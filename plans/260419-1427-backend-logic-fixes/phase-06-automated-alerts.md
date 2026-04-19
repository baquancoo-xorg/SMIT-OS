# Phase 6: Automated Alerts

**Priority:** Medium
**Estimated:** 1.5 hours
**Status:** completed
**Depends on:** Phase 3

## Overview

Add scheduled jobs to generate notifications for deadlines, sprint endings, and OKR risks.

## Alert Types

| Alert | Trigger | Recipients | Priority |
|-------|---------|------------|----------|
| Deadline Warning | WorkItem due in 1 day | Assignee | high |
| Sprint Ending | Sprint ends in 2 days | All users in sprint | normal |
| OKR At Risk | Progress < 50% at cycle midpoint | Objective owner | high |

## Implementation Options

### Option A: Express Cron (Simple, In-Process)

Use `node-cron` to run checks within Express server.

```typescript
// server/jobs/alert-scheduler.ts
import cron from 'node-cron';

export function initAlertScheduler(prisma: PrismaClient, notificationService: NotificationService) {
  // Run daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    await checkDeadlines(prisma, notificationService);
    await checkSprintEndings(prisma, notificationService);
    await checkOKRRisks(prisma, notificationService);
  });
}
```

### Option B: Separate Worker (Scalable)

Run alerts in separate process/container.

**Recommendation:** Start with Option A (simpler), migrate to B if needed.

## Implementation Steps

### 1. Install node-cron

```bash
npm install node-cron
npm install -D @types/node-cron
```

### 2. Create alert scheduler

```typescript
// server/jobs/alert-scheduler.ts
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../services/notification.service';

async function checkDeadlines(prisma: PrismaClient, notificationService: NotificationService) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const dueTomorrow = await prisma.workItem.findMany({
    where: {
      dueDate: { gte: tomorrow, lt: dayAfter },
      status: { not: 'Done' },
      assigneeId: { not: null },
    },
  });

  for (const item of dueTomorrow) {
    await notificationService.notifyDeadlineWarning(item);
  }

  console.log(`[AlertScheduler] Sent ${dueTomorrow.length} deadline warnings`);
}

async function checkSprintEndings(prisma: PrismaClient, notificationService: NotificationService) {
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  twoDaysFromNow.setHours(0, 0, 0, 0);

  const endingSprints = await prisma.sprint.findMany({
    where: {
      endDate: {
        gte: twoDaysFromNow,
        lt: new Date(twoDaysFromNow.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: {
      workItems: { select: { assigneeId: true }, where: { assigneeId: { not: null } } },
    },
  });

  for (const sprint of endingSprints) {
    const userIds = [...new Set(sprint.workItems.map(w => w.assigneeId!))];
    if (userIds.length > 0) {
      await notificationService.notifySprintEnding(sprint, userIds, 2);
    }
  }

  console.log(`[AlertScheduler] Notified ${endingSprints.length} ending sprints`);
}

async function checkOKRRisks(prisma: PrismaClient, notificationService: NotificationService) {
  // Get active OKR cycle
  const activeCycle = await prisma.okrCycle.findFirst({ where: { isActive: true } });
  if (!activeCycle) return;

  const now = new Date();
  const cycleStart = new Date(activeCycle.startDate);
  const cycleEnd = new Date(activeCycle.endDate);
  const cycleDuration = cycleEnd.getTime() - cycleStart.getTime();
  const elapsed = now.getTime() - cycleStart.getTime();
  const progressExpected = (elapsed / cycleDuration) * 100;

  // Find objectives significantly behind
  const atRiskObjectives = await prisma.objective.findMany({
    where: {
      progressPercentage: { lt: progressExpected * 0.5 }, // Less than 50% of expected
      parentId: { not: null }, // Only L2 objectives
    },
    include: { owner: { select: { id: true } } },
  });

  for (const obj of atRiskObjectives) {
    if (obj.owner) {
      await notificationService.create({
        userId: obj.owner.id,
        type: 'okr_risk',
        title: 'OKR At Risk',
        message: `"${obj.title}" is at ${obj.progressPercentage.toFixed(0)}% (expected ~${(progressExpected * 0.8).toFixed(0)}%)`,
        entityType: 'Objective',
        entityId: obj.id,
        priority: 'high',
      });
    }
  }

  console.log(`[AlertScheduler] Flagged ${atRiskObjectives.length} at-risk OKRs`);
}

export function initAlertScheduler(prisma: PrismaClient, notificationService: NotificationService) {
  // Run daily at 8:00 AM Vietnam time
  cron.schedule('0 8 * * *', async () => {
    console.log('[AlertScheduler] Running daily checks...');
    try {
      await checkDeadlines(prisma, notificationService);
      await checkSprintEndings(prisma, notificationService);
      await checkOKRRisks(prisma, notificationService);
    } catch (error) {
      console.error('[AlertScheduler] Error:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });

  console.log('[AlertScheduler] Initialized - runs daily at 8:00 AM');
}
```

### 3. Initialize in server.ts

```typescript
// server.ts
import { initAlertScheduler } from './jobs/alert-scheduler';

// After creating services
const notificationService = createNotificationService(prisma);
initAlertScheduler(prisma, notificationService);
```

## Files to Create

- `server/jobs/alert-scheduler.ts`

## Files to Modify

- `server.ts` - Initialize scheduler
- `package.json` - Add node-cron dependency

## Testing

```bash
# Manually trigger for testing (add temp endpoint)
curl -X POST http://localhost:3000/api/admin/trigger-alerts

# Check logs
npm run dev # Watch for "[AlertScheduler]" messages
```

## Checklist

- [x] Install node-cron
- [x] Create alert-scheduler.ts
- [x] Add checkDeadlines function
- [x] Add checkSprintEndings function
- [x] Add checkOKRRisks function
- [x] Initialize in server.ts
- [x] Test manually
- [x] Verify cron timing
