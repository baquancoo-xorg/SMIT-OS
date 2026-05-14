# Phase 01 — Schema + Prisma Migration

## Context links
- Parent: [plan.md](plan.md)
- Brainstorm: [brainstorm report](../reports/brainstorm-260514-0951-daily-report-draft-comments.md)
- Schema file: `prisma/schema.prisma` (DailyReport ở lines 145–165)
- Migration script: `npm run db:push` (xem CLAUDE.md)

## Overview
- **Date:** 2026-05-14
- **Priority:** P1 (blocker cho Phase 2)
- **Description:** Thêm model `DailyReportComment` (flat thread, soft delete) + relation ngược trong `DailyReport`. Push migration vào Postgres dev.
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- Flat schema, KHÔNG nested (chốt qua brainstorm). KHÔNG enum `ReportType` (chỉ Daily, YAGNI).
- Cascade delete: xóa DailyReport → xóa comments (đảm bảo orphan-free).
- Soft delete dùng `deletedAt`, không xóa physical → audit trail nguyên vẹn.
- Index `[reportId, createdAt]` để truy vấn thread theo thứ tự nhanh.

## Requirements
- Functional: Schema accept comment record; relation 2 chiều `DailyReport.comments ↔ DailyReportComment.report`.
- Non-functional: Migration không alter `DailyReport` columns → backward compat 100%.

## Architecture

```prisma
model DailyReportComment {
  id         String      @id @default(cuid())
  reportId   String
  authorId   String
  body       String      @db.Text
  editedAt   DateTime?
  deletedAt  DateTime?
  createdAt  DateTime    @default(now())

  report     DailyReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  author     User        @relation(fields: [authorId], references: [id])

  @@index([reportId, createdAt])
}
```

Trong `DailyReport`:
```prisma
comments   DailyReportComment[]
```

Trong `User` (nếu chưa có relation ngược):
```prisma
dailyReportComments DailyReportComment[]
```

## Related code files
- **Edit:** `prisma/schema.prisma` (~+20 LOC)
- **Generate:** `node_modules/.prisma/client/*` (auto)

## Implementation Steps
1. Mở `prisma/schema.prisma`.
2. Thêm model `DailyReportComment` (block YAML như trên).
3. Trong model `DailyReport`, thêm relation `comments DailyReportComment[]`.
4. Trong model `User`, thêm relation `dailyReportComments DailyReportComment[]`.
5. Chạy `npm run db:push` để sync schema vào Postgres dev (container `smit_os_db`).
6. Verify: `npm run db:studio` → confirm bảng `DailyReportComment` tồn tại với các cột đúng.
7. Type-check: `npx tsc --noEmit` để xác nhận Prisma client types đã regenerate.

## Todo list
- [ ] Append `DailyReportComment` model vào schema
- [ ] Add `comments` relation trong `DailyReport`
- [ ] Add `dailyReportComments` relation trong `User`
- [ ] `npm run db:push` → success
- [ ] `npx tsc --noEmit` pass
- [ ] Verify Prisma Studio show new table + relations

## Success Criteria
- Schema compile, Prisma client regenerate không error.
- Postgres dev có bảng `DailyReportComment` với columns + index đúng spec.
- TypeScript autocomplete cho `prisma.dailyReportComment.create(...)` hoạt động.

## Risk Assessment
| Risk | Mức | Mitigation |
|---|---|---|
| Migration fail do DB lock | Thấp | DB dev local, không có traffic |
| Prisma client type drift | Thấp | Restart tsx watch sau db:push để pick up types |

## Security Considerations
- `body` field max 2000 chars sẽ validate ở Zod layer (Phase 2), không enforce ở DB (linh hoạt cho future).
- Cascade delete an toàn vì comment thuộc report — không có cross-tenant risk.

## Next steps
- → Phase 2: Server API routes + notifications
