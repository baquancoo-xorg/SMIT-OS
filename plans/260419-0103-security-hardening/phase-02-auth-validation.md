# Phase 2: Auth Bypass + Input Validation

**Effort:** 1.5h | **Priority:** P0 | **Status:** completed

## Tasks

### 2.1 Fix Daily Report Auth Bypass (daily-report.routes.ts:10-11)

**Current (VULNERABLE):**
```typescript
const { userId, userRole, userDepartment } = req.query; // Client-controlled!
if (userRole === 'Member') {
  where.userId = userId;
}
```

**Fix:**
```typescript
const user = req.user; // From JWT via auth middleware
let where: any = {};

if (user.role === 'Member') {
  where.userId = user.userId;
} else if (user.role.includes('Leader')) {
  // Get user's departments from DB or JWT
  const userData = await prisma.user.findUnique({ 
    where: { id: user.userId },
    select: { departments: true }
  });
  where.OR = [
    { userId: user.userId },
    { user: { departments: { hasSome: userData?.departments || [] } } }
  ];
}
// Admin sees all (no where filter)
```

### 2.2 Add Zod Schemas to Routes

**Files to update:**
- `server/routes/report.routes.ts` - POST /api/reports
- `server/routes/sprint.routes.ts` - POST /api/sprints
- `server/routes/okr-cycle.routes.ts` - POST /api/okr-cycles
- `server/routes/objective.routes.ts` - PUT /api/objectives/:id

**Example schema (report.routes.ts):**
```typescript
import { z } from 'zod';

const createReportSchema = z.object({
  weekEnding: z.string().datetime(),
  teamId: z.string().uuid().optional(),
  highlights: z.string().max(5000).optional(),
  blockers: z.string().max(5000).optional(),
  nextWeekPlan: z.string().max(5000).optional(),
});

router.post('/', handleAsync(async (req: any, res: any) => {
  const data = createReportSchema.parse(req.body);
  const report = await prisma.weeklyReport.create({
    data: {
      ...data,
      weekEnding: new Date(data.weekEnding),
      status: 'Review',
      userId: req.user.userId,
    },
  });
  res.json(report);
}));
```

### 2.3 Create Validation Error Handler

**Add to server/middleware/validation.middleware.ts:**
```typescript
import { ZodError } from 'zod';

export function validationErrorHandler(err: any, req: any, res: any, next: any) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }
  next(err);
}
```

## Checklist

- [x] Daily reports use `req.user` from JWT
- [x] report.routes.ts has Zod schema
- [x] sprint.routes.ts has Zod schema
- [x] okr-cycle.routes.ts has Zod schema
- [x] daily-report.routes.ts has Zod schema
- [x] Validation error handler added
- [x] Test daily report filtering by role
