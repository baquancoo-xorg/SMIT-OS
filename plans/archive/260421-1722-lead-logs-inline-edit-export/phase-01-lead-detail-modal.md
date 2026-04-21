# Phase 01 — Lead Detail Modal

## Context Links
- Brainstorm: `plans/reports/brainstorm-260421-1722-lead-logs-inline-edit-export.md`
- Modal pattern ref: `src/components/lead-tracker/lead-form-modal.tsx`

## Overview
- **Priority:** High
- **Status:** Completed
- Tạo component `LeadDetailModal` — popup read-only hiển thị toàn bộ thông tin 1 lead

## Requirements
- Hiển thị: Customer, AE, Received, Resolved, Status (badge), Lead Type, UQ Reason, Notes (full)
- Đóng bằng nút X hoặc click backdrop
- Read-only (không có form/edit)
- Design nhất quán với `lead-form-modal.tsx`

## Architecture
```
LeadDetailModal
  props: { lead: Lead | null; onClose: () => void }
  └─ fixed overlay backdrop (click to close)
  └─ white card (max-w-lg, rounded-2xl)
      ├─ header: tên customer + nút X
      ├─ status badge
      ├─ grid 2-col: AE, Lead Type, Received, Resolved, UQ Reason
      └─ notes block (full text, không truncate)
```

## Related Code Files
- **Create:** `src/components/lead-tracker/lead-detail-modal.tsx`
- **Read:** `src/components/lead-tracker/lead-form-modal.tsx` (pattern tham khảo)
- **Read:** `src/types/` (Lead interface)

## Implementation Steps
1. Đọc `lead-form-modal.tsx` và `src/types/` để hiểu Lead interface + modal pattern
2. Tạo `lead-detail-modal.tsx`:
   - Props: `{ lead: Lead | null; onClose: () => void }`
   - Guard: nếu `!lead` return null
   - Overlay: `fixed inset-0 z-50 flex items-center justify-center bg-black/40` + `onClick={onClose}`
   - Card: `stopPropagation` để không đóng khi click bên trong
   - Hiển thị STATUS_BADGE từ `lead-logs-tab.tsx` (copy constant hoặc extract ra file riêng)
   - Notes block: `whitespace-pre-wrap` để giữ format
3. Export default component

## Todo
- [x] Tạo `src/components/lead-tracker/lead-detail-modal.tsx`
- [x] Test: render đúng tất cả fields, đóng khi click X, đóng khi click backdrop

## Success Criteria
- Component render đúng tất cả fields của Lead
- Đóng được bằng cả X lẫn backdrop
- Notes hiển thị đầy đủ không bị truncate
- Không có TypeScript error

## Next Steps
- Phase 02 import và sử dụng component này
