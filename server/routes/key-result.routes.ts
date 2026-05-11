import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createOKRService } from '../services/okr.service';
import { handleAsync } from '../utils/async-handler';
import { RBAC } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createKeyResultSchema, updateKeyResultSchema } from '../schemas/objective.schema';
import { requireAuth } from '../middleware/require-auth';

export function createKeyResultRoutes(prisma: PrismaClient) {
  const router = Router();
  const okrService = createOKRService(prisma);

  router.get('/', requireAuth(['read:okr']), handleAsync(async (req: any, res: any) => {
    const { ownerId } = req.query;
    const where: any = {};
    if (typeof ownerId === 'string' && ownerId) {
      where.ownerId = ownerId;
    }

    const keyResults = await prisma.keyResult.findMany({
      where,
      include: {
        objective: true,
        owner: { select: { id: true, fullName: true, avatar: true } },
      },
    });
    res.json(keyResults);
  }));

  // Create KR: admin only (Objective L1 structure changes are admin-only per RBAC matrix).
  router.post('/', RBAC.adminOnly, validate(createKeyResultSchema), handleAsync(async (req: any, res: any) => {
    const keyResult = await prisma.keyResult.create({
      data: req.body,
      include: { objective: true, owner: { select: { id: true, fullName: true, avatar: true } } },
    });
    res.json(keyResult);
  }));

  // Update KR: owner of KR or admin (read-shared, write-own pattern).
  router.put('/:id', validate(updateKeyResultSchema), handleAsync(async (req: any, res: any) => {
    const user = req.user!;
    const existing = await prisma.keyResult.findUnique({
      where: { id: req.params.id },
      select: { ownerId: true },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const isOwner = !!existing.ownerId && existing.ownerId === user.userId;
    if (!user.isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Forbidden — only KR owner or admin can edit' });
    }

    const keyResult = await prisma.keyResult.update({
      where: { id: req.params.id },
      data: req.body,
      include: { objective: true, owner: { select: { id: true, fullName: true, avatar: true } } },
    });
    await okrService.recalculateObjectiveProgress();
    res.json(keyResult);
  }));

  // Delete KR: admin only (structural change to OKR tree).
  router.delete('/:id', RBAC.adminOnly, handleAsync(async (req: any, res: any) => {
    await prisma.keyResult.delete({ where: { id: req.params.id } });
    await okrService.recalculateObjectiveProgress();
    res.status(204).send();
  }));

  return router;
}
