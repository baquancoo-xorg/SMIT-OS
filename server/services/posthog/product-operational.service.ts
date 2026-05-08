// Product Operational Service — Online time per business per day + touchpoints top 50
// Used by §5 Operational tables. Source: PostHog events + CRM business name lookup.

import { hogql, isPostHogConfigured } from './posthog-client';
import { getCrmClient } from '../../lib/crm-db';
import type {
  ProductOperational,
  OnlineTimeRow,
  TouchpointRow,
} from '../../types/dashboard-product.types';

const ONLINE_TIME_LOOKBACK_DAYS = 7;
const TOUCHPOINT_LIMIT = 50;

export async function getProductOperational(from: string, to: string): Promise<ProductOperational> {
  if (!isPostHogConfigured()) {
    return { days: buildDayBuckets(), onlineTime: [], touchpoints: [] };
  }

  const days = buildDayBuckets();

  const [onlineRaw, touchpointRaw] = await Promise.all([
    fetchOnlineTime(from, to),
    fetchTouchpoints(from, to),
  ]);

  const businessIds = Array.from(
    new Set([
      ...onlineRaw.map((r) => r.businessId),
      ...touchpointRaw.map((r) => r.businessId),
    ]),
  );
  const nameMap = await loadBusinessNames(businessIds);

  const onlineTime = aggregateOnlineTime(onlineRaw, days, nameMap);
  const touchpoints = touchpointRaw.map((r) => ({
    businessId: r.businessId,
    businessName: nameMap.get(r.businessId) ?? null,
    eventCount: r.eventCount,
    lastActiveAt: r.lastActiveAt,
  }));

  return { days, onlineTime, touchpoints };
}

function buildDayBuckets(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = ONLINE_TIME_LOOKBACK_DAYS - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

interface OnlineRow {
  businessId: string;
  day: string;
  minutes: number;
}

async function fetchOnlineTime(from: string, to: string): Promise<OnlineRow[]> {
  // PostHog events lack $session_duration property → derive duration from max(ts)-min(ts) per session per business per day.
  // Cap each session at 60 min to avoid wildly inflated values from idle tabs spanning the day.
  const query = `
    SELECT bid, day, sum(session_min) AS minutes FROM (
      SELECT properties.business_id AS bid,
             toDate(timestamp) AS day,
             $session_id AS sid,
             least(60, dateDiff('second', min(timestamp), max(timestamp)) / 60) AS session_min
      FROM events
      WHERE timestamp >= toDateTime('${from}')
        AND timestamp <= toDateTime('${to}')
        AND properties.business_id IS NOT NULL
        AND properties.business_id != ''
        AND $session_id IS NOT NULL
      GROUP BY bid, day, sid
    ) per_session
    GROUP BY bid, day
    HAVING minutes > 0
    ORDER BY minutes DESC
  `;
  try {
    const rows = await hogql<Array<[string, string, number]>>(query);
    return (rows ?? []).map(([bid, day, minutes]) => ({
      businessId: String(bid),
      day: typeof day === 'string' ? day.slice(0, 10) : day,
      minutes: Number(minutes) || 0,
    }));
  } catch (err) {
    console.error('[product-operational] online-time error:', err);
    return [];
  }
}

interface TouchpointRaw {
  businessId: string;
  eventCount: number;
  lastActiveAt: string | null;
}

async function fetchTouchpoints(from: string, to: string): Promise<TouchpointRaw[]> {
  const query = `
    SELECT properties.business_id AS bid,
           count() AS cnt,
           max(timestamp) AS last_at
    FROM events
    WHERE timestamp >= toDateTime('${from}')
      AND timestamp <= toDateTime('${to}')
      AND properties.business_id IS NOT NULL
      AND properties.business_id != ''
    GROUP BY bid
    ORDER BY cnt DESC
    LIMIT ${TOUCHPOINT_LIMIT}
  `;
  try {
    const rows = await hogql<Array<[string, number, string | null]>>(query);
    return (rows ?? []).map(([bid, cnt, lastAt]) => ({
      businessId: String(bid),
      eventCount: Number(cnt) || 0,
      lastActiveAt: lastAt ? String(lastAt) : null,
    }));
  } catch (err) {
    console.error('[product-operational] touchpoints error:', err);
    return [];
  }
}

function aggregateOnlineTime(
  rows: OnlineRow[],
  days: string[],
  nameMap: Map<string, string>,
): OnlineTimeRow[] {
  const map = new Map<string, OnlineTimeRow>();
  for (const r of rows) {
    let row = map.get(r.businessId);
    if (!row) {
      row = {
        businessId: r.businessId,
        businessName: nameMap.get(r.businessId) ?? null,
        totalMinutes: 0,
        dailyMinutes: days.map(() => 0),
      };
      map.set(r.businessId, row);
    }
    const idx = days.indexOf(r.day);
    if (idx >= 0) {
      row.dailyMinutes[idx] = Math.round(r.minutes);
    }
    row.totalMinutes += Math.round(r.minutes);
  }
  return Array.from(map.values())
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .slice(0, TOUCHPOINT_LIMIT);
}

async function loadBusinessNames(businessIds: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (businessIds.length === 0) return out;

  const crm = getCrmClient();
  if (!crm) return out;

  // PostHog `properties.business_id` may match CrmBusiness.id (Int, small) OR CrmBusiness.bid (String, large)
  const stringIds = businessIds.filter((s) => typeof s === 'string' && s.length > 0);
  const numericIds = businessIds
    .map((id) => Number.parseInt(id, 10))
    .filter((n) => Number.isFinite(n) && n <= Number.MAX_SAFE_INTEGER && String(n) === businessIds.find((b) => Number.parseInt(b, 10) === n));

  try {
    const [byId, byBid] = await Promise.all([
      numericIds.length > 0
        ? crm.crmBusiness.findMany({
            where: { id: { in: numericIds }, PEERDB_IS_DELETED: false },
            select: { id: true, bid: true, name: true },
          })
        : Promise.resolve([]),
      stringIds.length > 0
        ? crm.crmBusiness.findMany({
            where: { bid: { in: stringIds }, PEERDB_IS_DELETED: false },
            select: { id: true, bid: true, name: true },
          })
        : Promise.resolve([]),
    ]);

    for (const r of byId as Array<{ id: number; bid: string | null; name: string | null }>) {
      if (r.name) out.set(String(r.id), r.name);
    }
    for (const r of byBid as Array<{ id: number; bid: string | null; name: string | null }>) {
      if (r.name && r.bid) out.set(r.bid, r.name);
    }
  } catch (err) {
    console.warn('[product-operational] CRM name lookup failed:', (err as Error).message);
  }
  return out;
}
