# Leader Audit + Decision Table

**Date:** 2026-05-10
**Plan:** [260510-0318-role-simplification](../plan.md)

## Affected Users (3)

| ID | Full Name | Username | Current Role | Action |
|---|---|---|---|---|
| `1f1feab9-...` | Hà Canh | Canhha.Pm02 | Leader | → Member |
| `c2866949-...` | Thành Long | longdt3105 | Leader | → Member |
| `de1c1cbe-...` | Thái Phong | thaiphong | Leader | → Member |

## Role distribution (before)

| Role | Count |
|---|---|
| Admin | 2 |
| Member | 12 |
| Leader | 3 |

## Decision Table

### Backend (7 files)

| File | Line(s) | Context | Decision |
|---|---|---|---|
| `server/middleware/rbac.middleware.ts` | 3, 32, 53 | Type `Role` includes Leader; user role detection; `leaderOrAdmin` preset | Type → `'Admin' \| 'Member'`. Drop `leaderOrAdmin` preset. Callers that used it move to `adminOnly` (matrix: write actions on shared resources are admin) |
| `server/jobs/alert-scheduler.ts` | 67, 98 | `findLeadersAndAdminsFor(member)` for daily/weekly late escalation | **Move-up to Admin**: recipients = self + admins (Leader collapsed; admins handle escalation) |
| `server/services/notification.service.ts` | 27, 35, 50 | `findLeadersAndAdminsFor` queries `role.contains('Leader')` + dept overlap | Rename to `findAdminRecipientsFor`. Query only `isAdmin: true`. Drop dept filter (admins are global). Keep `excludeSelf` opt |
| `server/routes/lead.routes.ts` | 157-162 | delete-request: AE of lead OR Leader/Admin | **Move-up to Admin** (matrix: lead mutation = ownership OR admin). AE keeps right (already ownership-like). Leader path drops |
| `server/routes/objective.routes.ts` | 18, 23, 28, 33-34 | POST/PUT/DELETE/recalculate use `leaderOrAdmin` | **Move-up to Admin** (matrix: Objective L1 create/delete/link = admin). Recalculate = admin (system-wide effect) |
| `server/routes/daily-report.routes.ts` | 24-30, 78, 117-123, 142, 155-160 | Leader sees same-dept; Leader edits same-dept; Leader approves same-dept | **List = open all** (drop Leader-dept filter). **Edit = own + admin** (drop Leader override). **Approve = admin only**. Notify on submit = admins |
| `server/routes/report.routes.ts` | 76-87, 102, 115-121 | Same as daily-report | Same refactor: read-shared, write-own, approve = admin |

### Frontend (6 files)

| File | Line(s) | Context | Decision |
|---|---|---|---|
| `src/types/index.ts` | 9 | Comment `// Admin, Leader, Member` | Update comment to `// Admin, Member` |
| `src/components/settings/user-management-tab.tsx` | 12-21 | Dropdown 3 options + Leader badge color | Drop Leader from `ROLE_OPTIONS`. Drop Leader from `ROLE_BADGE_VARIANT` |
| `src/components/modals/WeeklyCheckinModal.tsx` | 154 | Text "Liên hệ Leader/Admin" | Update to "Liên hệ Admin" |
| `src/pages/WeeklyCheckin.tsx` | 47, 114 | `isLeaderOrAdmin` gate for approve | Rename `isAdmin`. `onApprove` only when `isAdmin` (matches backend approve = admin only) |
| `src/pages/DailySync.tsx` | 75, 295 | Same pattern | Same: rename `isAdmin`, gate approve to admin |
| `src/pages/LeadTracker.tsx` | 18, 82 | `canManageLeads = isAdmin \|\| Leader` for sync UI | `canManageLeads = isAdmin` (sync CRM = admin only per matrix) |

### Schema

| File | Line | Decision |
|---|---|---|
| `prisma/schema.prisma` | 19 | Comment `// Admin, Leader, Member` → `// Admin, Member` |

## Migration SQL

See `migrations/manual/demote-leader-to-member.sql`.

```sql
BEGIN;

-- Verify count before
SELECT COUNT(*) FROM "User" WHERE role LIKE '%Leader%';

-- Demote
UPDATE "User"
SET role = 'Member'
WHERE role LIKE '%Leader%';

-- Verify count after = 0
SELECT role, COUNT(*) FROM "User" GROUP BY role;

COMMIT;
```

Rollback (chỉ trong session DB chưa COMMIT):

```sql
ROLLBACK;
```

Hoặc restore từ backup `backups/backup-pre-role-simp-20260510-1422.sql` (9.4MB).

## Risk Notes

- 3 users sẽ mất quyền approve daily/weekly report của team họ. Sau migration, chỉ Admin (2 user) còn approve được.
- Bỏ logic Leader-dept-overlap trong escalation alerts → admins nhận tất cả late notifications của tất cả Members.
- Sale dept Member sẽ vẫn write lead được (logic `canWriteLead` check `departments.includes('Sale')`, không phụ thuộc Leader). 3 Leader cũ trong Sale dept (nếu có) vẫn write được khi demote về Member nhờ dept check.
