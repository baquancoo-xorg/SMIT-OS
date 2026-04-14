import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createOKRService } from '../services/okr.service';
import { handleAsync } from '../utils/async-handler';

export function createObjectiveRoutes(prisma: PrismaClient) {
  const router = Router();
  const okrService = createOKRService(prisma);

  router.get('/', handleAsync(async (_req: any, res: any) => {
    const objectives = await okrService.getAllObjectives();
    res.json(objectives);
  }));

  router.post('/', handleAsync(async (req: any, res: any) => {
    const objective = await okrService.createObjective(req.body);
    res.json(objective);
  }));

  router.put('/:id', handleAsync(async (req: any, res: any) => {
    const objective = await okrService.updateObjective(req.params.id, req.body);
    res.json(objective);
  }));

  router.delete('/:id', handleAsync(async (req: any, res: any) => {
    await okrService.deleteObjective(req.params.id);
    res.status(204).send();
  }));

  // Recalculate progress endpoint
  router.post('/recalculate', handleAsync(async (_req: any, res: any) => {
    await okrService.recalculateObjectiveProgress();
    res.json({ success: true });
  }));

  return router;
}
