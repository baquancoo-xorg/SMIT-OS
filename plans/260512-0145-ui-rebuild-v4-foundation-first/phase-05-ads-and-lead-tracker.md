# Phase 05 — AdsTracker + LeadTracker Rebuild

## Context Links

- Plan overview: [plan.md](./plan.md)
- Brainstorm: `/Users/dominium/Documents/Project/SMIT-OS/plans/reports/brainstorm-260512-0145-ui-rebuild-v4-foundation-first.md` §4.1 week 5
- v3 sources: `/Users/dominium/Documents/Project/SMIT-OS/src/pages/AdsTracker.tsx`, `/Users/dominium/Documents/Project/SMIT-OS/src/pages/LeadTracker.tsx`
- v4 components: `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/index.ts`
- Layout shell: `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/layouts/app-shell.tsx`

## Overview

- Date: week 5
- Priority: P1
- Status: pending
- Goal: rebuild the two heaviest tracker pages on v4 to confirm `data-table`, `filter-chip`, `date-range-picker`, `form-dialog` hold up under real domain data.

## Key Insights

- Both pages are data-table heavy → great stress test for v4 `data-table` and pagination/sort
- LeadTracker has more form interactions (create/edit lead) → exercises `form-dialog` + `custom-select`
- Reuse all existing data hooks/queries — only UI rebuilt
- v4 imports v3 components = forbidden; lint blocks. Anything missing requires returning to Phase 03 to add a Tier 3 slot or extend a component

## Requirements

**Functional:**
- `src/pages-v4/ads-tracker.tsx` matches v3 feature set: list, filter, sort, create/edit/delete
- `src/pages-v4/lead-tracker.tsx` matches v3 feature set
- Both routes mounted at `/v4/ads-tracker` + `/v4/lead-tracker`
- Reuse v3 data queries unchanged
- Git tags `ui-v4-page-ads-tracker`, `ui-v4-page-lead-tracker`

**Non-functional:**
- a11y: keyboard-navigable tables, focus-visible everywhere
- File size: < 200 lines each; split into subfolders if larger
- Lint: zero raw tokens in `src/pages-v4/**`

## Architecture

```
src/pages-v4/
├── ads-tracker.tsx               (page entry)
├── ads-tracker/
│   ├── ads-tracker-filters.tsx   (filter-chip + date-range-picker row)
│   ├── ads-tracker-table.tsx     (data-table wrapping ads data)
│   └── ads-tracker-form.tsx      (form-dialog for create/edit)
├── lead-tracker.tsx
└── lead-tracker/
    ├── lead-tracker-filters.tsx
    ├── lead-tracker-table.tsx
    └── lead-tracker-form.tsx
```

Each subfile < 200 lines. Page entry composes via v4 `app-shell` + `page-header`.

## Related Code Files

**Modify:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/App.tsx` (or router file) — add `/v4/ads-tracker` + `/v4/lead-tracker` routes
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/layouts/nav-items.ts` — add nav entries

**Create:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/ads-tracker.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/ads-tracker/ads-tracker-filters.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/ads-tracker/ads-tracker-table.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/ads-tracker/ads-tracker-form.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/lead-tracker.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/lead-tracker/lead-tracker-filters.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/lead-tracker/lead-tracker-table.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/lead-tracker/lead-tracker-form.tsx`

**Delete:** none (v3 stays until Phase 09)

## Implementation Steps

1. Read v3 `AdsTracker.tsx` carefully — list every feature, every query hook, every field.
2. Build `ads-tracker.tsx` shell using `app-shell` + `page-header` + slots for filters/table.
3. Build `ads-tracker-filters.tsx` — `filter-chip`, `date-range-picker`, `custom-select` for status/owner.
4. Build `ads-tracker-table.tsx` — `data-table` with sortable headers, `table-row-actions` per row.
5. Build `ads-tracker-form.tsx` — `form-dialog` for create/edit with `input` + `custom-select` + `date-picker`.
6. Wire to router. Test on `/v4/ads-tracker` after toggling flag.
7. Smoke checklist: load, sort, filter, create, edit, delete, empty state, error state.
8. Tag `ui-v4-page-ads-tracker`.
9. Repeat steps 1-8 for LeadTracker.
10. Tag `ui-v4-page-lead-tracker`.
11. Internal tester feedback round (1-2 days).
12. Append entries to `docs/project-changelog.md`.

## Todo List

- [ ] Audit v3 AdsTracker feature set
- [ ] `ads-tracker.tsx` page shell
- [ ] `ads-tracker-filters.tsx`
- [ ] `ads-tracker-table.tsx`
- [ ] `ads-tracker-form.tsx`
- [ ] Router mount `/v4/ads-tracker`
- [ ] AdsTracker smoke pass
- [ ] Tag `ui-v4-page-ads-tracker`
- [ ] Audit v3 LeadTracker feature set
- [ ] `lead-tracker.tsx` page shell
- [ ] `lead-tracker-filters.tsx`
- [ ] `lead-tracker-table.tsx`
- [ ] `lead-tracker-form.tsx`
- [ ] Router mount `/v4/lead-tracker`
- [ ] LeadTracker smoke pass
- [ ] Tag `ui-v4-page-lead-tracker`
- [ ] Tester feedback collected
- [ ] Append changelog entries

## Success Criteria

- Both pages render with identical data fidelity vs v3
- Lint green on `src/pages-v4/ads-tracker*` and `src/pages-v4/lead-tracker*`
- Every file < 200 lines
- 2 git tags pushed
- Tester reports no blocking regressions

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `data-table` missing pagination support | Medium | Medium | If discovered, add to v4 data-table (Phase 03 extension); do not hardcode |
| Filter state shape differs between pages | Medium | Low | Each page owns local state; no shared filter store |
| Form validation reuses v3 schema → coupling | Low | Medium | Extract shared zod schemas to `src/shared/schemas/` if found; otherwise duplicate |
| v3 page renames hide functionality | Medium | Medium | Read full v3 file end-to-end before rebuild; do not paraphrase |
| Date format mismatch DB ↔ picker | Medium | Low | Reuse v3 `table-date-format.ts` util if pure formatter |

## Security Considerations

- Form submit endpoints unchanged; CSRF token / auth unchanged.
- `table-row-actions` delete confirms via `confirm-dialog` (no accidental delete).
- Lead data may be PII — UI must not log to console in production.

## Next Steps

- Unlocks nothing new (Phase 04 already unblocked all page phases).
- Handoff: 2 tags + tester feedback summary.
