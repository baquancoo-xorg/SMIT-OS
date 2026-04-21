import * as OTPAuth from 'otpauth';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { encrypt, decrypt } from '../lib/crypto';

const TOTP_ISSUER = 'SMIT OS';
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30;
const BACKUP_CODE_COUNT = 8;

export const totpService = {
  generateSecret(username: string): { secret: string; otpauthUrl: string } {
    const totp = new OTPAuth.TOTP({
      issuer: TOTP_ISSUER,
      label: username,
      algorithm: 'SHA1',
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD,
    });
    return {
      secret: totp.secret.base32,
      otpauthUrl: totp.toString(),
    };
  },

  verifyCode(secretBase32: string, code: string): boolean {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: TOTP_ISSUER,
        algorithm: 'SHA1',
        digits: TOTP_DIGITS,
        period: TOTP_PERIOD,
        secret: OTPAuth.Secret.fromBase32(secretBase32),
      });
      const delta = totp.validate({ token: code.replace(/\s/g, ''), window: 1 });
      return delta !== null;
    } catch {
      return false;
    }
  },

  generateBackupCodes(): string[] {
    return Array.from({ length: BACKUP_CODE_COUNT }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );
  },

  async hashBackupCodes(codes: string[]): Promise<string[]> {
    return Promise.all(codes.map(c => bcrypt.hash(c, 10)));
  },

  async verifyAndConsumeBackupCode(
    inputCode: string,
    hashedCodes: string[]
  ): Promise<{ valid: boolean; remaining: string[] }> {
    const normalizedInput = inputCode.replace(/\s/g, '').toUpperCase();
    let matchIndex = -1;

    for (let i = 0; i < hashedCodes.length; i++) {
      const match = await bcrypt.compare(normalizedInput, hashedCodes[i]);
      if (match) { matchIndex = i; break; }
    }

    if (matchIndex === -1) return { valid: false, remaining: hashedCodes };

    const remaining = hashedCodes.filter((_, i) => i !== matchIndex);
    return { valid: true, remaining };
  },

  encryptSecret: encrypt,
  decryptSecret: decrypt,
};
