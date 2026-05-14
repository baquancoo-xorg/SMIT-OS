---
title: "Phase 2 — Growth Workspace Migration"
status: completed
priority: P2
effort: 2h
---

# Phase 2 — Growth Workspace Migration

## Context Links

- Phase 1: `phase-01-shared-page-layout-primitives.md`
- Baseline: `src/pages/v5/MediaTracker.tsx`
- Media toolbar: `src/components/v5/growth/media/media-filter-bar.tsx`
- Contract: `docs/ui-design-contract.md` §17-19, §22, §24-27, §42-43, §48, §50

## Overview

Apply the Media baseline to Growth workspace pages first because they share the closest data/product shape: filters, date range, action buttons, KPI summaries, and tables/charts.

## Key Insights

- Media is the visual source of truth and should remain the reference implementation.
- Ads and Leads likely contain similar toolbar/date/KPI/table patterns but may use local class stacks.
- Migration should preserve all existing query params, filtering behavior, sorting, and API calls.

## Requirements

**Functional**
- Media uses or remains compatible with `PageToolbar` and `PageSectionStack`.
- Ads toolbar follows Search/Group/Filter left and Action/Date right where those controls exist.
- Leads toolbar follows the same alignment and control sizing.
- KPI summaries use existing `KpiCard`/Card visual contract with Media-like spacing.
- Tables/charts sit below KPI summaries in canonical section shells.

**Non-Functional**
- No data behavior changes.
- Do not introduce fake controls to match the pattern.
- No raw colors, no solid orange CTA/tab/filter active state.
- Keep file size under 200 lines where practical; split only if a file grows materially.

## Architecture / Data Flow

```
Growth Page
  ├─ use existing hooks/query params
  ├─ PageSectionStack
  │   ├─ PageToolbar(left controls, right controls)
  │   ├─ KPI summary component
  │   └─ chart/table/data component
  └─ unchanged business logic
```

## Related Code Files

- **Modify:** `src/pages/v5/MediaTracker.tsx`
- **Modify:** `src/components/v5/growth/media/media-filter-bar.tsx`
- **Modify as needed:** `src/components/v5/growth/media/media-kpi-summary.tsx`
- **Modify as needed:** `src/components/v5/growth/media/media-posts-table.tsx`
- **Modify as needed:** `src/components/v5/growth/media/media-group-table.tsx`
- **Modify:** `src/pages/v5/AdsTracker.tsx`
- **Modify as needed:** `src/components/v5/growth/ads/ads-kpi-cards.tsx`
- **Modify:** `src/pages/v5/LeadTracker.tsx`

## Implementation Steps

1. Start with Media: wire the primitive only if it reduces duplication and preserves the approved visual baseline.
2. Migrate Ads toolbar to the shared primitive; preserve date params and tab params.
3. Align Ads KPI cards and primary data/chart sections to Media rhythm.
4. Migrate Leads toolbar to the shared primitive; preserve date params and tab params.
5. Align Leads summary and table sections to Media rhythm.
6. Verify hover states on cards/tables remain neutral/subtle.
7. Run `npm run typecheck` and `npm run lint:ui-canon`.

## Todo List

- [x] Media remains canonical after primitive integration
- [x] Ads toolbar aligned to Media baseline
- [x] Ads KPI/data sections aligned
- [x] Leads toolbar aligned to Media baseline
- [x] Leads summary/table sections aligned
- [x] Existing URL params and filters preserved
- [x] `npm run typecheck` passes
- [x] `npm run lint:ui-canon` passes

## Success Criteria

- Growth pages visually share the same toolbar baseline and vertical order.
- Search/Group/Filter align left; Action/Date align right on desktop.
- Summary cards appear between toolbar and data sections when meaningful.
- Tables/charts use neutral surface and hover behavior.
- No business/data regression.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Date/tab params are accidentally dropped | Medium | Medium | Preserve `new URLSearchParams(searchParams)` copy pattern |
| Ads chart section does not map cleanly to table shell | Medium | Low | Treat charts as data panels, not tables |
| Media approved visual changes subtly | Low | Medium | Compare against screenshot/baseline before wider migration |

## Accessibility Considerations

- Preserve labels/aria-labels on icon-only buttons.
- Maintain logical focus order matching visual order.
- Table headers and sortable controls must keep existing semantics.

## Security Considerations

No security-sensitive changes expected. URL params remain whitelisted where already implemented.

## Next Steps

Phase 3 applies the same standard to remaining v5 pages and Settings with semantic restraint.
