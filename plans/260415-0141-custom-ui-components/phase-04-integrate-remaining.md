# Phase 4: Integrate Remaining Pages

## Overview
- **Priority:** Medium
- **Status:** completed
- **Effort:** 1.5h
- **Depends on:** Phase 1

Replace native selects trong các pages còn lại.

## Target Files

### 1. WeeklyCheckinModal.tsx
[src/components/modals/WeeklyCheckinModal.tsx](../../src/components/modals/WeeklyCheckinModal.tsx)

| Field | Line | Type |
|-------|------|------|
| Team selector (mobile) | ~183 | CustomSelect |
| Confidence Score | ~225 | CustomSelect |

### 2. ProductBacklog.tsx
[src/pages/ProductBacklog.tsx](../../src/pages/ProductBacklog.tsx)

| Field | Line | Type |
|-------|------|------|
| Type filter | ~248 | CustomFilter |
| Status filter | ~258 | CustomFilter |
| Priority filter | ~269 | CustomFilter |

### 3. Board Pages (4 files)
Each has 1 filter select:

| File | Line |
|------|------|
| TechBoard.tsx | ~349 |
| MarketingBoard.tsx | ~349 |
| MediaBoard.tsx | ~347 |
| SaleBoard.tsx | ~347 |

### 4. Settings.tsx
[src/pages/Settings.tsx](../../src/pages/Settings.tsx)

| Field | Line |
|-------|------|
| Theme select | ~352 |
| Language select | ~422 |

## Implementation Steps

1. **WeeklyCheckinModal** (15 min)
   - Replace team selector
   - Replace confidence score selector

2. **ProductBacklog** (20 min)
   - Replace 3 filter selects với CustomFilter
   - Ensure multi-filter state works

3. **Board Pages** (20 min)
   - Replace filter select in each board
   - Same pattern across all 4 files

4. **Settings** (15 min)
   - Replace theme/language selects
   - Test settings persistence

## Todo
- [x] WeeklyCheckinModal - Team selector
- [x] WeeklyCheckinModal - Confidence score
- [x] ProductBacklog - Type filter
- [x] ProductBacklog - Status filter
- [x] ProductBacklog - Priority filter
- [x] TechBoard - Filter select
- [x] MarketingBoard - Filter select
- [x] MediaBoard - Filter select
- [x] SaleBoard - Filter select
- [x] Settings - Role selects (Add User + Edit User)
- [x] Full app testing

## Success Criteria
- All native selects replaced
- Consistent style across app
- All functionality preserved
- No console errors
- Keyboard navigation works everywhere
