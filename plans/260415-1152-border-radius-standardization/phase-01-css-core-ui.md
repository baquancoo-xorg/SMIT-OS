# Phase 1: CSS Tokens + Core UI Components

## Overview
- **Priority:** High
- **Status:** pending
- **Effort:** 1h

Update CSS tokens và core UI components làm foundation cho toàn bộ dự án.

## Files to Modify

| File | Current | Target | Changes |
|------|---------|--------|---------|
| `src/index.css` | 3 tokens | 5 tokens | Add semantic tokens |
| `src/components/ui/Button.tsx` | mixed | `rounded-full` | All sizes → capsule |
| `src/components/ui/Input.tsx` | `rounded-2xl` | `rounded-3xl` | Container radius |
| `src/components/ui/CustomSelect.tsx` | `rounded-2xl` | `rounded-3xl` | Button + dropdown |
| `src/components/ui/CustomFilter.tsx` | `rounded-2xl` dropdown | `rounded-3xl` | Dropdown only |
| `src/components/ui/CustomDatePicker.tsx` | mixed | `rounded-3xl` | Container + popover |
| `src/components/ui/Skeleton.tsx` | mixed | match standards | Update variants |

## Implementation Steps

### 1.1 Update CSS Tokens (`src/index.css`)

Add semantic tokens trong `@theme`:
```css
@theme {
  /* Existing */
  --radius-DEFAULT: 1rem;
  --radius-lg: 2rem;
  --radius-xl: 3rem;
  
  /* New semantic tokens */
  --radius-action: 9999px;    /* capsule - buttons, badges */
  --radius-container: 3rem;   /* 48px - inputs, cards, modals */
}
```

### 1.2 Update Button.tsx

Replace all size variants:
```tsx
// sm, md, lg → all use rounded-full
const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded-full',
  md: 'px-4 py-2 text-base rounded-full', 
  lg: 'px-6 py-3 text-lg rounded-full',
}
```

### 1.3 Update Input.tsx

Change `rounded-2xl` → `rounded-3xl`

### 1.4 Update CustomSelect.tsx

- Trigger button: `rounded-3xl`
- Dropdown panel: `rounded-3xl`

### 1.5 Update CustomFilter.tsx

- Filter button: keep `rounded-full` ✓
- Dropdown panel: `rounded-2xl` → `rounded-3xl`

### 1.6 Update CustomDatePicker.tsx

- Input container: `rounded-3xl`
- Calendar popover: `rounded-3xl`
- Calendar day cells: keep `rounded-lg` (small elements)

### 1.7 Update Skeleton.tsx

Match loading states với actual components.

## Todo

- [ ] Update CSS tokens
- [ ] Update Button.tsx
- [ ] Update Input.tsx
- [ ] Update CustomSelect.tsx
- [ ] Update CustomFilter.tsx
- [ ] Update CustomDatePicker.tsx
- [ ] Update Skeleton.tsx
- [ ] Verify dev server renders correctly

## Success Criteria

- CSS tokens defined
- All core UI components follow new standards
- No visual regressions in components
