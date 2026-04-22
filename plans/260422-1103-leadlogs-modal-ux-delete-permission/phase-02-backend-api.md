# Phase 02 — Backend API

## Overview
- Priority: High
- Status: pending
- Depends on: phase-01 (schema migration)

## Changes trong `server/routes/lead.routes.ts`

### 1. Helper xác định quyền xoá

Thêm helper function (trước `createLeadRoutes`):

```typescript
function canDelete(user: Express.Request['user']): boolean {
  if (!user) return false;
  if (user.isAdmin || user.role === 'Admin') return true;
  if (user.role === 'Leader' && user.departments?.includes('Sale')) return true;
  return false;
}
```

### 2. Cập nhật `DELETE /:id`

Thay route hiện tại (không có auth check) bằng:

```typescript
router.delete('/:id', handleAsync(async (req: any, res: any) => {
  const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });

  if (!canDelete(req.user)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  await prisma.lead.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));
```

### 3. Thêm `POST /:id/delete-request` (Member gửi yêu cầu)

```typescript
router.post('/:id/delete-request', handleAsync(async (req: any, res: any) => {
  const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.deleteRequestedBy) {
    return res.status(409).json({ error: 'Delete request already pending' });
  }

  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: {
      deleteRequestedBy: req.user.userId,
      deleteRequestedAt: new Date(),
    },
  });
  res.json(lead);
}));
```

### 4. Thêm `DELETE /:id/delete-request` (Member hủy yêu cầu)

```typescript
router.delete('/:id/delete-request', handleAsync(async (req: any, res: any) => {
  const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.deleteRequestedBy !== req.user.userId) {
    return res.status(403).json({ error: 'Not your request' });
  }

  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: { deleteRequestedBy: null, deleteRequestedAt: null },
  });
  res.json(lead);
}));
```

### 5. Thêm `POST /:id/delete-request/approve` (Admin/Leader duyệt xoá)

```typescript
router.post('/:id/delete-request/approve', handleAsync(async (req: any, res: any) => {
  if (!canDelete(req.user)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });

  await prisma.lead.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));
```

### 6. Thêm `POST /:id/delete-request/reject` (Admin/Leader từ chối)

```typescript
router.post('/:id/delete-request/reject', handleAsync(async (req: any, res: any) => {
  if (!canDelete(req.user)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: { deleteRequestedBy: null, deleteRequestedAt: null },
  });
  res.json(lead);
}));
```

## Thứ tự khai báo routes (QUAN TRỌNG)

Routes tĩnh phải khai báo TRƯỚC `/:id`. Thứ tự trong `createLeadRoutes`:

```
GET  /ae-list
GET  /daily-stats
GET  /:id/audit
POST /:id/delete-request           ← thêm mới (trước /:id delete)
DELETE /:id/delete-request         ← thêm mới
POST /:id/delete-request/approve   ← thêm mới
POST /:id/delete-request/reject    ← thêm mới
GET  /
POST /
PUT  /:id
DELETE /:id                        ← cập nhật auth check
```

## Todo

- [ ] Thêm `canDelete` helper
- [ ] Cập nhật `DELETE /:id` với auth check
- [ ] Thêm `POST /:id/delete-request`
- [ ] Thêm `DELETE /:id/delete-request`
- [ ] Thêm `POST /:id/delete-request/approve`
- [ ] Thêm `POST /:id/delete-request/reject`
- [ ] Kiểm tra thứ tự route declarations
- [ ] Compile check: `npx tsc --noEmit`

## Success Criteria

- Admin/Leader: DELETE /api/leads/:id trả về 204
- Member: DELETE /api/leads/:id trả về 403
- Member: POST /api/leads/:id/delete-request trả về lead updated
- Admin/Leader: POST approve → 204, POST reject → lead cleared
- Duplicate request: 409
