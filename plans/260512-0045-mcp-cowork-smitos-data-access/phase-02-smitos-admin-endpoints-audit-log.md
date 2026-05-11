# Phase 02 — Admin endpoints + audit log + Settings UI panel

## Context Links

- Parent plan: [../plan.md](./plan.md)
- Brainstorm: `plans/reports/brainstorm-260512-0045-mcp-cowork-smitos-data-access.md` (sections "SMIT-OS changes #3", "Risks: privacy/audit")
- Phase 01 deliverables (helpers, model): [phase-01-smitos-apikey-model-middleware.md](./phase-01-smitos-apikey-model-middleware.md)
- Existing admin route pattern: `server/routes/admin-fb-config.routes.ts`, mounted at `server.ts:150` behind `requireAdmin`
- Settings UI pattern: `src/pages/Settings.tsx`, sub-tabs in `src/components/settings/`
- Existing log model (audit pattern reference): `LeadAuditLog` (prisma/schema.prisma:157)
- **Depends on:** phase 01 (model + helpers)
- **Blocks:** phase 03 (test integration needs admin UI to generate test key); phase 07 (E2E)

## Overview

- Date: 2026-05-12
- Description: Build `POST/GET/DELETE /api/admin/api-keys` endpoints for key lifecycle, add `ApiKeyAuditLog` model + helper invoked from middleware, add Settings UI panel showing key list + generate/revoke actions.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights

- Raw key shown ONCE on generate response — UI must surface a copy-button modal with explicit "save now, can't recover" warning. Treat this as security UX, not nice-to-have.
- Audit log is a separate model (NOT extending `EtlErrorLog` — different concern: this is access log, not error log; different retention; different query patterns).
- Audit log write must NOT block response. Use `setImmediate(() => prisma.apiKeyAuditLog.create(...))` in middleware — fail-open for audit (incident: server crash mid-write loses 1 row, acceptable).
- Settings page uses `TabPill` v2 component (`src/components/ui`) and admin gates via `useAuth().isAdmin`. New panel must follow same pattern.
- `req.user.fullName` from JWT is the actor; capture for audit `createdBy`. Currently `createdBy` is `User.id` FK — admin must be authenticated via JWT to create keys (chicken-and-egg avoided: admin uses cookie session, not API key).

## Requirements

### Functional

- `POST /api/admin/api-keys` (JWT admin only) body `{ name: string, scopes: string[] }` → returns `{ id, prefix, name, scopes, createdAt, rawKey }` where `rawKey` is shown ONCE.
- `GET /api/admin/api-keys` (JWT admin only) → returns array `{ id, prefix, name, scopes, createdBy, createdAt, lastUsedAt, revokedAt }` (NO `keyHash`, NO `rawKey`).
- `DELETE /api/admin/api-keys/:id` (JWT admin only) → soft delete: set `revokedAt = now()`. Returns 204.
- New model `ApiKeyAuditLog`: `id`, `apiKeyId` (FK→ApiKey), `endpoint` (string, e.g. `/api/daily-reports`), `method` (string), `statusCode` (int), `responseSize` (int), `userAgent` (String?, from `req.headers['user-agent']`), `sourceIp` (String?, derive: `req.headers['cf-connecting-ip']` || `req.headers['x-forwarded-for']?.split(',')[0]` || `req.ip`), `timestamp` (default now), `@@index([apiKeyId, timestamp])`.
- Helper `logApiKeyUsage(apiKeyId, endpoint, method, statusCode, responseSize, userAgent, sourceIp)` invoked from `apiKeyAuth` middleware via response `finish` listener.
- Settings UI panel "API Keys" (admin only):
  - Table: prefix · name · scopes (chips) · createdBy · createdAt · lastUsedAt · status (active/revoked).
  - "Generate key" button → modal asking name + scope checkboxes → on submit show raw key once with copy button + warning.
  - "Revoke" button → confirm dialog → DELETE call → row marked revoked.

### Non-functional

- Audit write < 5ms p95 (fire-and-forget).
- Admin endpoints < 100ms p95.
- Each UI component file < 200 LOC; split into:
  - `ApiKeysPanel.tsx` (orchestrator, < 120 LOC)
  - `api-keys-table.tsx` (presentational, < 100 LOC)
  - `generate-api-key-modal.tsx` (< 120 LOC)
  - `revoke-api-key-confirm.tsx` (< 60 LOC, or reuse `ConfirmDialog`)

## Architecture

### Data Flow — Generate

```
Admin clicks Generate → modal collects {name, scopes}
  → POST /api/admin/api-keys
    → apiKeyHelpers.generateRawKey()
    → bcrypt hash
    → prisma.apiKey.create({ keyHash, prefix, name, scopes, createdBy: req.user.userId })
    → response { …row, rawKey }
  → modal renders raw key + copy button + warning
  → on close: rawKey discarded from React state
```

### Data Flow — Audit Log

```
Request hits whitelisted route via apiKeyAuth → req.user.type='api-key'
  → res.on('finish', () => logApiKeyUsage(apiKeyId, req.path, req.method, res.statusCode, Number(res.get('content-length') ?? 0)))
  → setImmediate(() => prisma.apiKeyAuditLog.create({...})) — fail-open, log error to childLogger
```

### File-level layout

```
server/
  routes/admin-api-keys.routes.ts      ← new (~140 LOC)
  services/api-key-audit.service.ts    ← new (~50 LOC) logApiKeyUsage helper
  middleware/api-key-auth.ts           ← modified (add finish-listener calling audit service)

src/components/settings/
  api-keys-panel.tsx                   ← new (orchestrator)
  api-keys-table.tsx                   ← new (presentational)
  generate-api-key-modal.tsx           ← new
  index.ts                              ← modified (export ApiKeysPanelV2)

src/pages/Settings.tsx                 ← modified (add 'api-keys' tab)
prisma/schema.prisma                   ← modified (add ApiKeyAuditLog)
server.ts                              ← modified (mount admin-api-keys.routes.ts)
```

## Related Code Files

### Create

- `server/routes/admin-api-keys.routes.ts` (~140 LOC)
- `server/services/api-key-audit.service.ts` (~50 LOC)
- `src/components/settings/api-keys-panel.tsx` (~120 LOC)
- `src/components/settings/api-keys-table.tsx` (~100 LOC)
- `src/components/settings/generate-api-key-modal.tsx` (~120 LOC)
- `server/__tests__/admin-api-keys.test.ts` (~150 LOC) — endpoint contract tests

### Modify

- `prisma/schema.prisma` — add `ApiKeyAuditLog` + `apiKey.auditLogs` back-relation
- `server/middleware/api-key-auth.ts` — add finish-listener calling `logApiKeyUsage`
- `server.ts` — mount `app.use("/api/admin/api-keys", requireAdmin, createAdminApiKeysRoutes(prisma))`
- `src/components/settings/index.ts` — export `ApiKeysPanelV2`
- `src/pages/Settings.tsx` — add tab id `api-keys`, icon `Key`, render `<ApiKeysPanelV2 />` for admin

### Delete

- None

## Implementation Steps

1. Edit `prisma/schema.prisma`: add `ApiKeyAuditLog` + back-relation. Run `npm run db:migrate -- --name add-api-key-audit-log` + `npm run prisma:gen`.
2. Create `server/services/api-key-audit.service.ts`: factory `createApiKeyAuditService(prisma)` returning `{ logUsage(apiKeyId, endpoint, method, statusCode, responseSize, userAgent, sourceIp) }`. Implementation uses `setImmediate` to enqueue `prisma.apiKeyAuditLog.create`. Catch errors → `childLogger('api-key-audit').error(...)` (don't throw).
3. Modify `server/middleware/api-key-auth.ts`: after setting `req.user`, attach `res.on('finish', () => auditService.logUsage(apiKeyId, req.originalUrl, req.method, res.statusCode, +res.getHeader('content-length') || 0, req.headers['user-agent'], deriveSourceIp(req)))`. Helper `deriveSourceIp(req)` reads `cf-connecting-ip` → `x-forwarded-for[0]` → `req.ip`.
4. Create `server/routes/admin-api-keys.routes.ts`:
   - `POST /` — `validate(zod schema { name: 1-50 chars, scopes: enum array non-empty })`. Generate raw key via helper, hash, store, return `{ ...row, rawKey }`.
   - `GET /` — list with explicit `select` (no keyHash), includes `createdBy` user `fullName`.
   - `DELETE /:id` — set `revokedAt: new Date()`, return 204.
5. Modify `server.ts`: mount `app.use("/api/admin/api-keys", requireAdmin, createAdminApiKeysRoutes(prisma))` — place AFTER existing JWT middleware (line ~150 area, near `admin-fb-config`).
6. Create `server/__tests__/admin-api-keys.test.ts`: spin up mini Express app + real PG (test DB), test full lifecycle: generate → list (no rawKey/keyHash exposed) → revoke → list shows revokedAt. Reuse pattern from `auth.test.ts` for setup.
7. Create UI files in order:
   - `api-keys-table.tsx` — props `{ keys, onRevoke }`. Tailwind table with status badges.
   - `generate-api-key-modal.tsx` — controlled modal, two stages: form → success (raw key shown). Use existing `Button`/`Input`/`Modal` from `components/ui`.
   - `api-keys-panel.tsx` — fetch list via `useQuery`, mutations for generate/revoke via `useMutation`. Compose table + modals.
8. Update `src/components/settings/index.ts` to export `ApiKeysPanelV2`.
9. Update `src/pages/Settings.tsx`: add `'api-keys'` to `SettingsTabId`, push `{ value: 'api-keys', label: 'API Keys', icon: <Key /> }` into `ADMIN_TABS`, render `<ApiKeysPanelV2 />`.
10. Manual smoke: `npm run dev` → login as `dominium` → Settings → API Keys → generate test key → verify table shows it (no rawKey leak in network tab after first response) → revoke → verify revoked status.
11. `npm test` + `npm run typecheck` clean.

## Todo List

- [ ] Add `ApiKeyAuditLog` model + back-relation to schema
- [ ] Run migration `add-api-key-audit-log`
- [ ] Create `server/services/api-key-audit.service.ts`
- [ ] Modify `api-key-auth.ts` to call audit on response finish
- [ ] Create `server/routes/admin-api-keys.routes.ts`
- [ ] Mount admin route in `server.ts`
- [ ] Create `server/__tests__/admin-api-keys.test.ts`
- [ ] Create `api-keys-table.tsx`
- [ ] Create `generate-api-key-modal.tsx`
- [ ] Create `api-keys-panel.tsx`
- [ ] Update `components/settings/index.ts` export
- [ ] Add `api-keys` tab in `Settings.tsx`
- [ ] Manual smoke: generate → list → revoke roundtrip
- [ ] `npm test` + `npm run typecheck` clean

## Success Criteria

- Admin can generate a key in Settings UI, see raw key once, copy it, close modal — raw never reappears.
- List endpoint never returns `keyHash` (verify via network inspect).
- Revoke marks key revoked; subsequent middleware calls reject (validated in phase 03).
- `ApiKeyAuditLog` table populates on each mock request from generated key.
- Each new component file < 200 LOC.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Audit write floods DB on heavy traffic | Low (rate-limited 100/min/key) | Medium | Per-key rate limit (phase 03) caps at ~144k/day/key. Add cron in future to prune > 90 days |
| Raw key accidentally logged via verbose middleware | Low | High | Audit `server.ts:93` logger to confirm only method+url logged. Add unit test: hit endpoint with `X-API-Key` header → grep test logs for `smk_` substring → fail if present |
| `ApiKeyAuditLog` schema changes break migration | Low | Low | v1 includes `userAgent` + `sourceIp` (decided 2026-05-12). Truncate UA at 255 chars to avoid bloat |
| UI exposes raw key via React DevTools state | Medium | Medium | Modal stores raw key in local `useState`, cleared on close. Document caveat: dev tools is admin-side; user already has admin access |
| Admin endpoint accessible to non-admin if mounted incorrectly | Low | High | `requireAdmin` middleware before `createAdminApiKeysRoutes`. Test asserts non-admin → 403 |

## Security Considerations

- All admin endpoints gated by `requireAdmin` (existing pattern from `server.ts:150`).
- Raw key only in HTTP response body (TLS in prod via Cloudflare Tunnel) — never in logs, never persisted client-side beyond modal lifetime.
- Audit log captures only metadata — explicitly NEVER stores request body or response body.
- Soft-delete (`revokedAt`) instead of hard delete — preserves audit trail; revoked keys can never be reactivated (UI hides "regenerate" option).
- Scopes are an allowlist (zod enum) — admin cannot grant arbitrary scope strings.

## Next Steps

- Phase 03: apply `requireAuth(['scope'])` to whitelisted GET routes + per-key rate limit + integration test using key generated in this phase's UI.
