# Tester Report — Call Performance Phase-05

Date: 2026-04-26
Scope: phase-05 call performance dashboard implementation

---

## Diff-aware Mode

Changed files reviewed:
- `server/routes/dashboard-call-performance.routes.ts`
- `server/services/dashboard/call-performance.service.ts`
- `server/services/dashboard/call-performance-aggregators.ts`
- `server/types/call-performance.types.ts`
- `src/types/call-performance.ts`
- `src/hooks/use-call-performance.ts`
- `src/components/dashboard/call-performance/*` (5 files)
- `src/pages/DashboardOverview.tsx`
- `server.ts`

Test files found: `src/lib/formatters.test.ts` (only existing test in project)
No co-located or import-mapped tests for any of the new files.

---

## Test Results

| Suite | Pass | Fail | Skip |
|---|---|---|---|
| formatters.test.ts | 1 | 0 | 0 |
| **Total** | **1** | **0** | **0** |

Duration: ~129ms

---

## Lint / TypeCheck (npm run lint = tsc --noEmit)

**PASS** — zero errors, zero warnings.

---

## Runtime Risk Assessment

### No critical risks found

**Low-risk observations:**

1. `loadEmployeeMap` calls `getLeadSyncPrisma()` which throws if `initLeadSyncPrisma` was not called.
   - `server.ts` calls `initLeadSyncPrisma(prisma)` at line 45, before any route setup. **Safe.**

2. `call-performance.service.ts` calls `loadEmployeeMap()` even when CRM is unavailable (after `getCrmClient()` check passes).
   - If CRM is available but main DB is down, `loadEmployeeMap` would throw. This error propagates up to the route handler's `catch` block which returns HTTP 500. **Acceptable — no silent failure.**

3. In-memory cache (`Map<string, CacheEntry>`) is module-scoped singleton — no TTL cleanup worker. Cache grows unboundedly with unique date ranges. At typical usage (30-day rolling window with 1 optional `aeId`), growth is negligible. **Acceptable.**

4. `aggregateHeatmap` / `aggregateTrend` use `call.callStartTime ?? call.createdAt` — `createdAt` is non-nullable so fallback is always valid. **Safe.**

5. `subscriberIds.map(id => BigInt(id))` — `id` values come from `call.subscriberId` filtered as `id !== null` with explicit `is number` guard. **Safe.**

6. `aeId` filter in `useCallPerformance` hook passes raw text input from `<input>` directly as query param with no debounce. Each keystroke triggers a new query key → new network request. Minor UX concern, not a crash risk.

---

## Coverage Gaps

[!] No tests for `call-performance-aggregators.ts` — the core business logic file.
  - Suggest: unit tests for `aggregatePerAe`, `aggregateHeatmap`, `aggregateConversion`, `aggregateTrend` with edge cases:
    - Empty array input
    - `subscriberId === null`, `employeeUserId === null`
    - `totalDuration === null` vs exactly 10s (boundary for `ANSWERED_THRESHOLD_SECONDS`)
    - `callStartTime === null` fallback to `createdAt`
    - Timezone correctness of `toVnParts` (UTC midnight vs VN midnight)

[!] No tests for route validation logic in `dashboard-call-performance.routes.ts`:
  - Invalid date format (`from=2024-99-99`) → expect 400
  - Missing params → expect default range applied
  - Unknown `aeId` → expect empty arrays (not error)

---

## Build Status

`tsc --noEmit`: PASS
`npm test`: PASS (1/1)
No manual build (`vite build`) run — not in scope for unit testing, and type check already validates frontend types.

---

## Unresolved Questions

- No debounce on AE ID filter input in `call-performance-section.tsx` — intended behavior or oversight?
- `recharts` version compatibility with React 19 not verified (no runtime test available in this env).
