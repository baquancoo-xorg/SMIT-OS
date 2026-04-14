# Phase 1: Backend - Active Sprint Endpoint

## Overview

Tạo `/api/sprints/active` endpoint trả về current sprint với work item stats.

## API Design

**Endpoint:** `GET /api/sprints/active`

**Response:**
```json
{
  "sprint": {
    "id": "uuid",
    "name": "Sprint 5",
    "startDate": "2026-04-08",
    "endDate": "2026-04-22"
  },
  "stats": {
    "total": 23,
    "done": 12,
    "inProgress": 5,
    "todo": 4,
    "blocked": 2,
    "progress": 68
  },
  "daysLeft": 8
}
```

**No active sprint:** Return `{ sprint: null, stats: null, daysLeft: null }`

## Implementation

**File:** `server/routes/sprint.routes.ts`

```typescript
router.get('/active', handleAsync(async (_req, res) => {
  const today = new Date();
  
  const sprint = await prisma.sprint.findFirst({
    where: {
      startDate: { lte: today },
      endDate: { gte: today }
    },
    include: { workItems: true }
  });

  if (!sprint) {
    return res.json({ sprint: null, stats: null, daysLeft: null });
  }

  const items = sprint.workItems;
  const stats = {
    total: items.length,
    done: items.filter(i => i.status === 'Done').length,
    inProgress: items.filter(i => i.status === 'InProgress').length,
    todo: items.filter(i => i.status === 'Todo').length,
    blocked: items.filter(i => i.priority === 'Urgent' && i.status !== 'Done').length,
    progress: items.length > 0 
      ? Math.round((items.filter(i => i.status === 'Done').length / items.length) * 100)
      : 0
  };

  const daysLeft = Math.ceil((sprint.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  res.json({ sprint, stats, daysLeft });
}));
```

## Tasks

- [x] Add `/active` route before `/:id` routes (order matters)
- [x] Test endpoint với Postman/curl
- [x] Verify correct sprint is returned based on today's date

## Notes

- Route order: `/active` MUST come before `/:id` to avoid matching "active" as an ID
- Use `findFirst` with date range filter
- Include workItems relation for stats calculation
