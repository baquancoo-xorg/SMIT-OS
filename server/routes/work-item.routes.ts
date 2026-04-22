import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { handleAsync } from '../utils/async-handler';
import { createWorkItemSchema, updateWorkItemSchema, workItemKrLinkSchema, workItemDependencySchema } from '../schemas/work-item.schema';
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

// --- Epic graph helpers ---
function getDescendants(id: string, all: any[]): any[] {
  const direct = all.filter(i => i.parentId === id);
  return direct.flatMap(c => [c, ...getDescendants(c.id, all)]);
}

function getLeafTasks(epicId: string, all: any[]) {
  return getDescendants(epicId, all).filter(
    i => i.type !== 'Epic' && i.type !== 'UserStory'
  );
}

function inferEpicTeam(epicId: string, all: any[]) {
  const tasks = getLeafTasks(epicId, all);
  const counts: Record<string, number> = {};
  for (const t of tasks) {
    const dept = t.assignee?.departments?.[0];
    if (dept) counts[dept] = (counts[dept] ?? 0) + 1;
  }
  const teams = Object.keys(counts);
  if (!teams.length) return { primaryTeam: 'Unassigned', teams: [] as string[] };
  if (teams.length > 1) return { primaryTeam: 'Cross-team', teams };
  return { primaryTeam: teams[0], teams };
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

  // Epic graph endpoint — must be registered BEFORE /:id
  router.get('/epics/graph', handleAsync(async (_req: any, res: any) => {
    const [allItems, links] = await Promise.all([
      prisma.workItem.findMany({
        include: { assignee: { select: { departments: true } } },
      }),
      prisma.workItemDependency.findMany(),
    ]);
    const epics = allItems.filter(i => i.type === 'Epic');
    const result = epics.map(epic => {
      const { primaryTeam, teams } = inferEpicTeam(epic.id, allItems);
      const descendants = getDescendants(epic.id, allItems);
      const tasks = descendants.filter(i => i.type !== 'Epic' && i.type !== 'UserStory');
      const stories = descendants.filter(i => i.type === 'UserStory');
      const done = tasks.filter(t => t.status === 'Done').length;
      return {
        id: epic.id,
        title: epic.title,
        status: epic.status,
        priority: epic.priority,
        primaryTeam,
        teams,
        progress: tasks.length ? Math.round(done / tasks.length * 100) : 0,
        taskCount: tasks.length,
        storyCount: stories.length,
      };
    });
    res.json({ epics: result, links });
  }));

  // Create dependency link
  router.post('/dependencies', handleAsync(async (req: any, res: any) => {
    const { fromId, toId } = workItemDependencySchema.parse(req.body);
    if (fromId === toId) return res.status(400).json({ error: 'Cannot link epic to itself' });
    const existing = await prisma.workItemDependency.findFirst({
      where: { OR: [{ fromId, toId }, { fromId: toId, toId: fromId }] },
    });
    if (existing) return res.status(409).json({ error: 'Link already exists' });
    const link = await prisma.workItemDependency.create({ data: { fromId, toId } });
    res.status(201).json(link);
  }));

  // Delete dependency link
  router.delete('/dependencies/:depId', handleAsync(async (req: any, res: any) => {
    await prisma.workItemDependency.delete({ where: { id: req.params.depId } });
    res.status(204).send();
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
