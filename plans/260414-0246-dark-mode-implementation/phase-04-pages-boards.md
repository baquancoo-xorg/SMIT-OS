# Phase 4: Pages & Board Components

**Priority:** Medium | **Effort:** 1.5h | **Status:** pending

## Overview

Add dark mode to all pages and board components. Largest phase.

## Files

### Pages (10 files)

| File | Key Elements |
|------|--------------|
| `LoginPage.tsx` | Form card, inputs |
| `PMDashboard.tsx` | Stats cards, tables |
| `ProductBacklog.tsx` | Task cards, filters |
| `DailySync.tsx` | Timeline, cards |
| `SaturdaySync.tsx` | Review cards |
| `OKRsManagement.tsx` | OKR cards, progress |
| `Settings.tsx` | Form sections |
| `Profile.tsx` | Profile card |
| `TechBoard.tsx` | Kanban columns |
| `MarketingBoard.tsx` | Kanban columns |
| `SaleBoard.tsx` | Kanban columns |
| `MediaBoard.tsx` | Kanban columns |

### Board Components (8 files)

| File | Key Elements |
|------|--------------|
| `TaskCard.tsx` | Card bg, badges, text |
| `TaskModal.tsx` | Form modal |
| `TaskDetailsModal.tsx` | Detail view |
| `TaskTableView.tsx` | Table rows |
| `ReportTableView.tsx` | Report table |
| `DraggableTaskCard.tsx` | Drag wrapper |
| `droppable-column.tsx` | Column bg |

### Modals (2 files)

| File | Key Elements |
|------|--------------|
| `ReportDetailDialog.tsx` | Report modal |
| `WeeklyCheckinModal.tsx` | Checkin form |

## Common Patterns

### Card/Panel
```
bg-white → dark:bg-[#1e1e1e]
border-outline-variant → dark:border-gray-700
shadow-sm → (keep)
```

### Text
```
text-on-surface → dark:text-gray-100
text-on-surface-variant → dark:text-gray-400
text-slate-500 → dark:text-gray-400
text-slate-700 → dark:text-gray-300
```

### Interactive
```
hover:bg-slate-50 → dark:hover:bg-gray-800
hover:bg-surface-container → dark:hover:bg-gray-800
```

### Badges/Tags
```
bg-blue-100 text-blue-700 → dark:bg-blue-900/30 dark:text-blue-400
bg-green-100 text-green-700 → dark:bg-green-900/30 dark:text-green-400
bg-red-100 text-red-700 → dark:bg-red-900/30 dark:text-red-400
```

### Tables
```
bg-white → dark:bg-[#1e1e1e]
divide-gray-200 → dark:divide-gray-700
hover:bg-gray-50 → dark:hover:bg-gray-800
```

## Implementation Order

1. **Board components first** (reused across pages)
2. **Kanban pages** (TechBoard, MarketingBoard, SaleBoard, MediaBoard)
3. **Dashboard pages** (PMDashboard, ProductBacklog)
4. **Other pages** (Login, Settings, Profile, DailySync, SaturdaySync, OKRs)
5. **Modals last**

## Todo

- [ ] TaskCard.tsx
- [ ] TaskModal.tsx
- [ ] TaskDetailsModal.tsx
- [ ] TaskTableView.tsx
- [ ] ReportTableView.tsx
- [ ] droppable-column.tsx
- [ ] LoginPage.tsx
- [ ] PMDashboard.tsx
- [ ] ProductBacklog.tsx
- [ ] DailySync.tsx
- [ ] SaturdaySync.tsx
- [ ] OKRsManagement.tsx
- [ ] Settings.tsx
- [ ] Profile.tsx
- [ ] TechBoard.tsx + other boards
- [ ] ReportDetailDialog.tsx
- [ ] WeeklyCheckinModal.tsx

## Verification

1. Each page readable in dark mode
2. Cards have clear boundaries
3. Badges/tags visible
4. Tables have row separation
