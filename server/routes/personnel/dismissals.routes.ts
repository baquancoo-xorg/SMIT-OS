/**
 * Dismiss / snooze attention flags.
 * POST   /api/personnel/dismissals       — body: { personnelId, flagCode, snoozeDays? }
 * DELETE /api/personnel/dismissals/:id   — restore (un-dismiss)
 * GET    /api/personnel/dismissals       — list active (snoozeUntil > now OR null)
 *
 * Cache invalidation: any mutation drops 'personnel-dashboard' prefix.
 */

import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { handleAsync } from '../../utils/async-handler';
import { adminAuth } from '../../middleware/admin-auth.middleware';
import { invalidatePrefix } from '../../lib/external-cache';

const VALID_CODES = new Set(['skill_regression', 'low_attendance', 'kr_at_risk', 'assessment_overdue']);
const VALID_SNOOZE_DAYS = new Set([7, 14, 30]);

export function createDismissalsRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get(
    '/',
    adminAuth,
    handleAsync(async (_req: any, res: any) => {
      const now = new Date();
      const rows = await prisma.attentionDismissal.findMany({
        where: { OR: [{ snoozeUntil: null }, { snoozeUntil: { gt: now } }] },
        orderBy: { dismissedAt: 'desc' },
      });
      res.json(rows);
    }),
  );

  router.post(
    '/',
    adminAuth,
    handleAsync(async (req: any, res: any) => {
      const { personnelId, flagCode, snoozeDays } = req.body ?? {};
      if (typeof personnelId !== 'string' || !personnelId) {
        return res.status(400).json({ error: 'personnelId required' });
      }
      if (typeof flagCode !== 'string' || !VALID_CODES.has(flagCode)) {
        return res.status(400).json({ error: 'flagCode invalid' });
      }
      let snoozeUntil: Date | null = null;
      if (snoozeDays !== undefined && snoozeDays !== null) {
        const n = Number(snoozeDays);
        if (!VALID_SNOOZE_DAYS.has(n)) return res.status(400).json({ error: 'snoozeDays must be 7, 14, or 30' });
        snoozeUntil = new Date(Date.now() + n * 24 * 60 * 60 * 1000);
      }
      const dismissedById = req.user?.id;
      const row = await prisma.attentionDismissal.upsert({
        where: { personnelId_flagCode: { personnelId, flagCode } },
        create: { personnelId, flagCode, dismissedById, snoozeUntil },
        update: { dismissedById, snoozeUntil, dismissedAt: new Date() },
      });
      invalidatePrefix('personnel-dashboard');
      res.json(row);
    }),
  );

  router.delete(
    '/:id',
    adminAuth,
    handleAsync(async (req: any, res: any) => {
      await prisma.attentionDismissal.delete({ where: { id: req.params.id } });
      invalidatePrefix('personnel-dashboard');
      res.status(204).end();
    }),
  );

  return router;
}
