import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { handleAsync } from '../utils/async-handler';
import { createWorkItemSchema, updateWorkItemSchema, workItemKrLinkSchema } from '../schemas/work-item.schema';
import { createOwnershipMiddleware } from '../middleware/ownership.middleware';

// Validate parentId to prevent circular references
async function validateParentId(
  prisma: PrismaClient,
  itemId: string | undefined,
  parentId: string | null | undefined
): Promise<{ valid: boolean; error?: string }> {
  if (!parentId) return { valid: true };
  if (itemId === parentId) return { valid: false, error: 'Cannot set item as its own parent' };

  // Check for circular chain
  let current: string | null = parentId;
  const visited = new Set<string>();
  while (current) {
    if (visited.has(current)) return { valid: false, error: 'Circular parent reference detected' };
    if (current === itemId) return { valid: false, error: 'Circular parent reference detected' };
    visited.add(current);
    const parent = await prisma.workItem.findUnique({
      where: { id: current },
      select: { parentId: true }
    });
    current = parent?.parentId || null;
  }
  return { valid: true };
}

export function createWorkItemRoutes(prisma: PrismaClient) {
  const router = Router();
  const checkOwnership = createOwnershipMiddleware(prisma);

  // Include relations for all queries
  const workItemIncludes = {
    assignee: true,
    sprint: true,
    parent: { select: { id: true, title: true, type: true } },
    children: { select: { id: true, title: true, type: true, status: true } },
    krLinks: {
      include: {
        keyResult: {
          include: { objective: { select: { id: true, title: true, department: true } } }
        }
      }
    }
  };

  router.get('/', handleAsync(async (_req: any, res: any) => {
    const items = await prisma.workItem.findMany({
      include: workItemIncludes,
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  }));

  router.get('/:id', handleAsync(async (req: any, res: any) => {
    const item = await prisma.workItem.findUnique({
      where: { id: req.params.id },
      include: workItemIncludes,
    });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  }));

  router.post('/', handleAsync(async (req: any, res: any) => {
    const data = createWorkItemSchema.parse(req.body);

    // Validate parentId
    const parentValidation = await validateParentId(prisma, undefined, data.parentId);
    if (!parentValidation.valid) {
      return res.status(400).json({ error: parentValidation.error });
    }

    const item = await prisma.workItem.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status,
        priority: data.priority,
        assigneeId: data.assigneeId,
        sprintId: data.sprintId,
        parentId: data.parentId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
      },
      include: workItemIncludes,
    });
    res.status(201).json(item);
  }));

  router.put('/:id', handleAsync(async (req: any, res: any) => {
    const { id } = req.params;
    const data = updateWorkItemSchema.parse(req.body);

    // Validate parentId if provided
    if (data.parentId !== undefined) {
      const parentValidation = await validateParentId(prisma, id, data.parentId);
      if (!parentValidation.valid) {
        return res.status(400).json({ error: parentValidation.error });
      }
    }

    const updateData: any = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.startDate) updateData.startDate = new Date(data.startDate);

    const item = await prisma.workItem.update({
      where: { id },
      data: updateData,
      include: workItemIncludes,
    });
    res.json(item);
  }));

  router.delete('/:id', checkOwnership('workItem'), handleAsync(async (req: any, res: any) => {
    await prisma.workItem.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }));

  // KR Linking endpoints
  router.post('/:id/kr-links', handleAsync(async (req: any, res: any) => {
    const { id } = req.params;
    const { keyResultId } = workItemKrLinkSchema.parse(req.body);

    const link = await prisma.workItemKrLink.create({
      data: { workItemId: id, keyResultId },
      include: {
        keyResult: {
          include: { objective: { select: { id: true, title: true, department: true } } }
        }
      }
    });
    res.status(201).json(link);
  }));

  router.delete('/:id/kr-links/:krId', handleAsync(async (req: any, res: any) => {
    const { id, krId } = req.params;
    await prisma.workItemKrLink.delete({
      where: { workItemId_keyResultId: { workItemId: id, keyResultId: krId } }
    });
    res.status(204).send();
  }));

  return router;
}
