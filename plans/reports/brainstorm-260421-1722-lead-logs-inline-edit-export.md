# Brainstorm Report: Lead Logs — Inline Edit + Export CSV

## Problem Statement
Lead Logs page cần 3 tính năng mới:
1. Detail view popup khi click vào lead
2. Quick inline edit cho 5 trường (không qua popup riêng)
3. Export tất cả records ra CSV

## Evaluated Approaches

### Feature 1: Detail View
- **Popup/Modal** ✅ — user chọn. Hiển thị full info (notes không truncate), read-only.
- Row expansion / Side panel — đã loại bỏ theo yêu cầu.

### Feature 2: Quick Inline Edit
**Option A: Per-cell inline edit** ✅ Recommended
- Click vào cell value → render input/select tại chỗ
- State: `inlineEdit: { id: string; field: string } | null`
- Auto-save onChange (select) hoặc onBlur/Enter (text/date)
- 1 API call per field change

**Option B: Row-level edit toggle** (current behavior)
- Cần click icon Edit2 ẩn trên hover
- Ít UX-friendly hơn

Giữ row-level edit cho Customer + AE (ít sửa hơn, đã có icon Edit2).

### Feature 3: Export CSV
**Client-side generation** ✅ Recommended
- Gọi `api.getLeads()` không filter → tất cả records từ DB
- Tạo CSV string client-side (không cần thư viện)
- Trigger download qua blob URL
- Server-side endpoint — overkill, không cần thiết.

## Final Solution

### 1. Detail View Modal
- Click customer name → `LeadDetailModal` component
- Hiển thị: Customer, AE, Received, Resolved, Status, Lead Type, UQ Reason, Notes (full)
- Read-only, đóng bằng X hoặc backdrop click

### 2. Per-Cell Inline Edit
Fields: Status, Resolved Date, Lead Type, UQ Reason, Notes
- State mới: `inlineEdit: { id: string; field: string } | null`
- Hover: cell show edit cursor + subtle highlight
- Click: render control (select hoặc input type=date/text) thay thế text
- Auto-save: `api.updateLead(id, { [field]: value })` → refetch
- UQ Reason chỉ editable khi Status = 'Unqualified'

### 3. Export CSV Button
- Thêm button "Export CSV" vào filter toolbar
- `exportLeads()` function: fetch all → build CSV → download
- Filename: `leads-export-YYYY-MM-DD.csv`
- Columns: Customer, AE, Received, Resolved, Status, Lead Type, UQ Reason, Notes

## Implementation Considerations
- `api.getLeads()` không có pagination → export an toàn
- Auto-save per cell: cần show loading state trên cell đang save
- UQ Reason cell: disable/hide khi status !== 'Unqualified'
- Detail modal: dùng cùng pattern với `lead-form-modal.tsx` hiện có
- CSV escaping: wrap values chứa dấu phẩy/newline trong double-quotes

## Files to Modify
- `src/components/lead-tracker/lead-logs-tab.tsx` — inline edit + export logic
- `src/components/lead-tracker/lead-form-modal.tsx` — tham khảo modal pattern

## Files to Create
- `src/components/lead-tracker/lead-detail-modal.tsx` — detail view component

## Success Metrics
- Click cell → edit control xuất hiện < 50ms
- Auto-save hoàn tất, row refresh đúng data
- Export CSV đúng encoding (UTF-8 BOM cho Excel)
- Modal đóng/mở mượt mà

## Risks
- Auto-save nhiều calls nếu user blur liên tục → acceptable, mỗi call nhỏ
- CSV encoding tiếng Việt → cần UTF-8 BOM để Excel đọc đúng
