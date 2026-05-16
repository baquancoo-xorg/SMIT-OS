/**
 * Zone D — SMIT-OS performance snapshot (DailyReport attendance + KR progress).
 * Cache 5min per personnel.
 */

import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { handleAsync } from '../../utils/async-handler';
import { createPersonnelAccess } from '../../middleware/personnel-access';
import { buildSmitosSnapshot } from '../../lib/smitos-metrics-aggregator';
import { cached, cacheKey, invalidatePrefix } from '../../lib/external-cache';

const TTL_MS = 5 * 60 * 1000;

export function createSmitosIntegrationRoutes(prisma: PrismaClient) {
  const router = Router({ mergeParams: true });
  const personnelAccess = createPersonnelAccess(prisma);

  router.get('/', personnelAccess, handleAsync(async (req: any, res: any) => {
    const personnel = await prisma.personnel.findUnique({
      where: { id: req.params.id },
      select: { userId: true },
    });
    if (!personnel) return res.status(404).json({ error: 'Personnel not found' });

    const refresh = req.query.refresh === '1';
    const key = cacheKey('smitos', personnel.userId);
    if (refresh) invalidatePrefix(key);

    const snapshot = await cached(key, TTL_MS, () => buildSmitosSnapshot(prisma, personnel.userId));
    res.json(snapshot);
  }));

  return router;
}
