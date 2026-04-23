---
title: "Lead Logs + Notification Stability + SLA + Note Filters"
description: "Fix notification dismiss persistence/badge UI; add SLA column + stats + note filters for Lead Logs."
status: pending
priority: P1
effort: 3-5h
branch: main
tags: [lead-logs, notification, sla, filters]
created: 2026-04-23
blockedBy: []
blocks: []
---

# Lead Logs + Notification Stability + SLA + Note Filters

## Context

- Brainstorm scope approved in session 2026-04-23 10:46 (Asia/Saigon)
- Constraints: YAGNI/KISS/DRY, update existing files, no DB schema change
- Note filter date accuracy: quick mode using `updatedAt`
- Notification persistence: user + local only (no cross-device sync)

## Phases

| # | Phase | Status | Output |
|---|-------|--------|--------|
| 01 | [Notification Stability + Badge UI](./phase-01-notification-stability-badge.md) | pending | Dismiss không bật lại sau F5, badge không che icon |
| 02 | [Lead Logs SLA Column + Stats Labels](./phase-02-lead-logs-sla-stats.md) | pending | Cột SLA + stat On-time/Overdue + Attempted label |
| 03 | [Lead Note Filters (API + UI)](./phase-03-lead-note-filters.md) | pending | Filter hasNote + noteDate hoạt động |
| 04 | [Validation Checklist](./phase-04-validation-checklist.md) | pending | Build + manual checks pass |

## Scope Boundaries

In scope:
- NotificationCenter/UI badge + use-notifications persistence logic
- Lead Logs table column + stats + filters
- `/api/leads` query extension for note filters

Out of scope:
- Notification dismiss sync across devices
- DB migration (`noteUpdatedAt`, audit redesign)
- Rework overall Lead Tracker architecture

## Files Expected to Change

- `src/hooks/use-notifications.ts`
- `src/components/layout/NotificationCenter.tsx`
- `src/components/lead-tracker/lead-logs-tab.tsx`
- `src/lib/api.ts`
- `server/routes/lead.routes.ts`

## Success Criteria

1. Deadline notification dismissed bởi user A không tự hiện lại sau F5 trên cùng browser
2. Badge đỏ không che icon chuông ở count 1..9+
3. Lead Logs có cột SLA với rule:
   - `Qualified/Unqualified` => `Closed`
   - open lead => `On-time (D-x)` hoặc `Overdue (+x)` theo mốc 7 ngày từ `receivedDate`
4. Stat bar:
   - `Approaching` đổi thành `Attempted`
   - thêm `On-time` và `Overdue`
5. Filter:
   - `Has note` (All/With note/Without note)
   - `Note changed date` (quick by `updatedAt`)
6. `npm run build` pass

## Execution Note

After this plan is accepted, proceed phase-by-phase and keep diffs minimal.
