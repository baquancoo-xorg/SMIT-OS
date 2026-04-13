# Phase 5: Testing & Polish

**Priority:** Medium | **Effort:** 30m | **Status:** pending

## Overview

Visual testing, contrast verification, edge case fixes.

## Testing Checklist

### Functional Tests

- [ ] Toggle button switches theme
- [ ] Theme persists after page reload
- [ ] Theme persists after browser restart
- [ ] No flash of wrong theme on initial load
- [ ] System preference NOT affecting (manual only)

### Visual Tests (Each Page)

| Page | Light OK | Dark OK | Notes |
|------|----------|---------|-------|
| Login | | | |
| PM Dashboard | | | |
| Product Backlog | | | |
| Daily Sync | | | |
| Saturday Sync | | | |
| OKRs | | | |
| Settings | | | |
| Profile | | | |
| Tech Board | | | |
| Marketing Board | | | |
| Sale Board | | | |
| Media Board | | | |

### Component Tests

| Component | Light | Dark | Notes |
|-----------|-------|------|-------|
| Button (all variants) | | | |
| Modal | | | |
| Input | | | |
| Skeleton | | | |
| EmptyState | | | |
| TaskCard | | | |
| Tables | | | |

### Contrast Verification

WCAG 2.1 AA requires:
- Normal text: 4.5:1 ratio
- Large text (18px+): 3:1 ratio

**Check:**
- [ ] Primary text on dark bg (#e5e5e5 on #121212 = 13.5:1 ✓)
- [ ] Secondary text (#a3a3a3 on #121212 = 7.5:1 ✓)
- [ ] Links/buttons clearly visible
- [ ] Error states visible

## Known Edge Cases

1. **Framer Motion animations** - may need explicit dark colors
2. **Third-party components** - may not respect dark mode
3. **Images/icons** - may need invert or different assets
4. **Charts/graphs** - if any, need dark variants

## Polish Tasks

- [ ] Verify smooth transition between themes
- [ ] Check loading states in dark mode
- [ ] Test mobile responsive in dark mode
- [ ] Test all dropdown/select components
- [ ] Verify focus rings visible in dark mode

## Final Verification

1. Run dev server: `npm run dev`
2. Open http://localhost:3005
3. Test light mode (all pages)
4. Toggle to dark mode
5. Test dark mode (all pages)
6. Reload - verify persistence
7. Clear localStorage, reload - verify default light
