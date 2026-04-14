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
