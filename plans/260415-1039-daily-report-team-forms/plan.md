---
status: pending
created: 2026-04-15
scope: Daily Report Team-specific Forms
blockedBy: []
blocks: []
---

# Daily Report Team-specific Forms

## Overview

Cải thiện Daily Report Form để cá nhân hóa cho 4 đội: Tech, Marketing, Media, Sale. Mỗi đội có metrics và workflow tracking riêng phù hợp với tính chất công việc.

**Reference:** [Brainstorm Report](../reports/brainstorm-260415-1039-daily-report-form-improvement.md)

## Goals

1. **Thu thập dữ liệu chính xác hơn** — Team-specific metrics
2. **Rút gọn thời gian nhập** — Auto-fill, smart defaults
3. **Tăng visibility cho PM/Leader** — Dashboard aggregate

## Current State

- `DailySync.tsx`: Form chung cho tất cả team
- `DailyReport` model: `tasksData` JSON string đơn giản
- User có `departments[]` array có thể dùng detect team

## Target State

```
┌─────────────────────────────────────────────────────────────┐
│  User Login → Auto-detect Team → Render Team Form          │
├─────────────────────────────────────────────────────────────┤
│  Tech Form      │  Mkt Form     │  Media Form  │  Sale Form│
│  - PR/Branch    │  - Spend/CPA  │  - Publish   │  - Lead   │
│  - Test Status  │  - Ads Test   │  - Revision  │  - Demo   │
│  - Bug P0       │  - Camp Flag  │  - SLA Flag  │  - Deal   │
└────────────────────────┬────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │   PM Dashboard      │
              │   Aggregate Metrics │
              └─────────────────────┘
```

## Phases

| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 1 | [DB Schema + Types](phase-01-db-schema-types.md) | pending | 2h |
| 2 | [Team Form Components](phase-02-team-form-components.md) | pending | 4h |
| 3 | [API Endpoints](phase-03-api-endpoints.md) | pending | 2h |
| 4 | [Integration + Auto-detect](phase-04-integration-autodetect.md) | pending | 1.5h |
| 5 | [PM Dashboard](phase-05-pm-dashboard.md) | pending | 3h |

**Total Effort:** ~12.5h (2-3 days)

## Key Decisions

- **Team Detection:** Via `user.departments[0]` mapping
- **Metrics Storage:** JSONB column `teamMetrics` for flexibility
- **Form Architecture:** Shared base + team-specific metric panels
- **Dashboard:** PM-only view with aggregate stats by team

## Dependencies

- `@headlessui/react` — Already installed
- `motion/react` — Already installed
- `CustomSelect` — Available at `src/components/ui/CustomSelect.tsx`

## Success Criteria

- [ ] 4 distinct form variants render based on team
- [ ] Team-specific metrics saved to DB
- [ ] Task sync works (update task status from report)
- [ ] PM Dashboard shows aggregate by team
- [ ] Form submission < 3 minutes per user

## Files to Modify

```
prisma/schema.prisma          # Extend DailyReport model
src/types/index.ts            # Add TeamMetrics types
src/pages/DailySync.tsx       # Refactor to use team forms
src/components/daily-report/  # NEW: Team form components
src/server/routes/            # API routes
src/pages/PMDashboard.tsx     # NEW: Dashboard page
```

## Cook Command

```bash
/ck:cook /Users/dominium/Documents/Project/SMIT-OS/plans/260415-1039-daily-report-team-forms
```
