/**
 * API Key helpers — generate, extract prefix, hash, compare.
 * Used by: api-key-auth middleware (verify) + admin endpoints phase 02 (generate).
 * Format: smk_<4-hex-prefix>_<28-hex-rest> — total raw key = "smk_" + 32 hex chars.
 * Prefix stored in DB = first 8 chars = "smk_xxxx" for fast lookup.
 */

import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const KEY_PREFIX = 'smk_';
const BCRYPT_COST = 10;

export interface GeneratedApiKey {
  /** Full raw key returned to user exactly once. Never stored. */
  raw: string;
  /** First 8 chars of raw key (e.g. "smk_a1b2") stored in DB for lookup. */
  prefix: string;
  /** bcrypt hash of raw key stored in DB. */
  hash: string;
}

/**
 * Generate a new API key.
 * Returns raw + prefix + hash. Caller must store only prefix and hash.
 */
export async function generateApiKey(): Promise<GeneratedApiKey> {
  const hex = crypto.randomBytes(16).toString('hex'); // 32 hex chars
  const raw = `${KEY_PREFIX}${hex}`;
  const prefix = extractPrefix(raw);
  const hash = await bcrypt.hash(raw, BCRYPT_COST);
  return { raw, prefix, hash };
}

/**
 * Extract the prefix (first 8 chars = "smk_xxxx") from a raw key.
 * Used for DB lookup before bcrypt compare.
 */
export function extractPrefix(raw: string): string {
  return raw.slice(0, 8);
}

/**
 * Validate raw key format: must start with "smk_" followed by exactly 32 hex chars.
 */
export function isValidKeyFormat(raw: string): boolean {
  return /^smk_[0-9a-f]{32}$/.test(raw);
}

/**
 * bcrypt-compare raw key against stored hash.
 */
export async function compareKey(raw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(raw, hash);
}
