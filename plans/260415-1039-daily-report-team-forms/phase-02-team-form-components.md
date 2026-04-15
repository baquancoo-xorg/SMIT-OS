# Phase 2: Team Form Components

## Overview

Tạo 4 form components riêng cho Tech, Marketing, Media, Sale với metrics phù hợp.

## Priority: High | Status: pending | Effort: 4h

## Key Insights

- Base structure giống nhau: Yesterday Tasks + Blockers + Today Plans
- Khác biệt ở: Metrics panel, Priority flags, Blocker tags
- Reuse `CustomSelect`, animation patterns từ existing components

## Requirements

### Functional
- [ ] 4 form components với UI riêng biệt
- [ ] Shared base layout component
- [ ] Team-specific color theming
- [ ] Priority flag buttons (P0/Hot/Key Camp/SLA)

### Non-functional
- [ ] Consistent with existing SMIT-OS design
- [ ] Mobile responsive
- [ ] Keyboard accessible

## Architecture

```
src/components/daily-report/
├── DailyReportBase.tsx          # Shared layout + logic
├── TechDailyForm.tsx            # Tech-specific
├── MarketingDailyForm.tsx       # Marketing-specific
├── MediaDailyForm.tsx           # Media-specific
├── SaleDailyForm.tsx            # Sale-specific
├── TeamFormSelector.tsx         # Auto-select based on team
└── components/
    ├── TaskStatusCard.tsx       # Yesterday task card
    ├── BlockerCard.tsx          # Blocker entry
    ├── TodayPlanCard.tsx        # Today plan entry
    └── MetricsPanel.tsx         # Team-specific metrics
```

## Team Color Themes

| Team | Primary | Accent | Flag Color |
|------|---------|--------|------------|
| Tech | Indigo-600 | Indigo-100 | Red (P0) |
| Marketing | Orange-600 | Orange-100 | Orange (Key Camp) |
| Media | Pink-600 | Pink-100 | Red (SLA) |
| Sale | Emerald-600 | Emerald-100 | Red (Hot Deal) |

## Related Code Files

### Create
- `src/components/daily-report/DailyReportBase.tsx`
- `src/components/daily-report/TechDailyForm.tsx`
- `src/components/daily-report/MarketingDailyForm.tsx`
- `src/components/daily-report/MediaDailyForm.tsx`
- `src/components/daily-report/SaleDailyForm.tsx`
- `src/components/daily-report/TeamFormSelector.tsx`
- `src/components/daily-report/components/TaskStatusCard.tsx`
- `src/components/daily-report/components/BlockerCard.tsx`
- `src/components/daily-report/components/TodayPlanCard.tsx`

### Reuse
- `src/components/ui/CustomSelect.tsx`
- `src/components/ui/CustomDatePicker.tsx`

## Implementation Steps

1. **Create DailyReportBase**
   - Shared modal container
   - Section headers (Yesterday, Blockers, Today)
   - Submit/Cancel buttons

2. **Create Task/Blocker/Plan Cards**
   - Reusable card components
   - Accept theme colors as props

3. **Create Tech Form**
   - PR Link input
   - Test Status dropdown (Local/Staging/Prod)
   - Task Type radio (Feature/Bug)
   - P0/Hot Fix flag button

4. **Create Marketing Form**
   - Metrics panel: Spend, MQLs, CPA (auto-calc), Ads Tested
   - Camp Status dropdown
   - Channel dropdown
   - Key Camp flag button

5. **Create Media Form**
   - Link + Version dropdown
   - Metrics: Publications, Views, Engagement, Followers
   - Revision count (v1/v2/v3+)
   - Hot SLA flag button

6. **Create Sale Form**
   - Lead funnel grid (5 columns)
   - Pipeline: Opp Value, Revenue
   - Ticket tracking with type
   - Hot Deal flag button

7. **Create TeamFormSelector**
   - Detect team from user
   - Render appropriate form component

## Todo List

- [ ] Create DailyReportBase.tsx
- [ ] Create shared card components
- [ ] Create TechDailyForm.tsx
- [ ] Create MarketingDailyForm.tsx
- [ ] Create MediaDailyForm.tsx
- [ ] Create SaleDailyForm.tsx
- [ ] Create TeamFormSelector.tsx
- [ ] Test all 4 forms manually

## Success Criteria

- [ ] All 4 forms render correctly
- [ ] Metrics capture works for each team
- [ ] Flag buttons toggle properly
- [ ] Mobile responsive
- [ ] Animations smooth (motion/react)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Code duplication | Medium | Extract shared components |
| Inconsistent styling | Medium | Use Tailwind theme vars |

## Next Steps

After Phase 2 → Phase 3 (API Endpoints) to persist data
