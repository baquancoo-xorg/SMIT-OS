# Scout Report: Border-Radius Audit

## Summary
Audited SMIT-OS project for UI components, Tailwind config, and border-radius patterns. No tailwind.config file exists - project uses Tailwind v4 with CSS-based configuration in `src/index.css`.

---

## 1. CSS Configuration (Design System)

**File:** `/Users/dominium/Documents/Project/SMIT-OS/src/index.css`

Custom radius tokens defined in `@theme`:
```css
--radius-DEFAULT: 1rem;   /* 16px */
--radius-lg: 2rem;        /* 32px */
--radius-xl: 3rem;        /* 48px */
```

---

## 2. UI Component Files

### Core UI Components (`src/components/ui/`)
| File | Border-radius Used |
|------|-------------------|
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/Button.tsx` | `rounded-lg` (sm), `rounded-xl` (md), `rounded-full` (lg) |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/Input.tsx` | `rounded-2xl` |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/Modal.tsx` | `rounded-3xl`, `rounded-full` |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/CustomSelect.tsx` | `rounded-2xl` (button + dropdown) |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/CustomFilter.tsx` | `rounded-full` (button), `rounded-2xl` (dropdown) |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/CustomDatePicker.tsx` | `rounded-2xl`, `rounded-lg` |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/Skeleton.tsx` | `rounded-full`, `rounded-xl`, `rounded-2xl` |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/EmptyState.tsx` | (not audited) |

### Board Components (`src/components/board/`)
| File | Key radius |
|------|-----------|
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/board/TaskCard.tsx` | `rounded-[32px]`, `rounded-full`, `rounded-2xl`, `rounded-xl` |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/board/TaskModal.tsx` | `rounded-*` various |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/board/TaskDetailsModal.tsx` | `rounded-*` |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/board/TaskTableView.tsx` | `rounded-*` |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/board/DraggableTaskCard.tsx` | (wrapper) |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/board/droppable-column.tsx` | (wrapper) |

### Layout Components (`src/components/layout/`)
| File | Key radius |
|------|-----------|
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/Sidebar.tsx` | `rounded-r-2xl`, `rounded-r-3xl`, `rounded-2xl`, `rounded-xl` |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/Header.tsx` | `rounded-*` |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/DateCalendarWidget.tsx` | `rounded-*` |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/SprintContextWidget.tsx` | `rounded-*` |

### Modal Components (`src/components/modals/`)
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/modals/WeeklyCheckinModal.tsx` - `rounded-3xl`, `rounded-2xl`, `rounded-xl`, `rounded-lg`, `rounded-full`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/modals/ReportDetailDialog.tsx` - `rounded-[40px]`, `rounded-3xl`, `rounded-2xl`, `rounded-full`

### Daily Report Components (`src/components/daily-report/`)
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/DailyReportBase.tsx` - `rounded-3xl`, `rounded-2xl`, `rounded-xl`, `rounded-full`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/PMDashboard.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/TechDailyForm.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/SaleDailyForm.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/MarketingDailyForm.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/MediaDailyForm.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/components/TaskStatusCard.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/components/BlockerCard.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/components/TodayPlanCard.tsx`

---

## 3. Page Files with Border-radius

- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/PMDashboard.tsx` - `rounded-2xl`, `rounded-3xl`, `rounded-[40px]`, `rounded-full`, `rounded-lg`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/TechBoard.tsx` - `rounded-[32px]`, `rounded-3xl`, `rounded-full`, `rounded-2xl`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/SaleBoard.tsx` - same pattern
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/MediaBoard.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/MarketingBoard.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/ProductBacklog.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/SaturdaySync.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/LoginPage.tsx` - `rounded-2xl`, `rounded-3xl`, `rounded-xl`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/Profile.tsx` - `rounded-3xl`, `rounded-xl`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/Settings.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/OKRsManagement.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/DailySync.tsx`

---

## 4. Border-Radius Patterns Observed

### Frequency Analysis
| Pattern | Usage |
|---------|-------|
| `rounded-full` | Badges, pills, circular buttons, indicators |
| `rounded-2xl` | Input fields, cards, dropdowns, containers |
| `rounded-3xl` | Modals, large panels, sidebar |
| `rounded-xl` | Medium elements, action buttons |
| `rounded-lg` | Small buttons, calendar days, icons |
| `rounded-[32px]` | Task cards, columns |
| `rounded-[40px]` | Report dialogs, large dashboard cards |

### Inconsistencies Found

1. **Button sizes use different radius:**
   - sm: `rounded-lg`
   - md: `rounded-xl`  
   - lg: `rounded-full`

2. **Cards lack uniformity:**
   - TaskCard: `rounded-[32px]`
   - Dashboard cards: `rounded-2xl`, `rounded-3xl`, `rounded-[40px]` mixed

3. **Inputs:**
   - Core Input: `rounded-2xl`
   - Form inputs in pages: `rounded-xl`, `rounded-2xl` mixed

4. **Dropdowns:**
   - CustomSelect: `rounded-2xl`
   - CustomFilter button: `rounded-full`
   - Both dropdown panels: `rounded-2xl`

5. **Modals:**
   - Modal.tsx: `rounded-3xl`
   - ReportDetailDialog: `rounded-[40px]`
   - WeeklyCheckinModal: `rounded-3xl`
   - DailyReportBase: `rounded-3xl`

---

## 5. Recommendation

Define semantic radius tokens in `src/index.css`:
```css
@theme {
  --radius-sm: 0.5rem;      /* 8px - small buttons, chips */
  --radius-md: 0.75rem;     /* 12px - inputs, dropdowns */
  --radius-lg: 1rem;        /* 16px - cards */
  --radius-xl: 1.5rem;      /* 24px - larger cards */
  --radius-2xl: 2rem;       /* 32px - modals, panels */
  --radius-full: 9999px;    /* pills, circular */
}
```

Then standardize components to use these tokens.

---

## Unresolved Questions

1. Why use arbitrary `rounded-[32px]` and `rounded-[40px]` instead of Tailwind defaults?
2. Should all modals share same radius or vary by modal type?
3. Is the Button radius variation (lg=full vs md=xl vs sm=lg) intentional design?
