/**
 * Personnel flags endpoint — live compute on each call (data upstream cached).
 */

import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { handleAsync } from '../../utils/async-handler';
import { createPersonnelAccess } from '../../middleware/personnel-access';
import { calculateFlags } from '../../lib/personnel-flag-calculator';

export function createFlagsRoutes(prisma: PrismaClient) {
  const router = Router({ mergeParams: true });
  const personnelAccess = createPersonnelAccess(prisma);

  router.get('/', personnelAccess, handleAsync(async (req: any, res: any) => {
    const result = await calculateFlags(prisma, req.params.id);
    res.json(result);
  }));

  return router;
}
