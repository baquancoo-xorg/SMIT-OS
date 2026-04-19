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

  const deadlineNotifications = dueTomorrow
    .filter(item => item.assigneeId)
    .map(item => ({
      userId: item.assigneeId!,
      type: 'deadline_warning',
      title: 'Deadline Approaching',
      message: `"${item.title}" is due tomorrow`,
      entityType: 'WorkItem',
      entityId: item.id,
      priority: 'high' as const,
    }));

  if (deadlineNotifications.length > 0) {
    await prisma.notification.createMany({ data: deadlineNotifications });
  }

  console.log(`[AlertScheduler] Sent ${deadlineNotifications.length} deadline warnings`);
}

async function checkSprintEndings(prisma: PrismaClient, notificationService: NotificationService) {
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  twoDaysFromNow.setHours(0, 0, 0, 0);

  const dayAfter = new Date(twoDaysFromNow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const endingSprints = await prisma.sprint.findMany({
    where: {
      endDate: { gte: twoDaysFromNow, lt: dayAfter },
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
  const activeCycle = await prisma.okrCycle.findFirst({ where: { isActive: true } });
  if (!activeCycle) return;

  const now = new Date();
  const cycleStart = new Date(activeCycle.startDate);
  const cycleEnd = new Date(activeCycle.endDate);
  const cycleDuration = cycleEnd.getTime() - cycleStart.getTime();
  const elapsed = now.getTime() - cycleStart.getTime();
  const progressExpected = (elapsed / cycleDuration) * 100;

  const atRiskObjectives = await prisma.objective.findMany({
    where: {
      progressPercentage: { lt: progressExpected * 0.5 },
      parentId: { not: null },
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
