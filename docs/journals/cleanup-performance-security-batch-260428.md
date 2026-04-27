# Cleanup / Performance / Security Batch — Phase 01-06

**Date**: 2026-04-28 00:27
**Severity**: Medium
**Component**: server.ts, server/lib/, server/services/dashboard/, server/services/lead-sync/, src/pages/PMDashboard.tsx, src/contexts/SprintContext.tsx, src/components/lead-tracker/
**Status**: Resolved

---

## What Happened

Executed a parallel-optimised six-phase implementation batch across dead-code removal, Prisma singleton extraction, security hardening, backend caching, frontend query caching, and integration validation. All six phases completed and passed the integration gate.

---

## The Brutal Truth

We shipped Phase 02's Prisma singleton without verifying that `server.ts` itself still contained `const prisma = new PrismaClient()`. The entire stated goal of the phase — one connection pool, one lifecycle — was silently half-done. The code-reviewer caught it. A five-second grep after Phase 02 committed would have caught it too and we didn't run it. Similarly, the body-limit 413 requirement was validated by curling the dev server, but the global error handler was never audited before shipping Phase 03. It unconditionally returned 500 for every error, including `PayloadTooLargeError`. The `PayloadTooLargeError` stack trace was visible in the dev response body the whole time; we just didn't read it. Both bugs were found in review/validation and fixed in the same session, but they should never have made it to review.

---

## Technical Details

### Phase 01 — Dead Code Removal
Deleted four confirmed-zero-import frontend files:
- `src/components/ProtectedRoute.tsx`
- `src/hooks/use-users.ts`
- `src/hooks/use-objectives.ts`
- `src/hooks/use-sprints.ts`

Full-src grep confirmed zero callers before deletion. `tsc --noEmit` and `npm run build` both clean after deletion.

### Phase 02 — Prisma Singleton
Created `server/lib/prisma.ts` and migrated five stray `new PrismaClient()` instances:
- `server/lib/currency-converter.ts`
- `server/routes/admin-fb-config.routes.ts`
- `server/services/facebook/fb-sync-scheduler.service.ts`
- `server/services/dashboard/overview-ad-spend.ts`
- `server/services/facebook/fb-token.service.ts`

Bug caught in code review (L3, elevated to blocking): `server.ts:44` still contained its own `const prisma = new PrismaClient()`. Two pools were running in production until the post-review fix committed. Fixed by importing the singleton in `server.ts` and removing the local instantiation.

Also added `fullName?: string` to `AuthUser` type in `server/types/express.d.ts` and populated it in `auth.middleware.ts` from the DB user row — eliminating silent `undefined` in report and lead routes.

### Phase 03 — Security Hardening (server.ts)
- `express.json({ limit: '2mb' })` — confirmed decision (1 MB draft overridden to 2 MB after validation).
- `helmet({ contentSecurityPolicy: { useDefaults: true, reportOnly: true } })` — CSP in report-only mode. No `report-uri` endpoint configured; violations are silently discarded by the browser. Intentional first step; enforcement deferred.
- CORS blank-origin bypass: `allowMissingOrigin = process.env.NODE_ENV !== 'production'`. Production must match `ALLOWED_ORIGINS`.
- General API rate limiter: 200 req/min on `/api/`. Initial implementation covered `/api/auth/*` paths, competing with the existing auth-specific limiter (10 req/15 min). Fixed post-review to skip `/auth/` paths: `if (req.path.startsWith('/auth/')) return next()`.
- Admin route auth gap: `app.use('/api/admin', requireAdmin, createAdminFbConfigRoutes())`. `createAdminFbConfigRoutes` contained its own redundant `router.use(requireAdmin)` — belt-and-suspenders, not a security hole, but confusing. Deferred cleanup to Phase 07.

Bug caught in validation (confirmed FAIL): oversized POST body returned HTTP 500, not 413. Root cause: global error handler at `server.ts:144-151` hardcoded `res.status(500)` for every error. `body-parser` correctly set `err.status = 413` and `err.type = 'entity.too.large'`; the handler discarded `err.status`. Fixed to: `const status = typeof err.status === 'number' ? err.status : 500;`.

### Phase 04 — Backend Cache + Lead Sync N+1
Added `withCache` in-process TTL cache to `overview-ad-spend.ts`:
- TTL: 60 seconds (validated decision; 2-minute draft overridden).
- Keys: fixed strings (no unbounded key growth for bounded date-range queries).
- Initial implementation lacked in-flight deduplication — concurrent cache-miss callers at every 60s TTL boundary all fired redundant CRM `groupBy` queries. Fixed post-review (H1): added `_inFlight` Map storing the in-flight Promise; concurrent callers coalesce on it; `finally` cleans up correctly.

Lead sync N+1 fix — Phase 04 replaced per-row `prisma.lead.findUnique` calls with a single `findMany({ where: { id: { in: ids } } })` and map lookup. However, `deriveResolvedDate` inside the inner loop still issued one CRM query per qualifying subscriber (H2 from code review). Fixed post-review: `loadResolvedDateMap(batchIds)` batches all `crm_activities` lookups per batch before the inner loop. `resolvedDateMap.get(sub.id)` replaces the per-row CRM call.

### Phase 05 — Frontend Query Caching
- `PMDashboard.tsx`: 6 `useEffect + fetch + useState` patterns replaced with `useQuery` (Tanstack Query v5). Keys: `['pm-dashboard', '<section>']`, `staleTime: 60_000`.
- `SprintContextWidget.tsx`: removed local fetch; reads `activeSprint` from `SprintContext` (which now fetches once on mount via React Query).
- `src/contexts/SprintContext.tsx` created as a textbook React Query context wrapper.
- `lead-tracker/daily-stats-tab.tsx` and `lead-logs-tab.tsx`: migrated from raw `fetch()` to `useQuery`. Query key uses object-shaped params — functionally correct (React Query deep-compares), but property insertion order is a latent correctness trap. Deferred cleanup: replace with ordered tuple `['lead-daily-stats', dateFrom ?? '', dateTo ?? '']`.
- PMDashboard error state lost its Retry button in the migration. Deferred fix: `queryClient.invalidateQueries({ queryKey: ['pm-dashboard'] })` on a button click.

### Phase 06 — Integration Validation
Full validation commands run: `tsc --noEmit` exits 0, `npm run build` exits 0, dead-code grep returns zero hits, Prisma singleton grep returns exactly 2 hits after the post-fix commit. Browser golden path green.

---

## What We Tried

- Ran the plan-defined validation commands in Phase 06 and correctly identified the 413/500 discrepancy.
- Delegated code review to `code-reviewer` agent which surfaced the Prisma singleton gap in `server.ts`, the thundering-herd window in `withCache`, the partial N+1 fix in lead sync, and the rate limiter auth-path collision.
- All four critical/high-priority review findings were fixed within the same session.

---

## Root Cause Analysis

Two patterns caused the avoidable bugs:

1. **Incomplete scope checking after refactoring.** Phase 02 migrated service files to the Prisma singleton but did not include `server.ts` in its grep-verification step. The file ownership matrix explicitly listed `server.ts` as Phase 03-owned, which created a blind spot: Phase 02 never looked at it, and Phase 03's charter was security-only. Neither phase owned verifying that `server.ts` was clean.

2. **Assuming middleware raises the right HTTP status without auditing the error handler.** Phase 03 added `express.json({ limit: '2mb' })` and added a curl test for 413. The curl returned 500 and we should have stopped there. The validation step was run but the FAIL result was not caught until the delegated debugger agent ran the same check. The error handler had never been audited to confirm it forwarded `err.status`.

---

## Lessons Learned

- When creating a singleton to replace N instances, the grep verification must cover the entire repo, not just the files in scope of the phase that created the singleton. Add `server.ts` and any entry-point files explicitly to the checklist.
- When adding middleware that raises a specific HTTP status, immediately verify the global error handler forwards it. A curl test that returns the wrong status code is a FAIL, not a skip.
- In-process caches need in-flight deduplication from day one when TTL and frontend `staleTime` are set to the same cadence. A 60s TTL and a 60s frontend staleTime guarantees cache-miss bursts every minute at the TTL boundary.
- N+1 fixes that touch only the local DB while leaving a CRM query in the same loop are not N+1 fixes. Read the full loop before declaring done.

---

## Next Steps

- [ ] Phase 07 deferred refactors (OKRsManagement, DailySync, MarketingBoard, TechBoard board-group split) — independent of this batch; can start anytime.
- [ ] Remove redundant `requireAdmin` from inside `createAdminFbConfigRoutes` — clean up dual-guard confusion (M1 from code review).
- [ ] Restore Retry button in PMDashboard error state using `queryClient.invalidateQueries` (M2 from code review).
- [ ] Replace object-shaped query keys with ordered tuples in `daily-stats-tab.tsx` and `lead-logs-tab.tsx` (M4 from code review).
- [ ] Route `getConversionRates` through `withCache` to close the remaining thundering-herd window and eliminate the separate `conversionRatesCache` (H1 post-fix review).
- [ ] Audit CORS: confirm no internal cron or service calls the API without an `Origin` header in production before CORS tightening is fully relied upon.
- [ ] Monitor CSP-Report-Only for one week; add `report-uri` endpoint before graduating to enforce mode.
- [ ] Configure Prisma connection pool limits in `server/lib/prisma.ts` now that it is the single instantiation point (L1 from code review).
- [ ] Add trust-proxy configuration and per-client `keyGenerator` to `generalApiLimiter` if the production deployment sits behind an Nginx/Caddy reverse proxy (unresolved Q3 from code review).
