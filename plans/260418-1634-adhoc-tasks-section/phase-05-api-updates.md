# Phase 5: API Updates

**Status:** pending | **Effort:** 30m | **Priority:** medium

## Overview

Update API routes để handle `adHocTasks` field trong create/update endpoints.

## Context

**Files:**
- `server/routes/daily-report.routes.ts`
- `server/routes/report.routes.ts` (weekly reports)

## Requirements

- Accept adHocTasks trong POST/PUT body
- Store as JSON string
- Return trong GET responses
- Null-safe handling

## Implementation Steps

### 5.1 Daily Report Route

**File:** `server/routes/daily-report.routes.ts`

```typescript
// POST /api/daily-reports
router.post('/', async (req, res) => {
  const { 
    userId, reportDate, teamType, tasksData, 
    blockers, impactLevel, teamMetrics,
    adHocTasks  // NEW
  } = req.body;

  const report = await prisma.dailyReport.create({
    data: {
      userId,
      reportDate: new Date(reportDate),
      teamType,
      tasksData,
      blockers,
      impactLevel,
      teamMetrics,
      adHocTasks,  // NEW - already JSON string from frontend
    },
  });
  
  res.json(report);
});
```

### 5.2 Weekly Report Route

**File:** `server/routes/report.routes.ts`

```typescript
// POST /api/reports
router.post('/', async (req, res) => {
  const { 
    userId, weekEnding, confidenceScore, progress,
    plans, blockers, score, krProgress,
    adHocTasks  // NEW
  } = req.body;

  const report = await prisma.weeklyReport.create({
    data: {
      userId,
      weekEnding: new Date(weekEnding),
      confidenceScore,
      progress,
      plans,
      blockers,
      score,
      krProgress,
      adHocTasks,  // NEW
    },
  });
  
  res.json(report);
});
```

### 5.3 GET Responses

Prisma tự động return tất cả fields, không cần thay đổi GET endpoints.

## Todo

- [ ] Add adHocTasks to daily-report POST
- [ ] Add adHocTasks to weekly report POST
- [ ] Test create với adHocTasks data
- [ ] Test create với null adHocTasks

## Success Criteria

- [ ] POST daily với adHocTasks thành công
- [ ] POST weekly với adHocTasks thành công
- [ ] Null handling không gây lỗi
- [ ] GET trả về adHocTasks field
