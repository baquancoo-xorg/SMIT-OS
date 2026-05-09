# Phase 01 — DB Migration & Schema

## Context Links
- **Parent plan:** [plan.md](./plan.md)
- **Brainstorm:** `plans/reports/brainstorm-260509-2355-smit-os-slim-down.md` mục 3.3, 4.2, 5.2, 7
- **Schema:** `prisma/schema.prisma`

## Overview
- **Date:** 2026-05-09 | **Revised:** 2026-05-10
- **Priority:** P1 (BLOCKING)
- **Status:** completed
- **Review status:** completed
- **Effort:** 2h
- **Description:** Truncate data cũ, drop 4 models task management (KHÔNG drop FB Ads — DashboardOverview giữ), ALTER `KeyResult`/`DailyReport`/`WeeklyReport`. Tạo migration mới.

## Key Insights
- **Clean slate** đã được user chốt → không cần data migration script
- **FK cascade order quan trọng**: WorkItem có FK đến KeyResult (qua WorkItemKrLink), Sprint, User → phải truncate junction tables trước
- **WeeklyReport.sprintId không có** (đã check schema): Sprint chỉ ràng buộc với WorkItem qua FK. Nhưng WeeklyReport.weekEnding tính theo Sprint trong helper `getSprintWeek` → drop helper khi xoá Sprint
- **DailyReport unique constraint** `[userId, reportDate]` giữ nguyên
- **Prisma cascade**: KeyResult→Objective Cascade (đã có), thêm KR→User (ownerId nullable, NoAction safe)

## Requirements

### Functional
- Drop hết row của 8 models legacy + 4 report tables → seed lại sau
- Schema mới: `KeyResult` thêm `ownerId`, `DailyReport` 4 text fields, `WeeklyReport` redesign cho check-in
- Migration tự áp dụng được trên DB rỗng (Docker `smit_os_db`)

### Non-functional
- Migration revertible (giữ migration files cũ; nếu cần down → manual)
- Không phá Lead, OkrCycle, Notification, GoogleIntegration, SheetsExportRun, LeadSyncRun, LeadStatusMapping, User
- Build pass `npm run build` sau khi `prisma generate`

## Architecture

### Schema Diff (high-level)

```
DROP MODELS:
  - WorkItem
  - WorkItemKrLink
  - WorkItemDependency
  - Sprint

KEEP MODELS (DashboardOverview consume):
  - FbAdAccountConfig
  - RawAdsFacebook
  - ExchangeRateSetting
  - EtlErrorLog

MODIFY MODELS:
  KeyResult:
    + ownerId       String?
    + owner         User?    @relation("OwnedKRs", fields: [ownerId], references: [id])
    - workItemLinks WorkItemKrLink[]   (auto via DROP table)

  DailyReport:
    + completedYesterday  String   @default("")
    + doingYesterday      String   @default("")
    + planToday           String   @default("")
    KEEP blockers, status, approvedBy, approvedAt, userId, reportDate, rawData, createdAt, updatedAt
    - tasksData    String
    - teamMetrics  Json?
    - teamType     String?
    - impactLevel  String?
    - adHocTasks   String?

  WeeklyReport:
    + krProgress  String   (re-purpose: JSON [{krId, currentValue, confidence0to10, note}])
    + progress    String   (re-purpose: JSON {priorities: [{text, done}]})
    + plans       String   (re-purpose: JSON {topThree: string[]})
    + blockers    String   (re-purpose: JSON {risks: string, helpNeeded: string})
    KEEP id, userId, weekEnding, status, approvedBy, approvedAt, rawData, createdAt
    - score          Int
    - confidenceScore Int
    - adHocTasks    String?

  User:
    + ownedKRs  KeyResult[] @relation("OwnedKRs")
```

### Truncate Order (raw SQL)

```sql
-- Run BEFORE prisma migrate. CHỈ truncate task-management + report tables.
-- KHÔNG truncate FB Ads tables (DashboardOverview cần data).
TRUNCATE TABLE "WorkItemDependency" CASCADE;
TRUNCATE TABLE "WorkItemKrLink" CASCADE;
TRUNCATE TABLE "WorkItem" CASCADE;
TRUNCATE TABLE "DailyReport" CASCADE;
TRUNCATE TABLE "WeeklyReport" CASCADE;
TRUNCATE TABLE "Sprint" CASCADE;
```

## Related Code Files

### Modify
- `prisma/schema.prisma` — toàn bộ thay đổi schema

### Create
- `prisma/migrations/{timestamp}_slim_down_drop_task_management/migration.sql` — migration tự động sinh
- `prisma/seeds/truncate-legacy.sql` (optional helper)

### Delete
- Migration cũ: KHÔNG xoá để giữ history (Prisma migrate require continuity)

## Implementation Steps

1. **Backup hiện tại** — `pg_dump smitos_db > /tmp/smitos-backup-260509.sql` (an toàn dù user đã đồng ý drop)
2. **Stop daemon** — `npm run daemon:stop` để tránh hot-reload conflict
3. **Truncate data legacy** — chạy SQL trên via `psql`:
   ```bash
   psql postgresql://postgres:password@localhost:5435/smitos_db -f prisma/seeds/truncate-legacy.sql
   ```
4. **Edit `prisma/schema.prisma`:**
   - Drop 8 models (giữ block `Notification`, `User`, etc.)
   - ADD `ownerId String?` + `owner User?` vào `KeyResult`
   - ADD `ownedKRs KeyResult[] @relation("OwnedKRs")` vào `User`
   - ADD 3 fields text vào `DailyReport`, drop 5 fields cũ
   - Drop 3 fields obsolete trong `WeeklyReport`
   - Refactor field comment cho `progress/plans/blockers/krProgress` (semantic mới)
5. **Generate migration** — `npx prisma migrate dev --name slim_down_drop_task_management --create-only` (review SQL trước apply)
6. **Apply migration** — `npx prisma migrate dev` → `npx prisma generate`
7. **Verify** — `npx prisma validate` + smoke test query qua `npx prisma studio`
8. **Commit migration** — git add `prisma/schema.prisma` + `prisma/migrations/...`
9. **Restart daemon** — `npm run daemon:restart`

## Todo Checklist

- [x] Backup DB
- [x] Stop daemon
- [x] Tạo `prisma/seeds/truncate-legacy.sql` với CASCADE order
- [x] Truncate qua psql, verify rowcount = 0
- [x] Edit `prisma/schema.prisma` (drop 8 models)
- [x] Edit `prisma/schema.prisma` (alter KeyResult, DailyReport, WeeklyReport, User)
- [x] `npx prisma migrate dev --create-only --name slim_down_drop_task_management`
- [x] Review generated SQL, đảm bảo DROP ORDER đúng
- [x] `npx prisma migrate dev` apply
- [x] `npx prisma generate`
- [x] `npx prisma validate`
- [x] Smoke test SELECT trên KeyResult, DailyReport, WeeklyReport
- [x] Commit migration files
- [x] Restart daemon

## Success Criteria

- ✅ `npx prisma validate` returns OK
- ✅ Migration apply không lỗi
- ✅ `prisma client` regenerate, `npm run build` (TypeScript) compile fail-fast tại các điểm dùng `prisma.workItem.*` (expected → P2 fix)
- ✅ Tables WorkItem, Sprint, WorkItemKrLink, WorkItemDependency không tồn tại trong DB
- ✅ Tables FbAdAccountConfig, RawAdsFacebook, ExchangeRateSetting, EtlErrorLog **vẫn tồn tại với data nguyên vẹn**
- ✅ Tables KeyResult có column `ownerId`, DailyReport có 4 text fields, WeeklyReport không có `score/confidenceScore/adHocTasks`

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| FK constraint violation khi truncate sai order | High | Dùng CASCADE + thứ tự dưới-lên trong file SQL |
| `prisma migrate` từ chối drop column có data | High | Truncate trước migration (đã step 3) |
| Mất data Lead khi truncate nhầm | Critical | KHÔNG truncate Lead, LeadAuditLog, OkrCycle. SQL file chỉ liệt kê 10 bảng cụ thể |
| Daemon đang chạy → `prisma client` mismatch | Med | Stop daemon step 2 |
| Migration history bị rotted | Low | `--create-only` review trước apply |

## Security Considerations

- Backup `pg_dump` chứa email + password hash (User table) → lưu `/tmp` permission 0600, xoá sau khi P5 done
- Không expose connection string mới qua git
- Truncate là irreversible bên ngoài backup → confirm với user lần cuối trước step 3 (đã confirm trong brainstorm)

## Next Steps
→ [Phase 02 — Backend Routes & Services](./phase-02-backend-routes.md)
