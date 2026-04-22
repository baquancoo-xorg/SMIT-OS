# Phase 02 u2014 Backend API

**Status:** completed  
**Priority:** High  
**Depends on:** Phase 01

## Overview

Thu00eam 3 endpoint mu1edbi vu00e0o `work-item.routes.ts`:
1. `GET /api/work-items/epics/graph` u2014 du1eef liu1ec7u cho graph view
2. `POST /api/work-items/dependencies` u2014 tu1ea1o link "related"
3. `DELETE /api/work-items/dependencies/:id` u2014 xu00f3a link

## Related Files

- Modify: `server/routes/work-item.routes.ts`
- Read: `server/schemas/work-item.schema.ts` (thu00eam schema mu1edbi)

## Team Inference Logic

```ts
// Tu00ednh primary team cu1ee7a mu1ed9t epic
function inferEpicTeam(epicId: string, allItems: WorkItemWithAssignee[]) {
  // Lu1ea5y tu1ea5t cu1ea3 task lu00e1 (khu00f4ng phu1ea3i Epic/UserStory) du01b0u1edbi epic
  const tasks = getLeafTasks(epicId, allItems);
  const deptCounts: Record<string, number> = {};
  for (const t of tasks) {
    const dept = t.assignee?.departments?.[0];
    if (dept) deptCounts[dept] = (deptCounts[dept] ?? 0) + 1;
  }
  const teams = Object.keys(deptCounts);
  if (teams.length === 0) return { primaryTeam: 'Unassigned', teams: [] };
  if (teams.length > 1) return { primaryTeam: 'Cross-team', teams };
  return { primaryTeam: teams[0], teams };
}
```

## Implementation Steps

### 1. Thu00eam `workItemDependencySchema` vu00e0o `work-item.schema.ts`

```ts
export const workItemDependencySchema = z.object({
  fromId: z.string().uuid(),
  toId:   z.string().uuid(),
});
```

### 2. Thu00eam `workItemIncludes` includes dependency relations

Cu1eadp nhu1eadt `workItemIncludes` trong `work-item.routes.ts` thu00eam:
```ts
dependenciesFrom: { select: { id: true, toId: true } },
dependenciesTo:   { select: { id: true, fromId: true } },
```

> u26a0ufe0f Khu00f4ng thu00eam vu00e0o existing `workItemIncludes` u2014 tu1ea1o `epicIncludes` riu00eang cho graph endpoint u0111u1ec3 khu00f4ng tu0103ng payload cu1ee7a cu00e1c endpoint hiu1ec7n cu00f3.

### 3. Endpoint `GET /epics/graph`

Thu00eam **tru01b0u1edbc** `router.get('/:id', ...)` u0111u1ec3 tru00e1nh conflict route:

```ts
router.get('/epics/graph', handleAsync(async (_req, res) => {
  // Lu1ea5y tu1ea5t cu1ea3 item vu00e0 dependency links
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
```

### 4. Endpoint `POST /dependencies`

```ts
router.post('/dependencies', handleAsync(async (req, res) => {
  const { fromId, toId } = workItemDependencySchema.parse(req.body);
  if (fromId === toId) return res.status(400).json({ error: 'Cannot link epic to itself' });
  // Enforce bidirectional uniqueness (A-B same as B-A)
  const existing = await prisma.workItemDependency.findFirst({
    where: { OR: [{ fromId, toId }, { fromId: toId, toId: fromId }] },
  });
  if (existing) return res.status(409).json({ error: 'Link already exists' });
  const link = await prisma.workItemDependency.create({ data: { fromId, toId } });
  res.status(201).json(link);
}));
```

### 5. Endpoint `DELETE /dependencies/:id`

```ts
router.delete('/dependencies/:depId', handleAsync(async (req, res) => {
  await prisma.workItemDependency.delete({ where: { id: req.params.depId } });
  res.status(204).send();
}));
```

### 6. Helper functions (inline trong routes file)

```ts
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
```

## Route Order (QUAN TRu1eccNG)

`/epics/graph` phu1ea3i u0111u0103ng ku00fd **tru01b0u1edbc** `/:id` u2014 Express match route theo thu1ee9 tu1ef1.

## Todo

- [x] Thu00eam `workItemDependencySchema` vu00e0o `work-item.schema.ts`
- [x] Thu00eam helper functions (getDescendants, getLeafTasks, inferEpicTeam)
- [x] Thu00eam `GET /epics/graph` (tru01b0u1edbc `/:id`)
- [x] Thu00eam `POST /dependencies`
- [x] Thu00eam `DELETE /dependencies/:depId`
- [x] Test bu1eb1ng curl: `GET /api/work-items/epics/graph`

## Success Criteria

- `GET /api/work-items/epics/graph` tru1ea3 vu1ec1 `{ epics: [...], links: [...] }`
- `POST /api/work-items/dependencies` tu1ea1o link u0111u01b0u1ee3c
- `DELETE /api/work-items/dependencies/:id` xu00f3a link u0111u01b0u1ee3c
- Duplicate link tru1ea3 vu1ec1 409
- Self-link tru1ea3 vu1ec1 400
