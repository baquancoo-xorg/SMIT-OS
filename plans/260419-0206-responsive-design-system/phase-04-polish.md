# Phase 4: Polish

**Priority:** Medium
**Status:** complete
**Duration:** Day 7+
**Depends on:** Phase 3 (Rollout)

## Overview

Edge cases, animations, documentation, và component library consolidation.

## Tasks

### 1. UI Component Consolidation

**Current Issues:**
- Button sizes inconsistent (sm/md/lg)
- Border radius mixed (xl/2xl/3xl/full)
- Padding varies across components

**Solution:**

```tsx
// src/components/ui/Button.tsx - Standardize
const sizes = {
  sm: 'h-9 px-3 text-sm',           // 36px
  md: 'h-11 px-4 text-base',        // 44px (touch-min)
  lg: 'h-12 px-6 text-lg',          // 48px (touch-comfort)
};

// All buttons use rounded-full (--radius-action)
```

**Files to Update:**
- `src/components/ui/Button.tsx`
- `src/components/ui/PrimaryActionButton.tsx`
- `src/components/ui/ViewToggle.tsx`
- `src/components/ui/CustomSelect.tsx`
- `src/components/ui/CustomFilter.tsx`
- `src/components/ui/CustomDatePicker.tsx`

### 2. Edge Cases

#### Safari iOS Address Bar
```css
/* dvh already handles this, but verify */
@supports not (height: 100dvh) {
  .viewport-fit {
    height: calc(100vh - env(safe-area-inset-bottom));
  }
}
```

#### iPad Split View
- Test 50/50 and 70/30 split screen
- Ensure columns resize gracefully

#### iPhone Landscape
- Verify viewport-fit works
- May need horizontal scroll for Kanban

#### 4K Displays
- Test clamp() max values
- Ensure content doesn't look tiny

### 3. Animations & Transitions

```css
@layer utilities {
  .transition-layout {
    transition: all 0.2s ease-out;
  }
}
```

Apply to:
- Sidebar open/close
- Mobile column switches
- Collapsible sections

### 4. Documentation

#### Design System Doc
Create: `docs/design-system.md`

```markdown
# SMIT OS Design System

## Breakpoints
| Token | Value | Usage |
|-------|-------|-------|
| xs | 375px | iPhone mini |
| ... |

## Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| --space-xs | clamp(...) | Tight spacing |
| ... |

## Layout Patterns
### Viewport-fit Page
### Dashboard Grid
### Kanban Board

## Component Sizes
### Buttons
### Cards
### Touch Targets
```

#### Update Existing Docs
- Add responsive guidelines to any code standards doc
- Update README if needed

### 5. Performance Audit

- [ ] Check for layout thrashing (frequent reflows)
- [ ] Verify smooth scroll in columns with 50+ cards
- [ ] Test DnD performance on iPad
- [ ] Consider virtualization if needed (react-window)

### 6. Accessibility Audit

- [ ] All touch targets ≥ 44px
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader navigation works

## Todo List

### Component Consolidation
- [ ] Standardize Button sizes
- [ ] Unify border radius to tokens
- [ ] Consistent padding across UI components

### Edge Cases
- [ ] Test Safari iOS address bar
- [ ] Test iPad split view
- [ ] Test iPhone landscape
- [ ] Test 4K displays
- [ ] Fix any issues found

### Polish
- [ ] Add transition-layout utility
- [ ] Smooth sidebar transitions
- [ ] Mobile column transitions

### Documentation
- [ ] Create docs/design-system.md
- [ ] Document breakpoints
- [ ] Document spacing scale
- [ ] Document layout patterns
- [ ] Document component sizes

### Audits
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] Fix issues found

## Success Criteria

- [ ] All UI components use consistent sizing
- [ ] Edge cases handled
- [ ] Smooth animations
- [ ] Design system documented
- [ ] Performance acceptable
- [ ] Accessibility compliant

## Deliverables

1. **Updated UI Components** - Consistent sizing/spacing
2. **Edge Case Fixes** - Safari, iPad split, iPhone landscape
3. **Design System Doc** - `docs/design-system.md`
4. **Audit Reports** - Performance + Accessibility notes

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance issues | Low | Medium | Virtualize if needed |
| Accessibility gaps | Medium | Medium | Audit early, fix iteratively |
| Documentation time | Medium | Low | Prioritize essentials |

## Project Completion

After Phase 4:
- [ ] All phases completed
- [ ] All success criteria met
- [ ] Stakeholder sign-off
- [ ] Archive plan via `/ck:plan archive`
