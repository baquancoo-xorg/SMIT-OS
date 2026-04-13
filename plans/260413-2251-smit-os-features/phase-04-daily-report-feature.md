# Phase 4: Daily Report Feature

**Priority:** High
**Status:** completed
**Effort:** 6-8h
**Depends on:** None (can run parallel with Phase 2-3)

## Overview

Implement full Daily Report feature: database, API, UI với permission system.

## Requirements

### 4.1 Database Schema

**File:** `prisma/schema.prisma`

```prisma
model DailyReport {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  reportDate   DateTime
  status       String   @default("Review")  // Review, Approved
  
  // Task data as JSON
  tasksData    String   // {completedYesterday: string[], doingYesterday: string[], doingToday: string[]}
  blockers     String?
  impactLevel  String?  // none, low, high
  
  // Approval
  approvedBy   String?
  approver     User?    @relation("ApprovedDailyReports", fields: [approvedBy], references: [id])
  approvedAt   DateTime?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model User {
  // ... existing fields
  dailyReports         DailyReport[]
  approvedDailyReports DailyReport[] @relation("ApprovedDailyReports")
}
```

### 4.2 API Endpoints

**File:** `server.ts`

#### GET /api/daily-reports

```typescript
app.get("/api/daily-reports", handleAsync(async (req: any, res: any) => {
  const { userId, userRole, userDepartment } = req.query;
  
  let where: any = {};
  
  if (userRole === 'Member') {
    // Member: chỉ xem của mình
    where.userId = userId;
  } else if (userRole?.includes('Leader')) {
    // Leader: xem của mình + team members (same department)
    where.OR = [
      { userId },
      { user: { department: userDepartment } }
    ];
  }
  // Admin: xem tất cả (no filter)
  
  const reports = await prisma.dailyReport.findMany({
    where,
    include: { 
      user: { select: { id: true, fullName: true, department: true, role: true, avatar: true } },
      approver: { select: { id: true, fullName: true } }
    },
    orderBy: { reportDate: 'desc' }
  });
  res.json(reports);
}));
```

#### POST /api/daily-reports

```typescript
app.post("/api/daily-reports", handleAsync(async (req: any, res: any) => {
  const { userId, reportDate, tasksData, blockers, impactLevel } = req.body;
  
  // Check if report already exists for this date
  const existing = await prisma.dailyReport.findFirst({
    where: {
      userId,
      reportDate: new Date(reportDate)
    }
  });
  
  if (existing) {
    return res.status(400).json({ error: "Report for this date already exists" });
  }
  
  const report = await prisma.dailyReport.create({
    data: {
      userId,
      reportDate: new Date(reportDate),
      tasksData: JSON.stringify(tasksData),
      blockers,
      impactLevel,
      status: 'Review'
    },
    include: { user: true }
  });
  res.json(report);
}));
```

#### PUT /api/daily-reports/:id

```typescript
app.put("/api/daily-reports/:id", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { currentUserId, currentUserRole, ...updateData } = req.body;
  
  const report = await prisma.dailyReport.findUnique({ 
    where: { id },
    include: { user: true }
  });
  
  if (!report) return res.status(404).json({ error: "Not found" });
  
  // Cannot edit approved report
  if (report.status === 'Approved') {
    return res.status(400).json({ error: "Cannot edit approved report" });
  }
  
  // Permission check
  const isOwner = report.userId === currentUserId;
  const isLeaderOfUser = currentUserRole?.includes('Leader') && report.user.role === 'Member';
  const isAdmin = currentUserRole === 'Admin';
  
  if (!isOwner && !isLeaderOfUser && !isAdmin) {
    return res.status(403).json({ error: "Not authorized" });
  }
  
  // Owner can only edit own report, Leader/Admin can edit for review
  if (isOwner && !isAdmin && !isLeaderOfUser) {
    // Member chỉ sửa được của mình, không sửa được của người khác
  }
  
  const updated = await prisma.dailyReport.update({
    where: { id },
    data: {
      ...updateData,
      tasksData: updateData.tasksData ? JSON.stringify(updateData.tasksData) : undefined,
      updatedAt: new Date()
    },
    include: { user: true }
  });
  res.json(updated);
}));
```

#### POST /api/daily-reports/:id/approve

```typescript
app.post("/api/daily-reports/:id/approve", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { approverId, approverRole } = req.body;
  
  const report = await prisma.dailyReport.findUnique({ 
    where: { id },
    include: { user: true }
  });
  
  if (!report) return res.status(404).json({ error: "Not found" });
  
  // Permission: Leader approve Member, Admin approve all
  const isLeaderApprovesMember = approverRole?.includes('Leader') && report.user.role === 'Member';
  const isAdmin = approverRole === 'Admin';
  
  if (!isLeaderApprovesMember && !isAdmin) {
    return res.status(403).json({ error: "Not authorized to approve" });
  }
  
  const updated = await prisma.dailyReport.update({
    where: { id },
    data: {
      status: 'Approved',
      approvedBy: approverId,
      approvedAt: new Date()
    },
    include: { user: true }
  });
  res.json(updated);
}));
```

### 4.3 TypeScript Types

**File:** `src/types/index.ts`

```typescript
export interface DailyReport {
  id: string;
  userId: string;
  user: User;
  reportDate: string;
  status: 'Review' | 'Approved';
  tasksData: string;  // JSON
  blockers?: string;
  impactLevel?: 'none' | 'low' | 'high';
  approvedBy?: string;
  approver?: { id: string; fullName: string };
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReportTasksData {
  completedYesterday: string[];  // task IDs
  doingYesterday: string[];
  doingToday: string[];
}
```

### 4.4 Frontend Components

#### New Page: DailySync.tsx

**File:** `src/pages/DailySync.tsx`

Structure:
- Header với date selector
- List của Daily Reports (table view)
- Button "New Report" mở modal

#### New Modal: DailyReportModal.tsx

**File:** `src/components/modals/DailyReportModal.tsx`

Form fields:
1. **Phần 1: Báo cáo hôm qua**
   - Fetch assigned tasks (In Progress)
   - Checkboxes: "Đã xong" / "Vẫn đang làm"

2. **Phần 2: Khó khăn & Tác động**
   - Textarea: blockers
   - Dropdown: impact level

3. **Phần 3: Kế hoạch hôm nay**
   - Fetch all assigned tasks
   - Checkboxes chọn tasks

#### DailyReportTable.tsx

**File:** `src/components/board/DailyReportTable.tsx`

Columns:
- Date
- User
- Status (badge)
- Blockers (truncated)
- Impact
- Actions (View/Approve)

#### DailyReportDetailDialog.tsx

**File:** `src/components/modals/DailyReportDetailDialog.tsx`

- View mode: hiển thị chi tiết
- Edit mode: cho Leader/Admin khi status = Review
- Approve button

### 4.5 Routing Update

**File:** `src/App.tsx`

Add new view type and route:
```typescript
type ViewType = '...' | 'daily-sync';

// In render
{currentView === 'daily-sync' && <DailySync />}
```

**File:** `src/components/layout/Sidebar.tsx`

Add menu item:
```tsx
<NavItem
  icon="event_note"
  label="Daily Sync"
  active={currentView === 'daily-sync'}
  onClick={() => onViewChange('daily-sync')}
/>
```

## Implementation Steps

1. [x] Update Prisma schema với DailyReport model
2. [x] Run migration: `npx prisma migrate dev --name add-daily-report`
3. [x] Add API endpoints in server.ts
4. [x] Add TypeScript types
5. [x] Create DailySync.tsx page
6. [x] Create DailyReportModal.tsx
7. [x] Create DailyReportTable.tsx
8. [x] Create DailyReportDetailDialog.tsx
9. [x] Update App.tsx routing
10. [x] Update Sidebar.tsx menu
11. [x] Test permission matrix:
    - Member: create own, view own, cannot edit/approve
    - Leader: create own, view team, edit team's Review, approve Member's
    - Admin: all actions

## Permission Matrix

| Action | Member | Leader | Admin |
|--------|--------|--------|-------|
| Create own | ✅ | ✅ | ✅ |
| View own | ✅ | ✅ | ✅ |
| View team | ❌ | ✅ | ✅ |
| View all | ❌ | ❌ | ✅ |
| Edit own (Review) | ✅ | ✅ | ✅ |
| Edit other (Review) | ❌ | ✅ (Member) | ✅ |
| Approve | ❌ | ✅ (Member) | ✅ |

## Success Criteria

- [x] Member can create/view own Daily Report
- [x] Leader can view team's reports
- [x] Leader can edit/approve Member's reports
- [x] Admin has full access
- [x] Approved reports cannot be edited
- [x] Task list populated from assigned WorkItems

## Security Notes

- Fixed authorization bypass in daily-reports endpoints
- User role now verified from database instead of trusting client
