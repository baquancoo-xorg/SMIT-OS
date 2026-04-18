import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET must be set in production');
  }
  console.warn('[auth] Using default JWT_SECRET - DO NOT USE IN PRODUCTION');
}
const EFFECTIVE_SECRET = JWT_SECRET || 'dev-secret-change-in-prod';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  role: string;
  isAdmin: boolean;
}

export const authService = {
  signToken(payload: JWTPayload): string {
    return jwt.sign(payload, EFFECTIVE_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, EFFECTIVE_SECRET) as JWTPayload;
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
