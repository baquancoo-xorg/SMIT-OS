// Product Cohort Service — Retention heatmap (week cohort × D0/D1/D7/D14/D30)
// HIGH RISK: HogQL CTE phức tạp. Cache 1h. Timeout fallback empty cohorts với message.

import { hogql, isPostHogConfigured } from './posthog-client';
import type { ProductCohort, CohortRetention } from '../../types/dashboard-product.types';

const RETENTION_DAYS = [0, 1, 7, 14, 30] as const;
const COHORT_TIMEOUT_MS = 10_000;

export async function getProductCohort(from: string, to: string): Promise<ProductCohort> {
  if (!isPostHogConfigured()) {
    return { cohorts: [], message: 'PostHog not configured' };
  }

  // Cohort = week of business creation. Retention = % active at D-N
  // NOTE: min(timestamp) is already DateTime64 — wrapping in toDateTime() throws "illegal type".
  // NOTE: HogQL CTE alias scope is fragile — use subqueries inline instead of WITH joins.
  const query = `
    SELECT
      formatDateTime(c.cohort_week, '%G-W%V') AS cohort,
      cs.size AS cohort_size,
      dateDiff('day', c.cohort_week, a.act_date) AS days_since,
      count(DISTINCT a.bid) AS active_count
    FROM (
      SELECT
        properties.business_id AS bid,
        toStartOfWeek(min(timestamp)) AS cohort_week
      FROM events
      WHERE event = 'Tạo doanh nghiệp thành công'
        AND timestamp >= toDateTime('${from}')
        AND timestamp <= toDateTime('${to}')
        AND properties.business_id IS NOT NULL
        AND properties.business_id != ''
      GROUP BY bid
    ) AS c
    JOIN (
      SELECT cohort_week, count(DISTINCT bid) AS size
      FROM (
        SELECT properties.business_id AS bid, toStartOfWeek(min(timestamp)) AS cohort_week
        FROM events
        WHERE event = 'Tạo doanh nghiệp thành công'
          AND timestamp >= toDateTime('${from}')
          AND timestamp <= toDateTime('${to}')
          AND properties.business_id IS NOT NULL
          AND properties.business_id != ''
        GROUP BY bid
      ) cohort_inner
      GROUP BY cohort_week
    ) AS cs ON cs.cohort_week = c.cohort_week
    JOIN (
      SELECT properties.business_id AS bid, toDate(timestamp) AS act_date
      FROM events
      WHERE properties.business_id IS NOT NULL
        AND properties.business_id != ''
        AND timestamp >= toDateTime('${from}')
      GROUP BY bid, act_date
    ) AS a ON a.bid = c.bid
    WHERE dateDiff('day', toDate(c.cohort_week), a.act_date) IN (0, 1, 7, 14, 30)
    GROUP BY cohort, cohort_size, days_since, c.cohort_week
    ORDER BY c.cohort_week DESC, days_since ASC
  `;

  try {
    const rows = await Promise.race([
      hogql<Array<[string, number, number, number]>>(query),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Cohort query timeout')), COHORT_TIMEOUT_MS)
      ),
    ]);

    return { cohorts: aggregateCohorts(rows ?? []) };
  } catch (err) {
    console.error('[product-cohort] error:', err);
    const msg = err instanceof Error && err.message.includes('timeout')
      ? 'Cohort query timeout — try smaller date range'
      : 'Cohort query failed';
    return { cohorts: [], message: msg };
  }
}

export function aggregateCohorts(rows: Array<[string, number, number, number]>): CohortRetention[] {
  // Group by cohort label, build retention map per cohort
  const cohortMap = new Map<string, { size: number; retention: Record<number, number> }>();

  for (const [cohort, size, daysSince, activeCount] of rows) {
    const existing = cohortMap.get(cohort) ?? { size: Number(size), retention: {} };
    existing.size = Number(size);
    existing.retention[Number(daysSince)] = Number(activeCount);
    cohortMap.set(cohort, existing);
  }

  // Convert to % retention vs cohort size, ordered by cohort DESC, top 8 most recent
  const result: CohortRetention[] = Array.from(cohortMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 8)
    .map(([cohort, { size, retention }]) => ({
      cohort,
      size,
      retention: {
        d0: pct(retention[0] ?? 0, size),
        d1: pct(retention[1] ?? 0, size),
        d7: pct(retention[7] ?? 0, size),
        d14: pct(retention[14] ?? 0, size),
        d30: pct(retention[30] ?? 0, size),
      },
    }));

  return result;
}

function pct(active: number, size: number): number {
  if (size === 0) return 0;
  return Math.round((active / size) * 100);
}
