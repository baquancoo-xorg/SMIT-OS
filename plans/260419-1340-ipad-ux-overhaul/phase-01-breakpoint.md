# Phase 1: Breakpoint & Burger Menu

## Overview
- **Priority:** Critical
- **Status:** pending
- **Estimated:** 30 minutes

Tăng breakpoint `xl` từ 1180px → 1440px để tất cả iPad có burger menu.

## Current State

```css
/* index.css */
--breakpoint-xl: 1180px;
```

- iPad Pro 11" landscape (1194px) > 1180px → sidebar static ❌
- iPad Pro 12.9" landscape (1366px) > 1180px → sidebar static ❌

## Implementation

### Step 1: Update breakpoint in index.css

**File:** `src/index.css`
**Location:** `@theme` block, line ~54

```css
/* Before */
--breakpoint-xl: 1180px;

/* After */
--breakpoint-xl: 1440px;
```

### Step 2: Verify burger menu visibility

**File:** `src/components/layout/Header.tsx`

Burger menu có class `xl:hidden` - sẽ tự động hiện khi breakpoint tăng.

```tsx
<button
  onClick={onMenuClick}
  className="xl:hidden w-10 h-10 ..."
>
  <Menu size={24} />
</button>
```

### Step 3: Verify sidebar behavior

**File:** `src/components/layout/AppLayout.tsx`

Sidebar có class `xl:static xl:translate-x-0` - sẽ chuyển sang fixed/hidden khi breakpoint tăng.

```tsx
<div className={`fixed xl:static inset-y-0 left-0 z-50 
  transform transition-all duration-300 ease-in-out 
  xl:translate-x-0 shrink-0 
  ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
```

### Step 4: Update Header padding for new breakpoint

Cần thêm breakpoint cho 1440px+ để sidebar static có padding-left đúng.

```tsx
// Header.tsx - update className
className="w-full h-full 
  px-[var(--content-px-mobile)] 
  md:px-[var(--content-px-tablet)] 
  xl:pl-72 xl:pr-[var(--content-px-desktop)] 
  flex items-center justify-between"
```

## Todo

- [ ] Update `--breakpoint-xl` to 1440px
- [ ] Verify burger menu visible on iPad landscape
- [ ] Test sidebar open/close on tablet
- [ ] Verify desktop (1440px+) still has static sidebar

## Success Criteria

- Burger menu visible on all iPads
- Sidebar opens/closes correctly with overlay
- Desktop ≥1440px has static sidebar
