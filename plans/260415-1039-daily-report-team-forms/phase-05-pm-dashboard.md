# Phase 5: PM Dashboard

## Overview

Tạo dashboard cho PM/Leader xem aggregate metrics từ daily reports của các team.

## Priority: Medium | Status: pending | Effort: 3h

## Key Insights

- PM cần overview nhanh về tiến độ các đội
- Focus: Blockers, Completion rate, Team-specific KPIs
- Date range filtering essential

## Requirements

### Functional
- [ ] Overview stats cards
- [ ] Team breakdown with key metrics
- [ ] Blocker summary with impact levels
- [ ] Date range filter

### Non-functional
- [ ] PM/Admin only access
- [ ] Quick loading (cached queries)
- [ ] Mobile responsive

## Architecture

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Daily Sync Dashboard                    [Date Range ▼]     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Total   │ │ Approved│ │ Pending │ │ Blockers│           │
│  │ Reports │ │ Rate    │ │ Review  │ │ (High)  │           │
│  │   24    │ │  85%    │ │    4    │ │    2    │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
├─────────────────────────────────────────────────────────────┤
│  TEAM BREAKDOWN                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Tech (6 reports)                                      │  │
│  │ • P0 Bugs: 1  • PRs Merged: 4  • Blocked: 1          │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Marketing (5 reports)                                 │  │
│  │ • Spend: 45M  • MQLs: 120  • CPA: 375K               │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Media (4 reports)                                     │  │
│  │ • Publications: 8  • Avg Revision: 1.5               │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Sale (5 reports)                                      │  │
│  │ • Demos: 12  • Revenue: 150M  • Hot Deals: 3         │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ACTIVE BLOCKERS                                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🔴 [Tech] Chờ API từ Core - Ngọc Phong              │  │
│  │ 🔴 [Sale] KH chờ tính năng mới - Kim Huệ            │  │
│  │ 🟡 [Media] Chờ Brief từ MKT - Thành Long            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Related Code Files

### Create
- `src/pages/PMDashboard.tsx` — Main dashboard page
- `src/components/dashboard/TeamStatsCard.tsx` — Team breakdown card
- `src/components/dashboard/BlockersList.tsx` — Active blockers list
- `src/components/dashboard/DateRangeFilter.tsx` — Date range picker

### Modify
- `src/components/layout/Sidebar.tsx` — Add dashboard link (PM only)

## Implementation Steps

1. **Create PMDashboard page**
   - Fetch stats from `/api/daily-reports/stats`
   - Display overview cards
   - Date range state

2. **Create TeamStatsCard**
   - Receive team data
   - Display team-specific metrics
   - Color coded by team

3. **Create BlockersList**
   - Fetch high-impact blockers
   - Show reporter name, team, description
   - Sort by impact level

4. **Add Route + Sidebar**
   - Route: `/pm-dashboard`
   - Sidebar item (PM/Admin only)

5. **Add DateRangeFilter**
   - Today / This Week / This Sprint
   - Custom range picker

## Todo List

- [ ] Create src/pages/PMDashboard.tsx
- [ ] Create TeamStatsCard component
- [ ] Create BlockersList component
- [ ] Create DateRangeFilter component
- [ ] Add route in App.tsx
- [ ] Add sidebar link (PM only)
- [ ] Test with real data

## Success Criteria

- [ ] Dashboard loads with stats
- [ ] Team breakdown shows correct metrics
- [ ] Blockers list actionable
- [ ] Date filter works
- [ ] Only PM/Admin can access

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Slow stats query | Medium | Index + cache |
| No data edge case | Low | Empty state UI |

## Security Considerations

- Route guard: PM/Admin only
- Don't expose individual report details without permission
- Rate limit stats endpoint
