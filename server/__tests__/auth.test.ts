// Auth + TOTP smoke tests — pure functions only (no DB).
// Run: npm test
//
// Requires JWT_SECRET >= 32 chars in environment (loaded from .env).

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { authService } from '../services/auth.service';
import { totpService } from '../services/totp.service';
import * as OTPAuth from 'otpauth';

describe('auth.service', () => {
  it('signs and verifies session token round-trip', () => {
    const token = authService.signToken({ userId: 'u1', role: 'Admin', isAdmin: true });
    const payload = authService.verifyToken(token);
    assert.ok(payload);
    assert.strictEqual(payload!.userId, 'u1');
    assert.strictEqual(payload!.role, 'Admin');
    assert.strictEqual(payload!.isAdmin, true);
  });

  it('rejects tampered tokens', () => {
    const token = authService.signToken({ userId: 'u1', role: 'Admin', isAdmin: true });
    const tampered = token.slice(0, -4) + 'XXXX';
    const payload = authService.verifyToken(tampered);
    assert.strictEqual(payload, null);
  });

  it('temp token has totp-pending purpose', () => {
    const token = authService.signTempToken('u-tmp');
    const payload = authService.verifyToken(token);
    assert.strictEqual(payload?.purpose, 'totp-pending');
  });

  it('verifyTempToken accepts only totp-pending tokens', () => {
    const tempToken = authService.signTempToken('u-tmp');
    const sessionToken = authService.signToken({ userId: 'u1', role: 'Admin', isAdmin: true });

    assert.deepStrictEqual(authService.verifyTempToken(tempToken), { userId: 'u-tmp' });
    assert.strictEqual(authService.verifyTempToken(sessionToken), null);
  });

  it('getTokenRemaining returns positive seconds for fresh token', () => {
    const token = authService.signToken({ userId: 'u1', role: 'Admin', isAdmin: true });
    const remaining = authService.getTokenRemaining(token);
    assert.ok(remaining !== null);
    assert.ok(remaining! > 0);
    assert.ok(remaining! <= 24 * 3600); // <= 24h (extended from 4h in commit 68d94d5)
  });
});

describe('totp.service', () => {
  it('generates secret + otpauth URL', () => {
    const { secret, otpauthUrl } = totpService.generateSecret('test@example.com');
    assert.match(secret, /^[A-Z2-7]+$/); // base32
    assert.match(otpauthUrl, /^otpauth:\/\/totp\//);
    assert.match(otpauthUrl, /test%40example\.com/); // URL-encoded
  });

  it('verifyCode accepts current TOTP within window', () => {
    const { secret } = totpService.generateSecret('test@example.com');
    const totp = new OTPAuth.TOTP({
      issuer: 'SMIT OS',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });
    const validCode = totp.generate();
    assert.strictEqual(totpService.verifyCode(secret, validCode), true);
    assert.strictEqual(totpService.verifyCode(secret, '000000'), false);
  });

  it('generates 8 unique 8-char backup codes', () => {
    const codes = totpService.generateBackupCodes();
    assert.strictEqual(codes.length, 8);
    codes.forEach((c) => assert.match(c, /^[0-9A-F]{8}$/));
    assert.strictEqual(new Set(codes).size, 8); // all unique
  });

  it('verifyAndConsumeBackupCode atomically consumes one code', async () => {
    const codes = totpService.generateBackupCodes();
    const hashed = await totpService.hashBackupCodes(codes);

    const r1 = await totpService.verifyAndConsumeBackupCode(codes[0], hashed);
    assert.strictEqual(r1.valid, true);
    assert.strictEqual(r1.remaining.length, 7);

    const r2 = await totpService.verifyAndConsumeBackupCode('WRONGCODE', hashed);
    assert.strictEqual(r2.valid, false);
    assert.strictEqual(r2.remaining.length, 8);
  });

  it('verifyAndConsumeBackupCode normalizes whitespace + case', async () => {
    const codes = totpService.generateBackupCodes();
    const hashed = await totpService.hashBackupCodes(codes);

    const lowercased = codes[0].toLowerCase();
    const withSpaces = ` ${lowercased.slice(0, 4)} ${lowercased.slice(4)} `;
    const r = await totpService.verifyAndConsumeBackupCode(withSpaces, hashed);
    assert.strictEqual(r.valid, true);
  });
});
