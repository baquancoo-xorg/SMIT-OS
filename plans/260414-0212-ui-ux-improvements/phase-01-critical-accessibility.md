# Phase 1: Critical Accessibility Fixes

## Priority: P0 (Immediate)

## Overview

Fix 3 critical accessibility issues blocking WCAG 2.1 AA compliance.

## Issues Addressed

| # | Issue | File | Line |
|---|-------|------|------|
| 1 | Missing focus states | Sidebar.tsx | 121-137 |
| 2 | Color contrast failures | index.css | 33 |
| 3 | Mobile nav no Escape | AppLayout.tsx | 19-23 |

---

## Task 1: Keyboard Navigation for Sidebar NavItem

**File:** `src/components/layout/Sidebar.tsx`

**Problem:** NavItem uses `<div>` with `onClick` - not keyboard accessible

**Fix:**
```tsx
// BEFORE (line 121-137)
<div
  onClick={() => onNavigate(item.viewType)}
  className={`cursor-pointer...`}
>

// AFTER
<button
  type="button"
  onClick={() => onNavigate(item.viewType)}
  onKeyDown={(e) => e.key === 'Enter' && onNavigate(item.viewType)}
  className={`cursor-pointer w-full text-left focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2...`}
  aria-current={isActive ? 'page' : undefined}
>
```

**Also add to:** Header.tsx menu button (line 64-68), TaskCard.tsx menu button (line 119-124)

---

## Task 2: Fix Color Contrast

**File:** `src/index.css`

**Problem:** `--color-outline: #6b759e` only ~3.5:1 contrast on surface

**Fix:**
```css
/* Line 33 - darken outline color */
--color-outline: #4a5580;  /* Was #6b759e - now 5.2:1 ratio */
```

**Also fix:**
- Remove `text-[9px]` usage - minimum 10px
- Darken `.text-slate-500` instances to `.text-slate-600`

---

## Task 3: Mobile Sidebar Escape Handler

**File:** `src/components/layout/AppLayout.tsx`

**Problem:** No keyboard way to close mobile sidebar

**Fix:**
```tsx
// Add useEffect for Escape key (after line 10)
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isSidebarOpen]);
```

---

## Files to Modify

- `src/components/layout/Sidebar.tsx` - NavItem to button
- `src/components/layout/AppLayout.tsx` - Escape handler
- `src/components/layout/Header.tsx` - aria-label on menu
- `src/components/board/TaskCard.tsx` - aria-label, aria-expanded
- `src/index.css` - color contrast fix

## Validation

```bash
# Check for remaining div onClick patterns
grep -n "div.*onClick" src/components/layout/*.tsx

# Check color contrast (manual)
# Use browser DevTools > Accessibility panel
```

## Success Criteria

- [x] Tab navigation works through all sidebar items
- [x] Focus visible on all interactive elements
- [x] Escape closes mobile sidebar
- [x] No color contrast warnings in DevTools
