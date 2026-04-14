# Phase 4: Backend Modularization

**Priority:** HIGH
**Effort:** 3 days
**Status:** completed
**Depends on:** Phase 2

## Overview

Tách 667-line server.ts thành modules: routes, controllers, services.

## Context

**Current state:** [server.ts](../../server.ts)
- 667 dòng code trong 1 file
- API routes mixed với business logic
- Không có separation of concerns

**Target state:**
```
server/
├── middleware/     # Auth, RBAC, validation (from Phase 2)
├── routes/         # Endpoint definitions only
├── controllers/    # Request/response handling
├── services/       # Business logic
└── types/          # TypeScript declarations
server.ts           # ~50 lines setup
```

## Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p server/{routes,controllers,services}
```

### Step 2: Extract Services
**File:** `server/services/user.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export function createUserService(prisma: PrismaClient) {
  return {
    async getAll() {
      return prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          username: true,
          department: true,
          role: true,
          scope: true,
          avatar: true,
          isAdmin: true,
        }
      });
    },

    async getById(id: string) {
      return prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          username: true,
          department: true,
          role: true,
          scope: true,
          avatar: true,
          isAdmin: true,
        }
      });
    },

    async create(data: {
      fullName: string;
      username: string;
      password?: string;
      department?: string;
      role?: string;
      isAdmin?: boolean;
    }) {
      const hashedPassword = await bcrypt.hash(data.password || '123456', 10);

      return prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
        select: {
          id: true,
          fullName: true,
          username: true,
          department: true,
          role: true,
          scope: true,
          avatar: true,
          isAdmin: true,
        }
      });
    },

    async update(id: string, data: Record<string, any>) {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      return prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          fullName: true,
          username: true,
          department: true,
          role: true,
          scope: true,
          avatar: true,
          isAdmin: true,
        }
      });
    },

    async delete(id: string) {
      // Check if last admin
      const user = await prisma.user.findUnique({ where: { id } });
      if (user?.isAdmin) {
        const adminCount = await prisma.user.count({ where: { isAdmin: true } });
        if (adminCount <= 1) {
          throw new Error('Cannot delete the last admin user');
        }
      }

      await prisma.user.delete({ where: { id } });
    },
  };
}

export type UserService = ReturnType<typeof createUserService>;
```

**File:** `server/services/okr.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';

export function createOKRService(prisma: PrismaClient) {
  return {
    async getAllObjectives() {
      return prisma.objective.findMany({
        include: {
          keyResults: true,
          owner: {
            select: {
              id: true,
              fullName: true,
              username: true,
              avatar: true,
              department: true,
            }
          },
          parent: true,
          children: {
            include: {
              keyResults: true,
              owner: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                  avatar: true,
                  department: true,
                }
              }
            }
          }
        },
      });
    },

    async createObjective(data: any) {
      const { keyResults, children, ...objectiveData } = data;
      return prisma.objective.create({
        data: {
          ...objectiveData,
          keyResults: { create: keyResults || [] },
        },
        include: {
          keyResults: true,
          parent: true,
          children: true,
        },
      });
    },

    // Fix N+1: Batch update KRs
    async syncOKRProgress(report: any) {
      if (!report.krProgress) return;

      const krProgressData = JSON.parse(report.krProgress);
      const krIds = krProgressData.map((kr: any) => kr.krId);

      // Single query to get all KRs
      const keyResults = await prisma.keyResult.findMany({
        where: { id: { in: krIds } },
        include: { objective: true }
      });

      const krMap = new Map(keyResults.map(kr => [kr.id, kr]));

      // Prepare batch updates
      const updates = krProgressData.map((kr: any) => {
        const keyResult = krMap.get(kr.krId);
        if (!keyResult) return null;

        let progressPct = kr.progressPct;
        if (kr.currentValue !== undefined && keyResult.targetValue > 0) {
          progressPct = (kr.currentValue / keyResult.targetValue) * 100;
        }

        return prisma.keyResult.update({
          where: { id: kr.krId },
          data: {
            currentValue: kr.currentValue ?? keyResult.currentValue,
            progressPercentage: Math.min(progressPct, 100)
          }
        });
      }).filter(Boolean);

      // Single transaction
      await prisma.$transaction(updates);
      await this.recalculateObjectiveProgress();
    },

    async recalculateObjectiveProgress() {
      const objectives = await prisma.objective.findMany({
        include: {
          keyResults: true,
          children: { include: { keyResults: true } }
        }
      });

      const updates = objectives.map(obj => {
        let progress = 0;

        if (obj.parentId) {
          // L2: average of KRs
          if (obj.keyResults.length > 0) {
            progress = obj.keyResults.reduce((sum, kr) => sum + kr.progressPercentage, 0) / obj.keyResults.length;
          }
        } else {
          // L1: average of L2 children
          if (obj.children.length > 0) {
            const childProgress = obj.children.map(child => {
              if (child.keyResults.length === 0) return 0;
              return child.keyResults.reduce((sum, kr) => sum + kr.progressPercentage, 0) / child.keyResults.length;
            });
            progress = childProgress.reduce((a, b) => a + b, 0) / obj.children.length;
          }
        }

        return prisma.objective.update({
          where: { id: obj.id },
          data: { progressPercentage: Math.round(progress * 100) / 100 }
        });
      });

      await prisma.$transaction(updates);
    },
  };
}

export type OKRService = ReturnType<typeof createOKRService>;
```

### Step 3: Create Controllers
**File:** `server/controllers/user.controller.ts`

```typescript
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export function createUserController(userService: UserService) {
  return {
    async getAll(req: Request, res: Response) {
      const users = await userService.getAll();
      res.json(users);
    },

    async create(req: Request, res: Response) {
      const user = await userService.create(req.body);
      res.json(user);
    },

    async update(req: Request, res: Response) {
      const { password, ...userData } = req.body;
      const data = password ? { ...userData, password } : userData;
      const user = await userService.update(req.params.id, data);
      res.json(user);
    },

    async delete(req: Request, res: Response) {
      try {
        await userService.delete(req.params.id);
        res.status(204).send();
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    },
  };
}
```

### Step 4: Create Routes
**File:** `server/routes/user.routes.ts`

```typescript
import { Router } from 'express';
import { createUserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { RBAC, rbac } from '../middleware/rbac.middleware';
import { handleAsync } from '../utils/async-handler';

export function createUserRoutes(userService: UserService) {
  const router = Router();
  const controller = createUserController(userService);

  router.get('/', handleAsync(controller.getAll));
  router.post('/', RBAC.adminOnly, handleAsync(controller.create));
  router.put('/:id', rbac({ allowSelf: true }), handleAsync(controller.update));
  router.delete('/:id', RBAC.adminOnly, handleAsync(controller.delete));

  return router;
}
```

### Step 5: Create Utils
**File:** `server/utils/async-handler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export function handleAsync(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}
```

### Step 6: Refactor server.ts
**File:** `server.ts` (final ~50 lines)

```typescript
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";

// Middleware
import { createAuthMiddleware } from "./server/middleware/auth.middleware";

// Routes
import { createAuthRoutes } from "./server/routes/auth.routes";
import { createUserRoutes } from "./server/routes/user.routes";
import { createObjectiveRoutes } from "./server/routes/objective.routes";
import { createWorkItemRoutes } from "./server/routes/work-item.routes";
import { createReportRoutes } from "./server/routes/report.routes";
import { createSprintRoutes } from "./server/routes/sprint.routes";

// Services
import { createUserService } from "./server/services/user.service";
import { createOKRService } from "./server/services/okr.service";

const prisma = new PrismaClient();
const app = express();
const PORT = 3005;

// Global middleware
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(cookieParser());

// Services
const userService = createUserService(prisma);
const okrService = createOKRService(prisma);

// Auth middleware
const authMiddleware = createAuthMiddleware(prisma);

// Public routes
app.use("/api/auth", createAuthRoutes(prisma));

// Protected routes
app.use("/api", authMiddleware);
app.use("/api/users", createUserRoutes(userService));
app.use("/api/objectives", createObjectiveRoutes(prisma, okrService));
app.use("/api/work-items", createWorkItemRoutes(prisma));
app.use("/api/reports", createReportRoutes(prisma, okrService));
app.use("/api/sprints", createSprintRoutes(prisma));

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// Vite middleware & start
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server: http://localhost:${PORT}`));
}

startServer();
```

## Files to Create

| File | Purpose |
|------|---------|
| server/services/user.service.ts | User business logic |
| server/services/okr.service.ts | OKR sync & calculation |
| server/services/report.service.ts | Report business logic |
| server/controllers/user.controller.ts | User request handling |
| server/controllers/objective.controller.ts | Objective handling |
| server/controllers/work-item.controller.ts | WorkItem handling |
| server/controllers/report.controller.ts | Report handling |
| server/routes/user.routes.ts | User endpoints |
| server/routes/objective.routes.ts | Objective endpoints |
| server/routes/work-item.routes.ts | WorkItem endpoints |
| server/routes/report.routes.ts | Report endpoints |
| server/routes/sprint.routes.ts | Sprint endpoints |
| server/utils/async-handler.ts | Error handling wrapper |

## Files to Modify

| File | Changes |
|------|---------|
| server.ts | Reduce to ~50 lines setup |

## Migration Strategy

1. Create new files alongside existing code
2. Migrate one route group at a time
3. Test each migration before proceeding
4. Delete old code from server.ts last

## Testing Checklist

- [ ] All existing API endpoints still work
- [ ] Response formats unchanged
- [ ] Error handling consistent
- [ ] server.ts < 100 lines

## Next Phase

After completion, proceed to [Phase 5: Zod Validation](phase-05-zod-validation.md)
