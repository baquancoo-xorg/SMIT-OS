# Phase 2: Header Alignment

## Overview
- **Priority:** High
- **Status:** pending
- **Estimated:** 15 minutes

Update Header.tsx để dùng CSS variables, đảm bảo alignment khớp với content.

## Context
- Current: `px-4 md:px-8 xl:pl-72 xl:pr-10`
- Expected: Dùng CSS variables để sync với content padding

## Implementation

### Step 1: Update Header className

**File:** `src/components/layout/Header.tsx`
**Location:** Line 65

**Current:**
```tsx
<div className="w-full h-full px-4 md:px-8 xl:pl-72 xl:pr-10 flex items-center justify-between">
```

**New:**
```tsx
<div className="w-full h-full px-[var(--content-px-mobile)] md:px-[var(--content-px-tablet)] xl:pl-72 xl:pr-[var(--content-px-desktop)] flex items-center justify-between">
```

### Step 2: Update Search Container margin

**File:** `src/components/layout/Header.tsx`
**Location:** Line 75

**Current:**
```tsx
<div className="flex-1 max-w-[280px] sm:max-w-md md:max-w-lg lg:max-w-xl relative ml-6 xl:ml-10" ref={searchRef}>
```

**New:**
```tsx
<div className="flex-1 max-w-[280px] sm:max-w-md md:max-w-lg lg:max-w-xl relative ml-4 xl:ml-8" ref={searchRef}>
```

## Todo

- [ ] Update Header div padding
- [ ] Adjust search container margin
- [ ] Verify alignment matches between header and content

## Success Criteria

- Global Search left edge = Content left edge
- Buttons right edge = Content right edge
