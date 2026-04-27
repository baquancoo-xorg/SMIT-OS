---
title: "Phase 04 u2014 Backend Performance: Cache + Lead Sync N+1"
status: complete
priority: P2
effort: 3h
---

# Phase 04 u2014 Backend Performance: Cache + Lead Sync N+1

## Context Links
- Research: `research/researcher-backend-security-performance.md` u00a7 Batch C1, C2
- Plan: `plan.md`

---

## Parallelization Info

- **Mode:** Starts after Phase 01; can run parallel with Phase 03 + Phase 05
- **Blocks:** Phase 06
- **Blocked by:** Phase 01 (baseline gate); Phase 02 must commit first if `overview-ad-spend.ts` needs singleton import before cache layer is added
- **File conflicts:** none with Phase 03 (owns server.ts only), none with Phase 05 (owns frontend)

> **Note:** Phase 02 changes the PrismaClient import in `overview-ad-spend.ts`. Phase 04 should start work on `overview-ad-spend.ts` only after Phase 02 is committed to avoid a merge conflict on that file.

---

## Overview

Add in-memory TTL cache to dashboard overview service to eliminate repeated CRM queries per request. Fix N+1 pattern in lead sync by batching DB reads before the loop.

**Priority:** P2 | **Status:** complete

---

## Key Insights

- Dashboard overview makes multiple CRM aggregation queries on every request; no caching exists.
- 2-minute TTL is acceptable staleness for overview metrics (stakeholder confirmation needed u2014 see Unresolved Q5).
- No Redis u2014 in-process Map + timestamp is sufficient at current scale (KISS).
- Lead sync iterates records and issues individual DB reads per lead u2014 O(n) queries. Batch with `findMany({ where: { id: { in: ids } } })` and index by id.

---

## Requirements

- Functional: dashboard overview returns same data, second request within TTL served from cache.
- Functional: lead sync produces identical output after N+1 fix; only query pattern changes.
- Non-functional: second overview request completes in <50ms vs first; lead sync DB query count = O(1) not O(n).

---

## Architecture

```
server/services/dashboard/
  overview-ad-spend.ts         u2014 add TTL cache wrapper
  [other overview service files] u2014 add cache if they also run expensive CRM queries

Cache pattern (no external dependency):
  const cache = new Map<string, { data: unknown; expiresAt: number }>();
  function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T>

server/services/lead-sync/
  [sync service file]   u2014 collect ids, batch findMany, build idu2192record map, use map in loop
```

---

## Related Code Files

**Edit:**
- `server/services/dashboard/overview-ad-spend.ts` (and any other dashboard overview files with CRM queries)
- `server/services/lead-sync/` (identify primary sync loop file via read)

**Read (context, no edit):**
- `server/services/dashboard/` (scan all files to identify CRM query patterns)
- `server/services/lead-sync/` (identify N+1 loop location)

**Do NOT touch:**
- `server.ts` (Phase 03)
- `server/lib/prisma.ts` (Phase 02 created)
- `server/lib/crm-db.ts` (separate DB client)

---

## File Ownership

| File/Directory | Phase 04 action |
|----------------|-----------------|
| `server/services/dashboard/` | EDIT (cache layer) |
| `server/services/lead-sync/` | EDIT (N+1 fix) |

No overlap with any other phase.

---

## Implementation Steps

### C1 u2014 Dashboard Overview Cache

1. Read all files in `server/services/dashboard/` to identify which files issue CRM queries on every request.

2. Create a minimal cache utility inline (no new file needed unless reused in 3+ places):
   ```ts
   const _cache = new Map<string, { data: unknown; expiresAt: number }>();

   async function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
     const hit = _cache.get(key);
     if (hit && Date.now() < hit.expiresAt) return hit.data as T;
     const data = await fn();
     _cache.set(key, { data, expiresAt: Date.now() + ttlMs });
     return data;
   }
   ```

3. Wrap the expensive CRM aggregation call(s):
   ```ts
   const TTL = 2 * 60 * 1000; // 2 minutes
   const result = await withCache('overview-ad-spend', TTL, () => fetchAdSpendFromCrm());
   ```

4. Validate timing:
   ```bash
   npm run dev
   time curl -s http://localhost:3000/api/dashboard/overview > /dev/null
   # Run twice; second should be significantly faster
   ```

### C2 u2014 Lead Sync N+1 Fix

5. Read `server/services/lead-sync/` to locate the loop issuing per-lead DB reads.

6. Before the loop, collect all IDs:
   ```ts
   const ids = leads.map(l => l.id);
   const existing = await prisma.lead.findMany({ where: { id: { in: ids } } });
   const existingMap = Object.fromEntries(existing.map(r => [r.id, r]));
   ```

7. Inside the loop, replace individual `prisma.lead.findUnique({ where: { id } })` calls with `existingMap[lead.id]`.

8. Validate query count:
   - Enable Prisma query logging temporarily: `new PrismaClient({ log: ['query'] })`
   - Trigger one sync cycle; count query log lines u2014 should be O(1), not O(n).
   - Remove query logging after validation.

9. Run full type check:
   ```bash
   npx tsc --noEmit
   ```

10. Commit:
    ```
    perf: add TTL cache to dashboard overview and fix lead sync N+1 query pattern
    ```

---

## Todo List

- [x] Read all `server/services/dashboard/` files to identify CRM query locations
- [x] Implement `withCache` helper in overview service
- [x] Wrap expensive CRM calls with 60s TTL cache (validated decision: 60s not 2min)
- [x] Validate: second overview request significantly faster
- [x] Read `server/services/lead-sync/` to find N+1 loop
- [x] Collect IDs before loop, batch `findMany`
- [x] Replace per-loop `findUnique` with map lookup
- [x] Validate: query count O(1) via Prisma query log
- [x] `npx tsc --noEmit` passes
- [x] Commit pushed

---

## Success Criteria

- Second overview request within TTL completes in <50ms
- Lead sync query log shows 1u20132 DB queries total (not n+1)
- `npx tsc --noEmit` exits 0
- Lead sync produces same result before and after

---

## Conflict Prevention

- Wait for Phase 02 to commit before editing `overview-ad-spend.ts` (avoid merge conflict on PrismaClient import line).
- No edits to `server.ts`, `server/lib/prisma.ts`, or `server/lib/crm-db.ts`.
- Phase 04 may read Phase 02-created `server/lib/prisma.ts` for reference but should not re-edit it.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Stale cache serves incorrect data to users | Low | Med | TTL 2min; clear cache on mutations if mutation routes exist in same service |
| N+1 fix changes output (e.g. ordering) | Low | Med | Compare output before/after with same input set |
| Dashboard cache Map grows unbounded | Very Low | Low | Cache keyed by fixed strings; at most a handful of keys |
| Lead sync has multiple loops u2014 only one fixed | Low | Med | Read full file before patching; fix all loops |

---

## Security Considerations

- In-process cache holds no user credentials; TTL bounded; no external state.
- No new endpoints or auth surface introduced.

---

## Next Steps

After commit: Phase 06 final validation.

**Deferred:** If cache needs to be invalidated on data mutation, add cache-bust call at mutation sites u2014 defer to Phase 07 or a follow-up ticket.
