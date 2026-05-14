# Phase 02 — Server: Comment API + Notifications

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [phase-01-schema-migration.md](phase-01-schema-migration.md) (Prisma client types)
- Reference existing routes: `server/routes/daily-report.routes.ts` (pattern auth + Zod + RBAC)
- Notification helpers: `server/lib/notifications.ts` (reuse `notifyDailyReportApproved` pattern)
- Auth contract: `docs/api-key-authentication.md`

## Overview
- **Date:** 2026-05-14
- **Priority:** P1
- **Description:** Tạo 4 REST endpoints comment CRUD + 2 notification helpers + mount router vào Express.
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- Permission helper `canAccessReportThread(user, report)` = `report.userId === user.id || user.isAdmin`. Centralize để tránh repeat 4 endpoint.
- Soft delete: PATCH `deletedAt=NOW()` thay vì DELETE physical.
- Notification dedupe: trước khi `notifyDailyReportCommentReply`, query distinct `authorId` đã comment, exclude current user, exclude report owner.
- Edit window: không giới hạn (KISS). `editedAt` set mỗi lần PATCH body.

## Requirements
- Functional:
  - GET list comments (exclude soft-deleted? → trả về với flag `deletedAt`, client render placeholder)
  - POST create comment (auto trigger notification)
  - PATCH update body (chỉ author hoặc admin)
  - DELETE soft (chỉ author hoặc admin)
- Non-functional: Response time < 200ms cho list (index `[reportId, createdAt]`).

## Architecture

### File 1: `server/schemas/comment.schema.ts` (~20 LOC)
```ts
import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export const updateCommentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
```

### File 2: `server/routes/daily-report-comment.routes.ts` (~140 LOC)
Router export, mount tại `server/index.ts` → app.use(`/api/daily-reports`, router).

Endpoints:
- `GET /:id/comments` → authenticate + checkAccess(report) → return list with author info
- `POST /:id/comments` → authenticate + checkAccess + Zod validate → create + notify
- `PATCH /:id/comments/:commentId` → authenticate + checkOwnerOrAdmin → update body + editedAt
- `DELETE /:id/comments/:commentId` → authenticate + checkOwnerOrAdmin → set deletedAt

### File 3: `server/lib/notifications.ts` (edit, +40 LOC)
Thêm 2 helpers:
```ts
export async function notifyDailyReportComment(reportOwnerId: string, commenterId: string, reportId: string): Promise<void>
export async function notifyDailyReportCommentReply(thread: { reportId: string; replierId: string; reportOwnerId: string }): Promise<void>
```

- `notifyDailyReportComment`: gọi khi admin comment → notify owner.
- `notifyDailyReportCommentReply`: query distinct authorIds trong thread (exclude `replierId` + `reportOwnerId` nếu trùng) → notify từng người.
- Edit/delete: KHÔNG notify (spam control).

### File 4: `server/index.ts` (edit, +2 LOC)
Mount router mới.

## Related code files
- **New:** `server/routes/daily-report-comment.routes.ts` (~140 LOC)
- **New:** `server/schemas/comment.schema.ts` (~20 LOC)
- **Edit:** `server/lib/notifications.ts` (+~40 LOC, vẫn <200 total)
- **Edit:** `server/index.ts` (+2 LOC mount)

## Implementation Steps
1. Tạo `server/schemas/comment.schema.ts` với 2 Zod schemas.
2. Tạo `server/routes/daily-report-comment.routes.ts`:
   - Import: Router, prisma, requireAuth middleware, schemas.
   - Helper `loadReportOrFail(id)` + `assertAccess(user, report)` + `assertCommentOwnerOrAdmin(user, comment)`.
   - 4 endpoints.
   - Mỗi endpoint try/catch trả 400/403/404/500 theo convention `daily-report.routes.ts`.
3. Edit `server/lib/notifications.ts`:
   - Thêm `notifyDailyReportComment` + `notifyDailyReportCommentReply`.
   - Dùng cùng pattern (`prisma.notification.create({ data: { ... }})`) như `notifyDailyReportApproved`.
4. Edit `server/index.ts`: import router, `app.use('/api/daily-reports', dailyReportCommentRouter)`.
5. Dev server hot-reload sẽ auto pick up. Test bằng curl/Postman.
6. Verify SQL count query: `SELECT COUNT(*) FROM "DailyReportComment" WHERE "reportId" = '...'`.

## Todo list
- [ ] `comment.schema.ts` với createCommentSchema + updateCommentSchema
- [ ] `daily-report-comment.routes.ts` với 4 endpoints + access helpers
- [ ] `notifications.ts` thêm 2 helpers + dedupe logic reply
- [ ] Mount router trong `server/index.ts`
- [ ] Test GET (empty + with data) via curl
- [ ] Test POST → verify notification record tạo trong DB
- [ ] Test PATCH → verify editedAt set
- [ ] Test DELETE → verify deletedAt set, record vẫn còn
- [ ] Test 403: user khác (không phải owner/admin) → reject
- [ ] `npx tsc --noEmit` pass

## Success Criteria
- 4 endpoints hoạt động, status code đúng (200/201/400/403/404).
- Permission: chỉ owner + admin truy cập thread; chỉ author + admin edit/delete.
- Notification record xuất hiện trong DB sau POST.
- Reply dedupe: 1 admin comment 2 lần, owner reply 1 lần → admin nhận 1 notification (không 2).
- File `daily-report-comment.routes.ts` <200 LOC; `notifications.ts` vẫn <200 LOC sau edit.

## Risk Assessment
| Risk | Mức | Mitigation |
|---|---|---|
| Permission bypass | Cao | Test 403 với user role khác trước khi merge |
| Notification spam | Trung bình | Dedupe ở `notifyDailyReportCommentReply`; edit/delete không notify |
| Body XSS (HTML/script injection) | Trung bình | Client escape khi render (Phase 4), DB store raw |
| N+1 query khi list comments | Thấp | `include: { author: true }` 1 lần |

## Security Considerations
- Body store raw, escape khi render (Phase 4 `comment-item.tsx`).
- Zod validate body length 1..2000.
- `requireAuth` middleware bắt buộc cho cả 4 endpoints.
- Soft delete đảm bảo audit; admin xóa comment của user khác phải log (future enhancement).

## Next steps
- → Phase 3: Client lib + React Query hooks
