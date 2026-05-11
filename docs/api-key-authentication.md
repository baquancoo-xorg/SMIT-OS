# API Key Authentication

## Overview

SMIT-OS supports two authentication mechanisms:

| Type | Use case | Lifetime |
|------|----------|----------|
| **JWT** | Human users via browser UI | 24h session, 8h sliding refresh |
| **ApiKey** | External integrations (MCP server, automated scripts) | Long-lived, manually revoked |

ApiKeys exist because JWT tokens expire and require browser-based refresh — unsuitable for background processes such as `smitos-mcp-server` running inside Claude Desktop. An ApiKey is a static credential with explicit read-only scopes that can be audited and revoked independently of any user session.

ApiKeys **never grant write access**. They are scoped to read operations only and every request is logged to `ApiKeyAuditLog`.

---

## Architecture

### Key format

```
smk_xxxx_<random-256-bit>
```

- Prefix `smk_` identifies SMIT-OS keys in logs and config files.
- Next 4 characters (stored as `prefix` in the DB) allow identifying a key by its short prefix without exposing the full key.
- The remainder is a cryptographically random string generated server-side.
- The raw key is shown **once** at generation time and never stored in plaintext. Only the bcrypt hash (`keyHash`) is persisted.

### Production scopes (5 total)

| Scope | What it grants |
|-------|---------------|
| `read:reports` | GET /api/daily-reports, GET /api/reports, GET /api/reports/:id, GET /api/daily-reports/:id |
| `read:crm` | GET /api/leads, GET /api/dashboard/lead-distribution, GET /api/dashboard/lead-flow |
| `read:ads` | GET /api/ads-tracker/campaigns |
| `read:okr` | GET /api/objectives, GET /api/key-results |
| `read:dashboard` | GET /api/dashboard/overview, GET /api/dashboard/call-performance, GET /api/dashboard/product |

> Note: `read:revenue` is folded into `read:dashboard`. The `revenue_summary` MCP tool uses `read:dashboard` scope.

### Middleware flow

```
Request with X-API-Key header
         │
         ▼
  api-key-auth middleware
  ├─ Read X-API-Key header (missing → 401)
  ├─ Validate prefix format smk_ (invalid → 401)
  ├─ Lookup by prefix in DB (not found → 401)
  ├─ bcrypt.compare(raw, keyHash) (mismatch → 401)
  ├─ Check revokedAt IS NULL (revoked → 401)
  └─ Attach req.apiKey = { id, scopes }
         │
         ▼
  requireAuth(['read:reports']) middleware
  ├─ Accept JWT (Bearer token) OR ApiKey
  └─ Check required scope present (missing → 403)
         │
         ▼
  perKeyRateLimit middleware
  └─ 100 req/min per key (exceeded → 429)
         │
         ▼
  Route handler → Prisma → PostgreSQL
         │
         ▼
  Response sent
         │
         ▼
  ApiKeyAuditLog written on response finish
  (apiKeyId, endpoint, method, statusCode,
   responseSize, userAgent, sourceIp)
```

---

## Database

### `ApiKey` model

Defined in `prisma/schema.prisma`:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Primary key |
| `name` | String | Human-readable label (e.g., "claude-desktop-cowork") |
| `keyHash` | String (unique) | bcrypt hash of the raw key |
| `prefix` | String | First 4 chars after `smk_` (for identification) |
| `scopes` | String[] | Array of scope strings |
| `createdBy` | String | Username of admin who generated it |
| `createdAt` | DateTime | Creation timestamp |
| `lastUsedAt` | DateTime? | Updated on each successful auth |
| `revokedAt` | DateTime? | Set on revoke; NULL = active |

### `ApiKeyAuditLog` model

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Primary key |
| `apiKeyId` | String | Foreign key → `ApiKey.id` |
| `endpoint` | String | Request path (e.g., `/api/daily-reports`) |
| `method` | String | HTTP method (always GET for read-only) |
| `statusCode` | Int | HTTP response status |
| `responseSize` | Int | Response body bytes |
| `userAgent` | String | Client User-Agent header |
| `sourceIp` | String | `CF-Connecting-IP` header (real client IP via CF Tunnel) |
| `createdAt` | DateTime | Log timestamp |

> The audit log never captures request/response body content.

---

## Generate a key

1. Log in to SMIT-OS as admin (user `dominium`).
2. Navigate to **Settings → API Keys** tab.
3. Click **Generate API Key**.
4. Enter a name (e.g., `claude-desktop-cowork`).
5. Select scopes (check all 5 for MCP Cowork use case).
6. Click **Generate**.
7. Copy the raw key from the modal — it will **not be shown again**.
8. Store the key in your integration config (e.g., `claude_desktop_config.json` env block).

---

## Revoke a key

1. Settings → API Keys → find the key by name.
2. Click **Revoke**.
3. The key's `revokedAt` is set immediately (soft delete).
4. Any subsequent request using this key returns `401 Unauthorized` within milliseconds.
5. Revoked keys remain visible in the list for audit purposes. They cannot be re-activated — generate a new key instead.

---

## Use a key

Pass the key in the `X-API-Key` header:

```bash
# Example: fetch last 10 daily reports
curl -H "X-API-Key: smk_xxxx_your_key_here" \
  "https://qdashboard.smitbox.com/api/daily-reports?limit=10"
```

The Cloudflare Tunnel forwards the header to SMIT-OS transparently.

---

## Whitelisted endpoints

Only the following endpoints accept ApiKey authentication. All other routes require JWT.

| Endpoint | Method | Required scope | Tool |
|----------|--------|---------------|------|
| `/api/daily-reports` | GET | `read:reports` | `list_daily_reports` |
| `/api/daily-reports/:id` | GET | `read:reports` | `get_report_by_id` |
| `/api/reports` | GET | `read:reports` | `list_weekly_reports` |
| `/api/reports/:id` | GET | `read:reports` | `get_report_by_id` |
| `/api/leads` | GET | `read:crm` | `list_leads` |
| `/api/dashboard/lead-distribution` | GET | `read:crm` | `lead_distribution` |
| `/api/dashboard/lead-flow` | GET | `read:crm` | `lead_flow` |
| `/api/ads-tracker/campaigns` | GET | `read:ads` | `list_ad_campaigns` |
| `/api/dashboard/overview` | GET | `read:dashboard` | `overview_snapshot`, `ad_spend_summary`, `revenue_summary` |
| `/api/dashboard/call-performance` | GET | `read:dashboard` | `call_performance` |
| `/api/objectives` | GET | `read:okr` | `list_objectives` |
| `/api/key-results` | GET | `read:okr` | `kr_progress` |

---

## Rate limits

- **Limit:** 100 requests per minute, per API key.
- **Shared:** All tools in a single MCP session share one key's quota.
- **429 response shape:**
  ```json
  {
    "error": "Rate limit exceeded",
    "retryAfter": 60
  }
  ```
- **Recovery:** Wait 60 seconds. The window resets per minute (sliding).
- **Workaround:** Generate a second key with the same scopes if parallel workflows need higher throughput.

---

## Audit log

Every authenticated API key request writes one row to `ApiKeyAuditLog` after the response is sent (non-blocking, on `res.on('finish')`).

**What is captured:**
- `apiKeyId` — which key was used
- `endpoint` — path only, no query string
- `method` — HTTP verb
- `statusCode` — response status
- `responseSize` — bytes sent
- `userAgent` — client identifier
- `sourceIp` — real client IP from `CF-Connecting-IP` header

**What is NOT captured:**
- Request query parameters or body
- Response body content
- User PII beyond what's in the fields above

**Querying audit log via psql:**

```sql
-- Recent activity for all keys
SELECT ak.name, al.endpoint, al.statusCode, al.createdAt
FROM "ApiKeyAuditLog" al
JOIN "ApiKey" ak ON ak.id = al."apiKeyId"
ORDER BY al."createdAt" DESC
LIMIT 50;

-- Usage count by key (last 7 days)
SELECT ak.name, COUNT(*) AS requests
FROM "ApiKeyAuditLog" al
JOIN "ApiKey" ak ON ak.id = al."apiKeyId"
WHERE al."createdAt" > NOW() - INTERVAL '7 days'
GROUP BY ak.name
ORDER BY requests DESC;
```

Connect: `psql postgresql://postgres:password@localhost:5435/smitos_db`

**Retention:** No automatic cleanup in v0.1. Recommended: add a cron to delete rows older than 90 days once the table grows beyond 100k rows.

---

## Security considerations

- **Never log the raw key.** The raw key appears only in the generation modal (client-side). Server logs contain only the prefix. Audit logs reference `apiKeyId` (UUID).
- **Scope minimization.** Grant only the scopes required. If a tool only needs `read:reports`, generate a key with that single scope.
- **Key rotation.** Rotate keys periodically:
  1. Generate a new key in Settings.
  2. Update the integration config with the new key.
  3. Restart the integration (Claude Desktop for MCP).
  4. Revoke the old key in Settings.
- **`claude_desktop_config.json` is not version-controlled.** The file lives in `~/Library/Application Support/Claude/` — outside any git repo. Never paste raw keys into commit messages, issues, or chat.
- **Read-only scope.** ApiKeys cannot mutate any data. The middleware rejects non-GET requests at the scope-check level.
- **API keys grant access to team data.** Reports, leads, and OKRs include team PII (names, sales metrics). Treat the key as confidential — equivalent to read-only DB access.
- **Audit review cadence.** Review `ApiKeyAuditLog` monthly to detect unexpected patterns (high volume from unexpected IPs, unusual endpoints).

---

## Troubleshooting

### 401 Unauthorized

| Cause | Fix |
|-------|-----|
| Missing `X-API-Key` header | Add header to request |
| Malformed key (not `smk_` prefix) | Regenerate key; copy from Settings modal |
| Key revoked | Generate new key in Settings |
| Key not found (wrong key for this environment) | Verify key was generated in the correct SMIT-OS instance |

### 403 Forbidden

| Cause | Fix |
|-------|-----|
| Key exists but lacks required scope | Revoke + generate new key with correct scope |
| Hitting a non-whitelisted endpoint | Only whitelisted endpoints accept ApiKey auth; use JWT for admin routes |

### Check audit log via psql

```bash
psql postgresql://postgres:password@localhost:5435/smitos_db \
  -c 'SELECT endpoint, "statusCode", "createdAt" FROM "ApiKeyAuditLog" ORDER BY "createdAt" DESC LIMIT 10;'
```

### Check key active status

```bash
psql postgresql://postgres:password@localhost:5435/smitos_db \
  -c 'SELECT name, prefix, scopes, "revokedAt", "lastUsedAt" FROM "ApiKey" ORDER BY "createdAt" DESC;'
```
