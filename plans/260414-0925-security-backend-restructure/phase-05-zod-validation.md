# Phase 5: Zod Input Validation

**Priority:** MEDIUM
**Effort:** 2 days
**Status:** completed
**Depends on:** Phase 4

## Overview

Thêm input validation với Zod cho tất cả POST/PUT endpoints.

## Context

**Current state:**
- Không có input validation
- req.body được trust trực tiếp
- Có thể inject invalid data

**Target state:**
- All inputs validated với Zod schemas
- Type-safe request handlers
- Clear error messages

## Implementation Steps

### Step 1: Install Zod
```bash
npm install zod
```

### Step 2: Create Validation Middleware
**File:** `server/middleware/validate.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }
      next(error);
    }
  };
}

// For query params
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: error.errors,
        });
      }
      next(error);
    }
  };
}
```

### Step 3: Create Schemas
**File:** `server/schemas/auth.schema.ts`

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username required').max(50),
  password: z.string().min(1, 'Password required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

**File:** `server/schemas/user.schema.ts`

```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(1, 'Full name required').max(100),
  username: z.string()
    .min(3, 'Username min 3 chars')
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username: letters, numbers, underscores only'),
  password: z.string().min(6, 'Password min 6 chars').optional(),
  department: z.string().max(50).optional(),
  role: z.string().max(50).optional(),
  scope: z.string().max(100).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  isAdmin: z.boolean().optional().default(false),
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

**File:** `server/schemas/objective.schema.ts`

```typescript
import { z } from 'zod';

export const keyResultSchema = z.object({
  title: z.string().min(1).max(200),
  targetValue: z.number().min(0).default(100),
  currentValue: z.number().min(0).default(0),
  unit: z.string().max(20).optional(),
  progressPercentage: z.number().min(0).max(100).default(0),
});

export const createObjectiveSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  description: z.string().max(1000).optional(),
  level: z.enum(['L1', 'L2']).optional(),
  department: z.string().max(50).optional(),
  ownerId: z.string().uuid().optional(),
  parentId: z.string().uuid().nullable().optional(),
  progressPercentage: z.number().min(0).max(100).default(0),
  keyResults: z.array(keyResultSchema).optional(),
});

export const updateObjectiveSchema = createObjectiveSchema.partial();

export type CreateObjectiveInput = z.infer<typeof createObjectiveSchema>;
```

**File:** `server/schemas/work-item.schema.ts`

```typescript
import { z } from 'zod';

export const createWorkItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['Task', 'Bug', 'Story', 'Epic']).default('Task'),
  status: z.enum(['Backlog', 'Todo', 'InProgress', 'Review', 'Done']).default('Backlog'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  storyPoints: z.number().min(0).max(100).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  sprintId: z.string().uuid().nullable().optional(),
  linkedKrId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateWorkItemSchema = createWorkItemSchema.partial();

export type CreateWorkItemInput = z.infer<typeof createWorkItemSchema>;
```

**File:** `server/schemas/report.schema.ts`

```typescript
import { z } from 'zod';

export const createWeeklyReportSchema = z.object({
  userId: z.string().uuid(),
  weekEnding: z.string().datetime(),
  summary: z.string().max(2000).optional(),
  accomplishments: z.string().max(5000).optional(),
  blockers: z.string().max(2000).optional(),
  nextWeekPlan: z.string().max(5000).optional(),
  krProgress: z.string().optional(), // JSON string
});

export const createDailyReportSchema = z.object({
  userId: z.string().uuid(),
  reportDate: z.string().datetime(),
  tasksData: z.union([z.string(), z.array(z.any())]),
  blockers: z.string().max(2000).optional(),
  impactLevel: z.enum(['None', 'Low', 'Medium', 'High']).default('None'),
});

export type CreateWeeklyReportInput = z.infer<typeof createWeeklyReportSchema>;
export type CreateDailyReportInput = z.infer<typeof createDailyReportSchema>;
```

### Step 4: Apply to Routes
**File:** `server/routes/user.routes.ts` (updated)

```typescript
import { validate } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

router.post('/', 
  RBAC.adminOnly, 
  validate(createUserSchema), 
  handleAsync(controller.create)
);

router.put('/:id', 
  rbac({ allowSelf: true }), 
  validate(updateUserSchema), 
  handleAsync(controller.update)
);
```

### Step 5: Update Controllers for Type Safety
**File:** `server/controllers/user.controller.ts` (updated)

```typescript
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';

async create(req: Request<{}, {}, CreateUserInput>, res: Response) {
  // req.body is now typed as CreateUserInput
  const user = await userService.create(req.body);
  res.json(user);
}
```

## Files to Create

| File | Purpose |
|------|---------|
| server/middleware/validate.middleware.ts | Zod validation middleware |
| server/schemas/auth.schema.ts | Auth input schemas |
| server/schemas/user.schema.ts | User input schemas |
| server/schemas/objective.schema.ts | Objective schemas |
| server/schemas/work-item.schema.ts | WorkItem schemas |
| server/schemas/report.schema.ts | Report schemas |
| server/schemas/sprint.schema.ts | Sprint schemas |
| server/schemas/index.ts | Re-export all schemas |

## Files to Modify

| File | Changes |
|------|---------|
| server/routes/*.ts | Add validate() middleware |
| server/controllers/*.ts | Add type annotations |

## Validation Rules

| Field Type | Rules |
|------------|-------|
| UUID | `.uuid()` |
| Email | `.email()` |
| URL | `.url()` |
| Date | `.datetime()` |
| Required string | `.min(1)` |
| Optional | `.optional()` |
| Nullable | `.nullable()` |
| Enum | `.enum([...])` |
| Number range | `.min().max()` |

## Error Response Format

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "username", "message": "Username min 3 chars" },
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

## Testing Checklist

- [ ] Invalid username returns 400 with clear message
- [ ] Missing required fields return 400
- [ ] Valid data passes through unchanged
- [ ] Type inference works in controllers
- [ ] Nested object validation works

## Next Phase

After completion, proceed to [Phase 6: Performance Optimization](phase-06-performance-optimization.md)
