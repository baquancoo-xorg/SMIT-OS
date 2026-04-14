import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { handleAsync } from '../utils/async-handler';

export function createWorkItemRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get('/', handleAsync(async (_req: any, res: any) => {
    const items = await prisma.workItem.findMany({
      include: { assignee: true, sprint: true },
    });
    const itemsWithKr = items.map((item: any) => ({
      ...item,
      linkedKrId: item.linkedKrId || null,
    }));
    res.json(itemsWithKr);
  }));

  router.get('/:id', handleAsync(async (req: any, res: any) => {
    const item = await prisma.workItem.findUnique({
      where: { id: req.params.id },
      include: { assignee: true, sprint: true },
    });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ ...item, linkedKrId: item.linkedKrId || null });
  }));

  router.post('/', handleAsync(async (req: any, res: any) => {
    const item = await prisma.workItem.create({
      data: req.body,
      include: { assignee: true, sprint: true },
    });
    res.json(item);
  }));

  router.put('/:id', handleAsync(async (req: any, res: any) => {
    const item = await prisma.workItem.update({
      where: { id: req.params.id },
      data: req.body,
      include: { assignee: true, sprint: true },
    });
    res.json(item);
  }));

  router.delete('/:id', handleAsync(async (req: any, res: any) => {
    await prisma.workItem.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }));

  return router;
}
