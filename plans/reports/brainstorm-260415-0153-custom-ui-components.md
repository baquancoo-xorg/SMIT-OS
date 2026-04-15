# Brainstorm: Custom UI Components

**Date:** 2026-04-15
**Status:** Approved

## Problem Statement
Native `<select>` và `<input type="date">` có dropdown style phụ thuộc OS (đen/xám), không đồng nhất với Date & Sprint widgets trên Topbar đã được thiết kế đẹp.

## Target Style (from DateCalendarWidget & SprintContextWidget)
- **Trigger:** `bg-slate-50 rounded-full border-slate-200 hover:bg-slate-100`
- **Dropdown:** `bg-white rounded-2xl shadow-xl border-slate-100`
- **Animation:** `motion.div` với `opacity: 0→1, y: 10→0`
- **Typography:** `text-sm font-medium text-slate-700`

## Approved Solution
Tạo 3 custom components sử dụng **@headlessui/react** + **Framer Motion**:

### 1. CustomSelect
- Headless UI Listbox
- Keyboard navigation, a11y built-in
- Framer Motion animation

### 2. CustomDatePicker
- Custom calendar grid (reuse logic từ DateCalendarWidget)
- Month navigation
- Clear/Today actions

### 3. CustomFilter
- Single/multi-select filter dropdown
- Checkmark indicators

## Files Impact

| Action | File |
|--------|------|
| CREATE | `src/components/ui/CustomSelect.tsx` |
| CREATE | `src/components/ui/CustomDatePicker.tsx` |
| CREATE | `src/components/ui/CustomFilter.tsx` |
| EDIT | `TaskModal.tsx` - 6 selects + 2 date inputs |
| EDIT | `OKRsManagement.tsx` - 6 selects |
| EDIT | `WeeklyCheckinModal.tsx` - 2 selects |
| EDIT | `ProductBacklog.tsx` - 3 selects |
| EDIT | Board pages (4 files) - 1 select each |

## Dependencies
- `@headlessui/react` - Unstyled, accessible UI primitives
- `motion/react` - Already installed

## Success Criteria
- All dropdowns có style giống Date/Sprint widgets
- Keyboard navigation hoạt động (Arrow keys, Enter, Escape)
- Animation mượt mà
- No accessibility regressions
