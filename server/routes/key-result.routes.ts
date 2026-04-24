import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createOKRService } from '../services/okr.service';
import { handleAsync } from '../utils/async-handler';
import { RBAC } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createKeyResultSchema, updateKeyResultSchema } from '../schemas/objective.schema';

export function createKeyResultRoutes(prisma: PrismaClient) {
  const router = Router();
  const okrService = createOKRService(prisma);

  router.get('/', handleAsync(async (_req: any, res: any) => {
    const keyResults = await prisma.keyResult.findMany({
      include: { objective: true },
    });
    res.json(keyResults);
  }));

  router.post('/', RBAC.leaderOrAdmin, validate(createKeyResultSchema), handleAsync(async (req: any, res: any) => {
    const keyResult = await prisma.keyResult.create({
      data: req.body,
      include: { objective: true },
    });
    res.json(keyResult);
  }));

  router.put('/:id', RBAC.leaderOrAdmin, validate(updateKeyResultSchema), handleAsync(async (req: any, res: any) => {
    const keyResult = await prisma.keyResult.update({
      where: { id: req.params.id },
      data: req.body,
      include: { objective: true },
    });
    await okrService.recalculateObjectiveProgress();
    res.json(keyResult);
  }));

  router.delete('/:id', RBAC.leaderOrAdmin, handleAsync(async (req: any, res: any) => {
    await prisma.keyResult.delete({ where: { id: req.params.id } });
    await okrService.recalculateObjectiveProgress();
    res.status(204).send();
  }));

  return router;
}
