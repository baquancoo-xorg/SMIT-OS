---
title: "Phase 1 — Shared Page Layout Primitives"
status: completed
priority: P2
effort: 2h
---

# Phase 1 — Shared Page Layout Primitives

## Context Links

- Contract: `docs/ui-design-contract.md` §1-2, §17-19, §22, §24-27, §42-43, §48, §50
- Baseline page: `src/pages/v5/MediaTracker.tsx`
- Baseline toolbar: `src/components/v5/growth/media/media-filter-bar.tsx`
- Existing primitives: `src/components/v5/ui/button.tsx`, `input.tsx`, `custom-select.tsx`, `filter-chip.tsx`, `date-range-picker.tsx`, `kpi-card.tsx`, `data-table.tsx`, `table-shell.tsx`, `card.tsx`

## Overview

Create a small reusable layout layer that captures Media page's toolbar and section rhythm without rewriting business logic. The primitives should standardize alignment, spacing, height, responsive wrapping, and section order across v5 pages.

## Key Insights

- Media already demonstrates the target composition: toolbar first, KPI summary next, data section last.
- Current drift is mostly layout/class duplication, not missing business capability.
- A full data-layout framework would be overkill; only toolbar/section stacking needs centralization.
- Settings/Profile need semantic adaptation, not forced KPI/table symmetry.

## Requirements

**Functional**
- Add a canonical `PageToolbar` primitive with left and right slots.
- Add a canonical `PageSectionStack` primitive for vertical page rhythm.
- Desktop toolbar: left controls and right controls share one horizontal baseline.
- Mobile toolbar: wraps cleanly without changing semantic order.
- Support `children`, `left`, and `right` slots without requiring page-specific data knowledge.

**Non-Functional**
- Keep each new code file under 200 lines.
- No new dependencies.
- Use existing tokens/classes only; no raw hex/rgb.
- No solid orange backgrounds for toolbar states.
- Keep API boring: no render-prop framework, no page registry.

## Architecture / Data Flow

```
Page
  └─ PageSectionStack
      ├─ PageToolbar
      │   ├─ left: Search / Group / Filter
      │   └─ right: Action / DateRangePicker
      ├─ KPI summary grid (existing KpiCard/Card)
      └─ Data section (existing DataTable/TableShell/Card)
```

Suggested API:

```tsx
<PageToolbar
  left={<>{search}{group}{filter}</>}
  right={<>{action}{dateRange}</>}
/>

<PageSectionStack>
  <PageToolbar ... />
  <KpiSummary />
  <DataTable />
</PageSectionStack>
```

## Related Code Files

- **Create:** `src/components/v5/ui/page-toolbar.tsx`
- **Create:** `src/components/v5/ui/page-section-stack.tsx`
- **Modify:** `src/components/v5/ui/index.ts` if exports are used elsewhere
- **Read:** Media baseline and existing v5 primitives listed above

## Implementation Steps

1. Read Media toolbar and page composition to extract current class patterns.
2. Create `PageToolbar` with left/right slots, tokenized spacing, desktop `justify-between`, responsive wrapping.
3. Ensure default child controls align at `h-8` / body-sm without mutating child components.
4. Create `PageSectionStack` for consistent vertical gap between toolbar, KPI, and data sections.
5. Export primitives from `src/components/v5/ui/index.ts` only if this repo uses that path; otherwise keep direct imports.
6. Replace no page usage in this phase except optional Media smoke integration if needed to verify API.
7. Run `npm run typecheck`.

## Todo List

- [x] Read Media toolbar/page baseline
- [x] Create `PageToolbar`
- [x] Create `PageSectionStack`
- [x] Confirm files are under 200 lines
- [x] Confirm no raw colors or solid orange states
- [x] Run `npm run typecheck`

## Success Criteria

- Shared primitive expresses Media toolbar layout without page-specific logic.
- Desktop left/right clusters align on one row.
- Narrow viewport wraps without clipped controls.
- Existing primitives remain unchanged unless a real mismatch is found.
- TypeScript compiles clean.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Primitive becomes too generic | Medium | Medium | Keep only left/right slots and stack gap; no registry/config DSL |
| Child controls still have mismatched heights | Medium | Low | Fix specific child usage during page migrations, not primitive magic |
| Direct export creates barrel drift | Low | Low | Prefer direct imports unless existing code uses UI index consistently |

## Accessibility Considerations

- Toolbar should not add fake roles; preserve native control semantics.
- Icon-only action buttons still require `aria-label`.
- Responsive wrapping must preserve focus order: Search → Group → Filter → Action → Date.

## Security Considerations

None — layout-only UI primitives, no data/auth paths touched.

## Next Steps

Phase 2 migrates Growth pages to the shared toolbar/section rhythm.
