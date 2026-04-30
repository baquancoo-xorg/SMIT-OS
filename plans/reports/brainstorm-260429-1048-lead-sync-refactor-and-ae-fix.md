# Brainstorm — Lead Sync Refactor & AE Unmapped Fix

**Ngày:** 2026-04-29 10:48
**Trang ảnh hưởng:** Lead Tracker → tab Lead Logs
**Files chính:**
- `server/services/lead-sync/crm-lead-sync.service.ts`
- `server/services/lead-sync/employee-mapper.ts`
- `server/services/lead-sync/derive-resolved-date.ts`
- `server/services/lead-sync/constants.ts`
- `server/routes/lead.routes.ts`
- `src/components/lead-tracker/lead-logs-tab.tsx`
- `src/components/lead-tracker/lead-log-dialog.tsx`

---

## 1. Problem Statement

### 1.1 Yêu cầu thay đổi nguồn dữ liệu các cột Lead Logs
- **Notes**: hiện local-only → đổi thành sync từ CRM `crm_activities (action='add_note')`
- **Resolved**: hiện CRM-derived → đổi thành local-only (Sale nhập tay)
- **SLA**: phân loại lại sang nhóm Auto-computed (UI logic giữ nguyên)

### 1.2 Bug AE = "Unmapped"
- Lead Logs hiển thị `AE = 'Unmapped'` cho hầu hết lead
- **Evidence từ DB query:**
  - CRM có 333 subscriber active từ 2026-04-01, thuộc 4 AE: Phương Linh (142), Kim Huệ (103), Hồng Nhung (82), Duy Linh (6)
  - SMIT-OS `User` chỉ có **2/17** user có `crmEmployeeId != null`
  - Tên AE thật trong CRM nằm ở `smit_employee.lark_info->>'name'` (JSONB)
- **Root cause:** Sync logic phụ thuộc SMIT-OS `User.crmEmployeeId` mapping table chưa được seed → mismatch → fallback `'Unmapped'`

---

## 2. Decisions (User confirmed)

| Topic | Decision |
|---|---|
| Note source | `crm_activities` WHERE `action='add_note'` AND `subscriber_id=X` |
| Note format | Concat timeline `[YYYY-MM-DD HH:mm] title: details` |
| Note cap | Chỉ sync note có `created_at >= today - 90 days` |
| Note conflict | Sync ghi đè (notes thuộc `CRM_OWNED_FIELDS`) |
| Resolved | Local-only, Sale nhập tay |
| Resolved migration | Giữ nguyên data cũ |
| SLA | Auto-computed, công thức hiện tại đúng — không cần đổi |
| AE mapping | Bỏ phụ thuộc `User.crmEmployeeId`, sync trực tiếp từ CRM `smit_employee.lark_info` |

---

## 3. Final Solution

### 3.1 Notes — sync từ CRM
- Helper mới `loadNotesMap(crmSubIds: bigint[])` tại `lead-sync/derive-notes.ts`:
  ```
  Query crm_activities:
    WHERE subscriber_id IN (...)
      AND action = 'add_note'
      AND PEERDB_IS_DELETED = false
      AND created_at >= NOW() - INTERVAL '90 days'
    ORDER BY subscriber_id ASC, created_at ASC
  Build Map<bigint, string>:
    notes = activities
      .map(a => `[${formatDateTime(a.created_at)}] ${a.title ?? ''}: ${a.details ?? ''}`)
      .join('\n\n')
  ```
- Gọi trong `crm-lead-sync.service.ts` cùng lúc với `loadResolvedDateMap` (batch level)
- Thêm `'notes'` vào `CRM_OWNED_FIELDS`
- Field `notes` tự động bị lock trong UPDATE endpoint qua `stripCrmLockedFields` (không cần code mới)

### 3.2 Resolved — chuyển local-only
- Bỏ `'resolvedDate'` khỏi `CRM_OWNED_FIELDS`
- Xoá `derive-resolved-date.ts` (chỉ `crm-lead-sync.service.ts` dùng — confirmed bằng grep)
- Xoá call `loadResolvedDateMap` trong `crm-lead-sync.service.ts:188-195`
- Bỏ `resolvedDate` khỏi payload `mapLeadPayload` và create/update trong sync
- Sửa `lead.routes.ts:279-284`: bỏ check `existing.syncedFromCrm` cho `resolvedDate` → Sale luôn được sửa
- Update `lead-log-dialog.tsx`: thêm input cho `resolvedDate` (nếu chưa có)
- Data cũ giữ nguyên — không cần migration script

### 3.3 SLA — phân loại Auto
- **Không cần code change.** Logic tại `lead-logs-tab.tsx:42-63` đã đúng:
  - Closed: status ∈ {Qualified, Unqualified}
  - end = `resolvedDate ?? today`
  - (end - received) ≤ 7 days → `On-time (D-N)`
  - (end - received) > 7 days → `Overdue (+N)`
- Document trong code comment: "SLA is UI-derived, not a DB column"

### 3.4 AE Unmapped — CRM-direct mapping
- Refactor `employee-mapper.ts`:
  ```ts
  // Old: query SMIT-OS User WHERE crmEmployeeId != null
  // New: query CRM smit_employee, extract name từ JSONB
  loadEmployeeMap() → Map<user_id, name>
    name = lark_info->>'name'
        ?? lark_info->>'en_name'
        ?? zalo_pancake_info->>'name'
        ?? `CRM-emp-${user_id}`
  ```
- Đổi `EmployeeMapValue.id: string` → `id?: string` (optional, vì không link SMIT-OS User nữa)
- Sync flow giữ nguyên: `employeeMap.get(employee_id_modified)` → `mappedEmployee?.fullName ?? 'Unmapped'`
- Sau merge: trigger backfill sync (mode='backfill') → toàn bộ lead Unmapped sẽ được populate tên thật
- `User.crmEmployeeId` schema giữ lại (deprecated) cho đến khi confirm không dùng nơi khác

---

## 4. Implementation Phases

| Phase | Scope | Files | Estimate |
|---|---|---|---|
| 1 | Refactor `employee-mapper.ts` query CRM `smit_employee` | `employee-mapper.ts` | 30m |
| 2 | Tạo `derive-notes.ts` helper, integrate vào sync | `derive-notes.ts` (new), `crm-lead-sync.service.ts`, `constants.ts` | 1h |
| 3 | Bỏ resolvedDate khỏi sync, cho Sale sửa thủ công | `crm-lead-sync.service.ts`, `constants.ts`, `lead.routes.ts`, `lead-log-dialog.tsx`, xoá `derive-resolved-date.ts` | 45m |
| 4 | Document SLA classification (code comment + docs) | `lead-logs-tab.tsx` (comment) | 10m |
| 5 | Test & trigger backfill sync | manual via API/CLI | 30m |

**Total estimate:** ~3h dev + test

---

## 5. Risks & Mitigations

| # | Risk | Mitigation |
|---|---|---|
| 1 | Note bloat khi 1 sub có nhiều add_note trong 90 ngày | Cap 90 ngày đã giảm; nếu cần thêm thì add max-records cap (vd: 30) |
| 2 | `smit_employee.lark_info` null cho employee mới | Fallback chain 4 levels — luôn có tên (worst case `CRM-emp-{id}`) |
| 3 | Backfill chạy lâu trên 333 lead | Acceptable — chạy 1 lần sau merge, manual trigger |
| 4 | Sale mất note local đã nhập trên synced lead | User chấp nhận (đã confirm "ghi đè") |
| 5 | `User.crmEmployeeId` thành dead code | Giữ schema, đánh dấu deprecated, audit lại sau 1 sprint |
| 6 | UPDATE flow vẫn cho Sale sửa notes của lead non-synced | Đúng — chỉ lock cho synced lead via `stripCrmLockedFields` |

---

## 6. Success Criteria

- [ ] Lead Logs hiển thị tên AE thật cho 333 lead (Phương Linh / Kim Huệ / Hồng Nhung / Duy Linh)
- [ ] Lead Logs hiển thị notes từ CRM activities cho lead synced (concat timeline)
- [ ] Sale chỉnh được resolvedDate cho lead synced qua dialog edit
- [ ] SLA badge hiển thị đúng 3 trạng thái: On-time(D-N) / Overdue(+N) / Closed
- [ ] Backfill sync xong không lỗi, không còn 'Unmapped' trong DB
- [ ] Lead local-only (syncedFromCrm=false) vẫn cho Sale nhập notes/resolvedDate

---

## 7. Validation Plan

**Pre-deploy:**
- Unit test `loadEmployeeMap` với mock CRM data (lark name vs en_name vs pancake)
- Unit test `loadNotesMap` với multiple activities cho 1 sub
- Integration test sync flow: insert 1 CrmSubscriber test → verify lead.notes/lead.ae/lead.resolvedDate

**Post-deploy:**
- Trigger manual sync (mode='manual')
- Spot check 5 lead trong UI: AE name, notes content, resolvedDate editable
- Query SMIT-OS DB: `SELECT COUNT(*) FROM "Lead" WHERE ae='Unmapped'` → expect 0

---

## 8. Dependencies & Next Steps

**Dependencies:**
- CRM DB connection healthy (đã verified qua psql query)
- `smit_employee.lark_info` được PEERDB sync đầy đủ
- `crm_activities` được PEERDB sync đầy đủ (6205 add_note records confirmed)

**Next steps:**
1. Tạo `/ck:plan` chi tiết với phase files (đã user approved)
2. Implement theo phases 1-5
3. Code review + test
4. Deploy + manual backfill trigger

---

## 9. Open Questions

- Có cần expose `lastSyncedAt` lên UI để Sale biết note đã sync khi nào không? (Chưa quyết)
- Sau khi `User.crmEmployeeId` deprecated, có nên xoá schema field hoàn toàn? (Cần audit thêm)
- Có muốn highlight visual trong UI để Sale nhận biết note nào do CRM sync vs local nhập? (Hiện cùng cột notes — không phân biệt)
