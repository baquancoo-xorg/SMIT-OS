# Phase 4: Testing

## Overview
- **Priority:** High
- **Status:** pending
- **Estimated:** 30 minutes

Test toàn bộ changes trên các devices và breakpoints.

## Test Matrix

### Devices

| Device | Width | Test |
|--------|-------|------|
| iPhone 14 | 390px | Mobile layout |
| iPad Pro 11" Portrait | 834px | Tablet, burger menu |
| iPad Pro 11" Landscape | 1194px | Near xl breakpoint |
| iPad Pro 12.9" Portrait | 1024px | Tablet landscape |
| iPad Pro 12.9" Landscape | 1366px | Desktop-like |
| MacBook Pro 14" | 1512px | Desktop |
| 4K Monitor | 2560px | Large desktop |

### Test Cases

#### TC1: Content Alignment
- [ ] Global Search left edge = Page title left edge
- [ ] Header buttons right edge = Content right edge
- [ ] Consistent across all breakpoints

#### TC2: Top Spacing
- [ ] Page title has 32px gap from Topbar
- [ ] Consistent on all pages

#### TC3: iPad Portrait
- [ ] Burger menu visible and clickable
- [ ] Sidebar opens/closes correctly
- [ ] Content not clipped
- [ ] Overlay appears when sidebar open

#### TC4: iPad Landscape
- [ ] Layout optimized (no wasted space)
- [ ] Content readable
- [ ] No horizontal scroll

#### TC5: Desktop Regression
- [ ] Dashboard page - KPI cards layout
- [ ] TechBoard - Kanban columns
- [ ] Team Backlog - List view
- [ ] All sidebar navigation works

### Pages to Test

- [ ] Overview
- [ ] Dashboard (Analytics)
- [ ] Tech & Product
- [ ] Marketing
- [ ] Media
- [ ] Sales
- [ ] OKRs
- [ ] Team Backlog
- [ ] Daily Sync
- [ ] Weekly Report

## Testing Commands

```bash
# Start dev server
npm run dev

# Open browser at different widths
# Chrome DevTools: Toggle device toolbar (Cmd+Shift+M)
# Select: iPad Pro, iPhone 14, responsive mode

# Or use real iPad Pro M2
# Ensure same network, access http://<local-ip>:3000
```

## Bug Report Template

```markdown
### Bug: [Title]
**Device:** 
**Width:**
**Page:**
**Expected:**
**Actual:**
**Screenshot:**
```

## Success Criteria

- All test cases pass
- No visual regressions
- iPad Pro M2 experience smooth
