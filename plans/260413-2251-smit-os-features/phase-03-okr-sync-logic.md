# Phase 3: OKR Sync Logic

**Priority:** High
**Status:** completed
**Effort:** 3-4h
**Depends on:** Phase 2

## Overview

Tự động cập nhật tiến độ OKR khi Weekly Report được approve.

## Requirements

### 3.1 OKR Calculation Logic

**Calculation rules:**
1. `KeyResult.progressPercentage = (currentValue / targetValue) * 100`
2. `Objective.progressPercentage = AVG(all KR.progressPercentage)`
3. `L1 Objective.progressPercentage = AVG(all L2 Objectives.progressPercentage)`

**Edge cases:**
- targetValue = 0 → progressPercentage = 0
- Không có KR → Objective progress = 0
- Không có L2 → L1 giữ nguyên

### 3.2 Server-side Sync Function

**File:** `server.ts`

```typescript
// Helper function to sync OKR progress after report approval
async function syncOKRProgress(report: WeeklyReport) {
  if (!report.krProgress) return;
  
  const krProgressData = JSON.parse(report.krProgress);
  // Structure: [{krId, currentValue, progressPct}]
  
  for (const kr of krProgressData) {
    // Update KeyResult
    const keyResult = await prisma.keyResult.findUnique({
      where: { id: kr.krId },
      include: { objective: true }
    });
    
    if (!keyResult) continue;
    
    // Calculate progress
    let progressPct = kr.progressPct;
    if (kr.currentValue !== undefined && keyResult.targetValue > 0) {
      progressPct = (kr.currentValue / keyResult.targetValue) * 100;
    }
    
    // Update KeyResult
    await prisma.keyResult.update({
      where: { id: kr.krId },
      data: {
        currentValue: kr.currentValue ?? keyResult.currentValue,
        progressPercentage: Math.min(progressPct, 100)
      }
    });
  }
  
  // Recalculate Objective progress
  await recalculateObjectiveProgress();
}

async function recalculateObjectiveProgress() {
  // Get all objectives with their KRs
  const objectives = await prisma.objective.findMany({
    include: { 
      keyResults: true,
      children: { include: { keyResults: true } }
    }
  });
  
  for (const obj of objectives) {
    let progress = 0;
    
    if (obj.parentId) {
      // L2 Objective: average of KRs
      if (obj.keyResults.length > 0) {
        progress = obj.keyResults.reduce((sum, kr) => sum + kr.progressPercentage, 0) / obj.keyResults.length;
      }
    } else {
      // L1 Objective: average of L2 children
      if (obj.children.length > 0) {
        const childProgress = obj.children.map(child => {
          if (child.keyResults.length === 0) return 0;
          return child.keyResults.reduce((sum, kr) => sum + kr.progressPercentage, 0) / child.keyResults.length;
        });
        progress = childProgress.reduce((a, b) => a + b, 0) / obj.children.length;
      }
    }
    
    await prisma.objective.update({
      where: { id: obj.id },
      data: { progressPercentage: Math.round(progress * 100) / 100 }
    });
  }
}
```

### 3.3 Integrate with Approve Endpoint

**File:** `server.ts`

Update `/api/reports/:id/approve`:

```typescript
app.post("/api/reports/:id/approve", handleAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { approverId } = req.body;
  
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
  
  // Sync OKR progress
  await syncOKRProgress(report);
  
  res.json(report);
}));
```

### 3.4 Manual Recalculate Endpoint (Optional)

```typescript
app.post("/api/okrs/recalculate", handleAsync(async (req: any, res: any) => {
  await recalculateObjectiveProgress();
  res.json({ success: true });
}));
```

## Implementation Steps

1. [x] Create `syncOKRProgress` function in server.ts
2. [x] Create `recalculateObjectiveProgress` function
3. [x] Integrate with approve endpoint
4. [x] Add manual recalculate endpoint (optional)
5. [x] Test với sample data:
   - Create Weekly Report with KR progress
   - Approve report
   - Verify KR.currentValue updated
   - Verify Objective.progressPercentage recalculated
6. [x] Handle edge cases (null values, 0 targets)

## Test Scenarios

| Scenario | Input | Expected |
|----------|-------|----------|
| Normal KR | currentValue: 45, target: 100 | progress: 45% |
| Exceed target | currentValue: 120, target: 100 | progress: 100% (capped) |
| Zero target | currentValue: 10, target: 0 | progress: 0% |
| % direct input | progressPct: 60 | progress: 60% |
| No KRs in Objective | - | Objective progress: 0% |

## Success Criteria

- [x] KR progress updates when report approved
- [x] Objective progress = AVG(KRs)
- [x] L1 Objective = AVG(L2 Objectives)
- [x] Edge cases handled (no errors)
- [x] Progress capped at 100%
