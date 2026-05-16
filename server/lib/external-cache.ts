/**
 * Shared in-process LRU cache for external API calls (Jira, SMIT-OS aggregations).
 * 5min TTL by default. Singleton — survives across requests within a single Node process.
 *
 * Migrate to Postgres/Redis when scaling > 20 concurrent users or multi-instance.
 */

import { LRUCache } from 'lru-cache';

const DEFAULT_TTL_MS = 5 * 60 * 1000;

export const externalCache = new LRUCache<string, unknown>({
  max: 500,
  ttl: DEFAULT_TTL_MS,
});

export function cacheKey(...parts: Array<string | number | undefined | null>): string {
  return parts.filter((p) => p !== undefined && p !== null && p !== '').join(':');
}

export function invalidatePrefix(prefix: string): number {
  let n = 0;
  for (const key of externalCache.keys()) {
    if (key.startsWith(prefix)) {
      externalCache.delete(key);
      n++;
    }
  }
  return n;
}

export async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = externalCache.get(key) as T | undefined;
  if (hit !== undefined) return hit;
  const value = await loader();
  externalCache.set(key, value as unknown, { ttl: ttlMs });
  return value;
}
