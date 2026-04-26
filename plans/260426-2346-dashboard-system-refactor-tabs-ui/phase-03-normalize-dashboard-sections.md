# Phase 03: Normalize Dashboard Sections, Cards, and Tables

## Context Links
- Overview plan: [plan.md](plan.md)
- UI primitives: [phase-01-dashboard-ui-primitives.md](phase-01-dashboard-ui-primitives.md)
- Analytics tabs: [phase-02-dashboard-overview-tabs.md](phase-02-dashboard-overview-tabs.md)

## Overview
Priority: P1  
Status: pending  
Apply dashboard primitives to existing dashboard sections so cards, containers, tables, and section headers share one visual style.

## Requirements
- Use `DashboardSectionTitle` for repeated section headers.
- Use `DashboardPanel` for loading/error/panel wrappers where possible.
- Normalize direct hex primary usages to Tailwind tokens when safe:
  - Prefer `text-primary`, `bg-primary`, `bg-primary/10`.
  - Keep chart library hex values only where CSS vars are awkward or already expected.
- Do not alter KPI table scroll-sync architecture.
- Do not change metrics calculations, sorting, view mode, or table columns.

## Related Code Files
Likely modify:
- `src/components/dashboard/overview/SummaryCards.tsx`
- `src/components/dashboard/overview/KpiTable.tsx`
- `src/components/dashboard/call-performance/call-performance-section.tsx`
- `src/components/dashboard/call-performance/call-performance-ae-table.tsx`
- `src/components/dashboard/call-performance/call-performance-heatmap.tsx`
- `src/components/dashboard/call-performance/call-performance-conversion.tsx`
- `src/components/dashboard/call-performance/call-performance-trend.tsx`
- `src/pages/DashboardOverview.tsx`

## Implementation Steps
1. Replace duplicated section title markup with `DashboardSectionTitle`.
2. Replace repeated glass panel class strings with `DashboardPanel` where it improves clarity.
3. Keep KPI table internal layout intact; only adjust wrapper/header styling.
4. Standardize loading/error panels across SummaryCards, KpiTable, CallPerformanceSection.
5. Normalize primary color classes in touched components.
6. Check chart panels for consistent padding/radius/shadow.
7. Avoid refactoring business logic or extracting table internals.

## Success Criteria
- No duplicated blue-left-bar section title in touched dashboard files.
- Loading/error states use consistent panel style.
- Summary cards, KPI table, Call Performance sections visually align.
- KPI horizontal scroll and fixed total row behavior remain unchanged.

## Risk Assessment
- Risk: breaking sticky/scroll behavior in KpiTable. Mitigation: do not alter the table’s three-div scroll-sync structure.
- Risk: className wrapper changes alter overflow. Mitigation: test horizontal scroll in browser.

## Security Considerations
No security impact. UI-only refactor.

## Todo List
- [ ] Normalize section title markup.
- [ ] Normalize panel/card wrappers.
- [ ] Normalize primary color token usage.
- [ ] Verify KPI table scroll behavior.
