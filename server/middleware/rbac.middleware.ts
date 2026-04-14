import { Request, Response, NextFunction } from 'express';

type Role = 'Admin' | 'Leader' | 'Member';

interface RBACOptions {
  allowedRoles?: Role[];
  allowSelf?: boolean;
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
