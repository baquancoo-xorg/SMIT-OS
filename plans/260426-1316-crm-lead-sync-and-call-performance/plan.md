---
title: "CRM Lead Auto-Sync & Call Performance Dashboard"
description: "Tự động sync subscriber từ CRM DB vào Lead Logs (CRM master, SMIT mirror) và thêm Call Performance section per-AE vào DashboardOverview"
status: completed
priority: P1
effort: 16h
branch: main
tags: [crm, sync, lead-logs, dashboard, call-performance, cron]
created: 2026-04-26
blockedBy: []
blocks: [260426-2346-dashboard-system-refactor-tabs-ui]
---

# Plan: CRM Lead Auto-Sync & Call Performance Dashboard

## Context Links
- Brainstorm: [brainstorm-260426-1316-crm-lead-sync-and-call-performance.md](../reports/brainstorm-260426-1316-crm-lead-sync-and-call-performance.md)
- Codebase exploration: [Explore-260426-smit-os-brainstorm-context.md](../reports/Explore-260426-smit-os-brainstorm-context.md)
- CRM schema: `prisma/crm-schema.prisma`
- SMIT schema: `prisma/schema.prisma`

## Goal
1. Auto-sync `crm_subscribers` (since 2026-04-01) → SMIT `Lead` table mỗi 10 phút (CRM master, SMIT mirror).
2. Thêm Call Performance section trong DashboardOverview với 4 widgets: per-AE table, 7×24 heatmap, conversion calls→qualified, trend line.

## Key Constraints
- CRM master, SMIT-only fields (`notes`, `leadType`, `unqualifiedType`) NEVER overwritten
- Match qua `Lead.crmSubscriberId` (BigInt unique)
- AE mapping qua `User.crmEmployeeId` (Int unique)
- Status mapping configurable (`LeadStatusMapping` table)
- Resolved Date derived từ `crm_activities` latest status-change event
- Audit log mọi sync attempt (`actorUserId='system-sync'`)
- Disable manual create lead (deprecate Add Lead + Bulk Paste)
- Call answered heuristic: `total_duration > 10s`

## Phases

| # | Phase | File | Effort | Status |
|---|---|---|---|---|
| 01 | Schema migration + seed | [phase-01-schema-migration-and-seed.md](phase-01-schema-migration-and-seed.md) | 2h | completed |
| 02 | Sync service + cron + manual API | [phase-02-sync-service-and-cron.md](phase-02-sync-service-and-cron.md) | 4h | completed |
| 03 | Backfill historical script | [phase-03-backfill-script.md](phase-03-backfill-script.md) | 1h | completed |
| 04 | Lead Logs UI deprecation | [phase-04-lead-logs-ui-deprecation.md](phase-04-lead-logs-ui-deprecation.md) | 3h | completed |
| 05 | Call Performance API + Dashboard | [phase-05-call-performance-api-and-dashboard.md](phase-05-call-performance-api-and-dashboard.md) | 5h | completed |
| 06 | Admin UI for mapping (DEFERRED) | [phase-06-admin-ui-mapping.md](phase-06-admin-ui-mapping.md) | 1h | deferred |

## Dependencies (Build Order)
```
phase-01 (schema)
   ↓
phase-02 (sync engine) ──┐
   ↓                     │
phase-03 (backfill)      │
                         ↓
                    phase-04 (UI deprecation)
phase-01 ────────────────┐
                         ↓
                    phase-05 (call dashboard, depends on User.crmEmployeeId)

phase-06 deferred — independent
```

## Critical Risks
- `User.crmEmployeeId` mapping rỗng ban đầu → leads không có AE; mitigation = phase-01 seed script + warning trong sync log
- Sync ghi đè SMIT-only fields nếu logic sai → mitigation = unit tests cover field protection
- Concurrent cron runs → advisory lock `pg_try_advisory_lock(LEAD_SYNC_LOCK_KEY)`

## Success Criteria
- Cron chạy ổn định 24h, < 15min latency CRM → Lead Logs
- 0 cases overwrite SMIT-only fields trong 1 tuần
- Call Performance dashboard load < 2s cho 30-day window
- Audit log đầy đủ mọi sync touch

## Open Questions (deferred to implementation)
- Admin UI permission cho "Sync from CRM" — Admin only hay Leader Sales? (default: Admin only, revisit phase-04)
- Alert mechanism khi cron fail liên tục — Slack/email/banner? (defer)
- Voice URL drill-down trong lead detail modal — phase tương lai
