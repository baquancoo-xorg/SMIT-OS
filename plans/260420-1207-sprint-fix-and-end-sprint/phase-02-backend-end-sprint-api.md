---
phase: 02
status: pending
priority: high
---

# Phase 02 - Backend End Sprint API

## Context
- File: `server/routes/sprint.routes.ts`
- Thêm 2 endpoints mới vào router hiện có

## Endpoints

### 1. `GET /api/sprints/:id/incomplete`
Trả về danh sách work items chưa Done của sprint + thông tin next sprint.

```ts
router.get('/:id/incomplete', handleAsync(async (req: any, res: any) => {
  const { id } = req.params;

  const incompleteItems = await prisma.workItem.findMany({
    where: {
      sprintId: id,
      status: { not: 'Done' }
    },
    include: { assignee: { select: { id: true, fullName: true, avatar: true } } }
  });

  // Tìm sprint tiếp theo (startDate > endDate của sprint hiện tại)
  const currentSprint = await prisma.sprint.findUnique({ where: { id } });
  const nextSprint = currentSprint
    ? await prisma.sprint.findFirst({
        where: { startDate: { gt: currentSprint.endDate } },
        orderBy: { startDate: 'asc' }
      })
    : null;

  res.json({ incompleteItems, nextSprint });
}));
```

### 2. `POST /api/sprints/:id/complete`
Kết thúc sprint: di chuyển incomplete items + cập nhật endDate.

```ts
router.post('/:id/complete', RBAC.adminOnly, handleAsync(async (req: any, res: any) => {
  const { id } = req.params;

  const currentSprint = await prisma.sprint.findUnique({ where: { id } });
  if (!currentSprint) return res.status(404).json({ error: 'Sprint not found' });

  // Tìm sprint tiếp theo
  const nextSprint = await prisma.sprint.findFirst({
    where: { startDate: { gt: currentSprint.endDate } },
    orderBy: { startDate: 'asc' }
  });

  // Di chuyển incomplete items
  const updated = await prisma.workItem.updateMany({
    where: { sprintId: id, status: { not: 'Done' } },
    data: { sprintId: nextSprint?.id ?? null }  // null = unassigned nếu không có next sprint
  });

  // Cập nhật endDate về hôm qua UTC (để active query không match sprint này nữa)
  const yesterday = new Date();
  yesterday.setUTCHours(0, 0, 0, 0);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  await prisma.sprint.update({
    where: { id },
    data: { endDate: yesterday }
  });

  res.json({
    movedCount: updated.count,
    movedTo: nextSprint ? nextSprint.name : null
  });
}));
```

## Lưu ý quan trọng
- Đặt `GET /:id/incomplete` và `POST /:id/complete` **TRƯỚC** `GET /:id` và các routes `/:id` khác để tránh conflict route matching
- `RBAC.adminOnly` middleware cho POST endpoint
- Không cần DB migration — chỉ update `endDate` để "đóng" sprint

## Steps
- [ ] Thêm `GET /:id/incomplete` vào sprint.routes.ts (trước route `/:id` hiện có)
- [ ] Thêm `POST /:id/complete` vào sprint.routes.ts
- [ ] Test cả 2 endpoints

## Success Criteria
- `GET /api/sprints/:id/incomplete` trả đúng danh sách items chưa Done
- `POST /api/sprints/:id/complete` di chuyển items và update endDate
- Active sprint query không còn trả về sprint đã complete
