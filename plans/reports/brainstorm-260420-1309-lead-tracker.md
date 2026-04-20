# Brainstorm Report: Lead Performance Tracker

**Date:** 2026-04-20  
**Status:** Approved

---

## Problem Statement

Tích hợp bảng theo dõi hiệu suất xử lý lead hàng ngày (hiện là Excel) vào SMIT OS dưới dạng module CRM đầy đủ, có persist DB, CRUD, Daily Stats và Charts.

---

## Excel Source Analysis

| Sheet | Columns | Notes |
|-------|---------|-------|
| Lead Logs | Tên KH, AE, Ngày nhận, Ngày resolve, Status, Loại Lead, Loại Unqualified, Ghi chú | 3 AE sections |
| Daily | Ngày + per AE: Thêm, Xử lý, Tồn cuối ngày, Tỷ lệ xử lý trong ngày, Tỷ lệ xử lý trên tổng | Computed từ Lead Logs |

**Status values:** Đang liên hệ, Đang nuôi dưỡng, Qualified, Unqualified  
**Lead types:** Việt Nam, Quốc Tế  
**AEs:** Hồng Nhung, Kim Huệ, Phương Linh (lấy dynamic từ User table, department=Sales)

---

## Agreed Solution: Full CRM Module

### Database Schema

```prisma
model Lead {
  id              String    @id @default(uuid())
  customerName    String
  ae              String    // User fullName, department Sales
  receivedDate    DateTime
  resolvedDate    DateTime?
  status          String    // Đang liên hệ | Đang nuôi dưỡng | Qualified | Unqualified
  leadType        String?   // Việt Nam | Quốc Tế
  unqualifiedType String?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([ae, receivedDate])
  @@index([ae, resolvedDate])
  @@index([status])
}
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/leads | List với filter (ae, dateFrom, dateTo, status) |
| POST | /api/leads | Tạo lead mới |
| PUT | /api/leads/:id | Cập nhật lead |
| DELETE | /api/leads/:id | Xóa lead |
| GET | /api/leads/daily-stats | Tổng hợp hàng ngày per AE |
| GET | /api/leads/ae-list | Danh sách AE từ User table (department=Sales) |

### Frontend Structure

```
src/pages/LeadTracker.tsx                    ← page chính, 3 tabs
src/components/lead-tracker/
  lead-logs-tab.tsx                          ← CRUD table + form nhập lead
  daily-stats-tab.tsx                        ← bảng tổng hợp theo ngày
  dashboard-tab.tsx                          ← charts (bar/line per AE)
  lead-form-modal.tsx                        ← modal thêm/sửa lead
src/lib/api.ts                               ← thêm lead API calls
```

### Sidebar Change

Thêm nhóm mới **"CRM"** vào Sidebar.tsx:

```tsx
{/* CRM */}
<div className="space-y-2">
  <p className="...">CRM</p>
  <NavItem icon="person_search" label="Lead Tracker" ... />
</div>
```

Thêm `'lead-tracker'` vào `ViewType` trong App.tsx.

---

## Implementation Risks

- AE name mapping: User.departments array có thể chứa 'Sale' hoặc 'Sales' — cần verify casing trong DB
- Daily Stats query cần tính `tồn cuối ngày` = cumulative, không phải simple count — cần window query hoặc computed in-app
- Charts cần date range filter để tránh load toàn bộ data

---

## Success Criteria

- AE có thể nhập lead mới trong < 30 giây
- Daily Stats khớp với logic Excel (Tồn = hôm trước + Thêm - Xử lý)
- Charts hiển thị trend theo tuần/tháng
- Sidebar group CRM hiển thị đúng cho mọi user

---

## Next Steps

1. Tạo implementation plan chi tiết
2. Phase 1: Prisma migration + API
3. Phase 2: Frontend pages + components
4. Phase 3: Sidebar integration + ViewType
5. Phase 4: Testing
