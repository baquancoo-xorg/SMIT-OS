---
phase: 01
status: pending
priority: critical
---

# Phase 01 - Timezone Bug Fix

## Context
- File: `server/routes/sprint.routes.ts`
- Route: `GET /api/sprints/active`

## Problem
`setHours(0,0,0,0)` reset về midnight **local timezone** (UTC+7).
Result trong UTC: `2026-04-19T17:00:00.000Z` — sớm hơn sprint startDate `2026-04-20T00:00:00.000Z`.
Query `startDate <= today` → **FALSE** → no active sprint.

## Fix

**File:** `server/routes/sprint.routes.ts` lines 12-43

```ts
// TRƯỚC (bug):
const today = new Date();
today.setHours(0, 0, 0, 0);

const sprint = await prisma.sprint.findFirst({
  where: {
    startDate: { lte: today },
    endDate: { gte: today }
  },
  ...
});

const daysLeft = Math.ceil((sprint.endDate.getTime() - today.getTime()) / ...);

// SAU (fix):
const today = new Date();
today.setUTCHours(0, 0, 0, 0); // ← thay setHours → setUTCHours

const sprint = await prisma.sprint.findFirst({
  where: {
    startDate: { lte: today },
    endDate: { gte: today }
  },
  ...
});

// daysLeft dùng cùng today UTC — không cần đổi
```

## Steps
- [ ] Sửa `sprint.routes.ts` line 14: `setHours` → `setUTCHours`
- [ ] Restart server, test `GET /api/sprints/active` trả về sprint đúng

## Success Criteria
- Sprint widget hiển thị đúng sprint theo ngày hiện tại
- Không còn "No active sprint" khi ngày nằm trong range sprint
