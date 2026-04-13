# Code Review: UI/UX Improvements

**Date:** 2026-04-14
**Reviewer:** code-reviewer
**Scope:** Accessibility, UI components, Modal, EmptyState, typography fixes

---

## Summary

Mixed results. Core accessibility improvements are solid, but **2 blocking TypeScript errors** must be fixed before merge. Component APIs are well-designed with minor accessibility gaps.

---

## Critical Issues (Blocking)

### 1. TypeScript Errors - Build Fails

**File:** `src/components/ui/Skeleton.tsx:42`
```
error TS2322: Type '{ key: number; variant: "rectangular"; ... }' is not assignable to type 'SkeletonProps'.
Property 'key' does not exist on type 'SkeletonProps'.
```

**Fix:** SkeletonProps needs to extend React's base props:
```tsx
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}
```

**File:** `src/pages/OKRsManagement.tsx:570`
```
error TS2741: Property 'currentValue' is missing
```

**Fix:** Add `currentValue: 0` to initialData object.

---

## High Priority

### 2. Input Component Missing Label Association

**File:** `src/components/ui/Input.tsx`

Label exists but lacks `htmlFor` connection. Screen readers won't associate label with input.

**Current:**
```tsx
<label className="text-xs font-medium...">{label}</label>
<input ref={ref} ... />
```

**Fix:**
```tsx
const id = useId();
<label htmlFor={id} className="...">{label}</label>
<input id={id} ref={ref} ... />
```

Also add `aria-describedby` for error messages.

### 3. Modal Focus Restore Missing

**File:** `src/components/ui/Modal.tsx`

Focus trap implemented, but doesn't restore focus to trigger element on close. This breaks keyboard navigation flow.

**Fix:** Store `document.activeElement` on open, restore on close.

---

## Medium Priority

### 4. Skeleton style Prop Not Typed

**File:** `src/components/ui/Skeleton.tsx:42`

ChartSkeleton passes `style` prop but interface doesn't accept it. Extend from HTMLAttributes.

### 5. Button hover Scale on Motion

**File:** `src/components/ui/Button.tsx:28-29`

`whileHover/whileTap` scales on disabled state still visually respond (motion scales). Consider:
```tsx
whileHover={!props.disabled ? { scale: 1.02 } : undefined}
```

### 6. EmptyState Icon String Only

**File:** `src/components/ui/EmptyState.tsx`

Only accepts Material Symbols string. Consider also accepting ReactNode for Lucide icons consistency with rest of app.

---

## Low Priority

### 7. Sidebar hover:scale-95 on NavItem

**File:** `src/components/layout/Sidebar.tsx:126`

`hover:scale-95` shrinks the button on hover, which is unconventional. Usually hover scales up (1.02-1.05) or has no scale. Scale-down may feel unresponsive.

### 8. Header Dark Mode Toggle Non-functional

**File:** `src/components/layout/Header.tsx:148`

Toggle state exists but doesn't apply theme. Either implement or remove to avoid confusion.

---

## Positive Observations

1. **Modal accessibility** - Proper focus trap, Escape handler, body scroll lock, ARIA attributes all present
2. **Sidebar NavItem** - Correct semantic `<button>`, `aria-current="page"`, focus ring offset
3. **Button component** - forwardRef, loading state, focus ring with offset-2, disabled state handling
4. **Color contrast fix** - `#6b759e` -> `#4a5580` improves contrast ratio
5. **Typography consistency** - Removing text-[9px]/text-[11px] improves readability
6. **Chart colors** - CSS variable approach enables theming

---

## Accessibility Checklist

| Item | Status |
|------|--------|
| Keyboard navigation | PASS - Escape handlers, focus states |
| Screen reader labels | PARTIAL - Input label needs `htmlFor` |
| Color contrast | PASS - Fixed to 4.5:1+ |
| Focus indicators | PASS - ring-2 ring-primary/50 |
| ARIA attributes | PASS - Modal has proper roles |
| Semantic HTML | PASS - NavItem changed to button |

---

## Recommended Actions

1. **[CRITICAL]** Fix Skeleton interface to extend HTMLAttributes
2. **[CRITICAL]** Add `currentValue: 0` to OKRsManagement initialData
3. **[HIGH]** Add `htmlFor`/`id` association in Input component
4. **[HIGH]** Implement focus restore in Modal
5. **[MEDIUM]** Decide: implement dark mode or remove toggle

---

## Metrics

- Files reviewed: 12
- New UI components: 5
- TypeScript errors: 2 (blocking)
- Accessibility issues: 2 (medium severity)

---

**Status:** BLOCKED - Fix TypeScript errors before merge
