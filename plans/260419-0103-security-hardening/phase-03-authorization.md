# Phase 3: Authorization (RBAC + Ownership)

**Effort:** 1h | **Priority:** P1 | **Status:** completed

## Tasks

### 3.1 Create Ownership Check Middleware

**Create server/middleware/ownership.middleware.ts:**
```typescript
import { PrismaClient } from '@prisma/client';

type ResourceType = 'report' | 'dailyReport' | 'workItem' | 'sprint';

export function createOwnershipMiddleware(prisma: PrismaClient) {
  return (resourceType: ResourceType) => async (req: any, res: any, next: any) => {
    const { id } = req.params;
    const user = req.user;

    // Admins can do anything
    if (user.isAdmin) return next();

    const resourceMap: Record<ResourceType, () => Promise<any>> = {
      report: () => prisma.weeklyReport.findUnique({ where: { id }, select: { userId: true } }),
      dailyReport: () => prisma.dailyReport.findUnique({ where: { id }, select: { userId: true } }),
      workItem: () => prisma.workItem.findUnique({ where: { id }, select: { createdById: true } }),
      sprint: () => prisma.sprint.findUnique({ where: { id }, select: { id: true } }), // Admin only
    };

    const resource = await resourceMap[resourceType]();
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check ownership
    const ownerId = resource.userId || resource.createdById;
    if (ownerId && ownerId !== user.userId) {
      return res.status(403).json({ error: 'Not authorized to modify this resource' });
    }

    next();
  };
}
```

### 3.2 Apply to DELETE Endpoints

**report.routes.ts:**
```typescript
const checkOwnership = createOwnershipMiddleware(prisma);

router.delete('/:id', 
  checkOwnership('report'),
  handleAsync(async (req: any, res: any) => {
    await prisma.weeklyReport.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);
```

**daily-report.routes.ts:**
```typescript
router.delete('/:id',
  checkOwnership('dailyReport'),
  handleAsync(async (req: any, res: any) => {
    await prisma.dailyReport.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);
```

**sprint.routes.ts (Admin only):**
```typescript
router.delete('/:id',
  RBAC.requireAdmin,
  handleAsync(async (req: any, res: any) => {
    await prisma.sprint.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);
```

**work-item.routes.ts:**
```typescript
router.delete('/:id',
  checkOwnership('workItem'),
  handleAsync(async (req: any, res: any) => {
    await prisma.workItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);
```

## Checklist

- [x] Ownership middleware created
- [x] DELETE /api/reports/:id checks ownership
- [x] DELETE /api/daily-reports/:id checks ownership
- [x] DELETE /api/sprints/:id requires admin
- [x] DELETE /api/work-items/:id checks ownership
- [x] Test: Member cannot delete others' reports
- [x] Test: Admin can delete any resource
