---
title: "Phase 07 u2014 Deferred Refactors (optional)"
status: deferred
priority: P3
effort: 4h+
---

# Phase 07 u2014 Deferred Refactors (optional)

## Context Links
- Research: `research/researcher-frontend-cleanup-validation.md` u00a7 2 Track B, Track C
- Plan: `plan.md`

---

## Parallelization Info

- **Mode:** Independent; starts only after Phase 06 completes
- **Blocks:** nothing
- **Blocked by:** Phase 06 (must have stable baseline before structural changes)
- **Internal sequencing:** PMDashboard split must follow Phase 05 commit (PMDashboard.tsx); all other items can be parallelized if file ownership is respected

---

## Overview

High-effort, medium-risk structural refactors deferred from the main plan. Not on the critical path. Address DX/maintainability debt only after core cleanup, security, and performance changes are stable.

**Priority:** P3 | **Status:** deferred

---

## Key Insights

- OKRsManagement (1544 ln) and DailySync (937 ln) exceed the 200-line file limit; split is worthwhile but carries state-boundary risk.
- MarketingBoard + TechBoard share ~95% logic u2014 deduplication saves ~450 lines long-term but risks breaking DnD context.
- CustomDatePicker vs date-picker.tsx: single caller (TaskModal); safe migration but needs visual regression check.
- PMDashboard structural split is safe only after Phase 05 caching commits (shared file ownership risk).
- SprintBoard (190 ln) and EpicBoard are already lean u2014 do not touch (YAGNI).

---

## Requirements

- Functional: no behavioral change; purely structural.
- Non-functional: all affected files under 200 lines after split.
- Non-functional: `npx tsc --noEmit` + `npm run build` + browser golden path pass after each sub-item.

---

## Architecture

```
OKRsManagement split:
  src/pages/OKRsManagement.tsx (1544 ln)
    u2514u2500u2500 src/components/okr/okr-objectives-panel.tsx
    u2514u2500u2500 src/components/okr/okr-key-results-panel.tsx
    u2514u2500u2500 src/components/okr/okr-cycles-panel.tsx
  Shell page keeps top-level state (useReducer or useState) that crosses panels.

DailySync split:
  src/pages/DailySync.tsx (937 ln)
    u2514u2500u2500 src/components/daily-sync/daily-sync-form-router.tsx
  Page shell routes to correct team form; form-router handles conditional render.

PMDashboard split (after Phase 05 commit):
  src/pages/PMDashboard.tsx (513 ln)
    u2514u2500u2500 src/components/dashboard/pm/pm-dashboard-metrics-section.tsx
    u2514u2500u2500 src/components/dashboard/pm/pm-dashboard-activity-section.tsx
  useQuery hooks stay in sub-components; page shell composes them.

Board deduplication:
  src/pages/MarketingBoard.tsx + TechBoard.tsx
    u2514u2500u2500 src/components/board/group-board-shell.tsx (new shared shell)
  use-group-board-filters hook used as seam.
  DnD provider stays in shell; board-specific config passed as props.

CustomDatePicker migration:
  src/components/ui/CustomDatePicker.tsx u2192 delete after migrating TaskModal
  src/components/modals/TaskModal.tsx u2192 use date-picker.tsx instead
```

---

## Related Code Files

**Edit:**
- `src/pages/OKRsManagement.tsx`
- `src/pages/DailySync.tsx`
- `src/pages/PMDashboard.tsx` (structural split only; after Phase 05)
- `src/pages/MarketingBoard.tsx`
- `src/pages/TechBoard.tsx`
- `src/components/modals/TaskModal.tsx`

**Create:**
- `src/components/okr/okr-objectives-panel.tsx`
- `src/components/okr/okr-key-results-panel.tsx`
- `src/components/okr/okr-cycles-panel.tsx`
- `src/components/daily-sync/daily-sync-form-router.tsx`
- `src/components/board/group-board-shell.tsx`
- `src/components/dashboard/pm/pm-dashboard-metrics-section.tsx`
- `src/components/dashboard/pm/pm-dashboard-activity-section.tsx`

**Delete:**
- `src/components/ui/CustomDatePicker.tsx` (after TaskModal migrated)

**Do NOT touch:**
- `src/pages/SprintBoard.tsx` (190 ln, already lean u2014 YAGNI)
- `src/pages/EpicBoard.tsx` (lean u2014 YAGNI)

---

## File Ownership

Within Phase 07, if parallelized across sub-agents:

| Sub-task | Files owned |
|----------|-------------|
| OKR split | `OKRsManagement.tsx`, `src/components/okr/` (new) |
| DailySync split | `DailySync.tsx`, `src/components/daily-sync/` (new) |
| Board dedup | `MarketingBoard.tsx`, `TechBoard.tsx`, `src/components/board/group-board-shell.tsx` (new) |
| DatePicker migration | `TaskModal.tsx`, `CustomDatePicker.tsx` (delete) |
| PMDashboard split | `PMDashboard.tsx`, `src/components/dashboard/pm/` (new) u2014 after Phase 05 |

No two sub-tasks share a file.

---

## Implementation Steps

> Before starting any sub-task: read the full target file to map internal state dependencies. Do not split across a state boundary.

### OKRsManagement Split
1. Read `src/pages/OKRsManagement.tsx` fully; map all `useState`/`useReducer` calls and which panels consume them.
2. Keep shared state in page shell; pass via props (not context u2014 KISS).
3. Extract each panel to its own file under `src/components/okr/`.
4. Validate: `npx tsc --noEmit` + browser: OKRs tabs all render.

### DailySync Split
5. Read `src/pages/DailySync.tsx`; identify form routing logic vs page shell.
6. Extract form router to `daily-sync-form-router.tsx`; page shell imports and renders it.
7. Validate: form selector routes to correct team form; submit succeeds.

### Board Deduplication
8. Read both board files; confirm `use-group-board-filters` is used by both.
9. Confirm server-side vs client-side team filtering (see Unresolved Q7).
10. Extract shared logic to `group-board-shell.tsx`; accept board config as props.
11. DnD provider stays in shell; board-specific columns passed as children or render-props.
12. Validate: filters work, cards drag/drop, no visual regression on both boards.

### CustomDatePicker Migration
13. Screenshot TaskModal date picker before migration.
14. Read `src/components/ui/date-picker.tsx` u2014 confirm API surface matches needs of TaskModal.
15. Update TaskModal to import from `date-picker.tsx`; verify date format output matches stored ISO format.
16. Screenshot after; compare visually.
17. Delete `CustomDatePicker.tsx`.
18. Validate: `grep -rn 'CustomDatePicker' src/` returns zero results.

### PMDashboard Structural Split (last, after Phase 05 committed)
19. Read post-Phase-05 PMDashboard.tsx; identify useQuery groupings by concern.
20. Extract metric and activity sections to sub-components; move their useQuery calls down.
21. Page shell composes sub-components.
22. Validate: all 6 sections still populate; caching still works.

---

## Todo List

- [ ] Read OKRsManagement.tsx u2014 map state dependencies
- [ ] Extract okr-objectives-panel, okr-key-results-panel, okr-cycles-panel
- [ ] Validate OKRs tabs in browser
- [ ] Read DailySync.tsx u2014 identify form routing logic
- [ ] Extract daily-sync-form-router.tsx
- [ ] Validate DailySync form routing in browser
- [ ] Read MarketingBoard + TechBoard u2014 confirm shared logic seam
- [ ] Create group-board-shell.tsx
- [ ] Validate both boards: filters, DnD, no regression
- [ ] Screenshot TaskModal before CustomDatePicker migration
- [ ] Migrate TaskModal to date-picker.tsx
- [ ] Delete CustomDatePicker.tsx; grep confirms zero references
- [ ] Read post-Phase-05 PMDashboard.tsx
- [ ] Extract pm-dashboard-metrics-section + pm-dashboard-activity-section
- [ ] Validate PMDashboard: all sections + caching intact
- [ ] Full `npx tsc --noEmit` + `npm run build` pass
- [ ] Browser golden path green

---

## Success Criteria

- All split files are under 200 lines
- No behavioral regression on any affected page
- `npx tsc --noEmit` exits 0, `npm run build` exits 0
- Browser golden path fully green
- `grep -rn 'CustomDatePicker' src/` returns zero results

---

## Conflict Prevention

- PMDashboard sub-task must start only after Phase 05 is committed (shared file).
- Within Phase 07, sub-tasks are fully file-disjoint and can parallelize safely.
- No backend files touched.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OKRsManagement state crosses split boundary | Medium | High | Read full file; keep all shared state in page shell |
| Board DnD breaks after shell extraction | Medium | Med | Keep DnD provider in shell; test drag across columns after every change |
| CustomDatePicker date format diverges from date-picker | Medium | Med | Screenshot + ISO format check before delete |
| PMDashboard useQuery keys duplicated across sub-components | Low | Low | Use same keys as Phase 05; deduplication is automatic in Tanstack Query |

---

## Security Considerations

- Structural refactor only; no auth surface, no new endpoints, no data handling changes.

---

## Next Steps

- After Phase 07: file-size budget maintained. Consider enforcing a lint rule for max file lines to prevent recurrence.
- If board DnD or OKR state split proves too complex, defer to individual feature tickets rather than blocking the PR.
