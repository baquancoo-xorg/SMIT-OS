import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { handleAsync } from '../utils/async-handler';
import { validate } from '../middleware/validate.middleware';
import { createSprintSchema, updateSprintSchema } from '../schemas/sprint.schema';
import { RBAC } from '../middleware/rbac.middleware';

export function createSprintRoutes(prisma: PrismaClient) {
  const router = Router();

  // Get active sprint with stats - MUST be before /:id
  router.get('/active', handleAsync(async (_req: any, res: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sprint = await prisma.sprint.findFirst({
      where: {
        startDate: { lte: today },
        endDate: { gte: today }
      },
      include: { workItems: true }
    });

    if (!sprint) {
      return res.json({ sprint: null, stats: null, daysLeft: null });
    }

    const items = sprint.workItems;
    const stats = {
      total: items.length,
      done: items.filter(i => i.status === 'Done').length,
      inProgress: items.filter(i => i.status === 'InProgress').length,
      todo: items.filter(i => i.status === 'Todo').length,
      blocked: items.filter(i => i.priority === 'Urgent' && i.status !== 'Done').length,
      progress: items.length > 0
        ? Math.round((items.filter(i => i.status === 'Done').length / items.length) * 100)
        : 0
    };

    const daysLeft = Math.ceil((sprint.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    res.json({ sprint, stats, daysLeft });
  }));

  router.get('/', handleAsync(async (_req: any, res: any) => {
    const sprints = await prisma.sprint.findMany();
    res.json(sprints);
  }));

  router.post('/', RBAC.adminOnly, validate(createSprintSchema), handleAsync(async (req: any, res: any) => {
    const sprint = await prisma.sprint.create({
      data: {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      },
    });
    res.json(sprint);
  }));

  router.put('/:id', RBAC.adminOnly, validate(updateSprintSchema), handleAsync(async (req: any, res: any) => {
    const data: any = { ...req.body };
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const sprint = await prisma.sprint.update({
      where: { id: req.params.id },
      data,
    });
    res.json(sprint);
  }));

  router.delete('/:id', RBAC.adminOnly, handleAsync(async (req: any, res: any) => {
    await prisma.sprint.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }));

  return router;
}
