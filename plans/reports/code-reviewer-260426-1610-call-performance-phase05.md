# Code Review: Call Performance Dashboard - Phase 05

Date: 2026-04-26
Scope: 9 files, ~480 LOC
Reviewer: code-reviewer agent

---

## Scope

| File | LOC |
|------|-----|
| server/routes/dashboard-call-performance.routes.ts | 61 |
| server/services/dashboard/call-performance.service.ts | 129 |
| server/services/dashboard/call-performance-aggregators.ts | 241 |
| server/types/call-performance.types.ts | 49 |
| src/types/call-performance.ts | 39 |
| src/hooks/use-call-performance.ts | 23 |
| src/components/dashboard/call-performance/* (5 files) | ~200 |
| src/pages/DashboardOverview.tsx | 77 |
| server.ts (mount lines) | - |

---

## Overall Assessment

Implementation is solid and production-functional. Type coverage is near-complete, in-process cache is in place, timezone handling via Intl.DateTimeFormat is correct. Two HIGH issues should be addressed before merge; no criticals found.

---

## Critical Issues

None.

---

## High Priority

### H1 - Internal error message leaked to API clients

Files:
- server/routes/dashboard-call-performance.routes.ts:54
- server.ts:132-135

In the route-level catch block `error: (err as Error).message` is returned unconditionally to the caller in production. This can expose Prisma internals, DB schema details, or connection strings embedded in error messages.

The global error handler in server.ts already gates stack/message behind `isDev`, but the route has its own handler that bypasses this guard.

Fix: gate on NODE_ENV:

```ts
error: process.env.NODE_ENV === 'production'
  ? 'Internal server error'
  : (err as Error).message,
```

---

### H2 - In-process cache grows unbounded

File: server/services/dashboard/call-performance.service.ts:6-31

The `Map<string, CacheEntry>` is module-level singleton. TTL is 5 min and correct. However the Map is never size-capped. With distinct `(from, to, aeId)` combinations over time (date-picker with daily granularity + per-AE filters over months), entry count accumulates and is never GC'd until process restart.

Fix (minimal): add a max-size eviction or use a simple LRU cap. Example:

```ts
function writeCache(key: string, data: CallPerformanceResponse) {
  if (cache.size >= 500) {
    // evict first (oldest) key
    cache.delete(cache.keys().next().value);
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}
```

---

## Medium Priority

### M1 - parseFromTo produces local-TZ midnight, not UTC

File: server/lib/date-utils.ts:34

`new Date('2024-01-15T00:00:00')` is parsed as LOCAL time of the Node.js process. If the server runs in UTC (typical in Docker), this is fine. If TZ=Asia/Ho_Chi_Minh is set, the DB filter window shifts by +7 h, causing boundary-day data to bleed between adjacent ranges. The aggregators correctly use Intl.DateTimeFormat for bucketing, but the DB query bounds use this function.

Fix: use explicit UTC:

```ts
const from = new Date(`${fromStr}T00:00:00Z`);
const to   = new Date(`${toStr}T23:59:59.999Z`);
```

Or document that the server must run TZ=UTC.

---

### M2 - aeId input has no max-length bound

Files:
- server/routes/dashboard-call-performance.routes.ts:11
- src/components/dashboard/call-performance/call-performance-section.tsx:28

Schema is `z.string().min(1).optional()` with no `.max()`. A multi-KB string in aeId passes validation and is used in an in-memory Map lookup (safe) and as a cache key (grows the Map). Add `.max(128)` or similar.

---

### M3 - Conversion metric semantics: callsToQualified counts distinct leads, not call events

File: server/services/dashboard/call-performance-aggregators.ts:175-203

The column header in the UI is "Calls -> Qualified" but the value is the count of DISTINCT qualified subscribers the AE ever called, not the number of call events made to qualified leads. `callsToQualified` increments once per unique subscriberId, while `qualifiedCallCount` is the actual call-event count. This is not wrong per se, but the naming `callsToQualified` is misleading.

If the intent is distinct leads that eventually became qualified: rename to `leadsQualified`. If the intent is call-event count to qualified leads: swap `callsToQualified += 1` to `callsToQualified += count`.

---

### M4 - avgCallsBeforeClose includes both qualified AND unqualified together

File: server/services/dashboard/call-performance-aggregators.ts:191-193

```ts
const closeCount = callsToQualified + callsToUnqualified;
const avgCallsBeforeClose = closeCount > 0
  ? round2((qualifiedCallCount + unqualifiedCallCount) / closeCount)
  : 0;
```

`avgCallsBeforeClose` is `totalCallEvents / totalDistinctClosedLeads`. This is a meaningful metric, but it pools qualified and unqualified outcomes. Users often want to know separately how many calls it took before a qualified close vs an unqualified close. Worth a comment at minimum, or split into two fields.

---

## Low Priority

### L1 - Trend chart: dual Y-scale issue

File: src/components/dashboard/call-performance/call-performance-trend.tsx:37

`avgDuration` (typically 60-300 s) shares one Y-axis with `calls`/`answered` (typically 10-100). The duration line will dominate and visually compress the call-count series. Consider a right Y-axis for duration or a separate panel.

---

### L2 - defaultRange in route uses server-local Date, not VN timezone

File: server/routes/dashboard-call-performance.routes.ts:14-22

`new Date()` reflects server TZ. If the server is UTC, "today" for a VN user starts 7 hours later than the server's "today". When the user hits the API without explicit dates on a Sunday evening VN-time (after 17:00 UTC), the default range will be one day behind. Low impact given the UI always sends explicit `from`/`to`.

---

### L3 - Type duplication between server and client

Files:
- server/types/call-performance.types.ts
- src/types/call-performance.ts

Both files define identical interfaces. Currently in sync, but will drift. Consider a shared types package or generating src types from the server definition.

---

### L4 - Heatmap DAYS array and toVnParts weekday map use different zero-points

File: src/components/dashboard/call-performance/call-performance-heatmap.tsx:3
File: server/services/dashboard/call-performance-aggregators.ts:31-38

Days array: `['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']` where index 0 = CN (Sunday).
Weekday map: `Sun: 0, Mon: 1, ...` - matches correctly.
UI iterates `dow 0..6` mapping to DAYS[dow]. This is correct. No bug, but add an inline comment confirming the mapping to prevent future regression.

---

## Edge Cases

1. Empty date range (from == to): works correctly, produces single-day window.
2. Large subscriber result set: `statusesRaw` loop converts bigint to Number at line 116-118. JavaScript Number can represent integers up to 2^53 safely, and subscriber IDs from a CRM are unlikely to exceed that. Safe.
3. Calls with null callStartTime AND null subscriberId: handled - falls back to `createdAt` for time bucketing, and null-checks guard the leadSet insert.
4. All calls from unmapped employees: groups under `unmapped:*` keys. Produces valid output but may be surprising if employee-mapper table is partially populated during a first sync. Not a bug.
5. Cache race (two concurrent requests with same key): both queries execute and the second write overwrites the first. Result is correct data either way; no corruption. Acceptable for this use case.

---

## Positive Observations

- Timezone handling using `Intl.DateTimeFormat` with explicit `Asia/Ho_Chi_Minh` is correct and avoids the common UTC-offset-arithmetic mistake.
- `ANSWERED_THRESHOLD_SECONDS = 10` constant is clearly named and centralised.
- `safeCrmQuery` wrapper cleanly handles CRM unavailability without crashing the service.
- `satisfies` type narrowing on aggregator return values ensures compile-time contract enforcement.
- `apiGet` sets `credentials: 'include'` - auth cookies sent correctly.
- In-memory cache with TTL is appropriately scoped for a read-heavy dashboard with 5-min acceptable staleness.
- Two-layer empty-state handling: server returns empty arrays when CRM unavailable or AE not found; UI renders localized empty-state messages.

---

## Recommended Actions (Prioritized)

1. **[H1]** Gate error.message behind NODE_ENV check in the route catch block.
2. **[H2]** Add max-size cap to the in-process cache Map.
3. **[M1]** Append `Z` suffix to parseFromTo date strings or document TZ=UTC requirement.
4. **[M2]** Add `.max(128)` to aeId schema.
5. **[M3]** Clarify naming: `callsToQualified` should be `leadsQualified` (distinct leads) or changed to count call events - decide intent and align name + column header.
6. **[L1]** Add right Y-axis for avgDuration in trend chart.

---

## Metrics

- Type Coverage: ~98% (no `any` in business logic; `any` isolated to crm-db.ts CRM client init only)
- Linting Issues: 0 observed structural issues
- Auth: route mounted under `/api` which requires `createAuthMiddleware` - correctly protected
- Security: no PII leaked in normal responses; H1 is the only data-exposure path

---

## Merge Verdict

Can merge after H1 and H2 are fixed. M1 should be fixed before any multi-timezone deployment. M3 requires product clarification on whether the metric means distinct leads or call events.
