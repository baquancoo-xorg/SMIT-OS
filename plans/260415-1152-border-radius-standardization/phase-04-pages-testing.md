# Phase 4: Pages + Testing

## Overview
- **Priority:** Medium
- **Status:** pending
- **Effort:** 1.5h

Update remaining page-level styles và comprehensive testing.

## Files to Modify

| File | Key Changes |
|------|-------------|
| `src/pages/PMDashboard.tsx` | Dashboard cards |
| `src/pages/TechBoard.tsx` | Board container |
| `src/pages/SaleBoard.tsx` | Board container |
| `src/pages/MediaBoard.tsx` | Board container |
| `src/pages/MarketingBoard.tsx` | Board container |
| `src/pages/ProductBacklog.tsx` | Table + cards |
| `src/pages/LoginPage.tsx` | Form container |
| `src/pages/Profile.tsx` | Profile card |

## Implementation Steps

### 4.1 PMDashboard.tsx

- Metric cards → `rounded-3xl`
- Remove `rounded-[40px]` arbitrary values
- Action buttons → `rounded-full`

### 4.2 Board Pages (Tech/Sale/Media/Marketing)

- Board container → `rounded-3xl`
- Column headers → `rounded-3xl`
- Remove `rounded-[32px]` arbitrary values
- Filter buttons → `rounded-full`

### 4.3 ProductBacklog.tsx

- Table container → `rounded-3xl`
- Filter pills → `rounded-full`
- Action buttons → `rounded-full`

### 4.4 LoginPage.tsx

- Login card → `rounded-3xl`
- Input fields → `rounded-3xl`
- Login button → `rounded-full`

### 4.5 Profile.tsx

- Profile card → `rounded-3xl`
- Avatar → keep `rounded-full`
- Edit button → `rounded-full`

## Testing Checklist

### Visual Testing

- [ ] **LoginPage** - Form centered, inputs aligned
- [ ] **PMDashboard** - Cards aligned, no overflow
- [ ] **TechBoard** - Columns + cards consistent
- [ ] **SaleBoard** - Same as TechBoard
- [ ] **MediaBoard** - Same as TechBoard
- [ ] **MarketingBoard** - Same as TechBoard
- [ ] **ProductBacklog** - Table renders correctly
- [ ] **Profile** - Card layout intact
- [ ] **DailySync** - Form fields aligned

### Responsive Testing

- [ ] Mobile viewport (375px) - No horizontal scroll
- [ ] Tablet viewport (768px) - Cards wrap correctly
- [ ] Desktop viewport (1440px) - Full layout

### Edge Cases

- [ ] Long button text - No overflow
- [ ] Empty states - Skeleton matches
- [ ] Modals - Centered, corners visible
- [ ] Dropdowns - Opens without clipping

## Todo

- [ ] Update PMDashboard.tsx
- [ ] Update TechBoard.tsx
- [ ] Update SaleBoard.tsx
- [ ] Update MediaBoard.tsx
- [ ] Update MarketingBoard.tsx
- [ ] Update ProductBacklog.tsx
- [ ] Update LoginPage.tsx
- [ ] Update Profile.tsx
- [ ] Run visual testing checklist
- [ ] Run responsive testing
- [ ] Fix any edge cases found

## Final Verification

```bash
# Grep to ensure no arbitrary values remain
grep -r "rounded-\[" src/ --include="*.tsx"
# Should return empty
```

## Success Criteria

- [ ] All pages follow standards
- [ ] No arbitrary `rounded-[Xpx]` values
- [ ] All viewports tested
- [ ] No visual regressions
