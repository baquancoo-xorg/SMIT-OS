# MCP Cowork Integration

## Purpose

This integration enables Claude Desktop (Cowork) to query SMIT-OS data in real time — reports, CRM leads, ad campaigns, OKRs, and dashboard metrics — without manual export.

The entry point is `smitos-mcp-server`: a local Node process that Claude Desktop spawns on startup. It translates Cowork's natural-language tool calls into HTTPS requests to the SMIT-OS REST API, authenticated with an ApiKey.

---

## Architecture

```
[User in Claude Desktop / Cowork]
   │ natural language: "show last 7 days daily reports"
   ▼
[Claude Desktop client]
   │ MCP stdio transport (JSON-RPC over stdin/stdout)
   ▼
[smitos-mcp-server  —  node dist/index.js]
   │ HTTPS + X-API-Key header
   ▼
[https://qdashboard.smitbox.com]  ←  Cloudflare Tunnel
   │
   ▼
[SMIT-OS Express :3000]
   │  api-key-auth → requireAuth(scope) → perKeyRateLimit → route handler
   ▼
[Prisma ORM → PostgreSQL :5435]
   │
   ▼
[Response → format.ts → Markdown table / JSON → MCP content]
   │
   ▼
[Cowork displays result]
```

Key properties:
- Transport is **stdio** (subprocess). The MCP server process has no network port — it communicates only via stdin/stdout with Claude Desktop.
- Authentication uses a **read-only ApiKey** (`smk_...`). No JWT, no browser session.
- The Cloudflare Tunnel forwards `X-API-Key` transparently. SMIT-OS never receives traffic directly from the internet without the tunnel.

---

## Repo location

The MCP server lives in a **separate git repository** — not inside the SMIT-OS monorepo:

```
/Users/dominium/Documents/Project/smitos-mcp-server/
```

This keeps the MCP server's lifecycle (Node version, MCP SDK updates, tool additions) independent from SMIT-OS's Express/Prisma stack.

SMIT-OS does not import or depend on `smitos-mcp-server`. The only coupling is the REST API contract and the `X-API-Key` header.

---

## Setup checklist

Follow these steps in order. Each step links to detailed documentation.

### Step 1 — Generate API key in SMIT-OS Settings

> Detailed: [docs/api-key-authentication.md](./api-key-authentication.md)

1. Log in to SMIT-OS as admin.
2. Settings → API Keys → Generate API Key.
3. Name: `claude-desktop-cowork`.
4. Select all 5 scopes: `read:reports`, `read:crm`, `read:ads`, `read:okr`, `read:dashboard`.
5. Copy the raw key (`smk_xxxx_...`) — shown once only.

### Step 2 — Clone and install mcp-server

```bash
cd /Users/dominium/Documents/Project/smitos-mcp-server
npm install
```

### Step 3 — Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
SMITOS_API_URL=https://qdashboard.smitbox.com
SMITOS_API_KEY=smk_xxxx_your_key_here
```

> `.env` is used for local development only (`npm run dev`). Production (Claude Desktop) reads env vars from `claude_desktop_config.json` instead.

### Step 4 — Build the server

```bash
npm run build
```

Verify: `dist/index.js` exists and `npm run typecheck` passes with 0 errors.

### Step 5 — Add to Claude Desktop config

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (create if missing):

```json
{
  "mcpServers": {
    "smitos": {
      "command": "node",
      "args": ["/Users/dominium/Documents/Project/smitos-mcp-server/dist/index.js"],
      "env": {
        "SMITOS_API_URL": "https://qdashboard.smitbox.com",
        "SMITOS_API_KEY": "smk_xxxx_your_key_here"
      }
    }
  }
}
```

Validate JSON before saving:
```bash
jq . "~/Library/Application Support/Claude/claude_desktop_config.json"
```

### Step 6 — Restart Claude Desktop

Quit fully (Cmd+Q — not just window close) then reopen. Claude Desktop reads the config only at startup.

### Step 7 — Verify connection

Open Claude Desktop. The MCP indicator should show `smitos` as connected with no error icon. Ask Cowork: "list available smitos tools" — expect 13 tools returned.

---

## Tools available (13)

### Reports (3 tools)

| Tool | Description |
|------|-------------|
| `list_daily_reports` | List daily standup reports filtered by date range, user, or status |
| `list_weekly_reports` | List weekly reports with KR progress; filter by week range or user |
| `get_report_by_id` | Fetch full content of a single daily or weekly report by UUID |

### Dashboard (2 tools)

| Tool | Description |
|------|-------------|
| `overview_snapshot` | Project-wide KPI snapshot: revenue, leads, ad spend for a date range |
| `call_performance` | Call center metrics: call volume, contact rate, conversions by AE |

### CRM (3 tools)

| Tool | Description |
|------|-------------|
| `list_leads` | List CRM leads filtered by AE, status, source, or date range |
| `lead_distribution` | Aggregated lead counts by AE, status, or source |
| `lead_flow` | Pipeline progression and stage transitions over a date range |

### Ads (2 tools)

| Tool | Description |
|------|-------------|
| `list_ad_campaigns` | List ad campaigns with spend, impressions, clicks, conversions |
| `ad_spend_summary` | Aggregate ad spend (VND) and per-platform breakdown for a date range |

### Revenue (1 tool)

| Tool | Description |
|------|-------------|
| `revenue_summary` | Revenue total, trend vs prior period, and ROAS for a date range |

### OKR (2 tools)

| Tool | Description |
|------|-------------|
| `list_objectives` | List OKR objectives filtered by cycle, owner, or status |
| `kr_progress` | Key result progress: current value, target, and progress % |

---

## Maintenance

### When SMIT-OS routes change

Each tool maps to one API endpoint. If an endpoint path or response shape changes:

1. Edit the corresponding tool file in `src/tools/<domain>/<tool-name>.ts`.
2. `npm run typecheck` + `npm run build`.
3. Restart Claude Desktop (it re-spawns the node process).

### When MCP SDK updates

`@modelcontextprotocol/sdk` is pinned to a minor version in `package-lock.json`. To update:

```bash
cd /Users/dominium/Documents/Project/smitos-mcp-server
npm update @modelcontextprotocol/sdk
npm run typecheck
npm run build
```

Test with MCP Inspector before deploying to Claude Desktop:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

### Key rotation

When rotating the ApiKey (recommended periodically):

1. Generate new key in SMIT-OS Settings → API Keys.
2. Edit `~/Library/Application Support/Claude/claude_desktop_config.json` — update `SMITOS_API_KEY` value.
3. Quit + reopen Claude Desktop.
4. Verify tools still work.
5. Revoke the old key in Settings.

---

## Troubleshooting

### "smitos not connected" in Claude Desktop

1. Check Claude Desktop logs: `~/Library/Logs/Claude/mcp-server-smitos.log`
2. Verify `node --version` is 20+: `node -e 'process.exit(Number(process.versions.node.split(".")[0]) < 20)'`
3. Run the server standalone to see startup errors:
   ```bash
   SMITOS_API_URL=https://qdashboard.smitbox.com \
   SMITOS_API_KEY=smk_xxxx_... \
   node /Users/dominium/Documents/Project/smitos-mcp-server/dist/index.js < /dev/null
   ```
4. Validate `claude_desktop_config.json` syntax: `jq . ~/Library/Application\ Support/Claude/claude_desktop_config.json`

### Tools fail with auth error (401/403)

- 401: Key may be revoked. Check Settings → API Keys → verify `revokedAt` is null.
- 403: Key exists but scope missing. Revoke and regenerate with all 5 scopes.
- Verify key in config matches what was shown in Settings modal (copy-paste error?).

### Rate limit hit (429)

- Limit: 100 req/min per key.
- Wait 60 seconds — the window resets.
- If sustained high usage: generate a second key with the same scopes and alternate between them (future: Redis cache layer will reduce redundant calls).

### SMIT-OS unreachable

1. Check app server: `curl https://qdashboard.smitbox.com/api/auth/health` (or any known route).
2. If 502/521: check Cloudflare Tunnel — `npm run tunnel:status` in the SMIT-OS repo.
3. If tunnel is down: `npm run tunnel:restart` and wait 30s.
4. If app server is down: `npm run dev` or check daemon — `npm run daemon:status`.

The MCP server retries failed requests twice with backoff before returning a user-friendly error message to Cowork (no silent 30s hangs).

---

## Future work (out of scope v0.1)

- **HTTP/SSE transport** — enable web-based Cowork (non-Desktop) to connect to a hosted MCP endpoint.
- **Redis cache** — cache hot reads (`overview_snapshot`, `list_daily_reports`) to reduce DB load when Cowork runs repeated queries.
- **npm publish** — publish `smitos-mcp-server` as a private npm package for easier install across machines.
- **Write-scope tools** — `create_daily_report`, `update_lead_status` etc. (requires careful scope design and audit).
- **Audit log retention cron** — auto-purge `ApiKeyAuditLog` rows older than 90 days.
- **Settings tab: audit viewer** — UI to browse audit log without psql.
