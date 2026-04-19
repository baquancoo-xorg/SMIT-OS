# Phase 3: iPad Fixes

## Overview
- **Priority:** High
- **Status:** pending
- **Estimated:** 30 minutes

Fix responsive issues trên iPad Pro M2 (cả portrait và landscape).

## Problems
1. **Burger menu mất** - Không thấy menu toggle button
2. **Content clipping** - Nội dung bị cắt ở edges

## Context
- iPad Pro 11": 1194x834 (landscape), 834x1194 (portrait)
- iPad Pro 12.9": 1366x1024 (landscape), 1024x1366 (portrait)
- Breakpoint `xl: 1180px` - sidebar static từ 1180px trở lên
- Burger menu: `xl:hidden` - chỉ hiện dưới 1180px

## Investigation Steps

### Step 1: Check Burger Menu Visibility

**File:** `src/components/layout/Header.tsx`
**Location:** Lines 67-73

```tsx
<button
  onClick={onMenuClick}
  className="xl:hidden w-10 h-10 flex items-center justify-center..."
```

**Check:**
- `xl:hidden` có hoạt động đúng không
- z-index conflict với search?
- Có bị overlap bởi element khác?

### Step 2: Check Content Overflow

**File:** `src/components/layout/AppLayout.tsx`

**Potential fix:**
```tsx
<main className="flex-1 overflow-hidden pt-16">
  <ErrorBoundary>
    <div className="viewport-fit page-padding w-full overflow-x-hidden">
```

### Step 3: Check Sidebar Overlay

**File:** `src/components/layout/AppLayout.tsx`
**Location:** Line 30

```tsx
<div className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 xl:hidden...`}
```

**Verify:**
- z-index ordering: overlay (40) < sidebar (50) < header (40)
- Possible conflict: header z-40 = overlay z-40

**Fix if needed:**
```tsx
// Header.tsx line 64
<header className="fixed top-0 left-0 right-0 h-16 z-50 ...">
```

### Step 4: Test Breakpoint Transitions

Test at these widths:
- 768px (tablet portrait)
- 834px (iPad Pro 11" portrait)
- 1024px (iPad Pro 12.9" portrait)
- 1180px (xl breakpoint)
- 1194px (iPad Pro 11" landscape)
- 1366px (iPad Pro 12.9" landscape)

## Implementation

### Fix 1: Header z-index (if needed)

```tsx
// Header.tsx line 64
className="fixed top-0 left-0 right-0 h-16 z-50 ..."
```

### Fix 2: Content overflow

```tsx
// AppLayout.tsx line 45
<div className="viewport-fit page-padding w-full overflow-x-hidden">
```

### Fix 3: Safe area insets (iOS Safari)

```css
/* index.css - add to .page-padding */
padding-left: max(var(--content-px-mobile), env(safe-area-inset-left));
padding-right: max(var(--content-px-mobile), env(safe-area-inset-right));
```

## Todo

- [ ] Investigate burger menu visibility issue
- [ ] Check z-index conflicts
- [ ] Add overflow-x-hidden if needed
- [ ] Test on iPad Pro M2 (both orientations)
- [ ] Verify safe area insets handling

## Success Criteria

- Burger menu visible and functional on iPad
- No content clipping
- Smooth transition between breakpoints
