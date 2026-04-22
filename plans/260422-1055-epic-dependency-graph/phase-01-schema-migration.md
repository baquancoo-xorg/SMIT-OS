# Phase 01 — Schema & Migration

**Status:** completed  
**Priority:** Critical (blocks all other phases)

## Overview

Thêm model `WorkItemDependency` vào Prisma schema và cập nhật relations trên `WorkItem`. Chạy migration.

## Related Files

- Modify: `prisma/schema.prisma`
- Run: `npm run db:push`

## Implementation Steps

### 1. Cập nhật `WorkItem` model — thêm relations

Trong `prisma/schema.prisma`, sau field `krLinks WorkItemKrLink[]`, thêm:

```prisma
  // Lateral epic dependency links (related)
  dependenciesFrom WorkItemDependency[] @relation("DepFrom")
  dependenciesTo   WorkItemDependency[] @relation("DepTo")
```

### 2. Thêm model `WorkItemDependency`

Sau model `WorkItemKrLink`, thêm:

```prisma
model WorkItemDependency {
  id        String   @id @default(uuid())
  fromId    String
  from      WorkItem @relation("DepFrom", fields: [fromId], references: [id], onDelete: Cascade)
  toId      String
  to        WorkItem @relation("DepTo", fields: [toId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([fromId, toId])
}
```

### 3. Chạy migration

```bash
npm run db:push
```

## Todo

- [x] Thêm relations vào `WorkItem` model
- [x] Thêm `WorkItemDependency` model
- [x] Chạy `npm run db:push` — verify không có lỗi

## Success Criteria

- `prisma db push` thành công, không có data loss
- Bảng `WorkItemDependency` tồn tại trong DB
- `@@unique([fromId, toId])` được tạo đúng

## Risk

- Nếu DB có data không hợp lệ → `db:push` sẽ cảnh báo, không phá data cũ
