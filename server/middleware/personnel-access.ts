/**
 * Access guard for /api/personnel/:id routes.
 * Admin: full access. Member: only own profile (userId match).
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { PrismaClient } from '@prisma/client';

export function createPersonnelAccess(prisma: PrismaClient): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (user.type === 'api-key') {
      return res.status(403).json({ error: 'API key not allowed on personnel routes' });
    }
    if (user.isAdmin) return next();

    const personnelId = req.params.id;
    if (!personnelId) return res.status(400).json({ error: 'Missing personnel id' });

    const personnel = await prisma.personnel.findUnique({
      where: { id: personnelId },
      select: { userId: true },
    });
    if (!personnel) return res.status(404).json({ error: 'Personnel not found' });
    if (personnel.userId !== user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  if (user.type === 'api-key' || !user.isAdmin) {
    return res.status(403).json({ error: 'Admin required' });
  }
  next();
}
