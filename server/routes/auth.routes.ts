import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authService } from '../services/auth.service';
import { validate } from '../middleware/validate.middleware';
import { loginSchema } from '../schemas/auth.schema';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export function createAuthRoutes(prisma: PrismaClient) {
  const router = Router();

  // Login
  router.post('/login', validate(loginSchema), async (req, res) => {
    const { username, password } = req.body;

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
  router.post('/logout', (_req, res) => {
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
        departments: true,
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
