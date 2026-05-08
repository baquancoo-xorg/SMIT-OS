// Product Time-to-Value Service — histogram days(Created→FirstSync) + days(FirstSync→PQL) + p50/p90
// Used by §2 Funnel TTV Histogram

import { getCrmClient } from '../../lib/crm-db';
import type { ProductTtv, TtvBucket, TtvStep } from '../../types/dashboard-product.types';

const BUCKETS: Array<{ label: string; min: number; max: number }> = [
  { label: '0-1d', min: 0, max: 1 },
  { label: '2-3d', min: 2, max: 3 },
  { label: '4-7d', min: 4, max: 7 },
  { label: '8-14d', min: 8, max: 14 },
  { label: '15-30d', min: 15, max: 30 },
  { label: '30d+', min: 31, max: Infinity },
];

export async function getProductTtv(from: string, to: string): Promise<ProductTtv> {
  const crm = getCrmClient();
  if (!crm) {
    return {
      steps: [
        emptyStep('created', 'first_sync'),
        emptyStep('first_sync', 'feature_activated'),
        emptyStep('feature_activated', 'pql'),
      ],
    };
  }

  try {
    const rows = await crm.crmBusinessPqlStatus.findMany({
      where: {
        first_sync_at: { gte: new Date(from), lte: new Date(to) },
        has_first_sync: true,
        PEERDB_IS_DELETED: false,
      },
      select: {
        createdAt: true, // Prisma maps `created_at` → `createdAt`
        first_sync_at: true,
        feature_activated_at: true,
        pql_achieved_at: true,
        has_feature_activated: true,
        is_pql: true,
      },
    });

    const createdToFirstSync = rows
      .filter((r: any) => r.createdAt && r.first_sync_at)
      .map((r: any) => daysBetween(r.createdAt, r.first_sync_at));

    const firstSyncToFeature = rows
      .filter((r: any) => r.has_feature_activated && r.first_sync_at && r.feature_activated_at)
      .map((r: any) => daysBetween(r.first_sync_at, r.feature_activated_at));

    const featureToPql = rows
      .filter((r: any) => r.is_pql && r.feature_activated_at && r.pql_achieved_at)
      .map((r: any) => daysBetween(r.feature_activated_at, r.pql_achieved_at));

    return {
      steps: [
        buildStep('created', 'first_sync', createdToFirstSync),
        buildStep('first_sync', 'feature_activated', firstSyncToFeature),
        buildStep('feature_activated', 'pql', featureToPql),
      ],
    };
  } catch (err) {
    console.error('[product-ttv] error:', err);
    return {
      steps: [
        emptyStep('created', 'first_sync'),
        emptyStep('first_sync', 'feature_activated'),
        emptyStep('feature_activated', 'pql'),
      ],
    };
  }
}

// Float days for accurate avg (e.g. 6.62 instead of floor=6 hoặc 0)
function daysBetween(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return Math.max(0, diff / (1000 * 60 * 60 * 24));
}

function buildStep(from: string, to: string, days: number[]): TtvStep {
  const buckets: TtvBucket[] = BUCKETS.map((b) => ({
    label: b.label,
    count: days.filter((d) => d >= b.min && d <= b.max).length,
  }));

  const sorted = [...days].sort((a, b) => a - b);
  const p50 = percentile(sorted, 0.5);
  const p90 = percentile(sorted, 0.9);
  const avgDays = days.length > 0 ? days.reduce((a, b) => a + b, 0) / days.length : 0;

  return {
    from,
    to,
    buckets,
    p50,
    p90,
    avgDays: Math.round(avgDays * 10) / 10,
    sampleSize: days.length,
  };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}

function emptyStep(from: string, to: string): TtvStep {
  return {
    from,
    to,
    buckets: BUCKETS.map((b) => ({ label: b.label, count: 0 })),
    p50: 0,
    p90: 0,
    avgDays: 0,
    sampleSize: 0,
  };
}
