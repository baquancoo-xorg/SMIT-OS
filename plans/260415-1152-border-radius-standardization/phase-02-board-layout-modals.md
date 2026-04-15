# Phase 2: Board + Layout + Modal Components

## Overview
- **Priority:** High
- **Status:** pending
- **Effort:** 1.5h

Update board components, layout components, và modals.

## Files to Modify

### Board Components (`src/components/board/`)

| File | Current | Target |
|------|---------|--------|
| `TaskCard.tsx` | `rounded-[32px]` | `rounded-3xl` |
| `TaskModal.tsx` | mixed | `rounded-3xl` containers, `rounded-full` buttons |
| `TaskDetailsModal.tsx` | mixed | `rounded-3xl` containers |
| `TaskTableView.tsx` | mixed | `rounded-3xl` cards |

### Layout Components (`src/components/layout/`)

| File | Current | Target |
|------|---------|--------|
| `Sidebar.tsx` | `rounded-r-2xl`, `rounded-r-3xl` | `rounded-r-3xl` consistent |
| `Header.tsx` | mixed | `rounded-full` buttons, `rounded-3xl` containers |
| `DateCalendarWidget.tsx` | mixed | Keep `rounded-lg` for day cells |
| `SprintContextWidget.tsx` | mixed | `rounded-3xl` container |

### Modal Components (`src/components/modals/`)

| File | Current | Target |
|------|---------|--------|
| `WeeklyCheckinModal.tsx` | mixed | `rounded-3xl` modal, `rounded-full` buttons |
| `ReportDetailDialog.tsx` | `rounded-[40px]` | `rounded-3xl` |

## Implementation Steps

### 2.1 Board Components

**TaskCard.tsx:**
- Replace `rounded-[32px]` → `rounded-3xl`
- Buttons inside → `rounded-full`

**TaskModal.tsx:**
- Modal container → `rounded-3xl`
- All buttons → `rounded-full`
- Input fields → `rounded-3xl`

**TaskDetailsModal.tsx:**
- Same pattern as TaskModal

**TaskTableView.tsx:**
- Table container → `rounded-3xl`
- Row hover states → `rounded-xl` (smaller for rows)

### 2.2 Layout Components

**Sidebar.tsx:**
- Sidebar container → `rounded-r-3xl`
- Nav items → `rounded-full`
- Active indicator → `rounded-full`

**Header.tsx:**
- User menu → `rounded-3xl`
- Action buttons → `rounded-full`

**DateCalendarWidget.tsx:**
- Container → `rounded-3xl`
- Day cells → keep `rounded-lg` (small, dense)
- Navigation buttons → `rounded-full`

**SprintContextWidget.tsx:**
- Container → `rounded-3xl`
- Badges → `rounded-full`

### 2.3 Modal Components

**WeeklyCheckinModal.tsx:**
- Modal → `rounded-3xl`
- Buttons → `rounded-full`
- Inputs → `rounded-3xl`
- Progress bars → `rounded-full`

**ReportDetailDialog.tsx:**
- Replace `rounded-[40px]` → `rounded-3xl`
- All buttons → `rounded-full`

## Todo

- [ ] Update TaskCard.tsx
- [ ] Update TaskModal.tsx
- [ ] Update TaskDetailsModal.tsx
- [ ] Update TaskTableView.tsx
- [ ] Update Sidebar.tsx
- [ ] Update Header.tsx
- [ ] Update DateCalendarWidget.tsx
- [ ] Update SprintContextWidget.tsx
- [ ] Update WeeklyCheckinModal.tsx
- [ ] Update ReportDetailDialog.tsx

## Success Criteria

- No `rounded-[Xpx]` arbitrary values
- Consistent capsule buttons
- Consistent container radius
