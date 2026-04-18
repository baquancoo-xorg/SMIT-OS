# Phase 1: Create Shared Components

**Status:** completed
**Effort:** 30 minutes
**Priority:** High

## Overview

Tạo 3 shared components để chuẩn hóa UI elements across pages.

## Tasks

### 1.1 Create PrimaryActionButton

**File:** `src/components/ui/PrimaryActionButton.tsx`

```tsx
interface PrimaryActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}
```

**Styling:**
```tsx
className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-95 transition-all min-w-[130px] whitespace-nowrap disabled:opacity-50 disabled:hover:scale-100"
```

**Default icon:** Material Symbols `add` (14px)

### 1.2 Create ViewToggle

**File:** `src/components/ui/ViewToggle.tsx`

```tsx
interface ViewToggleProps {
  value: 'board' | 'table' | string;
  onChange: (value: string) => void;
  options?: Array<{ value: string; label: string; icon?: React.ReactNode }>;
}
```

**Default options:** Board (LayoutGrid) / Table (List)

**Styling:**
```tsx
// Container
className="flex p-1 bg-surface-container-high rounded-full shadow-sm"

// Active button
className="flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-white text-primary shadow-sm"

// Inactive button
className="flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all text-slate-500 hover:text-primary"
```

### 1.3 Create PageLayout

**File:** `src/components/layout/PageLayout.tsx`

```tsx
interface PageLayoutProps {
  breadcrumb: { parent: string; current: string };
  title: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}
```

**Structure:**
```tsx
<div className="h-full flex flex-col py-6 lg:py-10 space-y-8 w-full">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
        <span className="hover:text-primary cursor-pointer">{breadcrumb.parent}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface">{breadcrumb.current}</span>
      </nav>
      <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
        {title}
      </h2>
    </div>
    {actions && (
      <div className="flex items-center gap-3">{actions}</div>
    )}
  </div>
  {children}
</div>
```

## Validation

- [x] Components compile without errors
- [x] TypeScript types correct
- [x] Default props work
- [x] Custom props override correctly
