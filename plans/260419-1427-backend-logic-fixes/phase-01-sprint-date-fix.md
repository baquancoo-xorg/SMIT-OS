# Phase 1: Fix Sprint Date Bug

**Priority:** Critical
**Estimated:** 30 minutes
**Status:** completed

## Problem

```typescript
// server/routes/sprint.routes.ts:12-21
const today = new Date(); // 2026-04-19 14:30:00

const sprint = await prisma.sprint.findFirst({
  where: {
    startDate: { lte: today },  // OK
    endDate: { gte: today }     // BUG: 00:00:00 >= 14:30:00 = FALSE
  },
});
```

Sprint 2 endDate = `2026-04-19 00:00:00`, current time = `14:30:04` → no sprint found.

## Solution

Normalize `today` to start of day (00:00:00) before comparison.

## Implementation Steps

### 1. Update sprint.routes.ts

```typescript
// server/routes/sprint.routes.ts:12-21
router.get('/active', handleAsync(async (_req: any, res: any) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const sprint = await prisma.sprint.findFirst({
    where: {
      startDate: { lte: today },
      endDate: { gte: today }
    },
    include: { workItems: true }
  });
  // ... rest unchanged
}));
```

### 2. Test Scenarios

| Date | Expected Sprint | Before Fix | After Fix |
|------|-----------------|------------|-----------|
| 2026-04-19 00:00 | Sprint 2 | ✅ | ✅ |
| 2026-04-19 14:30 | Sprint 2 | ❌ | ✅ |
| 2026-04-19 23:59 | Sprint 2 | ❌ | ✅ |
| 2026-04-20 00:00 | Sprint 3 | ✅ | ✅ |

## Files to Modify

- [server/routes/sprint.routes.ts](../../server/routes/sprint.routes.ts) - Line 12-21

## Verification

```bash
# Test API directly
curl http://localhost:3000/api/sprints/active | jq

# Expected: Sprint 2 with stats
```

## Checklist

- [x] Add `today.setHours(0, 0, 0, 0)` in sprint.routes.ts
- [x] Test on UI: SprintContextWidget shows Sprint 2
- [x] Verify stats calculation still works
