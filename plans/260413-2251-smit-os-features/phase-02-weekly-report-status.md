# Phase 2: Weekly Report Status Workflow

**Priority:** High
**Status:** completed
**Effort:** 4-6h
**Depends on:** None

## Overview

Thêm status workflow (Review → Approved) cho Weekly Report. Admin có thể review, edit và approve.

## Requirements

### 2.1 Database Schema Update

**File:** `prisma/schema.prisma`

```prisma
model WeeklyReport {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  weekEnding      DateTime
  progress        String   // JSON string
  plans           String   // JSON string
  blockers        String   // JSON string
  score           Int      @default(0)
  
  // NEW FIELDS
  status          String   @default("Review")  // Review, Approved
  approvedBy      String?
  approver        User?    @relation("ApprovedReports", fields: [approvedBy], references: [id])
  approvedAt      DateTime?
  krProgress      String?  // JSON: [{krId, currentValue, progressPct}]
  
  createdAt       DateTime @default(now())
}
```

**User model update:**
```prisma
model User {
  // ... existing
  approvedReports WeeklyReport[] @relation("ApprovedReports")
}
```

### 2.2 API Updates

**File:** `server.ts`

#### GET /api/reports - Add permission filtering

```typescript
app.get("/api/reports", handleAsync(async (req: any, res: any) => {
  const { userId, role } = req.query;
  
  let where = {};
  // Leader: xem của mình + team members
  // Admin: xem tất cả
  // Member: không xem được Weekly Report
  
  const reports = await prisma.weeklyReport.findMany({
    where,
    include: { 
      user: true,
      approver: { select: { id: true, fullName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(reports);
}));
```

#### PUT /api/reports/:id - Allow editing when status = Review

```typescript
app.put("/api/reports/:id", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { currentUserId, currentUserRole, ...updateData } = req.body;
  
  const report = await prisma.weeklyReport.findUnique({ where: { id } });
  
  // Only allow edit when status = Review
  if (report.status === 'Approved') {
    return res.status(400).json({ error: "Cannot edit approved report" });
  }
  
  // Permission check: Admin can edit any, Leader only own
  if (currentUserRole !== 'Admin' && report.userId !== currentUserId) {
    return res.status(403).json({ error: "Not authorized" });
  }
  
  const updated = await prisma.weeklyReport.update({
    where: { id },
    data: updateData,
    include: { user: true }
  });
  res.json(updated);
}));
```

#### POST /api/reports/:id/approve - New endpoint

```typescript
app.post("/api/reports/:id/approve", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { approverId } = req.body;
  
  // Only Admin can approve
  const approver = await prisma.user.findUnique({ where: { id: approverId } });
  if (!approver?.isAdmin) {
    return res.status(403).json({ error: "Only Admin can approve" });
  }
  
  const report = await prisma.weeklyReport.update({
    where: { id },
    data: {
      status: 'Approved',
      approvedBy: approverId,
      approvedAt: new Date()
    },
    include: { user: true }
  });
  
  // Trigger OKR sync (Phase 3)
  // await syncOKRProgress(report);
  
  res.json(report);
}));
```

### 2.3 Frontend Updates

#### Types update (`src/types/index.ts`)

```typescript
export interface WeeklyReport {
  // ... existing
  status: 'Review' | 'Approved';
  approvedBy?: string;
  approver?: { id: string; fullName: string };
  approvedAt?: string;
  krProgress?: string;  // JSON
}
```

#### ReportTableView - Show status badge

**File:** `src/components/board/ReportTableView.tsx`

```tsx
// Add status column
<td className="p-4">
  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
    report.status === 'Approved' 
      ? 'bg-emerald-100 text-emerald-700' 
      : 'bg-amber-100 text-amber-700'
  }`}>
    {report.status}
  </span>
</td>
```

#### ReportDetailDialog - Add approve button

**File:** `src/components/modals/ReportDetailDialog.tsx`

```tsx
// Add approve button for Admin when status = Review
{currentUser?.isAdmin && report.status === 'Review' && (
  <button
    onClick={handleApprove}
    className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold"
  >
    Approve
  </button>
)}
```

#### WeeklyCheckinModal - Add KR progress input

**File:** `src/components/modals/WeeklyCheckinModal.tsx`

Add section for Leader to input KR progress:
- List assigned KRs
- Input currentValue or progressPct for each
- Save as JSON in krProgress field

## Implementation Steps

1. [x] Update Prisma schema with new fields
2. [x] Run `npx prisma migrate dev --name add-report-status`
3. [x] Update server.ts with new endpoints
4. [x] Update TypeScript types
5. [x] Update ReportTableView with status column
6. [x] Update ReportDetailDialog with approve button + edit mode
7. [x] Update WeeklyCheckinModal with KR progress inputs
8. [x] Test permission flow: Leader create → Admin review/edit → Approve

## Success Criteria

- [x] New Weekly Report has status = "Review"
- [x] Admin can view all reports
- [x] Admin can edit report content when status = Review
- [x] Admin can approve report
- [x] Approved reports cannot be edited
- [x] Status badge shows correctly in table
