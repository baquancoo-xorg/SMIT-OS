import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { handleAsync } from '../utils/async-handler';

export function createSprintRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get('/', handleAsync(async (_req: any, res: any) => {
    const sprints = await prisma.sprint.findMany();
    res.json(sprints);
  }));

  router.post('/', handleAsync(async (req: any, res: any) => {
    const sprint = await prisma.sprint.create({
      data: {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      },
    });
    res.json(sprint);
  }));

  router.put('/:id', handleAsync(async (req: any, res: any) => {
    const data: any = { ...req.body };
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const sprint = await prisma.sprint.update({
      where: { id: req.params.id },
      data,
    });
    res.json(sprint);
  }));

  router.delete('/:id', handleAsync(async (req: any, res: any) => {
    await prisma.sprint.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }));

  return router;
}
