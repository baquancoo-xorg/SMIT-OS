# Phase 01 — Audit + Data Migration

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Dependencies: none

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P1 |
| Effort | 1 ngày |
| Status | ✅ completed (2026-05-10) |

Audit toàn bộ usage của `Leader` role trong codebase + db schema. Document quyết định "move-up to Admin" hoặc "open to Member" cho mỗi gate. Migrate data User.role từ Leader → Member.

## Key Insights

- 14 files affected (xem plan.md). Mỗi file cần đọc để hiểu quy tắc business hiện tại
- Leader đang được dùng kép: vừa là role label trong DB, vừa là logic check `role.includes('Leader')` (nghĩa là role là string free-text, không enum)
- Trước khi migrate phải biết rõ: bao nhiêu user có Leader role, ai, để communicate

## Requirements

### Functional
- List đầy đủ tất cả file/route/UI có Leader logic
- Quyết định cho từng gate: move-up (Admin) hay open (Member)
- SQL script migrate User.role
- Rollback script trong trường hợp lỗi

### Non-functional
- Audit document save vào `reports/leader-audit-260510-0318.md`
- Backup DB trước khi migrate prod

## Implementation Steps

1. **Audit script**:
   ```bash
   grep -rn "Leader" server/ src/ prisma/ \
     | grep -v "node_modules\|.test\|leader-board\|LeaderBoard" \
     > plans/260510-0318-role-simplification/reports/leader-audit-raw.txt
   ```

2. **Phân loại từng match** thành table:
   ```
   | File | Line | Context | Decision |
   |------|------|---------|----------|
   | server/routes/lead.routes.ts | 45 | manage leads | Admin only |
   | src/pages/WeeklyCheckin.tsx | 32 | submit checkin | Open to Member |
   | ... | ... | ... | ... |
   ```
   Save vào `reports/leader-audit-260510-0318.md`

3. **List affected users** trên prod:
   ```sql
   SELECT id, fullName, email, role FROM "User" WHERE role LIKE '%Leader%';
   ```
   Save vào audit report.

4. **Communicate** với user list ở step 3 (Quân Bá tự xử). Wait for green light.

5. **Backup DB**:
   ```bash
   docker exec smit_os_db pg_dump -U postgres smitos_db > backup-pre-role-simp-$(date +%Y%m%d-%H%M).sql
   ```

6. **Migration script** `prisma/migrations/manual/demote-leader-to-member.sql`:
   ```sql
   BEGIN;

   -- Verify count
   SELECT COUNT(*) FROM "User" WHERE role LIKE '%Leader%';

   -- Update
   UPDATE "User"
   SET role = REGEXP_REPLACE(role, 'Leader', 'Member', 'g')
   WHERE role LIKE '%Leader%';

   -- Verify
   SELECT role, COUNT(*) FROM "User" GROUP BY role;

   -- Manual review then COMMIT or ROLLBACK
   ```

7. **Run migration** trên local trước → verify → run prod.

## Todo List

- [ ] Run audit grep, save raw output
- [ ] Phân loại từng match → decision table
- [ ] List affected users prod
- [ ] Communicate (user task)
- [ ] Backup DB
- [ ] Write migration SQL
- [ ] Run local migration + verify
- [ ] Run prod migration + verify

## Success Criteria

- [ ] Audit doc complete với decision cho mọi Leader gate
- [ ] Backup file saved (>10MB → có data)
- [ ] Sau migration: `SELECT COUNT(*) FROM "User" WHERE role LIKE '%Leader%'` = 0
- [ ] Affected users đã được notify

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Migrate sai user → mất quyền nhầm | 🔴 High | Run local trước, BEGIN/ROLLBACK pattern, có backup |
| Quên 1 file Leader trong audit | 🟡 Medium | Final grep ở Phase 4 |
| Decision sai (open Member nhưng business không cho phép) | 🟡 Medium | Review từng decision với user trước khi code refactor Phase 2 |

## Security Considerations

- Backup file chứa user data → store secure, xóa sau 30 ngày
- Migration log không lưu password/token
- Audit document không expose PII (email full, chỉ ID)

## Next Steps

- Phase 2: Refactor backend dựa trên decision table từ Phase 1
