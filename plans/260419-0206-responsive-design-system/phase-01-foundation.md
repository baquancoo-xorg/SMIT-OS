# Phase 1: Foundation

**Priority:** Critical
**Status:** complete
**Duration:** Day 1-2

## Overview

Thiết lập design tokens, utilities, và fix AppLayout cho viewport-fit.

## Requirements

### Functional
- Design tokens cho spacing, sizing, breakpoints
- Utility classes cho common patterns
- AppLayout enforce viewport-fit

### Non-Functional
- No breaking changes to existing UI
- Backward compatible với current classes

## Architecture

```
src/index.css
├── @theme { }           # Existing tokens
│   ├── Breakpoints      # NEW: xs → 4xl
│   ├── Spacing scale    # NEW: space-xs → space-2xl
│   ├── Sizing tokens    # NEW: touch-min, card-min/max
│   └── Layout tokens    # NEW: header-h, content-h
└── @layer utilities { } # NEW utility classes
```

## Related Files

**Modify:**
- `src/index.css` - Add design tokens + utilities
- `src/components/layout/AppLayout.tsx` - Viewport-fit structure
- `src/components/layout/Header.tsx` - Fixed height token

**Create:**
- None (extend existing files)

## Implementation Steps

### Step 1: Design Tokens (index.css)

```css
@theme {
  /* Breakpoints - Tailwind v4 auto-generates */
  --breakpoint-xs: 375px;
  --breakpoint-sm: 390px;
  --breakpoint-md: 430px;
  --breakpoint-tablet: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1180px;
  --breakpoint-2xl: 1366px;
  --breakpoint-3xl: 1920px;
  --breakpoint-4xl: 2560px;

  /* Dynamic Spacing */
  --space-xs: clamp(0.25rem, 0.5vw, 0.5rem);
  --space-sm: clamp(0.5rem, 1vw, 0.75rem);
  --space-md: clamp(0.75rem, 1.5vw, 1rem);
  --space-lg: clamp(1rem, 2vw, 1.5rem);
  --space-xl: clamp(1.5rem, 3vw, 2rem);
  --space-2xl: clamp(2rem, 4vw, 3rem);

  /* Touch Targets */
  --touch-min: 44px;
  --touch-comfort: 48px;

  /* Card Sizing */
  --card-min: 280px;
  --card-max: 360px;

  /* Layout */
  --header-h: 4rem;
  --content-h: calc(100dvh - var(--header-h));
}
```

### Step 2: Utility Classes (index.css)

```css
@layer utilities {
  .viewport-fit {
    height: var(--content-h);
    overflow: hidden;
  }
  
  .page-padding {
    padding: var(--space-lg);
  }
  
  .touch-target {
    min-height: var(--touch-min);
    min-width: var(--touch-min);
  }
  
  .internal-scroll {
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }
}
```

### Step 3: AppLayout Refactor

```tsx
// Before: overflow-y-auto on main (page-level scroll)
<main className="flex-1 overflow-y-auto pt-20">

// After: viewport-fit, no page scroll
<main className="flex-1 overflow-hidden pt-16">
  <div className="viewport-fit page-padding">
    {children}
  </div>
</main>
```

### Step 4: Header Height

```tsx
// Standardize to h-16 (64px = 4rem = --header-h)
<header className="h-16 ...">
```

## Todo List

- [ ] Add breakpoint tokens to @theme
- [ ] Add spacing scale tokens
- [ ] Add sizing tokens (touch, card)
- [ ] Add layout tokens (header-h, content-h)
- [ ] Create utility classes
- [ ] Update AppLayout for viewport-fit
- [ ] Standardize Header height to h-16
- [ ] Test basic viewport-fit on desktop

## Success Criteria

- [ ] All tokens defined in index.css
- [ ] Utility classes working
- [ ] AppLayout children fit viewport (no page scroll)
- [ ] Header height consistent (64px)

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| dvh not supported | Low | High | Fallback to vh with JS fix |
| Existing pages break | Medium | Medium | Test immediately after changes |

## Security Considerations

None - CSS only changes.

## Next Steps

→ Phase 2: TechBoard Pilot
