import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authService } from '../services/auth.service';
import { totpService } from '../services/totp.service';
import { validate } from '../middleware/validate.middleware';
import { loginSchema, totpVerifySchema, totpEnableSchema, totpDisableSchema } from '../schemas/auth.schema';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 4 * 60 * 60 * 1000, // 4 hours (matches JWT_EXPIRES_IN)
};

// clearCookie should NOT have maxAge
const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

export function createAuthRoutes(prisma: PrismaClient) {
  const router = Router();

  // Inline auth middleware for protected 2FA management endpoints (full session only)
  const requireAuth = (req: any, res: any, next: any) => {
    const token = req.cookies?.jwt;
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    const payload = authService.verifyToken(token);
    if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });
    if (payload.purpose === 'totp-pending') return res.status(401).json({ error: 'Complete 2FA login first' });
    req.user = payload;
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    next();
  };

  // Login step 1: verify password
  router.post('/login', validate(loginSchema), async (req, res) => {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.totpEnabled) {
      const tempToken = authService.signTempToken(user.id);
      return res.json({ requiresTOTP: true, tempToken });
    }

    const token = authService.signToken({
      userId: user.id,
      role: user.role,
      isAdmin: user.isAdmin,
    });
    res.cookie('jwt', token, COOKIE_OPTIONS);
    const { password: _, totpSecret: __, totpBackupCodes: ___, ...safeUser } = user;
    res.json(safeUser);
  });

  // Login step 2: verify TOTP code or backup code
  router.post('/login/totp', validate(totpVerifySchema), async (req, res) => {
    const { tempToken, code } = req.body;

    const temp = authService.verifyTempToken(tempToken);
    if (!temp) return res.status(401).json({ error: 'Invalid or expired session' });

    const user = await prisma.user.findUnique({ where: { id: temp.userId } });
    if (!user || !user.totpEnabled || !user.totpSecret)
      return res.status(401).json({ error: 'User not found or 2FA not configured' });

    let decryptedSecret: string;
    try {
      decryptedSecret = totpService.decryptSecret(user.totpSecret);
    } catch {
      return res.status(500).json({ error: 'Configuration error' });
    }

    if (totpService.verifyCode(decryptedSecret, code)) {
      const token = authService.signToken({ userId: user.id, role: user.role, isAdmin: user.isAdmin });
      res.cookie('jwt', token, COOKIE_OPTIONS);
      const { password: _, totpSecret: __, totpBackupCodes: ___, ...safeUser } = user;
      return res.json(safeUser);
    }

    const { valid, remaining } = await totpService.verifyAndConsumeBackupCode(code, user.totpBackupCodes);
    if (valid) {
      await prisma.user.update({ where: { id: user.id }, data: { totpBackupCodes: remaining } });
      const token = authService.signToken({ userId: user.id, role: user.role, isAdmin: user.isAdmin });
      res.cookie('jwt', token, COOKIE_OPTIONS);
      const { password: _, totpSecret: __, totpBackupCodes: ___, ...safeUser } = user;
      return res.json({ ...safeUser, backupCodeUsed: true, lowBackupCodes: remaining.length <= 2 });
    }

    return res.status(401).json({ error: 'Invalid authentication code' });
  });

  // Logout
  router.post('/logout', (_req, res) => {
    res.clearCookie('jwt', CLEAR_COOKIE_OPTIONS);
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
      res.clearCookie('jwt', CLEAR_COOKIE_OPTIONS);
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
        totpEnabled: true,
      }
    });

    if (!user) {
      res.clearCookie('jwt', CLEAR_COOKIE_OPTIONS);
      return res.status(401).json({ error: 'User not found' });
    }

    res.json(user);
  });

  // Generate TOTP secret + QR URL for setup. Stores encrypted secret in DB (pending, totpEnabled=false).
  router.get('/2fa/setup', requireAuth, async (req: any, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { username: true, totpEnabled: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.totpEnabled) return res.status(400).json({ error: '2FA already enabled' });

    const { secret, otpauthUrl } = totpService.generateSecret(user.username);
    // Store encrypted secret server-side immediately; enable route reads it from DB
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { totpSecret: totpService.encryptSecret(secret) },
    });
    res.json({ secret, otpauthUrl });
  });

  // Enable 2FA: reads secret from DB (set by setup), verifies code, then activates
  router.post('/2fa/enable', requireAuth, validate(totpEnableSchema), async (req: any, res) => {
    const { code } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { totpSecret: true, totpEnabled: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.totpEnabled) return res.status(400).json({ error: '2FA already enabled' });
    if (!user.totpSecret) return res.status(400).json({ error: 'Run setup first' });

    let decryptedSecret: string;
    try {
      decryptedSecret = totpService.decryptSecret(user.totpSecret);
    } catch {
      return res.status(500).json({ error: 'Configuration error' });
    }

    if (!totpService.verifyCode(decryptedSecret, code))
      return res.status(400).json({ error: 'Invalid verification code' });

    const plainBackupCodes = totpService.generateBackupCodes();
    const hashedBackupCodes = await totpService.hashBackupCodes(plainBackupCodes);

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { totpEnabled: true, totpBackupCodes: hashedBackupCodes },
    });

    res.json({ success: true, backupCodes: plainBackupCodes });
  });

  // Disable 2FA after password confirmation
  router.post('/2fa/disable', requireAuth, validate(totpDisableSchema), async (req: any, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { password: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { totpEnabled: false, totpSecret: null, totpBackupCodes: [] }
    });

    res.json({ success: true });
  });

  // Admin reset 2FA for any user
  router.post('/2fa/admin-reset/:userId', requireAuth, requireAdmin, async (req: any, res) => {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await prisma.user.update({
      where: { id: userId },
      data: { totpEnabled: false, totpSecret: null, totpBackupCodes: [] }
    });

    res.json({ success: true });
  });

  return router;
}
