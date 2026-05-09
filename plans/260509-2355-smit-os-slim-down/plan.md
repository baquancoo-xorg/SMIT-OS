---
title: "SMIT-OS Slim-down: Drop Task Management, Keep OKR Loop & FB Ads Dashboard"
description: "Xoá WorkItem/Sprint + 8 pages task. Giữ DashboardOverview (FB Ads), OKR, Daily 4-field, Weekly Checkin Wodtke, LeadTracker."
status: completed
priority: P1
effort: 13h
branch: main
tags: [refactor, cleanup, okr, schema-migration, breaking-change]
created: 2026-05-09
completed: 2026-05-10
---

# SMIT-OS Slim-down

## Goal
Drop task management khỏi SMIT-OS. Giữ 5 trang core: **Dashboard FB Ads** (`/ads-overview`) + **OKRs** + **Daily Sync** (4 text fields) + **Weekly Checkin** (Wodtke 5-block) + **LeadTracker**.

## Context Links
- **Brainstorm:** `plans/reports/brainstorm-260509-2355-smit-os-slim-down.md`
- **Architecture:** `docs/system-architecture.md`
- **Project doc:** `CLAUDE.md`

## Page Mapping (Final)

| Sidebar Label | Path | Component | Action |
|---|---|---|---|
| Analytics > Overview | `/` | PMDashboard.tsx | **DROP**, redirect → `/ads-overview` |
| Analytics > Dashboard | `/ads-overview` | DashboardOverview.tsx | **KEEP** (FB Ads + Lead + Product KPIs) |
| Planning > OKRs | `/okrs` | OKRsManagement.tsx | KEEP (UI giữ, schema KR thêm `ownerId`) |
| Workspace > Tech / Product / Marketing / Media / Sales | `/tech`, `/backlog`, `/mkt`, `/media`, `/sale` | 5 board pages | **DROP** |
| Planning > Teambacklog / Sprintboard | (no route?) / `/sprint` | SprintBoard.tsx | **DROP** |
| Rituals > Daily Sync | `/daily-sync` | DailySync.tsx | REFACTOR (4 textarea text thuần) |
| Rituals > Weekly Report | `/sync` → `/checkin` | SaturdaySync.tsx → WeeklyCheckin.tsx | REFACTOR (5-block Wodtke) + rename URL |
| CRM > Lead Tracker | `/lead-tracker` | LeadTracker.tsx | KEEP unchanged |
| Settings | `/settings` | Settings.tsx | DROP `sprints` tab (giữ `fb-config`) |
| Profile | `/profile` | Profile.tsx | KEEP |

**Orphan dead files:** EpicBoard.tsx, EpicGraph.tsx → DROP.

## Key Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Drop hết data WorkItem/Sprint/DailyReport cũ/WeeklyReport cũ | Clean slate, no migration debt |
| 2 | Confidence 0-10 (Wodtke "Radical Focus") | Industry standard |
| 3 | Xoá Sprint, dùng OkrCycle | Sprint duplicate OkrCycle |
| 4 | Giữ approval Review→Approved cả Daily & Weekly | User chọn |
| 5 | Drop PMDashboard `/`, redirect `/` → `/ads-overview` | User confirm Analytics/Overview drop |
| 6 | **GIỮ FB Ads stack hoàn toàn** | DashboardOverview cần feed |
| 7 | Thêm `KeyResult.ownerId` | Linh hoạt hơn Objective.ownerId |
| 8 | Rename URL `/sync` → `/checkin` | URL match tên trang |

## Phases

| # | Phase | Effort | Status | Depends |
|---|---|---|---|---|
| 1 | [DB Migration & Schema](./phase-01-db-migration.md) | 2h | completed | — |
| 2 | [Backend Routes & Services](./phase-02-backend-routes.md) | 2h | completed | P1 |
| 3 | [Frontend Pages & Forms](./phase-03-frontend-pages.md) | 5h | completed | P2 |
| 4 | [Drop PMDashboard + Setup Redirect](./phase-04-pmdashboard-rebuild.md) | 0.5h | completed | P3 |
| 5 | [Settings Cleanup](./phase-05-settings-cleanup.md) | 0.5h | completed | P3 |

## Execution Order Rationale
P1 (schema clean) → P2 (BE match schema) → P3 (FE match BE) → P4 (drop PMDashboard + redirect) → P5 (settings).
**Deploy phải đồng bộ P1+P2+P3** để tránh runtime errors.

## Top Risks
- **FK cascade:** Truncate đúng thứ tự (P1)
- **DashboardOverview side-effect:** P3 chỉ touch DashboardOverview nếu types/index.ts đụng. Otherwise no change.
- **Notification emit cleanup:** Drop Sprint/WorkItem entityType, giữ Daily/Weekly/Lead emit (P2)
- **Sidebar label "Overview"** (which points to `/`): drop nav item, không drop "Dashboard" (`/ads-overview`)

## Success Metrics
- ✅ `npm run build` pass clean (no TS errors)
- ✅ `npx prisma validate` pass + migration apply clean
- ✅ Daily Sync = 4 textarea, no dropdown
- ✅ Weekly Checkin URL `/checkin`, form 5-block Wodtke, per-KR confidence 0-10
- ✅ Settings còn 5 tabs (profile/users/okrs/fb-config/export)
- ✅ LeadTracker hoạt động không suy giảm
- ✅ DashboardOverview `/ads-overview` hoạt động không suy giảm (FB Ads + Lead + Product KPIs)
- ✅ `/` redirect tự động sang `/ads-overview`
- ✅ Approval flow Daily + Weekly fire Notification đúng

## Completion Summary

**Shipped 2026-05-10:**
- P1: Schema clean — dropped 4 models (WorkItem, Sprint, WorkItemKrLink, WorkItemDependency), truncated 8 legacy tables (105 work_items, 7 sprints, 35 daily_reports, 17 weekly_reports), added KeyResult.ownerId, refactored DailyReport (4 text) + WeeklyReport (Wodtke 5-block)
- P2: Backend routes cleaned — deleted work-item + sprint routes, removed 3 extractors (planning/workspace/analytics-dashboard), updated daily-report/report/key-result payloads, dropped Sprint/WorkItem notification logic
- P3: Frontend shrunk 82kB → 10kB DailySync; dropped 9 pages (PMDashboard + 8 task boards) + 12 board components; renamed /sync → /checkin; rebuilt WeeklyCheckin (5-block Wodtke + confidence slider); updated OKRsManagement (removed WorkItem refs)
- P4: Root redirect live — / → /ads-overview, wildcard fallback verified
- P5: Settings tabs trimmed to 5 (users/okrs/fb-config/profile/export), removed sprints tab

**Key Deletions:**
- Backend: 2 routes, 3 extractors, 8 seed scripts
- Frontend: 9 pages, 2 folders (sprint/, work-item/), 12 task components, 1 context provider
- Database: 4 models, 8 tables truncated (Lead/Ads preserved)
