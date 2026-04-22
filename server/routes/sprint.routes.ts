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
    today.setUTCHours(0, 0, 0, 0);

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
      inProgress: items.filter(i => i.status === 'In Progress').length,
      todo: items.filter(i => i.status === 'Todo' || i.status === 'To Do').length,
      blocked: items.filter(i => i.priority === 'Urgent' && i.status !== 'Done').length,
      progress: items.length > 0
        ? Math.round((items.filter(i => i.status === 'Done').length / items.length) * 100)
        : 0
    };

    const daysLeft = Math.ceil((sprint.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    res.json({ sprint, stats, daysLeft });
  }));

  // Get incomplete items for a sprint (preview before ending) - MUST be before /:id
  router.get('/:id/incomplete', handleAsync(async (req: any, res: any) => {
    const { id } = req.params;

    const incompleteItems = await prisma.workItem.findMany({
      where: { sprintId: id, status: { not: 'Done' } },
      include: { assignee: { select: { id: true, fullName: true, avatar: true } } }
    });

    const currentSprint = await prisma.sprint.findUnique({ where: { id } });
    const nextSprint = currentSprint
      ? await prisma.sprint.findFirst({
          where: { startDate: { gt: currentSprint.endDate } },
          orderBy: { startDate: 'asc' }
        })
      : null;

    res.json({ incompleteItems, nextSprint });
  }));

  // Complete a sprint: move incomplete items to next sprint or unassigned
  router.post('/:id/complete', RBAC.adminOnly, handleAsync(async (req: any, res: any) => {
    const { id } = req.params;

    const currentSprint = await prisma.sprint.findUnique({ where: { id } });
    if (!currentSprint) return res.status(404).json({ error: 'Sprint not found' });

    const nextSprint = await prisma.sprint.findFirst({
      where: { startDate: { gt: currentSprint.endDate } },
      orderBy: { startDate: 'asc' }
    });

    const updated = await prisma.workItem.updateMany({
      where: { sprintId: id, status: { not: 'Done' } },
      data: { sprintId: nextSprint?.id ?? null }
    });

    // Set endDate to yesterday UTC so active query no longer matches this sprint
    const yesterday = new Date();
    yesterday.setUTCHours(0, 0, 0, 0);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    await prisma.sprint.update({
      where: { id },
      data: { endDate: yesterday }
    });

    res.json({
      movedCount: updated.count,
      movedTo: nextSprint ? nextSprint.name : null
    });
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
