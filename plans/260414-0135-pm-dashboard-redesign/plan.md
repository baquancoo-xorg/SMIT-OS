---
name: pm-dashboard-redesign
status: completed
priority: high
created: 2026-04-14
completed: 2026-04-14
estimated_effort: 2-3h
actual_effort: 45m
brainstorm: ../reports/brainstorm-260414-0135-pm-dashboard-redesign.md
---

# PM Dashboard Redesign

## Overview

Redesign PMDashboard page với 3-tier layout, 6 metric cards, horizontal bar charts, velocity line chart. Mục tiêu: UI consistent với project style, metrics đầy đủ cho PM.

## Scope

**Single file:** `src/pages/PMDashboard.tsx`

**No backend changes required** - tất cả data đã có sẵn từ existing APIs.

## Design Reference

See: [brainstorm report](../reports/brainstorm-260414-0135-pm-dashboard-redesign.md)

### Layout Structure

```
Tier 1: 6 metric cards (3x2 responsive grid)
Tier 2: 2 chart panels (50/50 split)
Tier 3: 2 action panels (50/50 split)
```

## Phases

| Phase | Description | Effort | Status |
|-------|-------------|--------|--------|
| [Phase 1](phase-01-top-metrics.md) | 6 metric cards với consistent styling | 45m | completed |
| [Phase 2](phase-02-charts-section.md) | Department bars + Status breakdown + Velocity chart | 1h | completed |
| [Phase 3](phase-03-action-panels.md) | Needs Attention + Critical Deadlines panels | 30m | completed |

## Data Sources

| Metric | API | Computation |
|--------|-----|-------------|
| Company OKRs | `/api/objectives` | Filter L1, avg progressPercentage |
| Sprint Countdown | `/api/sprints` | Find current sprint, calc days left |
| Flow Efficiency | `/api/work-items` | Done / Total |
| Active Blockers | `/api/work-items` | Urgent + Todo/InProgress |
| This Week Activity | `/api/work-items` | Filter createdAt >= 7 days ago |
| Report Status | `/api/weekly-reports` | Filter current week |
| Velocity | `/api/work-items` | Group by week, count Done |

## Success Criteria

- [x] All 6 metric cards display correct data
- [x] Consistent card styling (no colored backgrounds)
- [x] Charts use project color scheme
- [x] Responsive layout (mobile/tablet)
- [x] No TypeScript errors
- [x] Error handling with retry button

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| No current sprint in DB | Sprint countdown shows empty | Show "No active sprint" fallback |
| No historical data | Velocity chart empty | Show "Insufficient data" message |

## Files

- `src/pages/PMDashboard.tsx` - Main file to modify
- `src/index.css` - Color reference (read only)
