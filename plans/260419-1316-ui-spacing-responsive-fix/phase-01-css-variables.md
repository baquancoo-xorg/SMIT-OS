# Phase 1: CSS Variables Setup

## Overview
- **Priority:** High
- **Status:** pending
- **Estimated:** 15 minutes

Thêm CSS variables cho content padding vào `src/index.css`.

## Context
- [Brainstorm Report](../reports/brainstorm-260419-1317-ui-spacing-responsive-fix.md)
- Current: `.page-padding` dùng `var(--space-lg)` = 16-24px
- Expected: Match Header padding (mobile 16px, tablet 32px, desktop 40px)

## Implementation

### Step 1: Add CSS Variables to @theme

**File:** `src/index.css`
**Location:** Inside `@theme { }` block, after `--header-h`

```css
/* Content Padding - synced with Header */
--content-px-mobile: 1rem;      /* 16px */
--content-px-tablet: 2rem;      /* 32px */
--content-px-desktop: 2.5rem;   /* 40px = xl:pr-10 */

/* Page Block Spacing */
--page-pt: 2rem;    /* 32px from topbar */
--page-pb: 1.5rem;  /* 24px bottom */
```

### Step 2: Update .page-padding

**File:** `src/index.css`
**Location:** Replace existing `.page-padding` in `@layer utilities`

```css
.page-padding {
  padding-inline: var(--content-px-mobile);
  padding-block: var(--page-pt) var(--page-pb);
}

@media (min-width: 430px) {
  .page-padding {
    padding-inline: var(--content-px-tablet);
  }
}

@media (min-width: 1024px) {
  .page-padding {
    padding-inline: var(--content-px-tablet);
  }
}

@media (min-width: 1180px) {
  .page-padding {
    padding-inline: var(--content-px-desktop);
  }
}
```

## Todo

- [ ] Add CSS variables to @theme block
- [ ] Replace .page-padding with responsive version
- [ ] Verify no syntax errors

## Success Criteria

- CSS compiles without errors
- Variables available for use in other files
