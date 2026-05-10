/**
 * Convert AdSpendRecord rows to a single VND-normalized total.
 * Mirrors the pattern in `server/services/dashboard/overview-ad-spend.ts` —
 * USD spend × global VND rate, VND spend stays as-is.
 */
import { getGlobalExchangeRate } from '../../lib/currency-converter';

export interface SpendRowLike {
  spend: number | { toString(): string };
  currency: string;
}

let cachedRate: { value: number; expiresAt: number } | null = null;

export async function getCachedVndRate(): Promise<number> {
  if (cachedRate && Date.now() < cachedRate.expiresAt) return cachedRate.value;
  const rate = await getGlobalExchangeRate().catch(() => 27000);
  const safe = isFinite(rate) && rate > 0 ? rate : 27000;
  cachedRate = { value: safe, expiresAt: Date.now() + 60_000 };
  return safe;
}

export async function sumSpendInVnd(rows: SpendRowLike[]): Promise<number> {
  const rate = await getCachedVndRate();
  let total = 0;
  for (const r of rows) {
    const n = typeof r.spend === 'number' ? r.spend : Number(r.spend.toString());
    if (!isFinite(n)) continue;
    total += r.currency === 'USD' ? n * rate : n;
  }
  return total;
}

export function spendInVnd(spend: number | { toString(): string }, currency: string, rate: number): number {
  const n = typeof spend === 'number' ? spend : Number(spend.toString());
  if (!isFinite(n)) return 0;
  return currency === 'USD' ? n * rate : n;
}
