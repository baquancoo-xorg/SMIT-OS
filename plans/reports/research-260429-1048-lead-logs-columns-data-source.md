# Lead Logs — Phân tích nguồn dữ liệu các cột

**Ngày:** 2026-04-29 10:48
**Trang:** Lead Tracker → tab "Lead Logs"
**File UI:** `src/components/lead-tracker/lead-logs-tab.tsx:65-78`
**API endpoint:** `GET /api/leads` → `server/routes/lead.routes.ts:210-247`
**Sync service:** `server/services/lead-sync/crm-lead-sync.service.ts`

---

## TL;DR

Frontend **không** query trực tiếp CRM DB. Toàn bộ bảng đọc từ **SMIT-OS DB** (`prisma.lead.findMany`).
Tuy nhiên, **một phần các cột có dữ liệu gốc đến từ CRM DB** thông qua sync service (`crm-lead-sync.service.ts`) ghi vào bảng `Lead` của SMIT-OS DB. Các cột còn lại là dữ liệu **local-only** (nhập tay trong SMIT-OS) hoặc **derived/UI-only** (tính tại frontend).

Tham chiếu khoá: `CRM_OWNED_FIELDS` (`server/services/lead-sync/constants.ts:5-11`)
```ts
['customerName', 'ae', 'receivedDate', 'resolvedDate', 'status']
```

---

## Bảng 12 cột — Phân loại nguồn dữ liệu

| # | Cột (label) | Field DB / Logic | Nguồn gốc | Ghi chú |
|---|---|---|---|---|
| 1 | **Customer** | `customerName` | **CRM DB** (sync) | Map từ `CrmSubscriber.fullName`; fallback `CRM-{id}` nếu rỗng. Có thể tạo thủ công khi `syncedFromCrm = false`. |
| 2 | **Source** | (badge UI từ `syncedFromCrm: boolean`) | **CRM-driven flag** | Không phải cột dữ liệu thuần — là UI badge. Cờ `syncedFromCrm` do sync service set `true` khi insert/update từ CRM. |
| 3 | **AE** | `ae` | **CRM DB** (sync) | Map từ `employee_id_modified` qua `employeeMap`; fallback `'Unmapped'`. Có thể nhập tay nếu lead local. |
| 4 | **Received** | `receivedDate` | **CRM DB** (sync) | Map từ `CrmSubscriber.createdAt`, normalize về 12:00 UTC. Lock không cho sửa nếu `syncedFromCrm = true` (`lead.routes.ts:279-284`). |
| 5 | **Resolved** | `resolvedDate` | **CRM DB** (derived) | Lấy từ CRM thông qua `loadResolvedDateMap()` — chỉ áp dụng khi mapped status là Qualified/Unqualified. |
| 6 | **Status** | `status` | **CRM DB** (sync) | Map qua `statusMap` (CRM raw status → 5 status nội bộ); fallback `'Mới'`. |
| 7 | **SLA** | (derived: `receivedDate` + `status`) | **Computed (UI-only)** | Tính tại frontend bằng `getLeadSla()` — không có cột DB. Phụ thuộc vào `receivedDate` (CRM) và `status` (CRM). |
| 8 | **Lead Type** | `leadType` | **SMIT-OS DB (local-only)** | Không nằm trong `CRM_OWNED_FIELDS`. Nhập tay qua dialog/bulk edit. |
| 9 | **UQ Reason** | `unqualifiedType` | **SMIT-OS DB (local-only)** | Local-only. Nhập tay. |
| 10 | **Notes** | `notes` | **SMIT-OS DB (local-only)** | Local-only. Nhập tay. |
| 11 | **Modified** | `updatedAt` | **SMIT-OS DB (auto)** | Prisma `@updatedAt` — tự cập nhật khi row được ghi (do user edit **hoặc** do CRM sync ghi). Không phải lấy trực tiếp từ CRM. |
| 12 | **Actions** | — | **UI-only** | Không có dữ liệu — chỉ nút View/Edit/Delete + workflow duyệt xoá. |

> **Cột phụ (chỉ hiện khi user là Sale):** Checkbox select-row — UI-only, không phải cột dữ liệu.

---

## Tóm tắt phân loại

### Nhóm 1 — Dữ liệu gốc từ CRM DB (5 cột chính + 2 phụ)
Được sync bởi `crm-lead-sync.service.ts` ghi vào bảng `Lead` của SMIT-OS DB:
- **Customer** (`customerName`)
- **AE** (`ae`)
- **Received** (`receivedDate`)
- **Resolved** (`resolvedDate`)
- **Status** (`status`)
- *Source badge* — cờ `syncedFromCrm` do sync service set
- *SLA* — derived từ `receivedDate` + `status` (cả 2 đều CRM origin)

### Nhóm 2 — Local-only (SMIT-OS DB, nhập tay)
- **Lead Type** (`leadType`)
- **UQ Reason** (`unqualifiedType`)
- **Notes** (`notes`)

### Nhóm 3 — Auto/Computed/UI-only
- **Modified** (`updatedAt`) — auto bởi Prisma; bị cập nhật bởi cả user edit và CRM sync
- **Actions** — UI buttons
- *Checkbox select* — UI

---

## Điểm cần lưu ý

1. **Frontend đọc 100% từ SMIT-OS DB**, không gọi CRM DB. Sync chạy nền (cron/manual/backfill) để bridge dữ liệu.
2. **Cờ `syncedFromCrm`** quyết định lock các CRM-owned fields trong UPDATE endpoint (`lead.routes.ts:273` → `stripCrmLockedFields`).
3. **`updatedAt` (cột Modified)** không phản ánh thời điểm sync từ CRM — đó là `lastSyncedAt` (không hiển thị trong bảng). `updatedAt` cập nhật mỗi khi row được ghi bất kể nguồn.
4. **Lead có thể là local-only**: nếu Sale tạo lead thủ công qua UI (`POST /api/leads`), `syncedFromCrm = false` → tất cả field đều có thể là local input. Lúc này không có cột nào "đến từ CRM DB" — toàn bộ là user input.

---

## Câu hỏi chưa rõ

1. Bạn muốn phân loại theo "dữ liệu được ghi từ CRM sync" (`CRM_OWNED_FIELDS`) hay "dữ liệu được hiển thị từ row đang có `syncedFromCrm = true`"? Hai góc nhìn này khác nhau với lead local-only.
2. Cột **Source** (badge) có cần đếm là "lấy từ CRM DB" không, vì nó chỉ render boolean flag, không phải cột content?
3. Bạn cần giải pháp nào tiếp theo: thêm cột `lastSyncedAt`, hay highlight visually các cột CRM-owned, hay kiểm tra một lead cụ thể?
