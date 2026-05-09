# Phase 02 — Backend Routes & Services

## Context Links
- **Parent plan:** [plan.md](./plan.md)
- **Brainstorm:** `plans/reports/brainstorm-260509-2355-smit-os-slim-down.md`
- **Depends on:** [Phase 01 — DB Migration](./phase-01-db-migration.md)

## Overview
- **Date:** 2026-05-09 | **Revised:** 2026-05-10
- **Priority:** P1
- **Status:** completed
- **Review status:** completed
- **Effort:** 2h
- **Description:** Drop 2 routes task management. Refactor daily-report/report/key-result payload. **Giữ toàn bộ FB Ads stack + dashboard sub-routes** vì DashboardOverview tiếp tục dùng.

## Key Insights
- Sau P1 schema clean, route reference `prisma.workItem`, `prisma.sprint` sẽ TS error → driver dọn dẹp
- DashboardOverview consume: `dashboard-overview`, `dashboard-product`, `dashboard-call-performance`, `dashboard-lead-distribution`, `dashboard-lead-flow`, `admin-fb-config`, `fb-sync` → **GIỮ tất cả**
- `notification.service` emit "Sprint Ending Soon" + entityType `Sprint`/`WorkItem` → drop logic
- `sheets-export.service` reference `extractors.planningSprint` → drop planning + workspace + analytics-dashboard extractors (chỉ về task management) — **verify trước drop analytics-dashboard** vì có thể consume FB data
- `lead-sync.routes` không còn nguy cơ (FB stack giữ)

## Requirements

### Functional
- Endpoint giữ: `auth`, `user`, `objective`, `key-result`, `okr-cycle`, `daily-report`, `report`, `notification`, `lead`, `lead-sync`, `google-oauth`, `sheets-export`, `dashboard-overview`, `dashboard-product`, `dashboard-call-performance`, `dashboard-lead-distribution`, `dashboard-lead-flow`, `admin-fb-config`, `fb-sync`
- Endpoint drop: `work-item.routes`, `sprint.routes`
- `daily-report.routes` payload mới: `{completedYesterday, doingYesterday, blockers, planToday}`
- `report.routes` payload mới: `{krProgress: [...], lastWeekPriorities, nextWeekTopThree, risks, helpNeeded}`
- `key-result.routes` GET hỗ trợ `?ownerId=`

### Non-functional
- Server `npm run build` pass clean
- Server start không có warning route registration mismatch
- Approval flow Daily + Weekly fire Notification đúng

## Architecture

### Routes — Final Map

| Route | Action | Note |
|---|---|---|
| `auth.routes` | KEEP | unchanged |
| `user.routes` | KEEP | unchanged |
| `objective.routes` | KEEP | unchanged |
| `key-result.routes` | REFACTOR | + filter `?ownerId=` |
| `okr-cycle.routes` | KEEP | unchanged |
| `daily-report.routes` | REFACTOR | payload 4 text fields, drop teamMetrics/adHoc |
| `report.routes` | REFACTOR | payload 5-block Wodtke |
| `notification.routes` | KEEP | unchanged |
| `lead.routes` | KEEP | unchanged |
| `lead-sync.routes` | KEEP | unchanged |
| `google-oauth.routes` | KEEP | unchanged |
| `sheets-export.routes` | KEEP | service cleanup riêng |
| `dashboard-overview.routes` | KEEP | unchanged (DashboardOverview giữ) |
| `dashboard-product.routes` | KEEP | unchanged |
| `dashboard-call-performance.routes` | KEEP | unchanged |
| `dashboard-lead-distribution.routes` | KEEP | unchanged |
| `dashboard-lead-flow.routes` | KEEP | unchanged |
| `admin-fb-config.routes` | KEEP | unchanged |
| `fb-sync.routes` | KEEP | unchanged |
| `work-item.routes` | **DELETE** | task management |
| `sprint.routes` | **DELETE** | task management |

### Services — Final Map

| Service | Action |
|---|---|
| `services/facebook/*` | KEEP (FB sync) |
| `services/sheets-export/extractors/planning.extractor.ts` | DELETE (Sprint refs) |
| `services/sheets-export/extractors/workspace.extractor.ts` | DELETE (WorkItem refs) |
| `services/sheets-export/extractors/analytics-dashboard.extractor.ts` | **VERIFY** — keep nếu chỉ về Lead/Ads, drop nếu về task |
| `services/sheets-export/extractors/index.ts` | UPDATE — remove planning + workspace |
| `services/sheets-export.service.ts` | UPDATE — drop refs `extractors.planningSprint`, `extractors.workspace*` |
| `services/notification.service.ts` | UPDATE — drop "Sprint Ending Soon" + entityType Sprint/WorkItem |
| `schemas/dashboard-overview.schema.ts` | KEEP (fbSyncBodySchema) |

### Server Entry
- `server/index.ts`: unregister 2 routes deleted (work-item, sprint)

## Related Code Files

### Modify
- `server/routes/key-result.routes.ts` — thêm `?ownerId=` filter
- `server/routes/daily-report.routes.ts` — payload 4 text fields
- `server/routes/report.routes.ts` — payload 5-block Wodtke
- `server/services/sheets-export/extractors/index.ts` — remove imports
- `server/services/sheets-export.service.ts` — drop planning/workspace refs
- `server/services/notification.service.ts` — drop Sprint/WorkItem logic
- `server/index.ts` — un-register 2 routes

### Create
- (none)

### Delete
- `server/routes/work-item.routes.ts`
- `server/routes/sprint.routes.ts`
- `server/services/sheets-export/extractors/planning.extractor.ts`
- `server/services/sheets-export/extractors/workspace.extractor.ts`
- `server/services/sheets-export/extractors/analytics-dashboard.extractor.ts` (chỉ nếu verify confirm task-related)

## Implementation Steps

1. **Pre-verify analytics-dashboard.extractor** — đọc file xem reference bảng/concept nào. Nếu task-related (workItem, sprint) → drop. Nếu ads/lead-related → keep.
2. **Pre-verify sheets-export** — grep export DailyReport/WeeklyReport. Note kết quả.
3. **Delete files** — work-item.routes, sprint.routes, planning.extractor, workspace.extractor (+ analytics-dashboard nếu task-related).
4. **Update `extractors/index.ts`** — remove planning/workspace imports.
5. **Update `sheets-export.service.ts`** — drop calls `extractors.planningSprint`, `extractors.workspace*`.
6. **Update `notification.service.ts`:**
   - Remove function/branch tạo "Sprint Ending Soon"
   - Strip entityType union để chỉ còn `WeeklyReport | Objective | DailyReport | Lead`
7. **Update `server/index.ts`:**
   - Remove imports work-item, sprint routes
   - Remove `app.use('/api/work-items', ...)`, `'/api/sprints'`
   - Giữ nguyên các routes khác
8. **Refactor `key-result.routes.ts`** — GET `/api/key-results?ownerId=xxx&cycleId=yyy` filter
9. **Refactor `daily-report.routes.ts`:**
   - POST body Zod schema: `{userId, reportDate, completedYesterday, doingYesterday, blockers, planToday}`
   - PUT cho phép update 4 text fields
   - Trigger Notification cho Leader khi Review submitted (giữ logic)
10. **Refactor `report.routes.ts`** (rename khái niệm "checkin"):
    - POST body: `{userId, weekEnding, krProgress, lastWeekPriorities, nextWeekTopThree, risks, helpNeeded}`
    - Map vào WeeklyReport columns: `progress=lastWeekPriorities`, `plans=nextWeekTopThree`, `blockers={risks, helpNeeded}`, `krProgress`
    - Trigger Notification approval
11. **Build verify** — `npm run build` đến pass clean
12. **Manual smoke test** — `curl localhost:3000/api/key-results?ownerId=xxx`, daily-report POST, report POST, dashboard-overview GET (verify không vỡ)

## Todo Checklist

- [x] Verify `analytics-dashboard.extractor.ts` task-related hay không
- [x] Verify `sheets-export` không export DailyReport/WeeklyReport
- [x] Delete `work-item.routes.ts`, `sprint.routes.ts`
- [x] Delete `planning.extractor.ts`, `workspace.extractor.ts` (+ analytics-dashboard nếu cần)
- [x] Update `extractors/index.ts`
- [x] Update `sheets-export.service.ts`
- [x] Update `notification.service.ts` (drop Sprint/WorkItem)
- [x] Update `server/index.ts` (unregister 2 routes)
- [x] Refactor `key-result.routes.ts` ownerId filter
- [x] Refactor `daily-report.routes.ts` 4 text fields
- [x] Refactor `report.routes.ts` 5-block Wodtke
- [x] `npm run build` pass clean
- [x] Smoke test 5 endpoint chính
- [x] Verify Notification fire on approval
- [x] **Verify DashboardOverview endpoint không vỡ** (curl 7 endpoint dashboard-*)

## Success Criteria

- ✅ `npm run build` — 0 TypeScript errors
- ✅ Server start clean
- ✅ `GET /api/key-results?ownerId=<userId>` trả KR đúng owner
- ✅ `POST /api/daily-reports` chấp nhận 4 text fields
- ✅ `POST /api/reports` chấp nhận 5-block payload
- ✅ Approve daily/weekly report → Notification row mới
- ✅ Không còn import nào reference `prisma.workItem`, `prisma.sprint`
- ✅ DashboardOverview endpoints (`/api/dashboard-overview`, `dashboard-product`, etc.) trả 200 OK

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| `analytics-dashboard.extractor` ngầm task-related → break sheets-export | Med | Step 1 verify trước, fallback giữ nếu nghi ngờ |
| Route registration mismatch | Med | Update `server/index.ts` cẩn thận |
| Notification service break gây approval flow vỡ | High | Smoke test approve workflow sau update |
| Zod schema mới không match FE payload | Med | P3 sẽ fix, tạm warn console |
| **DashboardOverview break vô tình** | Med | Smoke test 7 dashboard endpoints sau mỗi commit |

## Security Considerations

- `?ownerId=` filter — verify ownerId là chính currentUser hoặc Leader (tránh leak KR ng khác)
- Daily/Weekly approval payload — kiểm tra `approverId` thực sự là Leader (đã có)
- `dashboard-overview` GET là protected route, giữ middleware auth

## Next Steps
→ [Phase 03 — Frontend Pages & Forms](./phase-03-frontend-pages.md)
