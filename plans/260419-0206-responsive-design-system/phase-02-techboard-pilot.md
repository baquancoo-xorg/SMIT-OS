# Phase 2: TechBoard Pilot

**Priority:** Critical
**Status:** complete
**Duration:** Day 3-4
**Depends on:** Phase 1 (Foundation)

## Overview

Refactor TechBoard (Kanban phức tạp nhất) làm pilot để validate approach trước khi rollout.

## Key Insights

**Current Issues (from scout):**
- Fixed heights: `h-[400px]` backlog, `h-[500px]` board
- Spacing inconsistent: `space-y-8`, `gap-6`, `p-4/5/6`
- Not viewport-fit: content overflows on small screens

**Target Structure:**
```
┌─────────────────────────────────────────────┐
│ Page Header (flex-shrink-0)                 │
├─────────────────────────────────────────────┤
│ Filter Bar (flex-shrink-0)                  │
├─────────────────────────────────────────────┤
│ Board Area (flex-1, internal scroll)        │
│ ┌──────────┬──────────────────────────────┐ │
│ │ Backlog  │ Sprint Columns               │ │
│ │ (25%)    │ (75%) - horizontal scroll    │ │
│ │ internal │ ┌────┬────┬────┬────┐        │ │
│ │ scroll   │ │Todo│IP  │Rev │Done│        │ │
│ │          │ │    │    │    │    │        │ │
│ └──────────┴─┴────┴────┴────┴────┴────────┘ │
└─────────────────────────────────────────────┘
```

## Requirements

### Functional
- Viewport-fit: no page-level vertical scroll
- Internal scroll in backlog & columns
- Responsive: stack on mobile, side-by-side on tablet+
- Touch-friendly on iPad/iPhone

### Non-Functional
- Performance: smooth scroll with 50+ cards
- Accessibility: touch targets ≥ 44px

## Related Files

**Modify:**
- `src/pages/TechBoard.tsx` - Main layout refactor
- `src/components/board/TaskCard.tsx` - Consistent sizing
- `src/components/board/droppable-column.tsx` - Column structure

**Reference:**
- `src/index.css` - Use new tokens

## Implementation Steps

### Step 1: TechBoard Layout Structure

```tsx
// Before (line 303):
<div className="h-full flex flex-col py-6 lg:py-10 space-y-8 w-full">

// After:
<div className="viewport-fit flex flex-col gap-[var(--space-lg)]">
```

### Step 2: Page Header Section

```tsx
// Keep header flexible but compact
<div className="flex flex-col md:flex-row md:items-center justify-between gap-[var(--space-md)] shrink-0">
  {/* Title - responsive font size */}
  <h2 className="text-2xl lg:text-4xl font-extrabold ...">
```

### Step 3: Filter Bar

```tsx
// Compact, shrink-0
<div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-[var(--space-md)] rounded-3xl shadow-sm shrink-0">
```

### Step 4: Board Area (Main Change)

```tsx
// Before (line 394-396):
<div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
  <div className="w-full lg:w-1/4 h-[400px] lg:h-auto ...">
  <div className="w-full lg:w-3/4 ... h-[500px] lg:h-auto">

// After:
<div className="flex-1 flex flex-col tablet:flex-row gap-[var(--space-md)] min-h-0">
  {/* Backlog - 25% width, full height, internal scroll */}
  <div className="w-full tablet:w-1/4 flex flex-col bg-surface-container-low/30 rounded-3xl shadow-sm min-h-[200px] tablet:min-h-0 tablet:h-full shrink-0 tablet:shrink">
    <div className="shrink-0 p-[var(--space-md)] ...">Header</div>
    <div className="internal-scroll p-[var(--space-sm)] space-y-[var(--space-sm)]">
      {/* Cards */}
    </div>
  </div>

  {/* Sprint Board - 75%, horizontal scroll for columns */}
  <div className="flex-1 flex gap-[var(--space-sm)] overflow-x-auto min-h-[300px] tablet:min-h-0">
    {/* Columns with internal scroll */}
  </div>
</div>
```

### Step 5: Column Structure

```tsx
// Each column: flex-1, internal scroll
<div className="min-w-[var(--card-min)] flex-1 flex flex-col bg-slate-50/50 rounded-3xl max-h-full">
  <div className="shrink-0 p-[var(--space-sm)] ...">Column Header</div>
  <DroppableColumn className="internal-scroll p-[var(--space-sm)] space-y-[var(--space-sm)]">
    {/* Cards */}
  </DroppableColumn>
</div>
```

### Step 6: TaskCard Touch Targets

```tsx
// Ensure touch-friendly
<div className="touch-target p-[var(--space-md)] ...">
```

### Step 7: Mobile Layout (Stacked)

```tsx
// On mobile: tabs or accordion for columns
// Show one column at a time with swipe/tabs
@media (max-width: 767px) {
  // Backlog collapsed by default
  // Columns as horizontal swipeable tabs
}
```

## Device Testing Checklist

### Desktop (1920x1080)
- [ ] Viewport-fit, no scroll
- [ ] 4 columns visible side-by-side
- [ ] Smooth DnD

### iPad Pro 12.9" Landscape (2732x2048 → ~1366 CSS)
- [ ] Viewport-fit
- [ ] Backlog + 4 columns visible
- [ ] Touch DnD works

### iPad Pro 11" (1194x834)
- [ ] Viewport-fit
- [ ] May need horizontal scroll for columns

### iPhone 15 Pro Max (430px)
- [ ] Stacked layout
- [ ] Backlog collapsible
- [ ] Column tabs/swipe
- [ ] Touch targets ≥ 44px

### iPhone 13 (390px)
- [ ] Same as 15 Pro Max
- [ ] Verify no horizontal overflow

## Todo List

- [ ] Refactor TechBoard container to viewport-fit
- [ ] Apply spacing tokens to header/filter
- [ ] Fix backlog: remove h-[400px], use flex
- [ ] Fix board area: remove h-[500px], use flex-1
- [ ] Add internal scroll to columns
- [ ] Apply card-min to column widths
- [ ] Test on desktop
- [ ] Test on iPad Pro (real device)
- [ ] Test on iPhone (real device)
- [ ] Fix any overflow issues
- [ ] Verify DnD still works

## Success Criteria

- [ ] TechBoard fits viewport on all target devices
- [ ] No page-level vertical scroll
- [ ] Internal scroll works in backlog + columns
- [ ] DnD functional
- [ ] Touch targets ≥ 44px on mobile

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| DnD breaks | Medium | High | Test early, minimal DOM changes |
| Mobile layout complex | Medium | Medium | Consider tabs approach |
| Many cards slow | Low | Medium | Virtualize if needed |

## Next Steps

→ Phase 3: Rollout to remaining pages
