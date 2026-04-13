# Brainstorm Report: SMIT OS Features

**Date:** 2026-04-13
**Status:** Approved for Implementation

---

## Problem Statement

SMIT OS cần bổ sung 4 tính năng:
1. Daily Report - Báo cáo task hàng ngày
2. Weekly Report OKR Sync - Tự động cập nhật tiến độ OKR
3. Backlog Rename - Đổi tên "Product Backlog" → "Backlog"
4. Backlog UI Fix - Bỏ hover effect, thêm Description column

---

## Requirements Summary

### 1. Daily Report

**Functional:**
- Member/Leader tạo báo cáo ngày theo task đã assigned
- Báo cáo: tasks hoàn thành hôm qua, đang làm, kế hoạch hôm nay
- Blockers và impact level
- Status workflow: Review → Approved
- Chỉ lưu báo cáo, không sync status task

**Permissions:**
| Role | Tạo | Xem | Sửa khi Review | Approve |
|------|-----|-----|----------------|---------|
| Member | ✅ (của mình) | ✅ (của mình) | ❌ | ❌ |
| Leader | ✅ (của mình) | ✅ (team) | ✅ (Member) | ✅ (Member) |
| Admin | ✅ | ✅ (tất cả) | ✅ (tất cả) | ✅ (tất cả) |

### 2. Weekly Report + OKR Sync

**Functional:**
- Chỉ Leader tạo được Weekly Report
- Báo cáo theo KR được assigned
- Status: Review → Approved (Admin approve)
- Admin có thể sửa nội dung + chỉ số khi review
- Sau khi Approved → tự động tính OKR progress

**KR Progress Input:**
- Số liệu: nhập currentValue, hệ thống tính %
- Định tính: nhập % trực tiếp

**OKR Calculation:**
- KeyResult.progressPercentage = (currentValue / targetValue) * 100
- Objective.progressPercentage = AVG(all KR.progressPercentage)
- L1 Objective = AVG(all L2 Objectives)

### 3. Backlog Rename

**Files cần sửa:**
- `src/components/layout/Sidebar.tsx:76` - Menu item
- `src/pages/ProductBacklog.tsx` - Page title, breadcrumb
- `src/pages/TechScrumBoard.tsx` - Column name
- `src/pages/MarketingKanban.tsx` - Column name
- `src/pages/MediaKanban.tsx` - Column name
- `src/pages/SaleKanban.tsx` - Column name

### 4. Backlog UI Fix

**Changes:**
- Remove `opacity-0 group-hover:opacity-100` on action buttons
- Add Description column in Grouped view
- Always show View/Edit/Delete buttons

---

## Database Schema Changes

### New: DailyReport Model
```prisma
model DailyReport {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  reportDate   DateTime
  status       String   @default("Review") // Review, Approved
  tasksData    String   // JSON: {completedYesterday, doingYesterday, doingToday}
  blockers     String?
  impactLevel  String?  // none, low, high
  approvedBy   String?
  approvedAt   DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Update: WeeklyReport Model
```prisma
model WeeklyReport {
  // existing fields...
  status       String   @default("Review") // Review, Approved
  approvedBy   String?
  approvedAt   DateTime?
  krProgress   String?  // JSON: [{krId, currentValue, progressPct}]
}
```

### Update: User Model
```prisma
model User {
  // existing fields...
  dailyReports DailyReport[]
}
```

---

## API Endpoints Required

### Daily Report
- `GET /api/daily-reports` - List reports (filtered by role/permissions)
- `POST /api/daily-reports` - Create report
- `GET /api/daily-reports/:id` - Get single report
- `PUT /api/daily-reports/:id` - Update report (edit/approve)
- `POST /api/daily-reports/:id/approve` - Approve report

### Weekly Report Updates
- `PUT /api/weekly-reports/:id` - Update (add status, krProgress)
- `POST /api/weekly-reports/:id/approve` - Approve and trigger OKR sync

### OKR Sync
- Internal function triggered on Weekly Report approval
- Updates KeyResult and Objective progressPercentage

---

## Implementation Order

| Phase | Description | Effort |
|-------|-------------|--------|
| **Phase 1** | Backlog rename + UI fix | 1-2h |
| **Phase 2** | Weekly Report status + Admin review | 4-6h |
| **Phase 3** | OKR sync logic | 3-4h |
| **Phase 4** | Daily Report full feature | 6-8h |

**Total Estimate:** 14-20 hours

---

## Success Criteria

1. **Backlog:** Tất cả UI hiển thị "Backlog" thay vì "Product Backlog"
2. **Backlog UI:** Action buttons luôn visible, Description column hiển thị
3. **Daily Report:** Member/Leader tạo được, Leader/Admin review & approve
4. **Weekly Report:** Status workflow hoạt động, Admin edit được
5. **OKR Sync:** Progress tự động cập nhật sau khi approve Weekly Report

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database migration issues | High | Test migration on staging first |
| Permission logic bugs | Medium | Comprehensive test cases |
| OKR calculation edge cases | Medium | Handle null/zero values |

---

## Next Steps

→ Tạo implementation plan chi tiết với các phase files
