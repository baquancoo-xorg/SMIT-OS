/**
 * Personnel dashboard aggregate endpoint.
 * GET /api/personnel/dashboard?quarter=YYYY-Qn (admin-only)
 * Cached 5min per quarter param.
 */

import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { handleAsync } from '../../utils/async-handler';
import { adminAuth } from '../../middleware/admin-auth.middleware';
import { buildPersonnelDashboard } from '../../lib/personnel-dashboard-aggregator';
import { getQuarterConfig, resolveQuarter } from '../../lib/quarter-config';
import { cached, cacheKey } from '../../lib/external-cache';

const TTL_MS = 5 * 60 * 1000;

export function createDashboardRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get(
    '/',
    adminAuth,
    handleAsync(async (req: any, res: any) => {
      let quarter = typeof req.query.quarter === 'string' ? req.query.quarter : '';
      if (!/^\d{4}-Q[1-4]$/.test(quarter)) {
        const config = await getQuarterConfig(prisma);
        quarter = resolveQuarter(new Date(), config);
      }
      const data = await cached(cacheKey('personnel-dashboard', quarter), TTL_MS, () =>
        buildPersonnelDashboard(prisma, quarter),
      );
      res.json(data);
    }),
  );

  return router;
}
