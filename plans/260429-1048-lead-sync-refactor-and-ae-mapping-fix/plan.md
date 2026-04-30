---
title: "Lead Sync Refactor & AE Unmapped Fix"
description: "Sync notes từ CRM, chuyển resolvedDate sang local-only, fix AE Unmapped bằng CRM-direct mapping qua smit_employee.lark_info"
status: completed
priority: P1
effort: ~3h
branch: main
tags: [crm-sync, lead-tracker, bug-fix, refactor]
created: 2026-04-29
---

# Lead Sync Refactor & AE Unmapped Fix

## Context
- Brainstorm: [`../reports/brainstorm-260429-1048-lead-sync-refactor-and-ae-fix.md`](../reports/brainstorm-260429-1048-lead-sync-refactor-and-ae-fix.md)
- Research column data sources: [`../reports/research-260429-1048-lead-logs-columns-data-source.md`](../reports/research-260429-1048-lead-logs-columns-data-source.md)
- Trang ảnh hưởng: Lead Tracker → tab Lead Logs

## Problem
1. **AE Unmapped:** 333/333 lead đang dùng tên thật trong CRM (4 AE: Phương Linh 142, Kim Huệ 103, Hồng Nhung 82, Duy Linh 6) — nhưng SMIT-OS hiển thị `Unmapped` vì sync phụ thuộc `User.crmEmployeeId` chỉ có 2/17 user được seed.
2. **Note local-only** không phản ánh activity Sale ghi trên CRM (6205 add_note records chưa được sync).
3. **Resolved sync nhầm chỗ:** Sale cần kiểm soát thủ công khi đóng lead.
4. **SLA chưa document:** Đã đúng logic nhưng chưa được phân loại rõ ràng.

## Goals
- Bỏ phụ thuộc `User.crmEmployeeId` — sync tên AE trực tiếp từ CRM `smit_employee.lark_info->>'name'`.
- Sync `notes` từ `crm_activities (action='add_note', last 90 days)` theo timeline format.
- Cho Sale chỉnh thủ công `resolvedDate` kể cả lead đã sync.
- SLA = Auto-derived (today vs received + 7 days, status-aware).
- Backfill toàn bộ 333 lead Unmapped.

## Phases

| # | Phase | Files | Status |
|---|---|---|---|
| 1 | [Refactor employee-mapper to CRM-direct](./phase-01-refactor-employee-mapper.md) | `employee-mapper.ts` | ✅ done |
| 2 | [Add notes sync from crm_activities](./phase-02-add-notes-sync.md) | `derive-notes.ts` (new), `crm-lead-sync.service.ts`, `constants.ts` | ✅ done |
| 3 | [Resolved date → local-only](./phase-03-resolved-date-local-only.md) | `crm-lead-sync.service.ts`, `constants.ts`, `lead.routes.ts`, xoá `derive-resolved-date.ts` | ✅ done |
| 4 | [Document SLA classification](./phase-04-document-sla-classification.md) | `lead-logs-tab.tsx` (comment) | ✅ done |
| 5 | [Backfill & validate](./phase-05-backfill-and-validate.md) | manual via script | ✅ done |

## Key Dependencies
- CRM DB connection (`CRM_DATABASE_URL` confirmed reachable qua psql)
- PEERDB sync `smit_employee.lark_info` và `crm_activities` (đã verified data available)
- Existing sync service skeleton tại `server/services/lead-sync/`

## Success Criteria
- [x] Unmapped giảm từ 428 → 96 (77.6% mapped, còn lại do employee_id null)
- [x] Lead Logs UI hiển thị notes timeline format cho lead synced
- [x] Sale edit được resolvedDate qua dialog (kể cả lead synced)
- [x] SLA badge: On-time(D-N) / Overdue(+N) / Closed
- [x] Lead local-only (`syncedFromCrm=false`) vẫn cho Sale nhập tay notes/resolvedDate

## Risks
- Note bloat → cap 90 ngày
- `lark_info` null → fallback chain 4 levels
- `User.crmEmployeeId` thành dead code → giữ deprecated 1 sprint
- Sale mất note local trên synced lead → user đã chấp nhận
