# Phase 02 — Refactor Backend

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Decision table: `reports/leader-audit-260510-0318.md` (output Phase 1)
- Dependencies: Phase 1 done

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P1 |
| Effort | 1 ngày |
| Status | ✅ completed (2026-05-10) |

Refactor 7 backend files để bỏ Leader logic. Mỗi gate được xử lý theo decision table Phase 1: chuyển sang Admin-only hoặc mở cho Member.

## Files to refactor

Theo Permission Matrix đã RESOLVED (xem `plan.md`):

| File | Hiện tại | Action sau refactor |
|---|---|---|
| `server/middleware/rbac.middleware.ts` | Có Leader role check | Bỏ Leader, refactor permission map còn 2 cấp Admin/Member |
| `server/jobs/alert-scheduler.ts` | Filter Leader để gửi alert | Đổi recipient query: Admin recipients hoặc dựa trên department |
| `server/services/notification.service.ts` | Logic recipient theo Leader | Tương tự alert-scheduler |
| `server/routes/lead.routes.ts` | Gate Leader cho manage actions | **List = open all Member**; **Mutation = ownership check (`Lead.assignedToId === req.user.id` OR isAdmin)** |
| `server/routes/objective.routes.ts` | Leader edit OKR | **List = open all Member**; **KR mutation = ownership (`KR.userId === req.user.id` OR isAdmin)**; Objective L1 create/delete/link = Admin only |
| `server/routes/daily-report.routes.ts` | Leader xem report team | **List = open all Member**; **Mutation own only** (đã có pattern) |
| `server/routes/report.routes.ts` | Tương tự | **List = open all Member**; **Mutation own only** |

## Ownership Pattern (CORE của refactor này)

```ts
// BEFORE
if (req.user.role.includes('Leader') || req.user.isAdmin) {
  return next();
}
return res.status(403).json({ error: 'Forbidden' });

// AFTER (read endpoint - GET list/detail)
// Open cho mọi Member, không cần ownership check
return next();

// AFTER (write endpoint - POST/PUT/PATCH/DELETE)
const resource = await prisma.lead.findUnique({ where: { id } });
if (!resource) return res.status(404).json({ error: 'Not found' });

const isOwner = resource.assignedToId === req.user.id;
if (!req.user.isAdmin && !isOwner) {
  return res.status(403).json({ error: 'Forbidden — chỉ owner hoặc admin có quyền sửa' });
}
return next();
```

Reuse `server/middleware/ownership.middleware.ts` nếu phù hợp; nếu không có generic helper → tạo helper trong middleware:

```ts
export function requireOwnership(getOwnerIdFn: (req) => Promise<string | null>) {
  return async (req, res, next) => {
    if (req.user.isAdmin) return next();
    const ownerId = await getOwnerIdFn(req);
    if (ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

## Implementation Steps

1. **Schema verify** (CRITICAL trước khi code):
   - Check `KeyResult` model có field `userId` / `assigneeId` chưa
   - Check `Lead` model có `assignedToId` / `aeId` chưa
   - Nếu thiếu → thêm migration NHỎ (không thuộc scope plan này, raise issue trước)

2. **Refactor `rbac.middleware.ts`**:
   - Bỏ Leader permission keys
   - Update permission map: `permissions[key] = ['admin']` hoặc `['admin', 'member']`
   - Export type `Role = 'admin' | 'member'`
   - Thêm helper `requireOwnership(getOwnerIdFn)` cho write endpoint pattern

3. **Refactor 6 file routes/services**:
   - Mở từng file, tìm `Leader` (grep)
   - Apply pattern:
     - **GET endpoints** (list/detail): **mở cho mọi Member** (bỏ Leader check)
     - **Write endpoints**: **ownership check** (xem snippet trên)
   - Special cases:
     - `objective.routes.ts`: KR write = ownership; Objective L1 create/delete/link = Admin only
     - `lead.routes.ts`: lead detail edit = ownership (`assignedToId`); CRM sync + AE assign = Admin only
     - `notification.service.ts` + `alert-scheduler.ts`: recipient query = filter by Admin role hoặc department

4. **Compile check**:
   ```bash
   npx tsc --noEmit
   ```

5. **Run dev server** + smoke test với 2 user (Admin + Member non-owner):
   ```bash
   npm run dev
   ```

6. **Commit từng route riêng** (atomic):
   - `refactor(auth): drop Leader gate on lead routes (open list, ownership write)`
   - `refactor(auth): drop Leader gate on objective routes (KR ownership)`
   - etc.

## Todo List

- [ ] Schema verify ownership fields (`KR.userId`, `Lead.assignedToId`) — raise issue nếu thiếu
- [ ] Refactor `rbac.middleware.ts` + thêm `requireOwnership` helper
- [ ] Refactor `alert-scheduler.ts` (recipient = Admin)
- [ ] Refactor `notification.service.ts` (recipient = Admin/department)
- [ ] Refactor `lead.routes.ts` (list open, write ownership `assignedToId`, sync/assign Admin only)
- [ ] Refactor `objective.routes.ts` (KR ownership `userId`, Objective L1 Admin only)
- [ ] Refactor `daily-report.routes.ts` (list open, write own)
- [ ] Refactor `report.routes.ts` (list open, write own)
- [ ] `tsc --noEmit` clean
- [ ] Server starts without error
- [ ] Smoke test 2 user: Admin (full access), Member non-owner (403 on write resource khác)
- [ ] 7 commits riêng từng file/concern

## Success Criteria

- [ ] `grep -rn "Leader" server/` = 0 nghiệp vụ
- [ ] TypeScript compile clean
- [ ] Dev server start success
- [ ] API smoke test với token Admin/Member work

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Quên 1 logic Leader-gate → break flow | 🟡 Medium | Compile check + grep cuối cùng + Phase 4 e2e test |
| Mở quá rộng cho Member (security) | 🟡 Medium | Reference decision table, prefer move-up Admin nếu phân vân |
| Recipient logic alert/notification sai sau refactor | 🟡 Medium | Test gửi alert manual ở Phase 4 |

## Security Considerations

- Nếu phân vân move-up vs open → CHỌN move-up (deny-by-default)
- KHÔNG remove auth middleware, chỉ bỏ Leader-specific checks
- Audit log cho config changes giữ nguyên

## Next Steps

- Phase 3: Refactor frontend
