# Frontend Cleanup / Performance / UI Validation — Implementation Guidance

**Date:** 2026-04-28 | **Author:** researcher | **Stack:** React 19 / TypeScript / Tailwind / Vite

---

## 1. Confirmed Dead Code (safe to delete, zero-risk batch 0)

| File | Evidence | Action |
|---|---|---|
| `src/components/ProtectedRoute.tsx` | Zero imports in App.tsx and full src scan | Delete |
| `src/hooks/use-users.ts` | No import found outside its own file | Delete |
| `src/hooks/use-objectives.ts` | No import found outside its own file | Delete |
| `src/hooks/use-sprints.ts` | No import found outside its own file | Delete |

**Do this first, alone, before any parallel work.** Dead-file deletes cannot conflict with other tracks. Run `npm run build` after; a compile error proves a usage was missed — revert the specific file.

---

## 2. Safe Ordering — Three Parallel Tracks (after batch 0)

### Track A — Fetch Caching (performance)
**File ownership:** `src/pages/PMDashboard.tsx`, `src/components/layout/SprintContextWidget.tsx`, `src/contexts/`

- PMDashboard: 6 independent fetches on mount → wrap in `Promise.all` + `useMemo` or lift to a context
- SprintContextWidget: active-sprint fetch runs on every layout render → cache result in `SprintContext` (already exists), read from context in widget instead of re-fetching
- Lead tracker tabs: replace raw `fetch()` calls with the existing `useLeadSync` hook pattern; do not introduce a new abstraction

**Risk:** Low. These are additive cache layers. No UI structure changes.

### Track B — Component Deduplication (DRY)
**File ownership:** `src/pages/MarketingBoard.tsx`, `src/pages/TechBoard.tsx`, `src/components/board/`

- MarketingBoard (476 ln) and TechBoard (470 ln) share board filter + column render logic → extract shared logic to `src/components/board/group-board-shell.tsx` (the `use-group-board-filters` hook already exists; use it as the seam)
- Do NOT touch SprintBoard (190 ln) or EpicBoard — they are already lean
- CustomDatePicker (`src/components/ui/CustomDatePicker.tsx`) vs `date-picker.tsx`: only one caller (TaskModal). Migrate TaskModal to `date-picker.tsx`, then delete `CustomDatePicker.tsx`. Medium risk — verify date format output matches existing stored values before deleting.

**Risk:** Medium. Extracting board shell touches two large files simultaneously. Must not run in parallel with Track C.

### Track C — File Size Reduction (readability + future DX)
**File ownership:** `src/pages/OKRsManagement.tsx` (1544 ln), `src/pages/DailySync.tsx` (937 ln), `src/pages/PMDashboard.tsx` (513 ln)

- OKRsManagement: split into `okr-objectives-panel.tsx`, `okr-key-results-panel.tsx`, `okr-cycles-panel.tsx` — all under 200 ln each
- DailySync: extract team form routing logic to `daily-sync-form-router.tsx`; keep page shell lean
- PMDashboard: only split after Track A caching work is committed (PMDashboard is in both tracks — serialize, not parallel)

**Constraint:** Track C on PMDashboard MUST follow Track A commit. Tracks A and C can proceed in parallel on their non-overlapping files.

---

## 3. File Ownership Boundaries (parallel safety)

```
Track A owns:  SprintContextWidget.tsx, src/contexts/SprintContext*, lead-tracker tabs
Track B owns:  MarketingBoard.tsx, TechBoard.tsx, group-board-shell.tsx (new), CustomDatePicker.tsx, TaskModal.tsx
Track C owns:  OKRsManagement.tsx, DailySync.tsx
Shared / serialize: PMDashboard.tsx — Track A first, then Track C
```

No two tracks touch the same file. Enforced by list above.

---

## 4. What NOT to Do in the First Parallel Batch

- Do not touch `src/pages/SprintBoard.tsx` — it is already minimal (190 ln), any refactor is YAGNI
- Do not introduce React Query / SWR — existing fetch pattern is consistent; adding a library is scope creep
- Do not extract shared board shell (Track B) at the same time as PMDashboard caching (Track A) — PMDashboard.tsx is a shared dependency risk
- Do not delete CustomDatePicker before migrating TaskModal and visually confirming date display in browser
- Do not split OKRsManagement before reading its internal state dependencies — local state may cross the proposed split boundaries; read the file before extracting

---

## 5. UI Browser Validation Checklist (golden path, post-cleanup)

Run `npm run dev`, open `localhost:3000`, walk each route:

- [ ] Login → Dashboard Overview loads, KPI table renders, no console errors
- [ ] PMDashboard → all 6 data sections populate; no blank panels
- [ ] SprintBoard → active sprint shown in sidebar SprintContextWidget; board columns load
- [ ] MarketingBoard + TechBoard → filters work, cards drag/drop, no visual regression
- [ ] Lead Tracker → tabs switch without re-fetching visible flicker; last-sync indicator present
- [ ] OKRsManagement → objectives, key results, cycles tabs all render after split
- [ ] DailySync → form selector routes to correct team form; submit succeeds
- [ ] Settings → all tabs render (sprint-cycles, okr-cycles, user-management, fb-config)
- [ ] Logout → redirects to login, session cleared

**Performance signal:** Open DevTools Network tab on PMDashboard; confirm requests are batched/cached, not 6 sequential waterfall calls on load.

---

## 6. Risks Summary

| Risk | Severity | Mitigation |
|---|---|---|
| use-sprints actually imported via barrel/alias | Low | `grep -r use-sprints src/` before delete |
| CustomDatePicker date format divergence from date-picker | Medium | Screenshot TaskModal before/after; check stored ISO format |
| OKRsManagement local state crosses split boundary | Medium | Read full file before extracting; keep state in page shell |
| PMDashboard edited by two tracks | High if parallel | Serialize: Track A commits first |
| Board deduplication breaks DnD context | Medium | Keep DnD provider in shell; test drag across columns |

---

## 7. Security Notes (scope-limited)

- No auth surface changes in this plan — ProtectedRoute deletion removes dead code only; auth is handled at context level
- No new network endpoints introduced
- Fetch caching reduces attack surface (fewer redundant requests)
- No secrets handling changes needed

---

## Unresolved Questions

1. Does SprintContext already expose `activeSprint` to children, or does it need a new value added?
2. Are MarketingBoard and TechBoard filtered by team ID server-side, or does the client filter? Matters for shared shell data flow.
3. Does OKRsManagement internal state use `useReducer` or multiple `useState`? Cross-boundary state is the split risk.
4. Is `use-group-board-filters` currently used by both boards, or only one?
