import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, unknown>({
  max: 100,
  ttl: 5 * 60 * 1000, // 5 minutes
});

export function cacheKey(endpoint: string, from: string, to: string): string {
  return `${endpoint}:${from}:${to}`;
}

export function getCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCached<T>(key: string, val: T): void {
  cache.set(key, val);
}

export function invalidateAll(): void {
  cache.clear();
}

export function getCacheStats() {
  return {
    size: cache.size,
    maxSize: cache.max,
  };
}
