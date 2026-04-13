# Phase 3: UI Components

**Priority:** High | **Effort:** 45m | **Status:** pending

## Overview

Add dark mode to reusable UI components.

## Files

| File | Purpose |
|------|---------|
| `src/components/ui/Button.tsx` | All button variants |
| `src/components/ui/Modal.tsx` | Modal backdrop + content |
| `src/components/ui/Input.tsx` | Form inputs |
| `src/components/ui/Skeleton.tsx` | Loading placeholders |
| `src/components/ui/EmptyState.tsx` | Empty state messages |

## Implementation

### 1. Button.tsx

Update variants object:

```typescript
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'bg-secondary text-on-secondary hover:bg-secondary/90',
  outline: 'border border-outline text-on-surface hover:bg-surface-container dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
  ghost: 'text-on-surface hover:bg-surface-container dark:text-gray-200 dark:hover:bg-gray-800',
};
```

Focus ring: `focus:ring-offset-2 dark:focus:ring-offset-gray-900`

### 2. Modal.tsx

| Element | Add |
|---------|-----|
| Backdrop | (keep - dark works) |
| Modal content | `dark:bg-[#1e1e1e] dark:border-gray-700` |
| Title | `dark:text-white` |
| Close button | `dark:text-gray-400 dark:hover:bg-gray-800` |

### 3. Input.tsx

```typescript
// Base classes
'bg-white dark:bg-gray-800 border-outline-variant dark:border-gray-600 text-on-surface dark:text-gray-100 placeholder-on-surface-variant dark:placeholder-gray-500 focus:border-primary dark:focus:border-primary-container'
```

### 4. Skeleton.tsx

```typescript
// Shimmer bg
'bg-surface-container-high dark:bg-gray-700 animate-pulse'
```

### 5. EmptyState.tsx

| Element | Add |
|---------|-----|
| Icon | `dark:text-gray-500` |
| Title | `dark:text-gray-200` |
| Description | `dark:text-gray-400` |

## Todo

- [ ] Button: dark variants for outline/ghost
- [ ] Modal: dark content background
- [ ] Input: dark background + text
- [ ] Skeleton: dark shimmer color
- [ ] EmptyState: dark text colors

## Verification

1. All buttons visible in dark mode
2. Modal readable
3. Inputs have sufficient contrast
4. Skeleton visible against dark bg
