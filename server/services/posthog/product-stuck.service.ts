// Product Stuck Service — TRACKING-ONLY (Master Plan §1.4 monitoring, no Sale Concierge trigger)
// Business signup >= STUCK_THRESHOLD_DAYS AND has_first_sync = false → flag stuck.
// Privacy: no email/phone exposed, only business_id/name/days_stuck/signup_at.

import { getCrmClient } from '../../lib/crm-db';
import type { ProductStuck, StuckBusiness } from '../../types/dashboard-product.types';

export const STUCK_THRESHOLD_DAYS = 7;
const RESULT_LIMIT = 500;

export async function getProductStuck(from?: string, to?: string): Promise<ProductStuck> {
  const crm = getCrmClient();
  if (!crm) {
    return { thresholdDays: STUCK_THRESHOLD_DAYS, totalCount: 0, items: [] };
  }

  const cutoff = new Date(Date.now() - STUCK_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

  // Combined date filter: must be older than stuck threshold AND within page-level date range
  const createdAtFilter: Record<string, Date> = { lt: cutoff };
  if (from) {
    const fromDate = new Date(from);
    if (Number.isFinite(fromDate.getTime())) createdAtFilter.gte = fromDate;
  }
  if (to) {
    const toDate = new Date(to);
    if (Number.isFinite(toDate.getTime())) {
      // Tighten upper bound: not after `to` AND still older than cutoff
      createdAtFilter.lt = toDate < cutoff ? toDate : cutoff;
    }
  }

  try {
    const rows = await crm.crmBusinessPqlStatus.findMany({
      where: {
        has_first_sync: false,
        createdAt: createdAtFilter,
        PEERDB_IS_DELETED: false,
      },
      select: { businessId: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: RESULT_LIMIT,
    });

    if (rows.length === 0) {
      return { thresholdDays: STUCK_THRESHOLD_DAYS, totalCount: 0, items: [] };
    }

    const ids = rows.map((r: { businessId: number }) => r.businessId);
    const businesses = await crm.crmBusiness.findMany({
      where: { id: { in: ids }, PEERDB_IS_DELETED: false },
      select: { id: true, name: true },
    });
    const nameMap = new Map<number, string | null>();
    for (const b of businesses as Array<{ id: number; name: string | null }>) {
      nameMap.set(b.id, b.name);
    }

    const now = Date.now();
    const items: StuckBusiness[] = rows.map((r: { businessId: number; createdAt: Date }) => {
      const daysStuck = Math.floor((now - r.createdAt.getTime()) / (24 * 60 * 60 * 1000));
      return {
        businessId: String(r.businessId),
        businessName: nameMap.get(r.businessId) ?? null,
        signupAt: r.createdAt.toISOString(),
        daysStuck,
      };
    });

    items.sort((a, b) => b.daysStuck - a.daysStuck);

    return {
      thresholdDays: STUCK_THRESHOLD_DAYS,
      totalCount: items.length,
      items,
    };
  } catch (err) {
    console.error('[product-stuck] error:', err);
    return { thresholdDays: STUCK_THRESHOLD_DAYS, totalCount: 0, items: [] };
  }
}
