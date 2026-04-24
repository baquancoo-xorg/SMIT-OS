import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createOKRService } from '../services/okr.service';
import { handleAsync } from '../utils/async-handler';
import { RBAC } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createObjectiveSchema, updateObjectiveSchema } from '../schemas/objective.schema';

export function createObjectiveRoutes(prisma: PrismaClient) {
  const router = Router();
  const okrService = createOKRService(prisma);

  router.get('/', handleAsync(async (_req: any, res: any) => {
    const objectives = await okrService.getAllObjectives();
    res.json(objectives);
  }));

  router.post('/', RBAC.leaderOrAdmin, validate(createObjectiveSchema), handleAsync(async (req: any, res: any) => {
    const objective = await okrService.createObjective(req.body);
    res.json(objective);
  }));

  router.put('/:id', RBAC.leaderOrAdmin, validate(updateObjectiveSchema), handleAsync(async (req: any, res: any) => {
    const objective = await okrService.updateObjective(req.params.id, req.body);
    res.json(objective);
  }));

  router.delete('/:id', RBAC.leaderOrAdmin, handleAsync(async (req: any, res: any) => {
    await okrService.deleteObjective(req.params.id);
    res.status(204).send();
  }));

  // Recalculate progress endpoint (Leader+ can trigger)
  router.post('/recalculate', RBAC.leaderOrAdmin, handleAsync(async (_req: any, res: any) => {
    await okrService.recalculateObjectiveProgress();
    res.json({ success: true });
  }));

  return router;
}
