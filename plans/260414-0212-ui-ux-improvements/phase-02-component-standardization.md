# Phase 2: Component Standardization

## Priority: P1 (Short-term)

## Overview

Create reusable UI components to eliminate inconsistencies across pages.

## Issues Addressed

| # | Issue | Current State |
|---|-------|---------------|
| 4 | Inconsistent buttons | py-2 vs py-3, rounded-xl vs rounded-full |
| 6 | No skeleton loading | Only spinner for all loading states |
| 12 | Form input variations | Different padding/radius per page |

---

## Task 1: Create Button Component

**New File:** `src/components/ui/Button.tsx`

```tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'bg-secondary text-on-secondary hover:bg-secondary/90',
  outline: 'border border-outline text-on-surface hover:bg-surface-container',
  ghost: 'text-on-surface hover:bg-surface-container',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-full',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, className = '', ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          Loading...
        </span>
      ) : children}
    </motion.button>
  )
);
```

**Migration:** Replace inline button styles in PMDashboard, OKRsManagement, Settings, DailySync

---

## Task 2: Create Skeleton Components

**New File:** `src/components/ui/Skeleton.tsx`

```tsx
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-surface-container-high';
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };
  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
}

// Pre-built skeletons
export function CardSkeleton() {
  return (
    <div className="p-4 rounded-2xl bg-surface-container space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3">
      <Skeleton variant="circular" className="h-8 w-8" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}
```

**Usage:** Replace spinner in PMDashboard, TechBoard, OKRsManagement loading states

---

## Task 3: Create Input Component

**New File:** `src/components/ui/Input.tsx`

```tsx
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1">
      {label && (
        <label className="text-xs font-medium text-on-surface-variant">{label}</label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline/30 
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          placeholder:text-on-surface-variant/50 ${error ? 'border-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
);
```

---

## Files to Modify

**Create:**
- `src/components/ui/Button.tsx`
- `src/components/ui/Skeleton.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/index.ts` (barrel export)

**Update:**
- `src/pages/PMDashboard.tsx` - Use Button, CardSkeleton
- `src/pages/OKRsManagement.tsx` - Use Button, Input
- `src/pages/Settings.tsx` - Use Button, Input
- `src/pages/DailySync.tsx` - Use Button

## Validation

```bash
# Check for inline button styles remaining
grep -n "bg-primary.*rounded" src/pages/*.tsx

# TypeScript check
npm run typecheck
```

## Success Criteria

- [x] Button component with 4 variants, 3 sizes
- [x] Skeleton components for cards, tables, charts
- [x] Input component with label/error support
- [x] All pages migrated to use new components
