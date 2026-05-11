# Phase 06 — MediaTracker + OKRsManagement + DashboardOverview

## Context Links

- Plan overview: [plan.md](./plan.md)
- Brainstorm: `/Users/dominium/Documents/Project/SMIT-OS/plans/reports/brainstorm-260512-0145-ui-rebuild-v4-foundation-first.md` §4.1 week 6
- v3 sources:
  - `/Users/dominium/Documents/Project/SMIT-OS/src/pages/MediaTracker.tsx`
  - `/Users/dominium/Documents/Project/SMIT-OS/src/pages/OKRsManagement.tsx`
  - `/Users/dominium/Documents/Project/SMIT-OS/src/pages/DashboardOverview.tsx`
- v4 components: `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/index.ts`

## Overview

- Date: week 6
- Priority: P1
- Status: pending
- Goal: rebuild three pages. MediaTracker (data-table heavy), OKRsManagement (exercises `okr-cycle-countdown` + progress UI), DashboardOverview (KPI-heavy summary view).

## Key Insights

- DashboardOverview is distinct from Phase 04 dashboard — verify with user which is the "primary" entry. Likely DashboardOverview = aggregate landing, dashboard = personal/role-scoped.
- OKR page is the only consumer of `okr-cycle-countdown` v4 component — Phase 03 must have shipped it.
- MediaTracker shares structural pattern with AdsTracker/LeadTracker — template from Phase 05 applies.

## Requirements

**Functional:**
- `src/pages-v4/media-tracker.tsx` — match v3 feature set
- `src/pages-v4/okrs-management.tsx` — match v3 feature set including cycle countdown
- `src/pages-v4/dashboard-overview.tsx` — match v3 aggregate dashboard
- Routes: `/v4/media-tracker`, `/v4/okrs`, `/v4/dashboard-overview` (match v3 paths)
- Reuse v3 data queries unchanged
- 3 git tags

**Non-functional:**
- a11y identical to prior phases
- File size < 200 lines per file
- Lint green

## Architecture

Same pattern as Phase 05:

```
src/pages-v4/
├── media-tracker.tsx
├── media-tracker/
│   ├── media-tracker-filters.tsx
│   ├── media-tracker-table.tsx
│   └── media-tracker-form.tsx
├── okrs-management.tsx
├── okrs-management/
│   ├── okrs-cycle-header.tsx       (page-header + okr-cycle-countdown)
│   ├── okrs-list.tsx
│   └── okrs-form.tsx
├── dashboard-overview.tsx
└── dashboard-overview/
    ├── overview-kpis.tsx
    ├── overview-charts.tsx         (chart slot — reuse v3 chart lib unchanged)
    └── overview-activity.tsx
```

## Related Code Files

**Modify:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/App.tsx` — add 3 v4 routes
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/layouts/nav-items.ts` — add 3 entries

**Create:** 11 files under `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/`
- `media-tracker.tsx` + 3 in `media-tracker/`
- `okrs-management.tsx` + 3 in `okrs-management/`
- `dashboard-overview.tsx` + 3 in `dashboard-overview/`

**Delete:** none

## Implementation Steps

1. Confirm with user: is DashboardOverview = primary landing or secondary? Adjust routes accordingly.
2. MediaTracker: follow Phase 05 template. Audit v3 → page shell → filters → table → form → smoke → tag.
3. OKRsManagement: audit v3 → page shell with cycle countdown → list view → create/edit form → smoke → tag. Reuse v3 progress calculation logic unchanged.
4. DashboardOverview: audit v3 → page shell → KPI grid → chart slots (wrap existing chart components — do NOT rebuild charts in Phase 06; out-of-scope per brainstorm §8) → recent activity → smoke → tag.
5. After all three, run internal tester pass.
6. Append entries to `docs/project-changelog.md`.

## Todo List

- [ ] Confirm DashboardOverview role (Q to user)
- [ ] `media-tracker.tsx` + 3 subfiles
- [ ] Router mount `/v4/media-tracker`
- [ ] Smoke + tag `ui-v4-page-media-tracker`
- [ ] `okrs-management.tsx` + 3 subfiles
- [ ] Router mount `/v4/okrs`
- [ ] Smoke + tag `ui-v4-page-okrs-management`
- [ ] `dashboard-overview.tsx` + 3 subfiles
- [ ] Router mount `/v4/dashboard-overview`
- [ ] Smoke + tag `ui-v4-page-dashboard-overview`
- [ ] Tester feedback collected
- [ ] Append changelog entries

## Success Criteria

- 3 pages render with full v3 fidelity
- 3 git tags pushed
- All files < 200 lines, lint green
- Cycle countdown component exercised + visually correct
- Charts render unchanged inside v4 shell

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Chart library tied to v3 tokens via inline color | High | Medium | Pass v4 token values to chart props (CSS custom properties); do NOT rewrite charts |
| OKR cycle math hidden in v3 component | Medium | Medium | Extract to shared util `src/shared/okr-cycle.ts` if needed |
| DashboardOverview duplicates Dashboard | Medium | Low | Confirm with user; if dupe, deprecate one v4-side |
| Tag naming conflict between dashboard + dashboard-overview | Low | Low | Distinct slugs `dashboard` vs `dashboard-overview` |
| Media list pagination performance regressions | Medium | Low | Lazy load + virtualize only if data > 1000 rows (defer otherwise) |

## Security Considerations

- Charts render data only; no eval, no user HTML.
- OKR data may include personal targets — UI must respect auth scope unchanged from v3.
- Media URLs sanitized server-side (unchanged).

## Next Steps

- Approaching v3 page parity. Phase 07 + Phase 08 follow.
- Handoff: 3 tags + tester feedback.
