# Phase 6: Testing

## Overview
- **Priority:** High
- **Status:** pending
- **Estimated:** 1 hour

Comprehensive testing on iPad và các breakpoints.

## Test Devices

| Device | Width | Priority |
|--------|-------|----------|
| iPhone 14 | 390px | High |
| iPad Pro 11" Portrait | 834px | Critical |
| iPad Pro 11" Landscape | 1194px | Critical |
| iPad Pro 12.9" Portrait | 1024px | High |
| iPad Pro 12.9" Landscape | 1366px | Critical |
| MacBook Air 13" | 1440px | High |
| Desktop 1920px | 1920px | Medium |

## Test Cases

### TC1: Burger Menu
- [ ] iPad 11" portrait: burger visible, sidebar opens
- [ ] iPad 11" landscape: burger visible, sidebar opens
- [ ] iPad 12.9" landscape: burger visible
- [ ] Desktop 1440px+: sidebar static, no burger

### TC2: Global Search
- [ ] Mobile (<768px): search icon, tap opens overlay
- [ ] Tablet: shorter search bar, not touching icons
- [ ] Desktop: full search bar

### TC3: Page Scroll
- [ ] OKRs: page scrolls vertically
- [ ] Tech Kanban: viewport-fit, columns internal scroll
- [ ] Settings: page scrolls
- [ ] Dashboard: viewport-fit

### TC4: Responsive Sizing
- [ ] OKRs cards: appropriate size on tablet
- [ ] Dashboard stats: readable, not oversized
- [ ] Touch targets: ≥44px on all buttons

### TC5: Tables
- [ ] Horizontal scroll works
- [ ] First column sticky (if implemented)
- [ ] Row height comfortable for touch

### TC6: Kanban
- [ ] Columns visible or scrollable on tablet
- [ ] Drag-drop works on touch
- [ ] No content clipping

### TC7: No Regressions
- [ ] Desktop 1440px+: sidebar static, all features work
- [ ] Desktop 1920px+: no layout breaks
- [ ] All pages render correctly

## Testing Commands

```bash
# Local testing
npm run dev

# Chrome DevTools responsive mode
# Cmd+Shift+M → select device

# Real iPad testing
# Connect to same network
# Access http://<local-ip>:3000
```

## Bug Report Template

```markdown
### Bug: [Title]
**Device/Width:**
**Page:**
**Steps:**
1.
2.
**Expected:**
**Actual:**
**Screenshot:**
```

## Todo

- [ ] Test all cases on iPad Pro M2
- [ ] Test on desktop breakpoints
- [ ] Document any issues found
- [ ] Fix critical bugs before completing

## Success Criteria

- All test cases pass
- No visual regressions
- Smooth experience on iPad Pro M2
- User approves final result
