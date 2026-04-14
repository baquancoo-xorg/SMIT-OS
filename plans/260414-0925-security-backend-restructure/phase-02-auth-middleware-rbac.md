# Phase 2: Auth Middleware & RBAC

**Priority:** CRITICAL
**Effort:** 2 days
**Status:** completed
**Depends on:** Phase 1

## Overview

Tạo middleware bảo vệ tất cả API routes và implement Role-Based Access Control.

## Context

**Current state:** [server.ts](../../server.ts)
- Tất cả routes public
- Line 52-66: GET /api/users không check auth
- Line 398-423: Approve report lấy role từ request body

**Target state:**
- Middleware verify JWT trên mọi request
- RBAC check quyền dựa trên role trong JWT
- Role KHÔNG lấy từ frontend

## RBAC Matrix

| Endpoint | Admin | Leader | Member |
|----------|-------|--------|--------|
| GET /api/users | ✅ | ✅ (same dept) | ❌ |
| POST /api/users | ✅ | ❌ | ❌ |
| PUT /api/users/:id | ✅ | ❌ | ✅ (self) |
| DELETE /api/users/:id | ✅ | ❌ | ❌ |
| GET /api/objectives | ✅ | ✅ | ✅ |
| POST /api/objectives | ✅ | ✅ | ❌ |
| GET /api/work-items | ✅ | ✅ | ✅ (assigned) |
| POST /api/work-items | ✅ | ✅ | ✅ |
| GET /api/reports | ✅ | ✅ (team) | ✅ (own) |
| POST /api/reports/:id/approve | ✅ | ✅ (team) | ❌ |
| GET /api/daily-reports | ✅ | ✅ (team) | ✅ (own) |
| POST /api/daily-reports/:id/approve | ✅ | ✅ (team) | ❌ |

## Implementation Steps

### Step 1: Extend Express Request Type
**File:** `server/types/express.d.ts`

```typescript
import { JWTPayload } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & {
        department?: string;
      };
    }
  }
}

export {};
```

### Step 2: Create Auth Middleware
**File:** `server/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authService } from '../services/auth.service';

export function createAuthMiddleware(prisma: PrismaClient) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = authService.verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch fresh user data (role could have changed)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isAdmin: true, department: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      userId: user.id,
      role: user.role,
      isAdmin: user.isAdmin,
      department: user.department,
    };

    next();
  };
}
```

### Step 3: Create RBAC Middleware
**File:** `server/middleware/rbac.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

type Role = 'Admin' | 'Leader' | 'Member';

interface RBACOptions {
  allowedRoles?: Role[];
  allowSelf?: boolean;        // User can access own resource
  allowSameDept?: boolean;    // Leader can access same department
  allowTeam?: boolean;        // Leader can access team members
  adminOnly?: boolean;
}

export function rbac(options: RBACOptions = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Admin bypasses all checks
    if (user.isAdmin) {
      return next();
    }

    // Admin-only endpoint
    if (options.adminOnly) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Check allowed roles
    if (options.allowedRoles) {
      const userRole = user.isAdmin ? 'Admin' : 
        user.role?.includes('Leader') ? 'Leader' : 'Member';
      
      if (!options.allowedRoles.includes(userRole as Role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }

    // Self-access check (for /users/:id routes)
    if (options.allowSelf && req.params.id === user.userId) {
      return next();
    }

    // For routes requiring ownership check, let controller handle it
    // Just pass through if role check passed
    next();
  };
}

// Preset RBAC configurations
export const RBAC = {
  adminOnly: rbac({ adminOnly: true }),
  authenticated: rbac({}),
  leaderOrAdmin: rbac({ allowedRoles: ['Admin', 'Leader'] }),
  selfOrAdmin: rbac({ allowSelf: true }),
};
```

### Step 4: Apply Middleware to Routes
**Update:** `server.ts`

```typescript
import { createAuthMiddleware } from './server/middleware/auth.middleware';
import { RBAC, rbac } from './server/middleware/rbac.middleware';

const authMiddleware = createAuthMiddleware(prisma);

// Public routes (no middleware)
app.use('/api/auth', createAuthRoutes(prisma));

// Protected routes
app.use('/api', authMiddleware);

// Users - Admin only for create/delete
app.post('/api/users', RBAC.adminOnly, /* existing handler */);
app.delete('/api/users/:id', RBAC.adminOnly, /* existing handler */);
app.put('/api/users/:id', rbac({ allowSelf: true }), /* existing handler */);

// Reports approve - Leader or Admin
app.post('/api/reports/:id/approve', RBAC.leaderOrAdmin, /* handler */);
app.post('/api/daily-reports/:id/approve', RBAC.leaderOrAdmin, /* handler */);
```

### Step 5: Fix Trust Client Role Issue
**Current code (INSECURE):**
```typescript
// server.ts line 398-423
app.post("/api/reports/:id/approve", handleAsync(async (req, res) => {
  const { approverId } = req.body; // ❌ FROM CLIENT
  // ...
}));
```

**Fixed code:**
```typescript
app.post("/api/reports/:id/approve", RBAC.leaderOrAdmin, handleAsync(async (req, res) => {
  const approverId = req.user!.userId; // ✅ FROM JWT
  
  const report = await prisma.weeklyReport.update({
    where: { id: req.params.id },
    data: {
      status: 'Approved',
      approvedBy: approverId,
      approvedAt: new Date()
    },
    include: { user: true }
  });
  // ...
}));
```

### Step 6: Add Team/Department Check for Leaders
**File:** `server/middleware/rbac.middleware.ts` (extend)

```typescript
export function checkTeamAccess(prisma: PrismaClient) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || user.isAdmin) return next();

    // For report endpoints, check if leader can access
    if (req.params.id && user.role?.includes('Leader')) {
      const report = await prisma.weeklyReport.findUnique({
        where: { id: req.params.id },
        include: { user: { select: { department: true, role: true } } }
      });

      if (!report) return res.status(404).json({ error: 'Not found' });

      // Leader can only approve their department's Members
      const isSameDept = report.user.department === user.department;
      const isMember = report.user.role === 'Member';

      if (!isSameDept || !isMember) {
        return res.status(403).json({ error: 'Can only approve your team members' });
      }
    }

    next();
  };
}
```

## Files to Create

| File | Purpose |
|------|---------|
| server/middleware/auth.middleware.ts | JWT verification middleware |
| server/middleware/rbac.middleware.ts | Role-based access control |
| server/types/express.d.ts | Extend Request with user |

## Files to Modify

| File | Changes |
|------|---------|
| server.ts | Apply middleware to routes, fix approve handlers |
| tsconfig.json | Include server/types |

## Testing Checklist

- [ ] Unauthenticated request to /api/users returns 401
- [ ] Member cannot POST /api/users (403)
- [ ] Member CAN PUT /api/users/:ownId (200)
- [ ] Member cannot PUT /api/users/:otherId (403)
- [ ] Leader can approve team member's report
- [ ] Leader cannot approve other dept's report
- [ ] Admin can access everything

## Security Considerations

- NEVER trust role from request body
- Always fetch fresh role from DB via JWT userId
- Leader access scoped to department only
- All endpoints protected except /api/auth/*

## Next Phase

After completion, proceed to [Phase 3: Frontend Auth Update](phase-03-frontend-auth-update.md)
