import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('FATAL: JWT_SECRET must be set and >= 32 chars');
}
const JWT_EXPIRES_IN = '4h'; // Reduced from 7d for security

export interface JWTPayload {
  userId: string;
  role: string;
  isAdmin: boolean;
  purpose?: 'session' | 'totp-pending';
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

  signTempToken(userId: string): string {
    return jwt.sign(
      { userId, role: '', isAdmin: false, purpose: 'totp-pending' },
      JWT_SECRET,
      { expiresIn: '5m' }
    );
  },

  verifyTempToken(token: string): { userId: string } | null {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
      if (payload.purpose !== 'totp-pending') return null;
      return { userId: payload.userId };
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
  },

  getTokenRemaining(token: string): number | null {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload & { exp?: number };
      if (!payload.exp) return null;
      const nowSec = Math.floor(Date.now() / 1000);
      return Math.max(0, payload.exp - nowSec);
    } catch {
      return null;
    }
  }
};
