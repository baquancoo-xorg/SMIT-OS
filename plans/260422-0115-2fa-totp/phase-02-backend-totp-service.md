---
phase: 02
title: "Backend TOTP Service"
status: completed
priority: critical
effort: 1h
dependsOn: phase-01
---

# Phase 02 u2014 Backend TOTP Service

## Overview

Tu1ea1o `server/services/totp.service.ts` vu00e0 cu1eadp nhu1eadt `server/services/auth.service.ts` u0111u1ec3 hu1ed7 tru1ee3 two-step login.

## Files to Create

- `server/services/totp.service.ts` u2014 TOTP generation, verification, backup codes

## Files to Modify

- `server/services/auth.service.ts` u2014 thu00eam `purpose` field vu00e0o JWT, thu00eam `signTempToken`
- `server/schemas/auth.schema.ts` u2014 thu00eam schemas mu1edbi cho TOTP endpoints

## Implementation Steps

### 1. Cu00e0i u0111u1eb7t dependency

```bash
npm install otpauth
```

`otpauth` lu00e0 library TOTP/HOTP chuu1ea9n (RFC 6238), hu1ed7 tru1ee3 Google Authenticator, Microsoft Authenticator, Authy.

### 2. Tu1ea1o `server/services/totp.service.ts`

```typescript
import * as OTPAuth from 'otpauth';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { encrypt, decrypt } from '../lib/crypto';

const TOTP_ISSUER = 'SMIT OS';
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30;
const BACKUP_CODE_COUNT = 8;

export const totpService = {
  // Generate new TOTP secret + QR URL. Secret is returned plaintext (for QR display only).
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

  // Verify a TOTP code against a plaintext secret. Window=1 allows 30s clock drift.
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

  // Generate 8 one-time backup codes (plain). Caller hashes before storing.
  generateBackupCodes(): string[] {
    return Array.from({ length: BACKUP_CODE_COUNT }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase() // e.g., "A3F2B1C9"
    );
  },

  // Hash backup codes for storage
  async hashBackupCodes(codes: string[]): Promise<string[]> {
    return Promise.all(codes.map(c => bcrypt.hash(c, 10)));
  },

  // Verify a backup code against stored hashed codes. Returns remaining codes if valid.
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

  // Encrypt secret before storing in DB
  encryptSecret: encrypt,
  // Decrypt secret for verification
  decryptSecret: decrypt,
};
```

### 3. Cu1eadp nhu1eadt `server/services/auth.service.ts`

Thu00eam `purpose` field vu00e0o JWT payload vu00e0 `signTempToken` function:

```typescript
export interface JWTPayload {
  userId: string;
  role: string;
  isAdmin: boolean;
  purpose?: 'session' | 'totp-pending'; // 'session' = full auth, 'totp-pending' = awaiting TOTP
}

// Thu00eam vu00e0o authService object:
signTempToken(userId: string): string {
  return jwt.sign(
    { userId, role: '', isAdmin: false, purpose: 'totp-pending' },
    EFFECTIVE_SECRET,
    { expiresIn: '5m' }
  );
},

verifyTempToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, EFFECTIVE_SECRET) as JWTPayload;
    if (payload.purpose !== 'totp-pending') return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
},
```

### 4. Cu1eadp nhu1eadt `server/schemas/auth.schema.ts`

Thu00eam schemas cho cu00e1c endpoint mu1edbi:

```typescript
export const totpVerifySchema = z.object({
  tempToken: z.string().min(1),
  code: z.string().min(6).max(8), // 6 digits TOTP or 8-char backup code
});

export const totpEnableSchema = z.object({
  secret: z.string().min(1), // plaintext secret u0111u01b0u1ee3c tru1ea3 tu1eeb /2fa/setup
  code: z.string().length(6).regex(/^\d+$/),
});

export const totpDisableSchema = z.object({
  password: z.string().min(1),
});
```

## Success Criteria

- [x] `otpauth` install thu00e0nh cu00f4ng
- [x] `totpService.generateSecret()` tru1ea3 vu1ec1 valid base32 secret + otpauth URL
- [x] `totpService.verifyCode()` verify u0111u00fang vu1edbi mu00e3 tu1eeb Google Authenticator
- [x] `authService.signTempToken()` tu1ea1o JWT 5 phu00fat vu1edbi purpose='totp-pending'
- [x] `authService.verifyTempToken()` reject token khu00f4ng u0111u00fang purpose
- [x] TypeScript compile khu00f4ng lu1ed7i

## Security Notes

- TOTP secret u0111u01b0u1ee3c encrypt bu1eb1ng AES-256-GCM tru01b0u1edbc khi lu01b0u vu00e0o DB
- Backup codes u0111u01b0u1ee3c hash bu1eb1ng bcrypt tru01b0u1edbc khi lu01b0u
- Temp token TTL 5 phu00fat, khu00f4ng chu1ee9a role/isAdmin u2192 khu00f4ng thu1ec3 du00f9ng truy cu1eadp API
- `window: 1` trong verify cho phu00e9p clock drift u00b130 giu00e2y
