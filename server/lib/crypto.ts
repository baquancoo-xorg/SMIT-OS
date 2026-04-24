import crypto from 'node:crypto';

const ALGO = 'aes-256-gcm';
const SECRET = process.env.APP_SECRET ?? process.env.JWT_SECRET ?? '';

if (SECRET.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: APP_SECRET/JWT_SECRET must be >= 32 chars in production');
  }
  console.warn('[crypto] APP_SECRET/JWT_SECRET should be >= 32 chars (DEV MODE)');
}

const key = crypto.createHash('sha256').update(SECRET).digest();

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decrypt(payload: string): string {
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

export function decryptIfEncrypted(payload: string | null | undefined): string | null {
  if (!payload) {
    return null;
  }

  // Detect if payload looks like base64 encrypted data (our format: iv + tag + ciphertext)
  const isLikelyEncrypted = /^[A-Za-z0-9+/=]{44,}$/.test(payload);
  if (!isLikelyEncrypted) {
    console.warn('[crypto] decryptIfEncrypted: payload does not look encrypted, returning as-is (legacy format?)');
    return payload;
  }

  try {
    return decrypt(payload);
  } catch (err) {
    console.error('[crypto] decryptIfEncrypted: decryption failed for encrypted-looking payload', err);
    throw new Error('Decryption failed - data may be corrupted or key mismatch');
  }
}
