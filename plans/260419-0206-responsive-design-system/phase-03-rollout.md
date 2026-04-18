# Phase 3: Rollout

**Priority:** High
**Status:** complete
**Duration:** Day 5-6
**Depends on:** Phase 2 (TechBoard Pilot)

## Overview

Apply validated patterns từ TechBoard pilot sang 12 pages còn lại.

## Page Categories

### Category A: Kanban Boards (Same Pattern as TechBoard)
1. `MarketingBoard.tsx`
2. `MediaBoard.tsx`
3. `SaleBoard.tsx`

**Approach:** Copy TechBoard pattern exactly.

### Category B: Dashboard/Analytics
4. `DashboardOverview.tsx`
5. `PMDashboard.tsx`

**Approach:** Grid layout with viewport-fit, internal scroll per widget.

### Category C: Planning Pages
6. `OKRsManagement.tsx`
7. `ProductBacklog.tsx`

**Approach:** Split view or tabs, internal scroll for lists.

### Category D: Sync/Rituals
8. `DailySync.tsx`
9. `SaturdaySync.tsx`

**Approach:** Content-heavy, may allow page scroll with sticky headers.

### Category E: User Management
10. `Settings.tsx`
11. `Profile.tsx`
12. `LoginPage.tsx`

**Approach:** Form layouts, centered, simple viewport-fit.

## Implementation Order

```
Day 5 Morning:  Kanban Boards (A) - 3 pages, same pattern
Day 5 Afternoon: Dashboards (B) - 2 pages
Day 6 Morning:  Planning (C) + Sync (D) - 4 pages
Day 6 Afternoon: User Mgmt (E) - 3 pages + final testing
```

## Category A: Kanban Boards

### Pattern (Copy from TechBoard)

```tsx
<div className="viewport-fit flex flex-col gap-[var(--space-lg)]">
  {/* Header - shrink-0 */}
  <div className="shrink-0 ...">Page Header</div>
  
  {/* Filter - shrink-0 */}
  <div className="shrink-0 ...">Filter Bar</div>
  
  {/* Board - flex-1, internal scroll */}
  <div className="flex-1 flex flex-col tablet:flex-row gap-[var(--space-md)] min-h-0">
    <div className="tablet:w-1/4 internal-scroll">Backlog</div>
    <div className="flex-1 flex gap-[var(--space-sm)] overflow-x-auto">Columns</div>
  </div>
</div>
```

### Files to Update
- `src/pages/MarketingBoard.tsx`
- `src/pages/MediaBoard.tsx`
- `src/pages/SaleBoard.tsx`

## Category B: Dashboards

### Pattern

```tsx
<div className="viewport-fit flex flex-col gap-[var(--space-lg)]">
  {/* Header - shrink-0 */}
  <div className="shrink-0">Dashboard Title + Filters</div>
  
  {/* Stats Row - shrink-0 */}
  <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-[var(--space-md)]">
    {/* Stat cards */}
  </div>
  
  {/* Charts Grid - flex-1, internal scroll */}
  <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-md)] overflow-y-auto">
    {/* Chart widgets - each with max-height */}
  </div>
</div>
```

### Files to Update
- `src/pages/DashboardOverview.tsx`
- `src/pages/PMDashboard.tsx`

## Category C: Planning Pages

### Pattern

```tsx
<div className="viewport-fit flex flex-col gap-[var(--space-lg)]">
  {/* Header - shrink-0 */}
  <div className="shrink-0">Title + Actions</div>
  
  {/* Content - flex-1, split view */}
  <div className="flex-1 flex flex-col lg:flex-row gap-[var(--space-md)] min-h-0">
    <div className="lg:w-1/3 internal-scroll">Sidebar/List</div>
    <div className="flex-1 internal-scroll">Main Content</div>
  </div>
</div>
```

### Files to Update
- `src/pages/OKRsManagement.tsx`
- `src/pages/ProductBacklog.tsx`

## Category D: Sync Pages

### Pattern (Exception - Allow Page Scroll)

```tsx
<div className="min-h-[var(--content-h)] flex flex-col gap-[var(--space-lg)]">
  {/* Sticky Header */}
  <div className="sticky top-0 z-10 bg-surface shrink-0">Title + Date</div>
  
  {/* Content - natural height */}
  <div className="flex flex-col gap-[var(--space-md)]">
    {/* Meeting sections */}
  </div>
</div>
```

**Note:** Content-heavy pages may need scroll. Use sticky header.

### Files to Update
- `src/pages/DailySync.tsx`
- `src/pages/SaturdaySync.tsx`

## Category E: User Management

### Pattern (Centered)

```tsx
<div className="viewport-fit flex items-center justify-center">
  <div className="w-full max-w-md lg:max-w-2xl p-[var(--space-lg)]">
    {/* Form content */}
  </div>
</div>
```

### Files to Update
- `src/pages/Settings.tsx`
- `src/pages/Profile.tsx`
- `src/pages/LoginPage.tsx`

## Todo List

### Day 5
- [ ] MarketingBoard - apply TechBoard pattern
- [ ] MediaBoard - apply TechBoard pattern
- [ ] SaleBoard - apply TechBoard pattern
- [ ] Test all Kanban boards
- [ ] DashboardOverview - grid layout
- [ ] PMDashboard - grid layout
- [ ] Test dashboards

### Day 6
- [ ] OKRsManagement - split view
- [ ] ProductBacklog - split view
- [ ] DailySync - sticky header
- [ ] SaturdaySync - sticky header
- [ ] Settings - centered form
- [ ] Profile - centered form
- [ ] LoginPage - centered form
- [ ] Full device testing all pages

## Success Criteria

- [ ] All 12 pages follow viewport-fit pattern
- [ ] Consistent spacing using tokens
- [ ] No horizontal overflow on mobile
- [ ] Touch targets ≥ 44px

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Different page structures | Medium | Medium | Categorize first, pattern per category |
| Missing edge cases | Medium | Low | Test each page on all devices |
| Sync pages too long | High | Low | Allow scroll with sticky header |

## Next Steps

→ Phase 4: Polish
