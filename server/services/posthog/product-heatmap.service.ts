// Product Heatmap Service — 3 view variant: hour×day-of-week, cohort×days-since-signup, business×days
// Used by §1 Executive Activation Heatmap (dropdown switch)

import { hogql, isPostHogConfigured } from './posthog-client';
import type { ProductHeatmap, HeatmapCell } from '../../types/dashboard-product.types';

type View = 'hour-day' | 'cohort' | 'business';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOUR_LABELS = Array.from({ length: 24 }, (_, h) => `${h.toString().padStart(2, '0')}h`);

export async function getProductHeatmap(view: View, from: string, to: string): Promise<ProductHeatmap> {
  if (!isPostHogConfigured()) {
    return { view, xLabels: [], yLabels: [], cells: [] };
  }

  switch (view) {
    case 'hour-day':
      return getHourDayHeatmap(from, to);
    case 'cohort':
      return getCohortHeatmap(from, to);
    case 'business':
      return getBusinessHeatmap(from, to);
  }
}

async function getHourDayHeatmap(from: string, to: string): Promise<ProductHeatmap> {
  // X = hour 0-23, Y = day-of-week 1-7 (Mon-Sun ClickHouse), value = distinct business count
  const query = `
    SELECT toDayOfWeek(timestamp) AS dow, toHour(timestamp) AS hr,
           count(DISTINCT properties.business_id) AS value
    FROM events
    WHERE timestamp >= toDateTime('${from}')
      AND timestamp <= toDateTime('${to}')
      AND properties.business_id IS NOT NULL
      AND properties.business_id != ''
    GROUP BY dow, hr
  `;
  try {
    const rows = await hogql<Array<[number, number, number]>>(query);
    // ClickHouse toDayOfWeek: 1=Monday..7=Sunday → reorder to Mon-Sun
    const yLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const cells: HeatmapCell[] = (rows ?? []).map(([dow, hr, value]) => ({
      x: HOUR_LABELS[hr] ?? `${hr}h`,
      y: yLabels[dow - 1] ?? 'Mon',
      value: Number(value),
    }));
    return { view: 'hour-day', xLabels: HOUR_LABELS, yLabels, cells };
  } catch (err) {
    console.error('[product-heatmap] hour-day error:', err);
    return { view: 'hour-day', xLabels: HOUR_LABELS, yLabels: DAY_LABELS, cells: [] };
  }
}

async function getCohortHeatmap(from: string, to: string): Promise<ProductHeatmap> {
  // Y = cohort week (toStartOfWeek of first signup), X = days-since-cohort (0,1,3,7,14,30)
  // value = % active business của cohort tại day-N
  const xMilestones = [0, 1, 3, 7, 14, 30];

  // Inline subqueries instead of WITH CTEs (HogQL CTE alias scope is fragile across joins).
  const query = `
    SELECT
      formatDateTime(c.cohort_week, '%Y-W%V') AS cohort,
      dateDiff('day', toDate(c.cohort_week), a.act_date) AS days_since,
      count(DISTINCT a.bid) AS active_count,
      cs.size AS cohort_size
    FROM (
      SELECT properties.business_id AS bid, toStartOfWeek(min(timestamp)) AS cohort_week
      FROM events
      WHERE event = 'Tạo doanh nghiệp thành công'
        AND timestamp >= toDateTime('${from}')
        AND timestamp <= toDateTime('${to}')
        AND properties.business_id IS NOT NULL
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
        GROUP BY bid
      ) cohort_inner
      GROUP BY cohort_week
    ) AS cs ON cs.cohort_week = c.cohort_week
    JOIN (
      SELECT properties.business_id AS bid, toDate(timestamp) AS act_date
      FROM events
      WHERE properties.business_id IS NOT NULL
        AND timestamp >= toDateTime('${from}')
        AND timestamp <= toDateTime('${to}')
      GROUP BY bid, act_date
    ) AS a ON a.bid = c.bid
    WHERE dateDiff('day', toDate(c.cohort_week), a.act_date) IN (0, 1, 3, 7, 14, 30)
    GROUP BY cohort, days_since, c.cohort_week, cs.size
    ORDER BY c.cohort_week DESC, days_since ASC
  `;
  try {
    const rows = await hogql<Array<[string, number, number, number]>>(query);
    const cohortSet = new Set<string>();
    const cells: HeatmapCell[] = (rows ?? []).map(([cohort, days, active, size]) => {
      cohortSet.add(cohort);
      const pct = size > 0 ? Math.round((active / size) * 100) : 0;
      return {
        x: `D${days}`,
        y: cohort,
        value: pct,
        label: `${active}/${size}`,
      };
    });
    const yLabels = Array.from(cohortSet).sort().reverse().slice(0, 8); // top 8 cohort gần nhất
    const xLabels = xMilestones.map((d) => `D${d}`);
    return {
      view: 'cohort',
      xLabels,
      yLabels,
      cells: cells.filter((c) => yLabels.includes(c.y as string)),
    };
  } catch (err) {
    console.error('[product-heatmap] cohort error:', err);
    return { view: 'cohort', xLabels: xMilestones.map((d) => `D${d}`), yLabels: [], cells: [] };
  }
}

async function getBusinessHeatmap(from: string, to: string): Promise<ProductHeatmap> {
  // Y = top 50 business by event count, X = last 30 days, value = event count per day
  const query = `
    WITH top_biz AS (
      SELECT properties.business_id AS bid, count() AS total
      FROM events
      WHERE timestamp >= toDateTime('${from}')
        AND timestamp <= toDateTime('${to}')
        AND properties.business_id IS NOT NULL
        AND properties.business_id != ''
      GROUP BY bid ORDER BY total DESC LIMIT 50
    )
    SELECT properties.business_id AS bid, toDate(timestamp) AS day, count() AS value
    FROM events
    WHERE properties.business_id IN (SELECT bid FROM top_biz)
      AND timestamp >= toDateTime('${from}')
      AND timestamp <= toDateTime('${to}')
    GROUP BY bid, day ORDER BY day ASC
  `;
  try {
    const rows = await hogql<Array<[string, string, number]>>(query);
    const businessSet = new Set<string>();
    const daySet = new Set<string>();
    const cells: HeatmapCell[] = (rows ?? []).map(([bid, day, value]) => {
      businessSet.add(bid);
      daySet.add(day);
      return { x: day, y: bid, value: Number(value) };
    });
    return {
      view: 'business',
      xLabels: Array.from(daySet).sort(),
      yLabels: Array.from(businessSet),
      cells,
    };
  } catch (err) {
    console.error('[product-heatmap] business error:', err);
    return { view: 'business', xLabels: [], yLabels: [], cells: [] };
  }
}
