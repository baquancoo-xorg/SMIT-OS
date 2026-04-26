# Phase 01: Define Dashboard UI Primitives

## Context Links
- Overview plan: [plan.md](plan.md)
- Current tab reference: `src/components/ui/ViewToggle.tsx`
- Current dashboard page: `src/pages/DashboardOverview.tsx`
- Current PM dashboard page: `src/pages/PMDashboard.tsx`

## Overview
Priority: P1  
Status: pending  
Create reusable dashboard UI primitives before moving page content. This phase should not change data fetching or dashboard behavior.

## Requirements
- Add/standardize dashboard-specific UI primitives:
  - `DashboardPageHeader`
  - `SegmentedTabs`
  - `DashboardSectionTitle`
  - `DashboardPanel`
  - `DashboardEmptyState`
- Keep components small and focused.
- Prefer existing Tailwind tokens: `text-primary`, `bg-surface-container-high`, `text-on-surface`.
- Avoid introducing a broad design-system framework.

## Architecture
Suggested files:
- `src/components/dashboard/ui/dashboard-page-header.tsx`
- `src/components/dashboard/ui/segmented-tabs.tsx`
- `src/components/dashboard/ui/dashboard-section-title.tsx`
- `src/components/dashboard/ui/dashboard-panel.tsx`
- `src/components/dashboard/ui/dashboard-empty-state.tsx`
- Optional barrel: `src/components/dashboard/ui/index.ts`

### Component responsibilities
- `DashboardPageHeader`
  - Props: `breadcrumb`, `title`, `accent`, `children/rightControls`.
  - Renders shared header shell: flex column on mobile, row/end aligned on desktop.
- `SegmentedTabs`
  - Props: `value`, `onChange`, `options`.
  - Style derived from Team Backlog `ViewToggle` pill pattern.
  - Use button semantics. If adding ARIA tab roles, keep implementation simple.
- `DashboardSectionTitle`
  - Props: `children`, optional `action`.
  - Standard blue vertical marker.
- `DashboardPanel`
  - Props: `children`, `className`, optional padding/overflow variant.
  - Default glass panel: `bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm`.
- `DashboardEmptyState`
  - Used for Product/Marketing/Media Coming soon.

## Implementation Steps
1. Create the dashboard UI primitives under `src/components/dashboard/ui/`.
2. Reuse `cn` helper if it exists; otherwise use simple className concatenation already used in project.
3. Keep `ViewToggle.tsx` unchanged unless there is a strong reason to deduplicate later.
4. Use `type` unions where helpful, but do not over-abstract tab value typing globally.
5. Ensure components are reusable by DashboardOverview and PMDashboard.

## Success Criteria
- New primitives compile with TypeScript.
- No page behavior changed yet.
- Styles visually match Team Backlog/Analytics screenshots.

## Risk Assessment
- Risk: over-abstraction. Mitigation: only support props needed by current pages.
- Risk: style drift from `ViewToggle`. Mitigation: copy the same pill classes deliberately.

## Security Considerations
No security impact. UI-only primitives.

## Todo List
- [ ] Create dashboard UI primitives.
- [ ] Export primitives from optional index file.
- [ ] Verify no unused imports or TypeScript errors.
