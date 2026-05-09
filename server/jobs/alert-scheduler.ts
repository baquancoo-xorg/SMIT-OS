import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../services/notification.service';
import { childLogger } from '../lib/logger';

const log = childLogger('alert-scheduler');

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

  log.info({ count: atRiskObjectives.length }, 'flagged at-risk OKRs');
}

export function initAlertScheduler(prisma: PrismaClient, notificationService: NotificationService) {
  cron.schedule('0 8 * * *', async () => {
    log.info('running daily checks');
    try {
      await checkOKRRisks(prisma, notificationService);
    } catch (error) {
      log.error({ err: error }, 'error during daily checks');
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });

  log.info('initialized - runs daily at 8:00 AM');
}
