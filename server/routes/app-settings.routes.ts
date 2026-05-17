/**
 * App-wide settings (singleton).
 * GET /api/app-settings/quarter-config (admin) — fetch fiscal year start
 * PUT /api/app-settings/quarter-config (admin) — update + invalidate cache
 */

import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { handleAsync } from '../utils/async-handler';
import { adminAuth } from '../middleware/admin-auth.middleware';
import { getQuarterConfig, invalidateQuarterConfigCache } from '../lib/quarter-config';
import { invalidatePrefix } from '../lib/external-cache';

export function createAppSettingsRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get(
    '/quarter-config',
    adminAuth,
    handleAsync(async (_req: any, res: any) => {
      const config = await getQuarterConfig(prisma);
      res.json(config);
    }),
  );

  router.put(
    '/quarter-config',
    adminAuth,
    handleAsync(async (req: any, res: any) => {
      const month = Number(req.body?.startMonth);
      const day = Number(req.body?.startDay);
      if (!Number.isInteger(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: 'startMonth must be integer 1-12' });
      }
      if (!Number.isInteger(day) || day < 1 || day > 31) {
        return res.status(400).json({ error: 'startDay must be integer 1-31' });
      }
      const row = await prisma.appSetting.upsert({
        where: { id: 'singleton' },
        create: { id: 'singleton', fiscalYearStartMonth: month, fiscalYearStartDay: day },
        update: { fiscalYearStartMonth: month, fiscalYearStartDay: day },
      });
      invalidateQuarterConfigCache();
      invalidatePrefix('personnel-dashboard');
      res.json({ startMonth: row.fiscalYearStartMonth, startDay: row.fiscalYearStartDay });
    }),
  );

  return router;
}
