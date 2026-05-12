/**
 * Unified auth guard accepting either JWT or API key sessions.
 *
 * Usage:
 *   router.get('/reports', requireAuth(['read:reports']), handler)
 *   router.get('/admin', requireAuth(), handler)  // any authenticated user
 *
 * Scope rules:
 *   - api-key users: must possess ALL requested scopes (intersection check)
 *   - jwt users: always pass (RBAC handled separately per route)
 *   - no req.user: 401
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';

export function requireAuth(requiredScopes: string[] = []): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.type === 'api-key') {
      if (requiredScopes.length === 0) {
        return next();
      }

      const userScopes = req.user.scopes; // narrowed to ApiKeyUser
      const missing = requiredScopes.filter((s) => !userScopes.includes(s));
      if (missing.length > 0) {
        return res.status(403).json({ error: 'Insufficient scope' });
      }

      return next();
    }

    // JWT users (type === 'jwt' or legacy undefined type) — pass through
    return next();
  };
}
