---
name: Post-Fix Focused Review
date: 2026-04-28T01:11
scope: server.ts, overview-ad-spend.ts, crm-lead-sync.service.ts, derive-resolved-date.ts, admin-fb-config.routes.ts, auth.middleware.ts, currency-converter.ts, fb-sync-scheduler.service.ts, fb-token.service.ts, prisma.ts
---

## Code Review Summary

### Scope
- Files reviewed: server.ts, server/lib/prisma.ts, server/services/dashboard/overview-ad-spend.ts, server/services/lead-sync/crm-lead-sync.service.ts, server/services/lead-sync/derive-resolved-date.ts, server/routes/admin-fb-config.routes.ts, server/middleware/auth.middleware.ts, server/lib/currency-converter.ts, server/services/facebook/fb-sync-scheduler.service.ts, server/services/facebook/fb-token.service.ts
- Focus: Targeted re-review of recently fixed items

### Verification of Claimed Fixes

| Fix | Verified? | Notes |
|-----|-----------|-------|
| prisma singleton from server/lib/prisma | PASS | `server.ts:4` imports singleton; no stray `new PrismaClient()` outside crm-db.ts (CRM client is intentionally separate) |
| error handler preserves non-500 status | PASS | `server.ts:145-148` checks `err?.status` numeric, returns that code for non-500 |
| general limiter skips /auth/ | PASS | `req.path.startsWith('/auth/')` under `app.use('/api/', ...)` correctly strips prefix; confirmed: `/api/auth/login` yields `req.path = /auth/login` |
| overview-ad-spend in-flight deduplication | PASS | `_inFlight` map deduplicates concurrent cache misses; `.finally()` cleans up correctly; rejections propagate to all waiters without poisoning cache |
| lead-sync resolvedDate preloaded per batch | PASS | `loadResolvedDateMap(batchIds)` called once per batch; empty-array guard exists in callee; per-row CRM query eliminated |

---

### Blockers

**None.**

---

### High Priority (Non-Blocking)

**H1: `getConversionRates()` has no in-flight deduplication**
- File: `server/services/dashboard/overview-ad-spend.ts:33-48`
- Issue: Concurrent cache-miss callers all run their own `prisma.fbAdAccountConfig.findMany` + `getGlobalExchangeRate()` in parallel. Under burst load this fires N redundant DB round-trips until the first writer sets `conversionRatesCache`.
- Impact: Performance only — all callers get correct data, last writer wins with equivalent value.
- Fix (straightforward): wrap in `withCache` using a fixed key, or add a dedicated in-flight Promise variable mirroring the pattern used for `_inFlight`.

**H2: `parseInt(req.params.id)` without NaN guard in admin-fb-config.routes.ts**
- Lines: `admin-fb-config.routes.ts:61, 87, 97`
- Issue: `parseInt('abc')` returns `NaN`; Prisma receives `where: { id: NaN }` and throws `PrismaClientValidationError`. The catch block catches it and returns 500. Not exploitable (admin-only, error is caught), but returns a misleading 500 instead of 400.
- Fix: `const id = parseInt(req.params.id, 10); if (isNaN(id)) return res.status(400).json(...);`

---

### Informational

- `admin-fb-config.routes.ts` exposes raw `err.message` in 500 responses. Acceptable since all endpoints are double-guarded (router-level + mount-level `requireAdmin`).
- `loadResolvedDateMap` correctly early-exits on empty array; no unnecessary CRM query when no Qualified/Unqualified IDs exist in a batch.
- Auth middleware fetches fresh user on every request (no session cache). This is by design (role changes take effect immediately) but costs 1 DB query per authenticated request — acceptable given the stated architecture.
- CRM `PrismaClient` in `crm-db.ts` is a separate client for an external read-only database, not a duplicate of the main client. This is correct.

---

### Positive Observations
- Error handler correctly differentiates non-500 status codes; stack traces are dev-only.
- Rate limiter skip logic is correct for Express path stripping.
- In-flight deduplication pattern in `withCache` is clean and correct.
- `loadResolvedDateMap` batch design eliminates per-row CRM query as intended.
- `requireAdmin` is applied twice on admin routes (belt-and-suspenders); no bypass path visible.
- Prisma singleton is properly shared across the application via `server/lib/prisma.ts`.
