---
title: "Role Simplification — Member + Admin only"
description: "Bỏ role Leader trong toàn hệ thống, hạ Leader về Member. Đơn giản hóa RBAC còn 2 cấp."
status: completed
priority: P1
effort: 2-3d
branch: main
tags: [refactor, rbac, breaking-change, security]
created: 2026-05-10
completed: 2026-05-10
---

# Plan: Role Simplification

## Goal

Đơn giản hóa RBAC từ 3 cấp (Admin / Leader / Member) xuống **2 cấp (Admin / Member)**. Tất cả user có role Leader hiện tại sẽ được hạ về Member. Cần ship trước plan `260510-0237-acquisition-trackers` để Phase 6 RBAC đơn giản hơn.

## Context

- Yêu cầu user: chỉ giữ 2 role Member + Admin
- Plan dependent: [acquisition-trackers](../260510-0237-acquisition-trackers/plan.md)
- Reference: chuẩn auth/rbac trong [`docs/system-architecture.md`](../../docs/system-architecture.md)

## Phases

| # | Phase | Effort | Status | File |
|---|---|---|---|---|
| 1 | Audit + Migration | 1d | ✅ completed | [phase-01-audit-migration.md](./phase-01-audit-migration.md) |
| 2 | Refactor backend | 1d | ✅ completed | [phase-02-refactor-backend.md](./phase-02-refactor-backend.md) |
| 3 | Refactor frontend | 0.5d | ✅ completed | [phase-03-refactor-frontend.md](./phase-03-refactor-frontend.md) |
| 4 | Test + Doc | 0.5d | ✅ completed | [phase-04-test-doc.md](./phase-04-test-doc.md) |

**Total: 2-3 ngày**.

## Files Affected (14 files từ scout)

```
server/
├─ middleware/rbac.middleware.ts          (refactor)
├─ jobs/alert-scheduler.ts                (Leader filter → admin or specific user list)
├─ services/notification.service.ts       (recipient logic)
└─ routes/
   ├─ lead.routes.ts                      (gate Leader → Admin)
   ├─ objective.routes.ts
   ├─ daily-report.routes.ts
   └─ report.routes.ts

src/
├─ types/index.ts                         (Role enum/type)
├─ components/
│  ├─ settings/user-management-tab.tsx    (UI dropdown bỏ Leader option)
│  └─ modals/WeeklyCheckinModal.tsx       (visibility logic)
└─ pages/
   ├─ WeeklyCheckin.tsx                   (Leader-gated UI)
   ├─ DailySync.tsx
   └─ LeadTracker.tsx                     (line 18: canManageLeads logic)

prisma/schema.prisma                      (User model)
```

## Permission Matrix (RESOLVED 2026-05-10)

**Pattern chung:** **read-shared, write-own** — Member view tất cả nhưng chỉ sửa của mình/được assign.

| Trang | Member view | Member CRUD | Admin only |
|---|---|---|---|
| **Dashboard** (`/dashboard`) | ✅ Tất cả tabs | ❌ (read-only) | — |
| **OKRs** (`/okrs`) | ✅ Tất cả objectives + KR | ✅ **Sửa KR của mình** (filter by `KR.userId`/`assigneeId`) | Tạo/xóa Objective L1, link parent, sửa KR người khác |
| **Daily Sync** (`/daily-sync`) | ✅ Tất cả team daily | ✅ CRUD daily của mình | Xóa daily người khác |
| **Weekly Checkin** (`/checkin`) | ✅ Tất cả checkin | ✅ CRUD checkin của mình | Approve/reject, xóa người khác |
| **Lead Tracker** (`/lead-tracker`) | ✅ **Tất cả leads** | ✅ **Sửa/log activity lead được assign** (filter by `Lead.assignedToId`) | Sync CRM, assign AE, sửa lead người khác |
| **Settings** (`/settings`) | ✅ Profile mình | ✅ Edit basic profile | User mgmt, RBAC, integration tokens, system config |
| **Profile** (`/profile`) | ✅ Own | ✅ Own | — |
| **Media Tracker** (mới, Phase 4) | ✅ Posts/KOL/PR all | ✅ **Tự nhập KOL/PR** (created by mình → sửa được) | Config sync token, sửa của người khác |
| **Ads Tracker** (mới, Phase 3) | ✅ Campaigns + attribution | ❌ (data từ Meta API, không CRUD) | Config Meta token, trigger sync |
| **Dashboard Marketing/Media tabs** (Phase 5) | ✅ View | ❌ | — |

### Implementation note (cho Phase 2 refactor)

Pattern enforcement:
- **List endpoint** (GET): trả về tất cả → KHÔNG filter by user (read-shared)
- **Mutation endpoint** (PUT/PATCH/DELETE):
  - Verify ownership: `resource.userId === req.user.id` HOẶC `resource.assignedToId === req.user.id`
  - Nếu không match VÀ không phải `isAdmin` → 403
  - Reuse `server/middleware/ownership.middleware.ts` (đã có) hoặc extend
- **UI gate**: ẩn/disable edit button khi `resource.userId !== currentUser.id` (cho Member non-owner). Error 403 fallback nếu user bypass UI.

### Specific filters

| Resource | Ownership field | Note |
|---|---|---|
| `KeyResult` | `userId` (hoặc `assigneeId`) | Member sửa được KR của mình; Objective L1 chỉ Admin tạo/xóa |
| `Lead` | `assignedToId` (hoặc `aeId`) | Member sửa lead assign cho mình |
| `MediaPost` (KOL/PR) | `createdById` (thêm field nếu chưa có ở Phase 2 acquisition schema) | Member sửa bản ghi do mình tạo |
| `DailyReport` | `userId` | Đã có |
| `WeeklyReport` | `userId` | Đã có |

## Migration Strategy

**Data migration (Phase 1):**

```sql
-- Backup first
SELECT * FROM "User" WHERE role LIKE '%Leader%';

-- Demote all Leader → Member
UPDATE "User" SET role = 'Member' WHERE role LIKE '%Leader%';

-- Verify
SELECT role, COUNT(*) FROM "User" GROUP BY role;
```

Run via Prisma migration script + manual verify trên prod.

**Code migration:**

- Tất cả `role.includes('Leader')` checks → đổi thành `isAdmin` check (nếu cần quyền cao) hoặc bỏ check (nếu Member đủ)
- Mỗi file phải review case-by-case: Leader đang gate cái gì → quyết định move lên Admin hay xuống Member

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Tính năng Leader đang gate bị mất hoặc mở quá rộng | 🔴 High | Audit kỹ Phase 1, review từng file Leader-gate, document quyết định move-up vs open |
| Migration data lỗi | 🟡 Medium | Backup DB trước, run script local trước, có rollback SQL |
| User Leader phản ứng vì mất quyền | 🟡 Medium | Communicate trước khi ship, list users affected |
| Quên file → Leader vẫn còn | 🟡 Medium | Final grep `Leader` trên codebase sau Phase 3 |
| Break Acquisition plan đang dependency | 🟢 Low | Plan này ship trước, Acquisition Phase 6 dùng Admin/Member chuẩn mới |

## Success Metrics

- [ ] `grep -r "Leader" server/ src/ prisma/` = 0 kết quả nghiệp vụ (chỉ còn comment hoặc unrelated)
- [ ] Tất cả user có role hợp lệ (Admin hoặc Member)
- [ ] 4 routes Leader-gated cũ đã chuyển sang Admin-gated hoặc Member-accessible đúng business logic
- [ ] User management UI chỉ còn 2 option role
- [ ] Test 2 personas (Admin, Member) — đầy đủ chức năng

## Unresolved Questions

1. ✅ ~~3 quyết định Permission Matrix~~ — RESOLVED (xem matrix)
2. Có cần thông báo cho Leader hiện tại trước khi demote không? Bao giờ?
3. Có cần audit log cho action demote này không (tracking)?
4. UI Style Guide reference: refactor frontend Phase 3 có cần re-style các page bị drift (Lead Tracker `text-[9px]` v.v.) hay defer sang plan refactor UI riêng?
5. **Schema verify cần thiết** trước Phase 2:
   - `KeyResult` có cột `userId` / `assigneeId` chưa? Nếu chưa → cần migration thêm
   - `Lead` đã có `assignedToId` / `aeId` (verify với existing code)
   - `MediaPost` (Phase 2 acquisition) cần thêm `createdById` field
