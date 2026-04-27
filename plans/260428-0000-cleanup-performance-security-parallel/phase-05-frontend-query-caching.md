---
title: "Phase 05 — Frontend Query Caching"
status: complete
priority: P2
effort: 2h
---

# Phase 05 — Frontend Query Caching

## Context Links
- Research: `research/researcher-frontend-cleanup-validation.md` § 2 Track A
- Plan: `plan.md`

---

## Parallelization Info

- **Mode:** Parallel with Phase 02 (and Phase 03/04) after Phase 01 completes
- **Blocks:** Phase 06
- **Blocked by:** Phase 01
- **File conflicts:** none with Phase 02/03/04 (all backend files)

---

## Overview

Eliminate redundant fetches on PMDashboard (6 uncached calls on mount) and SprintContextWidget (active-sprint re-fetch every render). Use existing patterns: Tanstack Query v5 is already in the stack; SprintContext already exists.

**Priority:** P2 | **Status:** complete

---

## Key Insights

- PMDashboard fires 6 independent fetches on every mount — no caching, no deduplication.
- SprintContextWidget fetches active sprint on every layout render; Sprint Context already exists and likely can hold the value.
- Do NOT introduce new libraries (Tanstack Query v5 already available; use it consistently).
- Do NOT refactor PMDashboard structure — Track C (Phase 07 deferred) owns that split; this phase only adds caching.
- Lead tracker tabs use raw `fetch()` — migrate to existing `useLeadSync` hook pattern; no new abstraction.

---

## Requirements

- Functional: all 6 PMDashboard data sections still populate correctly.
- Functional: SprintContextWidget shows correct active sprint; no re-fetch on every render.
- Functional: lead tracker tabs switch without full re-fetch flicker.
- Non-functional: DevTools Network tab shows cached/batched calls, not 6 sequential waterfall on PMDashboard load.

---

## Architecture

```
PMDashboard.tsx
  Before: 6 useEffect fetch calls, no caching
  After:  wrap each in useQuery (Tanstack Query v5)
          keys: ['pm-dashboard', 'section-name']
          staleTime: 60_000 (1 min) — adjust per data freshness need

SprintContextWidget.tsx
  Before: fetch active sprint on every render
  After:  read activeSprint from SprintContext
          SprintContext fetches once on mount; widget reads context value

Lead tracker tabs (identify file via read)
  Before: raw fetch() per tab
  After:  replace with useLeadSync hook (existing); preserve tab-keyed caching
```

---

## Related Code Files

**Edit:**
- `src/pages/PMDashboard.tsx`
- `src/components/layout/SprintContextWidget.tsx`
- `src/contexts/SprintContext.tsx` (or equivalent — confirm filename)
- Lead tracker tab component(s) — identify via read before editing

**Read (context, no edit):**
- `src/hooks/useLeadSync.ts` (or equivalent — confirm hook name/signature)
- Tanstack Query setup file (confirm `queryClient` provider)

**Do NOT touch:**
- `src/pages/OKRsManagement.tsx`, `src/pages/DailySync.tsx` — Phase 07 deferred
- `src/pages/MarketingBoard.tsx`, `src/pages/TechBoard.tsx` — Phase 07 deferred
- Any backend file

---

## File Ownership

| File | Phase 05 action |
|------|-----------------|
| `src/pages/PMDashboard.tsx` | EDIT (add useQuery caching) — Phase 07 deferred split owns structure only after this commits |
| `src/components/layout/SprintContextWidget.tsx` | EDIT |
| `src/contexts/SprintContext*` | EDIT (expose activeSprint if not already) |
| Lead tracker tab file(s) | EDIT (hook migration) |

No overlap with any other active phase.

---

## Implementation Steps

### PMDashboard — useQuery caching

1. Read `src/pages/PMDashboard.tsx` to map the 6 fetch calls and their endpoints/state variables.

2. For each fetch, replace the `useEffect + fetch + useState` pattern with `useQuery`:
   ```ts
   import { useQuery } from '@tanstack/react-query';

   const { data: overviewData } = useQuery({
     queryKey: ['pm-dashboard', 'overview'],
     queryFn: () => fetch('/api/dashboard/overview').then(r => r.json()),
     staleTime: 60_000,
   });
   ```
   Apply to all 6 fetches with distinct `queryKey` values.

3. Remove the corresponding `useEffect` + `useState` pairs for each migrated fetch.

### SprintContextWidget — context read

4. Read `src/contexts/SprintContext.tsx` — confirm if `activeSprint` is already exposed.
   - If yes: remove local fetch from widget, read from context.
   - If no: add `activeSprint` state to SprintContext, fetch once on context mount, expose via value.

5. Update `SprintContextWidget.tsx` to consume context value:
   ```ts
   const { activeSprint } = useSprintContext();
   // remove local fetch entirely
   ```

### Lead tracker tabs — hook migration

6. Locate lead tracker tab component(s) via:
   ```bash
   grep -rn 'fetch(' src/ --include='*.tsx' | grep -i 'lead\|tracker'
   ```

7. Read the file; identify raw `fetch()` calls per tab.

8. Replace with `useLeadSync` hook pattern (or equivalent existing hook). Do not create a new abstraction.

### Final validation

9. Run:
   ```bash
   npx tsc --noEmit
   npm run build
   npm run dev
   ```

10. Open DevTools Network tab on PMDashboard; confirm no 6-call waterfall on load.

11. Navigate to SprintBoard — verify SprintContextWidget shows correct sprint without extra network request.

12. Commit:
    ```
    perf: cache PMDashboard queries, deduplicate sprint fetch, migrate lead tracker to hook
    ```

---

## Todo List

- [x] Read `PMDashboard.tsx` — map all 6 fetch locations
- [x] Migrate each fetch to `useQuery` with distinct key + staleTime
- [x] Remove replaced `useEffect`/`useState` pairs
- [x] Read `SprintContext.tsx` — confirm `activeSprint` exposure
- [x] Update SprintContext if needed (add activeSprint state + fetch)
- [x] Update `SprintContextWidget.tsx` to read from context
- [x] Grep for raw `fetch(` in lead tracker files
- [x] Migrate lead tracker tabs to existing hook
- [x] `npx tsc --noEmit` passes
- [x] `npm run build` passes
- [x] DevTools: PMDashboard shows cached/batched pattern
- [x] SprintContextWidget shows correct sprint
- [x] Commit pushed

---

## Success Criteria

- PMDashboard Network tab: no 6-request waterfall on repeated visits within staleTime
- SprintContextWidget renders sprint name without firing new network request on layout re-render
- Lead tracker tabs switch without full re-fetch flicker
- `npx tsc --noEmit` exits 0, `npm run build` exits 0

---

## Conflict Prevention

- Do not edit `PMDashboard.tsx` structural layout — Phase 07 deferred split depends on this file as-is after caching commits.
- Do not add new query library imports (Tanstack Query v5 already in stack).
- No backend file edits.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| SprintContext doesn't expose activeSprint — needs new state | Low | Low | Additive change; low risk |
| staleTime too long — stale data visible to users | Low | Low | Start at 60s; tunable per query |
| Raw fetch in lead tracker has custom error handling lost in migration | Low | Med | Read existing error handling before replacing; preserve it in hook call |
| useQuery change breaks loading/error UI state | Low | Med | Map existing loading/error state to useQuery `isLoading`/`isError` equivalents |

---

## Security Considerations

- No new endpoints. No auth surface change.
- Tanstack Query caches in memory only; no persistence.

---

## Next Steps

After commit: Phase 06 final validation.

Phase 07 (deferred) may then split PMDashboard — it must start from the post-Phase-05 committed state.
