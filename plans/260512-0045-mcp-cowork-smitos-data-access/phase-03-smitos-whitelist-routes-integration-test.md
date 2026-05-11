# Phase 03 — Whitelist routes + per-key rate limit + integration test

## Context Links

- Parent plan: [../plan.md](./plan.md)
- Brainstorm: `plans/reports/brainstorm-260512-0045-mcp-cowork-smitos-data-access.md` (sections "Whitelist endpoints", "Rate limit per ApiKey")
- Phase 01 (helpers, middleware): [phase-01-smitos-apikey-model-middleware.md](./phase-01-smitos-apikey-model-middleware.md)
- Phase 02 (admin UI to generate test key): [phase-02-smitos-admin-endpoints-audit-log.md](./phase-02-smitos-admin-endpoints-audit-log.md)
- Existing rate limiter pattern: `server.ts:97-120` (`express-rate-limit` 8.3.2 already in deps)
- Routes to whitelist: `daily-report.routes.ts`, `report.routes.ts`, `lead.routes.ts`, `objective.routes.ts`, `key-result.routes.ts`, `ads-tracker.routes.ts`, `dashboard-overview.routes.ts`, `dashboard-product.routes.ts`, `dashboard-call-performance.routes.ts`, `dashboard-lead-distribution.routes.ts`, `dashboard-lead-flow.routes.ts`
- **Depends on:** phase 01, phase 02
- **Blocks:** phase 07 (E2E)

## Overview

- Date: 2026-05-12
- Description: Wire `apiKeyAuth` + `requireAuth(scopes)` into whitelisted GET endpoints, add per-key rate limit (100 req/min keyed by apiKeyId), write integration test covering full read path with generated key.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights

- Current server mounts `createAuthMiddleware` GLOBALLY on `/api` (server.ts:130). Two viable patterns:
  - **Option A (chosen)**: Keep global JWT, but insert `apiKeyAuth` BEFORE it (line ~129) — if header present and valid, `req.user.type='api-key'` and global JWT skips because we set a marker; if absent, falls through to JWT.
  - Option B: Replace global with per-route — bigger surface change, risky.
  - Chosen A: minimal diff, well-isolated.
- The global JWT middleware (`auth.middleware.ts:9`) rejects 401 if no cookie. Must modify it to: "if `req.user` already set by ApiKey path, skip and call `next()`". One-line change in `auth.middleware.ts`.
- `express-rate-limit` `keyGenerator` option supports custom function returning `req.user.apiKeyId` for ApiKey requests; falls back to IP for JWT.
- Scope mapping (decided in brainstorm):
  - `read:reports` → daily-reports + reports
  - `read:crm` → leads + lead-distribution + lead-flow
  - `read:ads` → ads-tracker + dashboard/overview (ads section read via shared endpoint — accept full overview)
  - `read:okr` → objectives + key-results
  - `read:dashboard` → dashboard/overview + dashboard/call-performance + dashboard/product (revenue)
  - **NOTE (2026-05-12 decision):** `read:revenue` scope dropped. Revenue data lives in `dashboard/overview.summary` and `dashboard/product` — both covered by `read:dashboard`. Keep enum extensible for future split.
- `dashboard/overview` requires BOTH `read:ads` OR `read:dashboard` — implement with OR semantics: `requireAuth([['read:ads', 'read:dashboard']])` not feasible without complicating helper. Simpler: give it `read:dashboard` only; MCP `ad_spend_summary` tool uses key with `read:dashboard` scope rather than splitting. Document in phase 04 env example.

## Requirements

### Functional

- Modify `auth.middleware.ts`: if `req.user?.type === 'api-key'`, skip JWT logic and `next()` immediately. JWT path untouched for non-API-key users.
- Mount `apiKeyAuth` BEFORE global JWT in `server.ts` so ApiKey requests bypass JWT cookie check.
- Apply `requireAuth([scope])` per route to whitelisted GET endpoints:
  - `GET /api/daily-reports`, `GET /api/daily-reports/:id` → `read:reports`
  - `GET /api/reports`, `GET /api/reports/:id` → `read:reports`
  - `GET /api/leads`, `GET /api/leads/:id` (if exists) → `read:crm`
  - `GET /api/dashboard/lead-distribution/*` → `read:crm`
  - `GET /api/dashboard/lead-flow/*` → `read:crm`
  - `GET /api/ads-tracker/campaigns`, `GET /api/ads-tracker/campaigns/:id`, `GET /api/ads-tracker/attribution`, `GET /api/ads-tracker/attribution/unmatched` → `read:ads`
  - `GET /api/dashboard/overview/*` → `read:dashboard`
  - `GET /api/dashboard/call-performance/*` → `read:dashboard`
  - `GET /api/dashboard/product/*` → `read:dashboard`
  - `GET /api/objectives`, `GET /api/objectives/:id` → `read:okr`
  - `GET /api/key-results`, `GET /api/key-results/:id` → `read:okr`
- Non-GET methods on these routers remain JWT-only (ApiKey scopes are read-only; `requireAuth` middleware on those returns 403 if `type='api-key'`).
- Add per-key rate limiter middleware (factory) with `keyGenerator: req => req.user?.type === 'api-key' ? req.user.apiKeyId : req.ip`, `windowMs: 60_000`, `max: 100`. Mount globally on `/api` after `apiKeyAuth`.
- Integration test: real Express + real PG (Docker), seeds an `ApiKey` row with all scopes, hits each whitelisted endpoint, asserts 200 + structure + scope enforcement (key with `read:reports` only → 403 on `/api/leads`).

### Non-functional

- Apply changes route-by-route via `router.get('/', requireAuth(['scope']), handleAsync(...))` — keep existing `RBAC.authenticated` etc. for non-GET.
- Integration test file < 200 LOC; helper extraction to `__tests__/helpers/seed-api-key.ts` if needed.
- No regression in existing JWT-protected behavior.

## Architecture

### Middleware Chain — New Order

```
app.use('/api', generalApiLimiter)                       (existing)
app.use("/api/auth", createAuthRoutes(...))              (existing — public)
app.use("/api/google", createGoogleOAuthPublicRoutes(…)) (existing — public)
app.use("/api", apiKeyAuth)                              ← NEW (sets req.user if header valid; 401 if header present but invalid)
app.use("/api", perKeyRateLimiter)                       ← NEW (keys by apiKeyId or IP)
app.use("/api", createAuthMiddleware(prisma))            (existing — modified to skip if req.user.type='api-key')
app.use("/api/google", createGoogleOAuthAdminRoutes(…))  (existing)
… mounted routers below
```

### Scope Enforcement Pattern

```ts
// example: server/routes/daily-report.routes.ts
router.get('/', requireAuth(['read:reports']), handleAsync(async (req, res) => {
  const reports = await prisma.dailyReport.findMany({...});
  res.json(reports);
}));
```

`requireAuth` is no-op for JWT users (scope concept is api-key only). For api-key users, scopes must match.

## Related Code Files

### Modify

- `server/middleware/auth.middleware.ts` — add early-return when `req.user.type === 'api-key'`
- `server.ts` — mount `apiKeyAuth` + per-key rate limiter before existing JWT line
- `server/routes/daily-report.routes.ts` — add `requireAuth(['read:reports'])` to two GETs
- `server/routes/report.routes.ts` — same `read:reports`
- `server/routes/lead.routes.ts` — `read:crm` on GETs
- `server/routes/dashboard-lead-distribution.routes.ts` — `read:crm`
- `server/routes/dashboard-lead-flow.routes.ts` — `read:crm`
- `server/routes/ads-tracker.routes.ts` — `read:ads` on 4 GETs (skip POST /sync — admin JWT only)
- `server/routes/dashboard-overview.routes.ts` — `read:dashboard`
- `server/routes/dashboard-call-performance.routes.ts` — `read:dashboard`
- `server/routes/dashboard-product.routes.ts` — `read:dashboard`
- `server/routes/objective.routes.ts` — `read:okr` on GETs
- `server/routes/key-result.routes.ts` — `read:okr` on GETs

### Create

- `server/middleware/per-key-rate-limit.ts` (~30 LOC) — factory wrapping `express-rate-limit` with `keyGenerator` strategy
- `server/__tests__/api-key-routes.integration.test.ts` (~180 LOC)

### Delete

- None

## Implementation Steps

1. Edit `server/middleware/auth.middleware.ts`:
   ```ts
   // Top of returned async function:
   if (req.user && (req.user as any).type === 'api-key') {
     return next();
   }
   ```
2. Create `server/middleware/per-key-rate-limit.ts`:
   ```ts
   import rateLimit from 'express-rate-limit';
   export const perKeyRateLimiter = rateLimit({
     windowMs: 60_000,
     max: 100,
     keyGenerator: (req) =>
       (req.user as any)?.type === 'api-key'
         ? `apikey:${(req.user as any).apiKeyId}`
         : `ip:${req.ip}`,
     standardHeaders: true,
     legacyHeaders: false,
     message: { error: 'Rate limit exceeded for this API key' },
   });
   ```
3. Edit `server.ts` around line 128-130:
   - Insert `app.use("/api", createApiKeyAuthMiddleware(prisma));` after public routes, before global JWT.
   - Insert `app.use("/api", perKeyRateLimiter);` after apiKeyAuth.
   - Existing `app.use("/api", createAuthMiddleware(prisma));` remains.
4. For each route file listed, import `requireAuth` from `../middleware/require-auth` and prepend it to GET handler signatures:
   ```ts
   router.get('/', requireAuth(['read:reports']), handleAsync(...));
   router.get('/:id', requireAuth(['read:reports']), handleAsync(...));
   ```
   POST/PUT/DELETE keep existing middleware (RBAC.authenticated / adminOnly etc.). When `requireAuth` sees JWT user, it pass-throughs.
5. For `ads-tracker.routes.ts`: skip applying `requireAuth` to `POST /sync` (admin-only manual trigger).
6. Create `server/__tests__/api-key-routes.integration.test.ts`:
   - `before`: spin up Express app via `createApp(prisma)` factory (if not exists, inline route registration matching `server.ts`). Seed one user (admin) + one ApiKey row with all 6 scopes + one with only `read:reports`.
   - Tests:
     - `read:reports` key → 200 on `/api/daily-reports`, 403 on `/api/leads`.
     - Full-scope key → 200 on each whitelisted GET (table-driven).
     - Revoked key → 401 on `/api/daily-reports`.
     - No header → 401 (falls to JWT path with no cookie).
     - JWT cookie (admin) → 200 on `/api/daily-reports` (legacy path).
     - Rate limit: 101st request within 60s window → 429 (use small fake limit for test by overriding `max` via env or factory).
   - `after`: cleanup DB rows.
7. Run `npm test` — all green.
8. Manual smoke (optional): generate key in Settings UI (from phase 02) → `curl -H "X-API-Key: smk_…" https://qdashboard.smitbox.com/api/daily-reports | jq '.[0]'` → expect data.

## Todo List

- [ ] Modify `auth.middleware.ts` early-return on api-key user
- [ ] Create `server/middleware/per-key-rate-limit.ts`
- [ ] Wire `apiKeyAuth` + `perKeyRateLimiter` in `server.ts`
- [ ] Add `requireAuth` to daily-report GETs
- [ ] Add `requireAuth` to report GETs
- [ ] Add `requireAuth` to lead GETs
- [ ] Add `requireAuth` to dashboard-lead-distribution GETs
- [ ] Add `requireAuth` to dashboard-lead-flow GETs
- [ ] Add `requireAuth` to ads-tracker GETs (skip /sync)
- [ ] Add `requireAuth` to dashboard-overview GETs
- [ ] Add `requireAuth` to dashboard-call-performance GETs
- [ ] Add `requireAuth` to dashboard-product GETs
- [ ] Add `requireAuth` to objective GETs
- [ ] Add `requireAuth` to key-result GETs
- [ ] Create integration test covering scope enforcement + rate limit + revoke + JWT compat
- [ ] `npm test` green
- [ ] Manual `curl` smoke optional

## Success Criteria

- All listed GET endpoints accept valid ApiKey + reject wrong/missing scope.
- Existing JWT requests on the same endpoints continue working unchanged.
- Per-key rate limit caps at 100/min per key (verified in test).
- Revoke takes effect on next request (no caching gap).
- Integration test file < 200 LOC; reuses helpers; no mock DB.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `apiKeyAuth` placement causes `/api/auth/login` to require key | High if mis-ordered | High | Mount apiKeyAuth AFTER public auth routes (`/api/auth`, `/api/google` public). Test asserts login still works |
| Scope mismatch in route → legitimate Cowork tool 403 | Medium | Medium | Phase 06 maps each tool to scope; cross-check phase 06 spec before merge |
| `req.user` shape divergence breaks downstream code reading `userId` | Medium | High | Existing routes that need `userId` are all behind JWT path (mutations). GET endpoints only read data, don't dereference `req.user.userId`. Audit each modified route for `req.user.userId` usage on GET — if found, gate on `type==='jwt'` |
| Per-key rate limit memory grows unbounded | Low | Low | `express-rate-limit` default in-memory store auto-expires; switch to Redis later if multi-instance |
| Test uses test DB but pollutes dev data | Low | Medium | Tests prefix names with `__test_api_key__`; cleanup in `after` |
| Cloudflare Tunnel strips `X-API-Key` header | Low | High | Verified: CF Tunnel preserves arbitrary headers by default. Add `curl` smoke to phase 07 checklist |

## Security Considerations

- `requireAuth` enforces scopes only for `type='api-key'` users. JWT admin/member retains existing RBAC (handled per-route by `RBAC.adminOnly` etc. on mutations).
- ApiKey path NEVER allowed on POST/PUT/DELETE (scope vocabulary is `read:*` only; non-GET routes don't call `requireAuth` with read scopes, and even if accidentally called, scopes don't include `write:*`).
- Rate limit prevents brute-force scope discovery.
- Integration test asserts `keyHash` field never appears in any response body across all whitelisted endpoints (regression guard).

## Next Steps

- Phase 04: scaffold `smitos-mcp-server` repo (separate dir, separate lifecycle).
