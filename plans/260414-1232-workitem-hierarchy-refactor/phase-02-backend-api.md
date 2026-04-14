# Phase 2: Backend API Updates

## Overview

Update work-item routes và services để hỗ trợ hierarchy và KR linking mới.

**Priority:** High | **Effort:** 30m | **Risk:** Low

## Context

- [Work Item Routes](../../server/routes/work-item.routes.ts)
- [Work Item Schema](../../server/schemas/work-item.schema.ts)

## Requirements

### Functional
- API support parentId in CRUD operations
- API support krLinks (junction table)
- Include parent/children in responses

### Non-functional
- Backward compatible responses
- Efficient queries (avoid N+1)

## Implementation Steps

### Step 1: Update Zod Schema

Edit `server/schemas/work-item.schema.ts`:

```typescript
import { z } from 'zod';

export const workItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string(),
  priority: z.string(),
  status: z.string(),
  assigneeId: z.string().uuid().optional().nullable(),
  sprintId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(), // NEW
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  storyPoints: z.number().optional().nullable(),
});

// NEW: Schema for linking KR
export const workItemKrLinkSchema = z.object({
  workItemId: z.string().uuid(),
  keyResultId: z.string().uuid(),
});
```

### Step 2: Update Routes

Edit `server/routes/work-item.routes.ts`:

```typescript
// GET /api/work-items - Include parent and children
router.get('/', async (req, res) => {
  const items = await prisma.workItem.findMany({
    include: {
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
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(items);
});

// POST /api/work-items - Support parentId
router.post('/', async (req, res) => {
  const data = workItemSchema.parse(req.body);
  const item = await prisma.workItem.create({
    data: {
      ...data,
      parentId: data.parentId || null,
    },
    include: {
      assignee: true,
      sprint: true,
      parent: { select: { id: true, title: true, type: true } },
    }
  });
  res.status(201).json(item);
});

// PUT /api/work-items/:id - Support parentId update
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = workItemSchema.partial().parse(req.body);
  const item = await prisma.workItem.update({
    where: { id },
    data,
    include: {
      assignee: true,
      sprint: true,
      parent: { select: { id: true, title: true, type: true } },
      children: { select: { id: true, title: true, type: true, status: true } },
    }
  });
  res.json(item);
});

// NEW: POST /api/work-items/:id/kr-links - Link KR to Epic/Story
router.post('/:id/kr-links', async (req, res) => {
  const { id } = req.params;
  const { keyResultId } = workItemKrLinkSchema.omit({ workItemId: true }).parse(req.body);
  
  const link = await prisma.workItemKrLink.create({
    data: { workItemId: id, keyResultId },
    include: {
      keyResult: {
        include: { objective: { select: { id: true, title: true, department: true } } }
      }
    }
  });
  res.status(201).json(link);
});

// NEW: DELETE /api/work-items/:id/kr-links/:krId - Unlink KR
router.delete('/:id/kr-links/:krId', async (req, res) => {
  const { id, krId } = req.params;
  await prisma.workItemKrLink.delete({
    where: { workItemId_keyResultId: { workItemId: id, keyResultId: krId } }
  });
  res.status(204).end();
});
```

## Todo

- [x] Update Zod schema with parentId
- [x] Add workItemKrLinkSchema
- [x] Update GET /work-items to include parent/children/krLinks
- [x] Update POST /work-items to support parentId
- [x] Update PUT /work-items to support parentId
- [x] Add POST /work-items/:id/kr-links endpoint
- [x] Add DELETE /work-items/:id/kr-links/:krId endpoint
- [x] Add circular reference validation

## Success Criteria

- [x] API accepts parentId in create/update
- [x] API returns parent, children, krLinks
- [x] KR linking endpoints work correctly
