// Product Trends Service — line chart timeseries cho Pre-PQL Rate / Signup / FirstSync / Activation by date
// Used by §1 Executive section

import { hogql, isPostHogConfigured } from './posthog-client';
import { getCrmClient } from '../../lib/crm-db';
import type { ProductTrends, TrendPoint } from '../../types/dashboard-product.types';

type Metric = 'signup' | 'firstsync' | 'pre_pql_rate' | 'activation';

export async function getProductTrends(from: string, to: string, metric: Metric): Promise<ProductTrends> {
  let points: TrendPoint[] = [];

  switch (metric) {
    case 'signup':
      points = await getSignupTrend(from, to);
      break;
    case 'firstsync':
      points = await getFirstSyncTrend(from, to);
      break;
    case 'pre_pql_rate':
      points = await getPrePqlRateTrend(from, to);
      break;
    case 'activation':
      points = await getActivationTrend(from, to);
      break;
  }

  return { metric, points };
}

async function getSignupTrend(from: string, to: string): Promise<TrendPoint[]> {
  if (!isPostHogConfigured()) return [];
  const query = `
    SELECT toDate(timestamp) AS date, count() AS value
    FROM events
    WHERE event = 'Tạo doanh nghiệp thành công'
      AND timestamp >= toDateTime('${from}')
      AND timestamp <= toDateTime('${to}')
    GROUP BY date ORDER BY date ASC
  `;
  try {
    const rows = await hogql<Array<[string, number]>>(query);
    return (rows ?? []).map(([date, value]) => ({ date: String(date), value: Number(value) }));
  } catch (err) {
    console.error('[product-trends] signup error:', err);
    return [];
  }
}

async function getFirstSyncTrend(from: string, to: string): Promise<TrendPoint[]> {
  const crm = getCrmClient();
  if (!crm) return [];
  try {
    const rows = await crm.crmBusinessPqlStatus.findMany({
      where: {
        has_first_sync: true,
        first_sync_at: { gte: new Date(from), lte: new Date(to) },
        PEERDB_IS_DELETED: false,
      },
      select: { first_sync_at: true },
    });
    return groupByDate(rows.map((r: any) => r.first_sync_at).filter(Boolean));
  } catch (err) {
    console.error('[product-trends] firstsync error:', err);
    return [];
  }
}

async function getPrePqlRateTrend(from: string, to: string): Promise<TrendPoint[]> {
  // Pre-PQL Rate (PLG Gate #1) — cohort-based theo ngày signup.
  // Denominator: TẤT CẢ business created in day X (crm_businesses).
  // Numerator: business của ngày X có has_first_sync = true (LEFT JOIN crm_business_pql_status).
  // crm_business_pql_status sparse — chỉ track business đã sync, nên LEFT JOIN bắt buộc.
  const crm = getCrmClient();
  if (!crm) return [];
  try {
    const rows = await crm.$queryRaw<Array<{ date: string; total: bigint; synced: bigint }>>`
      SELECT to_char(b.created_at, 'YYYY-MM-DD') AS date,
             count(b.id)::bigint AS total,
             count(CASE WHEN p.has_first_sync THEN 1 END)::bigint AS synced
      FROM crm_businesses b
      LEFT JOIN crm_business_pql_status p ON p.business_id = b.id
      WHERE b."_PEERDB_IS_DELETED" = false
        AND b.created_at >= ${new Date(from)}
        AND b.created_at <= ${new Date(to)}
      GROUP BY date
      ORDER BY date ASC
    `;
    return rows.map((r) => {
      const total = Number(r.total);
      const synced = Number(r.synced);
      return {
        date: r.date,
        value: total > 0 ? Math.round((synced / total) * 1000) / 10 : 0,
      };
    });
  } catch (err) {
    console.error('[product-trends] pre_pql_rate error:', err);
    return [];
  }
}

async function getActivationTrend(from: string, to: string): Promise<TrendPoint[]> {
  if (!isPostHogConfigured()) return [];
  // Activation = businesses với ≥20 events trong ngày (proxy cho ≥2h online)
  const query = `
    SELECT date, count(DISTINCT business_id) AS value
    FROM (
      SELECT toDate(timestamp) AS date, properties.business_id AS business_id, count() AS event_count
      FROM events
      WHERE timestamp >= toDateTime('${from}')
        AND timestamp <= toDateTime('${to}')
        AND properties.business_id IS NOT NULL
        AND properties.business_id != ''
      GROUP BY date, business_id
      HAVING event_count >= 20
    )
    GROUP BY date ORDER BY date ASC
  `;
  try {
    const rows = await hogql<Array<[string, number]>>(query);
    return (rows ?? []).map(([date, value]) => ({ date: String(date), value: Number(value) }));
  } catch (err) {
    console.error('[product-trends] activation error:', err);
    return [];
  }
}

function groupByDate(dates: Date[]): TrendPoint[] {
  const map = new Map<string, number>();
  for (const d of dates) {
    const key = d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}
