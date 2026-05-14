---
title: "Phase 3 — Remaining v5 Pages and Settings"
status: completed
priority: P2
effort: 2h
---

# Phase 3 — Remaining v5 Pages and Settings

## Context Links

- Phase 1: `phase-01-shared-page-layout-primitives.md`
- Phase 2: `phase-02-growth-workspace-migration.md`
- Contract: `docs/ui-design-contract.md` §24-27, §40, §42-43, §48, §50

## Overview

Apply the Media-derived rhythm to non-Growth v5 pages where it fits: Dashboard, Reports, Execution pages, Settings, and Profile. This phase is intentionally semantic: align shared UI patterns without forcing fake KPI/table structures.

## Key Insights

- Dashboard has command-center-specific layout and should not be flattened into a tracker page.
- Reports likely benefits from toolbar/date/action and data panel consistency.
- Execution pages may need card/form alignment more than KPI/table migration.
- Settings requires page-level TabPill and canonical card/table/form treatment, not KPI cards.
- Profile should align card/form styling only if no toolbar/data table is present.

## Requirements

**Functional**
- Reports uses canonical toolbar alignment where filters/actions/date exist.
- Dashboard keeps its flagship layout but aligns KPI/card/table hover and section shell details.
- Daily Sync, Weekly Check-in, and OKRs align action/filter rows if present.
- Settings keeps page tabs and aligns tab content cards/tables/forms to Media/v5 contract.
- Profile aligns card/form section styling without fake toolbar/KPI additions.

**Non-Functional**
- No route behavior changes.
- No fake data or placeholder controls.
- No business logic changes.
- No new arbitrary colors/radii/shadows.
- Preserve dark/light theme parity.

## Architecture / Data Flow

```
Remaining v5 Page
  ├─ Keep page-specific content model
  ├─ Use PageSectionStack where vertical rhythm matches Media
  ├─ Use PageToolbar only when the page has real controls/actions
  └─ Keep existing data/form components, visually aligned to v5 contract
```

## Related Code Files

- **Modify as needed:** `src/pages/v5/DashboardOverview.tsx`
- **Modify:** `src/pages/v5/Reports.tsx`
- **Modify as needed:** `src/pages/v5/DailySync.tsx`
- **Modify as needed:** `src/pages/v5/WeeklyCheckin.tsx`
- **Modify as needed:** `src/pages/v5/OKRsManagement.tsx`
- **Modify:** `src/pages/v5/Settings.tsx`
- **Modify as needed:** `src/pages/v5/Profile.tsx`

## Implementation Steps

1. Audit each remaining v5 page for real toolbar/filter/action/date controls.
2. Apply `PageToolbar` only where a real toolbar exists.
3. Apply `PageSectionStack` where the page has toolbar/card/data vertical rhythm.
4. Align Reports data panels and date/action controls to Media baseline.
5. Align Settings tab content cards/tables/forms; do not add KPI cards.
6. Align Execution/Profile cards/tables/forms where visually inconsistent.
7. Verify responsive behavior for Settings and Reports at minimum.
8. Run `npm run typecheck` and `npm run lint:ui-canon`.

## Todo List

- [x] Reports toolbar/data sections aligned
- [x] Dashboard checked for card/table hover/rhythm drift
- [x] Daily Sync checked and aligned if applicable
- [x] Weekly Check-in checked and aligned if applicable
- [x] OKRs checked and aligned if applicable
- [x] Settings tabs/cards/tables/forms aligned without fake KPI cards
- [x] Profile checked and aligned if applicable
- [x] `npm run typecheck` passes
- [x] `npm run lint:ui-canon` passes

## Success Criteria

- All v5 pages share Media's visual rhythm where semantically relevant.
- Settings is included without being distorted into a tracker layout.
- No page introduces solid orange CTA/filter/tab states.
- Dark and light modes preserve hierarchy and contrast.
- TypeScript and UI canon lint pass.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Over-standardizing unique pages | Medium | Medium | Apply primitives only when real toolbar/section rhythm exists |
| Settings gets fake tracker structure | Low | Medium | Keep Settings as tabs + cards/tables/forms only |
| Dashboard loses flagship hierarchy | Low | Medium | Only align local card/table details, not page IA |

## Accessibility Considerations

- Preserve existing tab keyboard behavior.
- Maintain form labels and table header semantics.
- Ensure toolbar wrap order follows reading/focus order.

## Security Considerations

None expected. Do not alter auth, API keys, or token handling in Settings beyond visual wrappers.

## Next Steps

Phase 4 validates visual, functional, and documentation completion.
