# Phase 1: JWT Authentication Implementation

**Priority:** CRITICAL
**Effort:** 2 days
**Status:** completed

## Overview

Implement JWT-based authentication với httpOnly cookies để thay thế localStorage auth.

## Context

**Current state:** [AuthContext.tsx](../../src/contexts/AuthContext.tsx)
- Line 29: `localStorage.getItem('smit_os_user_id')`
- Line 58: `localStorage.setItem('smit_os_user_id', user.id)`
- Ai biết UUID có thể impersonate user

**Target state:**
- JWT token trong httpOnly cookie
- Token không accessible từ JavaScript
- Server validate JWT mỗi request

## Requirements

### Functional
- POST /api/auth/login → Set JWT cookie
- POST /api/auth/logout → Clear cookie
- GET /api/auth/me → Return current user từ JWT
- POST /api/auth/refresh → Refresh token (optional)

### Non-Functional
- JWT expires sau 7 days
- httpOnly + Secure + SameSite=Strict
- Secret từ .env

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install jsonwebtoken cookie-parser
npm install -D @types/jsonwebtoken @types/cookie-parser
```

### Step 2: Create Auth Service
**File:** `server/services/auth.service.ts`

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  role: string;
  isAdmin: boolean;
}

export const authService = {
  signToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return null;
    }
  },

  async validateCredentials(prisma: PrismaClient, username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return null;
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
};
```

### Step 3: Create Auth Routes
**File:** `server/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authService } from '../services/auth.service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export function createAuthRoutes(prisma: PrismaClient) {
  const router = Router();

  // Login
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await authService.validateCredentials(prisma, username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = authService.signToken({
      userId: user.id,
      role: user.role,
      isAdmin: user.isAdmin,
    });

    res.cookie('jwt', token, COOKIE_OPTIONS);
    res.json(user);
  });

  // Logout
  router.post('/logout', (req, res) => {
    res.clearCookie('jwt', COOKIE_OPTIONS);
    res.json({ success: true });
  });

  // Get current user
  router.get('/me', async (req, res) => {
    const token = req.cookies?.jwt;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const payload = authService.verifyToken(token);
    if (!payload) {
      res.clearCookie('jwt', COOKIE_OPTIONS);
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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

    if (!user) {
      res.clearCookie('jwt', COOKIE_OPTIONS);
      return res.status(401).json({ error: 'User not found' });
    }

    res.json(user);
  });

  return router;
}
```

### Step 4: Update server.ts
```typescript
import cookieParser from 'cookie-parser';
import { createAuthRoutes } from './server/routes/auth.routes';

app.use(cookieParser());

// Auth routes (public)
app.use('/api/auth', createAuthRoutes(prisma));
```

### Step 5: Add .env JWT_SECRET
```bash
# .env
JWT_SECRET=your-super-secret-key-min-32-chars
```

### Step 6: Add .env.example
```bash
# .env.example
JWT_SECRET=change-this-in-production
```

## Files to Create

| File | Purpose |
|------|---------|
| server/services/auth.service.ts | JWT sign/verify, password validation |
| server/routes/auth.routes.ts | /api/auth/* endpoints |
| server/types/express.d.ts | Extend Request type |

## Files to Modify

| File | Changes |
|------|---------|
| server.ts | Add cookie-parser, mount auth routes |
| .env | Add JWT_SECRET |
| .gitignore | Ensure .env ignored |

## Testing Checklist

- [ ] POST /api/auth/login returns user + sets cookie
- [ ] POST /api/auth/login with wrong password returns 401
- [ ] GET /api/auth/me with valid cookie returns user
- [ ] GET /api/auth/me without cookie returns 401
- [ ] POST /api/auth/logout clears cookie
- [ ] Cookie is httpOnly (not accessible via document.cookie)

## Security Considerations

- JWT_SECRET MUST be in .env, never hardcoded
- Use different secret in production
- Cookie SameSite=Strict prevents CSRF
- httpOnly prevents XSS token theft

## Rollback Plan

If issues, revert to localStorage temporarily:
1. Remove cookie-parser middleware
2. Comment out auth routes
3. Frontend keeps localStorage fallback

## Next Phase

After completion, proceed to [Phase 2: Auth Middleware & RBAC](phase-02-auth-middleware-rbac.md)
