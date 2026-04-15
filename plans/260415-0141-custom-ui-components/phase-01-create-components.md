# Phase 1: Setup & Create Components

## Overview
- **Priority:** High
- **Status:** pending
- **Effort:** 2h

Install @headlessui/react và tạo 3 custom UI components.

## Context
- [DateCalendarWidget.tsx](../../src/components/layout/DateCalendarWidget.tsx) - Reference style
- [SprintContextWidget.tsx](../../src/components/layout/SprintContextWidget.tsx) - Reference style

## Requirements

### Install Dependency
```bash
npm install @headlessui/react
```

### Create Files
1. `src/components/ui/CustomSelect.tsx`
2. `src/components/ui/CustomDatePicker.tsx`
3. `src/components/ui/CustomFilter.tsx`

## Implementation

### 1. CustomSelect.tsx

```tsx
// Props interface
interface CustomSelectProps<T> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

// Use Headless UI Listbox
// Style trigger: bg-white rounded-2xl border border-slate-200 px-4 py-3
// Style dropdown: bg-white rounded-2xl shadow-xl border border-slate-100
// Animation: AnimatePresence + motion.div
```

**Key Features:**
- Generic type support for value
- Icon slot (optional)
- Keyboard navigation (built-in from Headless UI)
- Click outside to close
- Framer Motion animations

### 2. CustomDatePicker.tsx

```tsx
interface CustomDatePickerProps {
  value: string; // ISO date string or empty
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Reuse calendar logic from DateCalendarWidget
// Add month navigation (prev/next buttons)
// Add Clear + Today actions at bottom
```

**Key Features:**
- Month/year display with navigation
- Day grid with current date highlight
- Selected date highlight (bg-primary)
- Clear button to reset
- Today button for quick select

### 3. CustomFilter.tsx

```tsx
interface CustomFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
  className?: string;
}

// Similar to CustomSelect but optimized for filters
// Rounded-full trigger (pill style)
// Smaller padding for compact look
```

## Shared Style Constants

```tsx
// Dropdown animation
const dropdownAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 }
};

// Common classes
const triggerBase = "flex items-center gap-2 transition-all outline-none";
const triggerForm = "w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20";
const triggerFilter = "px-4 py-2 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300";
const dropdownPanel = "absolute z-50 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden";
```

## Todo
- [ ] Install @headlessui/react
- [ ] Create CustomSelect.tsx
- [ ] Create CustomDatePicker.tsx
- [ ] Create CustomFilter.tsx
- [ ] Test components in isolation

## Success Criteria
- Components render correctly
- Keyboard navigation works
- Animations smooth
- TypeScript types correct
