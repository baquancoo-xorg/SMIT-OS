import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authService } from '../services/auth.service';
import { JWT_COOKIE_NAME, JWT_COOKIE_OPTIONS } from '../lib/cookie-options';

const REFRESH_THRESHOLD_SECONDS = 8 * 60 * 60; // 8 hours — refresh khi token còn <8h (1/3 lifetime). Active user mỗi 16h dùng 1 lần là never expire.

export function createAuthMiddleware(prisma: PrismaClient) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // API key middleware already authenticated this request — skip JWT path entirely
    if (req.user?.type === 'api-key') {
      return next();
    }

    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = authService.verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Block totp-pending tokens from accessing protected routes
    if (payload.purpose === 'totp-pending') {
      return res.status(401).json({ error: 'Complete 2FA login first' });
    }

    // Fetch fresh user data (role could have changed)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isAdmin: true, departments: true, fullName: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Sliding session: refresh token if < 1h remaining
    const remaining = authService.getTokenRemaining(token);
    if (remaining !== null && remaining < REFRESH_THRESHOLD_SECONDS) {
      const newToken = authService.signToken({
        userId: user.id,
        role: user.role,
        isAdmin: user.isAdmin,
      });
      res.cookie(JWT_COOKIE_NAME, newToken, JWT_COOKIE_OPTIONS);
    }

    req.user = {
      type: 'jwt',
      userId: user.id,
      role: user.role,
      isAdmin: user.isAdmin,
      departments: user.departments,
      fullName: user.fullName,
    };

    next();
  };
}
