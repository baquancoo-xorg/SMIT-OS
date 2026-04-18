---
status: completed
created: 2026-04-18
scope: Ad-hoc Tasks Section for Daily/Weekly Reports
blockedBy: []
blocks: []
---

# Ad-hoc Tasks Section

## Overview

Thêm section "Công việc phát sinh ngoài OKRs" vào Daily Report và Weekly Check-in forms để track công việc ngoài kế hoạch.

**Reference:** [Brainstorm Report](../reports/brainstorm-260418-1634-adhoc-tasks-section.md)

## Goals

1. **Visibility** — PM/Leader thấy được workload ngoài OKRs
2. **Tracking** — Members ghi nhận effort phát sinh
3. **Analytics** — Tổng hợp giờ phát sinh theo team/user

## Current State

- DailyReport có 3 sections: yesterday, blockers, today
- WeeklyCheckin có: KR Progress, Next Week Plans, Blockers
- Không có chỗ track công việc ngoài OKRs

## Target State

```
┌────────────────────────────────────────┐
│  Daily Report                          │
├────────────────────────────────────────┤
│  1. Review hôm qua (existing)          │
│  ├─ Task status cards                  │
│  └─ [NEW] Ad-hoc Tasks Table           │
│       ├─ Task | Requester | Impact     │
│       └─ Status | Hours | Total: Xh    │
│  2. Blockers (existing)                │
│  3. Today Plans (existing)             │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  Weekly Check-in                       │
├────────────────────────────────────────┤
│  Confidence Score                      │
│  KR Progress                           │
│  [NEW] Công việc phát sinh (Xh total)  │
│  Cam kết tuần tới                      │
│  Blockers                              │
└────────────────────────────────────────┘
```

## Phases

| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 1 | [Schema + Types](phase-01-schema-types.md) | completed | 30m |
| 2 | [AdHocTasksSection Component](phase-02-adhoc-component.md) | completed | 1.5h |
| 3 | [Daily Report Integration](phase-03-daily-integration.md) | completed | 1h |
| 4 | [Weekly Check-in Integration](phase-04-weekly-integration.md) | completed | 1h |
| 5 | [API Updates](phase-05-api-updates.md) | completed | 30m |

**Total Effort:** ~4.5h

## Key Decisions

- **Storage:** JSON field `adHocTasks` (optional, null-safe)
- **UI:** Reusable `AdHocTasksSection` component
- **Position:** Daily=after yesterday, Weekly=before next week plans
- **Fields:** name, requester, impact, status, hoursSpent

## Dependencies

- Existing components: CustomSelect, lucide-react icons
- Existing patterns: table styling from WeeklyCheckinModal

## Files to Modify

```
prisma/schema.prisma              # Add adHocTasks field
src/types/daily-report-metrics.ts # Add AdHocTask interface
src/components/daily-report/      # AdHocTasksSection component
src/components/daily-report/DailyReportBase.tsx
src/components/daily-report/*DailyForm.tsx (4 files)
src/components/modals/WeeklyCheckinModal.tsx
server/routes/report.routes.ts
server/routes/daily-report.routes.ts
```

## Success Criteria

- [x] Add/remove ad-hoc tasks trong cả 2 forms
- [x] Auto-sum tổng giờ hiển thị đúng
- [x] Data lưu DB sau submit
- [x] Existing reports không bị ảnh hưởng

## Cook Command

```bash
/ck:cook /Users/dominium/Documents/Project/SMIT-OS/plans/260418-1634-adhoc-tasks-section
```
