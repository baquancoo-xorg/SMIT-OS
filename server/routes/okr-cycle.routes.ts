import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { handleAsync } from '../utils/async-handler';
import { validate } from '../middleware/validate.middleware';
import { createOkrCycleSchema, updateOkrCycleSchema } from '../schemas/okr-cycle.schema';
import { RBAC } from '../middleware/rbac.middleware';

export function createOkrCycleRoutes(prisma: PrismaClient) {
  const router = Router();

  // Get all cycles
  router.get('/', handleAsync(async (_req: any, res: any) => {
    const cycles = await prisma.okrCycle.findMany({
      orderBy: { startDate: 'desc' },
    });
    res.json(cycles);
  }));

  // Get active cycle
  router.get('/active', handleAsync(async (_req: any, res: any) => {
    const cycle = await prisma.okrCycle.findFirst({
      where: { isActive: true },
    });
    res.json(cycle);
  }));

  // Create cycle (admin only)
  router.post('/', RBAC.adminOnly, validate(createOkrCycleSchema), handleAsync(async (req: any, res: any) => {
    const cycle = await prisma.okrCycle.create({
      data: {
        name: req.body.name,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        isActive: req.body.isActive || false,
      },
    });
    res.json(cycle);
  }));

  // Update cycle (admin only)
  router.put('/:id', RBAC.adminOnly, validate(updateOkrCycleSchema), handleAsync(async (req: any, res: any) => {
    const data: any = { ...req.body };
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    // Atomic activation - wrap deactivate + activate in transaction (BUG-006)
    if (data.isActive === true) {
      const [, cycle] = await prisma.$transaction([
        prisma.okrCycle.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        }),
        prisma.okrCycle.update({
          where: { id: req.params.id },
          data,
        }),
      ]);
      return res.json(cycle);
    }

    const cycle = await prisma.okrCycle.update({
      where: { id: req.params.id },
      data,
    });
    res.json(cycle);
  }));

  // Delete cycle (admin only)
  router.delete('/:id', RBAC.adminOnly, handleAsync(async (req: any, res: any) => {
    await prisma.okrCycle.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }));

  return router;
}
