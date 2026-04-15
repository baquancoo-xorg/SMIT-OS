# Scout Report: Dropdown, Datepicker, Filter, Select Components

## Summary
Located all dropdown, datepicker, filter, and select UI elements in SMIT-OS project.

---

## 1. Native `<select>` Elements

### Pages with Select Elements

| File | Lines | Purpose |
|------|-------|---------|
| `src/pages/OKRsManagement.tsx` | 307, 1239, 1264, 1349, 1442, 1457 | Department filter, status filter, level select, parent OKR select |
| `src/pages/SaleBoard.tsx` | 347 | Sprint filter select |
| `src/pages/ProductBacklog.tsx` | 248, 258, 269 | Type filter, priority filter, search filter |
| `src/pages/MarketingBoard.tsx` | 349 | Sprint filter select |
| `src/pages/MediaBoard.tsx` | 347 | Sprint filter select |
| `src/pages/TechBoard.tsx` | 349 | Sprint filter select |
| `src/pages/Settings.tsx` | 352, 422 | User role select (new user form, edit form) |
| `src/components/modals/WeeklyCheckinModal.tsx` | 183, 225 | Team select, week select |
| `src/components/board/TaskModal.tsx` | 166, 179, 193, 206, 248 | Type, priority, assignee, status, parent select |

---

## 2. Custom Dropdown/Widget Components

### DateCalendarWidget (Popover Calendar)
- **File:** `src/components/layout/DateCalendarWidget.tsx`
- **Lines:** 1-129 (full component)
- **Type:** Custom popover with mini calendar + deadline lists
- **Features:**
  - Click outside to close (line 17-25)
  - AnimatePresence for transitions (line 57-126)
  - Mini month calendar grid (line 65-90)
  - Today's deadlines section (line 92-105)
  - Upcoming deadlines section (line 107-123)

### SprintContextWidget (Popover Stats)
- **File:** `src/components/layout/SprintContextWidget.tsx`
- **Lines:** 1-179 (full component)
- **Type:** Custom popover with sprint progress stats
- **Features:**
  - Click outside to close (line 47-55)
  - Progress bar in trigger (line 86-92)
  - Dropdown panel with stats (line 95-175)

### Search Results Dropdown
- **File:** `src/components/layout/Header.tsx`
- **Lines:** 88-145
- **Type:** Search autocomplete dropdown
- **Features:**
  - AnimatePresence transitions (line 89)
  - Max 8 results (line 60)
  - Click outside to close (line 38-46)

---

## 3. Action Menus (Popover Menus)

### TaskCard Action Menu
- **File:** `src/components/board/TaskCard.tsx`
- **Lines:** 93-132
- **State:** `isMenuOpen` (line 18)
- **Actions:** View Details, Edit Task, Delete Task

### TaskTableView Action Menu
- **File:** `src/components/board/TaskTableView.tsx`
- **Lines:** 324-351 (row actions)
- **State:** `openMenuId` (line 30)
- **Actions:** View Details, Edit, Delete

---

## 4. Filter UI Components

### Sprint Filter Bars
All board pages have identical sprint filter pattern:

| File | Line | Component |
|------|------|-----------|
| `src/pages/TechBoard.tsx` | 341-396 | Sprint filter bar with Filter icon |
| `src/pages/MarketingBoard.tsx` | 341-396 | Sprint filter bar |
| `src/pages/MediaBoard.tsx` | 339-394 | Sprint filter bar |
| `src/pages/SaleBoard.tsx` | 339-394 | Sprint filter bar |

### OKR Filters
- **File:** `src/pages/OKRsManagement.tsx`
- **Lines:** 300-324
- **Filters:** departmentFilter, ownerFilter, statusFilter (state defined lines 10-12)

### Backlog Filters
- **File:** `src/pages/ProductBacklog.tsx`
- **Lines:** 216-270
- **Filters:** typeFilter, priorityFilter (state defined lines 17-18)

---

## 5. Date Inputs (Native)

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/board/TaskModal.tsx` | 220-235 | Start date, due date inputs |

---

## File Summary

### Components (Reusable)
1. `/src/components/layout/DateCalendarWidget.tsx` - Calendar popover widget
2. `/src/components/layout/SprintContextWidget.tsx` - Sprint stats popover widget
3. `/src/components/layout/Header.tsx` - Search dropdown (lines 88-145)
4. `/src/components/board/TaskCard.tsx` - Action menu (lines 93-132)
5. `/src/components/board/TaskModal.tsx` - Form selects (lines 166-259)
6. `/src/components/board/TaskTableView.tsx` - Row action menu (lines 324-351)

### Pages with Inline Selects/Filters
1. `/src/pages/OKRsManagement.tsx` - Multiple selects + filters
2. `/src/pages/ProductBacklog.tsx` - Type/priority filters
3. `/src/pages/TechBoard.tsx` - Sprint filter bar
4. `/src/pages/MarketingBoard.tsx` - Sprint filter bar
5. `/src/pages/MediaBoard.tsx` - Sprint filter bar
6. `/src/pages/SaleBoard.tsx` - Sprint filter bar
7. `/src/pages/Settings.tsx` - User role selects

### Modals with Selects
1. `/src/components/modals/WeeklyCheckinModal.tsx` - Team/week selects

---

**Status:** DONE
**Summary:** Found 14 files containing dropdown/select/filter/popover UI elements. No dedicated reusable Select or Dropdown component exists - all implementations are inline or context-specific widgets.
