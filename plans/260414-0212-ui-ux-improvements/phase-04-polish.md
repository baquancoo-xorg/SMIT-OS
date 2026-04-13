# Phase 4: Polish

## Priority: P2 (Medium-term)

## Overview

Address minor UI inconsistencies and improvements.

## Issues Addressed

| # | Issue | Impact |
|---|-------|--------|
| 5 | Table responsiveness | Mobile UX |
| 8 | Typography scale | Visual consistency |
| 9 | Hardcoded colors | Theme-ability |
| 10 | Mixed icon libraries | Visual weight |
| 11 | Basic empty states | User guidance |

---

## Task 1: Typography Consolidation

**Problem:** Non-standard sizes `text-[9px]`, `text-[11px]` break scale

**Fix:**

1. Add custom size to Tailwind config:
```css
/* index.css - add to @theme */
--text-2xs: 10px;
```

2. Replace instances:
```bash
# Find all text-[9px] and text-[11px]
grep -rn "text-\[9px\]\|text-\[11px\]" src/
```

| Pattern | Replace With |
|---------|--------------|
| `text-[9px]` | `text-[10px]` or `text-2xs` |
| `text-[11px]` | `text-xs` (12px) |

**Files:** PMDashboard.tsx, TaskCard.tsx, ProductBacklog.tsx

---

## Task 2: Migrate Hardcoded Colors

**Problem:** recharts uses inline colors like `stroke="#0059b6"`

**Fix:**

1. Create chart color constants:
```tsx
// src/lib/chart-colors.ts
export const chartColors = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  tertiary: 'var(--color-tertiary)',
  error: 'var(--color-error)',
  surface: 'var(--color-surface)',
};
```

2. Update PMDashboard.tsx recharts config:
```tsx
// Line 407-432
<Line stroke={chartColors.primary} />
<Bar fill={chartColors.primary} />
```

---

## Task 3: Responsive Tables

**Problem:** Tables don't adapt well on mobile

**Solution:** Add responsive table wrapper with card-view toggle

```tsx
// src/components/ui/ResponsiveTable.tsx
interface ResponsiveTableProps {
  headers: string[];
  data: any[];
  renderRow: (item: any) => ReactNode;
  renderCard: (item: any) => ReactNode;
}

export function ResponsiveTable({ headers, data, renderRow, renderCard }: ResponsiveTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table>...</table>
      </div>
      
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {data.map(renderCard)}
      </div>
    </>
  );
}
```

**Apply to:** DailySync.tsx, TaskTableView.tsx, Settings.tsx tables

---

## Task 4: Empty State Component

**New File:** `src/components/ui/EmptyState.tsx`

```tsx
interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <span className="material-symbols-outlined text-5xl text-on-surface/20 mb-4">
        {icon}
      </span>
      <h3 className="text-sm font-semibold text-on-surface/60 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-on-surface/40 max-w-xs mb-4">{description}</p>
      )}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

**Usage:**
```tsx
<EmptyState
  icon="inbox"
  title="No items yet"
  description="Create your first item to get started"
  action={{ label: "Create Item", onClick: handleCreate }}
/>
```

---

## Task 5: Icon Standardization

**Current state:** Mix of Material Symbols + Lucide React

**Decision:** Keep both with clear rules:
- **Material Symbols:** Navigation, status, system icons
- **Lucide:** Actions, editor, smaller inline icons

**Document in:** `docs/code-standards.md` or component README

---

## Files to Modify

**Create:**
- `src/lib/chart-colors.ts`
- `src/components/ui/ResponsiveTable.tsx`
- `src/components/ui/EmptyState.tsx`

**Update:**
- `src/index.css` - Add text-2xs
- `src/pages/PMDashboard.tsx` - Typography, chart colors
- `src/components/board/TaskCard.tsx` - Typography
- `src/pages/ProductBacklog.tsx` - Empty state
- `src/components/board/TaskTableView.tsx` - Responsive table
- `src/pages/DailySync.tsx` - Responsive table

## Validation

```bash
# Check no hardcoded hex colors remain
grep -rn "#[0-9a-fA-F]\{6\}" src/pages/*.tsx

# Check typography
grep -rn "text-\[" src/ | wc -l  # Should decrease
```

## Success Criteria

- [x] No `text-[9px]` in codebase
- [x] All chart colors use CSS variables
- [x] Tables have mobile card view
- [x] Empty states have icon + title + action CTA
- [x] Icon usage documented
