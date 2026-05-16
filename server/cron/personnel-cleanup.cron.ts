/**
 * Weekly cron — hard-delete soft-deleted records > 2 years old.
 * Tables: SkillAssessment, PersonalityResult.
 * Schedule: Sunday 03:17 (off-hours, low-traffic).
 */

import cron from 'node-cron';
import type { PrismaClient } from '@prisma/client';
import { childLogger } from '../lib/logger';

const log = childLogger('personnel-cleanup-cron');
const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

export function startPersonnelCleanupCron(prisma: PrismaClient) {
  cron.schedule('17 3 * * 0', async () => {
    const cutoff = new Date(Date.now() - TWO_YEARS_MS);
    const start = Date.now();
    log.info({ cutoff }, 'started');
    try {
      const [skill, personality] = await Promise.all([
        prisma.skillAssessment.deleteMany({ where: { deletedAt: { lt: cutoff } } }),
        prisma.personalityResult.deleteMany({ where: { deletedAt: { lt: cutoff } } }),
      ]);
      log.info({ skill: skill.count, personality: personality.count, durationMs: Date.now() - start }, 'done');
    } catch (err) {
      log.error({ err }, 'failed');
    }
  });
}
