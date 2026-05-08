// Product Channel Service — Channel attribution
// Primary: CRM crm_subscribers_utm × crm_subscribers × crm_businesses × crm_business_pql_status
// Secondary: PostHog $referring_domain (cross-validation, filtered noise)

import { hogql, isPostHogConfigured } from './posthog-client';
import { getCrmClient } from '../../lib/crm-db';
import type { ProductChannel, ChannelSource, ChannelPostHog } from '../../types/dashboard-product.types';

const POSTHOG_NOISE = new Set(['$direct', 'agency.smit.vn', '', null, undefined]);

export async function getProductChannel(from: string, to: string): Promise<ProductChannel> {
  const [crm, posthog] = await Promise.all([
    getCrmChannel(from, to),
    getPostHogChannel(from, to),
  ]);
  return { crm, posthog };
}

async function getCrmChannel(_from: string, _to: string): Promise<ChannelSource[]> {
  const crmClient = getCrmClient();
  if (!crmClient) return [];

  try {
    // CRM UTM data is sparse for recent subscribers — query at subscriber level (all-time) to surface
    // 8+ clean sources per audit. Date range from page-level filter does not narrow this widget.
    // signups = distinct subscribers with this utm_source.
    // first_sync_count = distinct businesses owned by those subscribers that achieved first_sync.
    const rows = await crmClient.$queryRaw<
      Array<{ source: string; signups: bigint; first_sync_count: bigint }>
    >`
      SELECT
        u.utm_source AS source,
        count(DISTINCT s.id)::bigint AS signups,
        count(DISTINCT CASE WHEN p.has_first_sync THEN b.id END)::bigint AS first_sync_count
      FROM crm_subscribers_utm u
      JOIN crm_subscribers s ON s.id = u.subscriber_id
      LEFT JOIN crm_businesses b ON b.created_by = s.id AND b."_PEERDB_IS_DELETED" = false
      LEFT JOIN crm_business_pql_status p ON p.business_id = b.id
      WHERE u."_PEERDB_IS_DELETED" = false
        AND s."_PEERDB_IS_DELETED" = false
        AND u.utm_source IS NOT NULL
        AND u.utm_source != ''
      GROUP BY u.utm_source
      HAVING count(DISTINCT s.id) > 0
      ORDER BY signups DESC
      LIMIT 25
    `;

    // Normalize source name (Home/Homepage → home, fb/Facebook/facebook/Faceboookads → facebook)
    const normalized = new Map<string, { signups: number; firstSync: number }>();
    for (const r of rows) {
      const key = normalizeSource(r.source);
      const existing = normalized.get(key) ?? { signups: 0, firstSync: 0 };
      existing.signups += Number(r.signups);
      existing.firstSync += Number(r.first_sync_count);
      normalized.set(key, existing);
    }

    return Array.from(normalized.entries())
      .map(([source, { signups, firstSync }]) => ({
        source,
        signupCount: signups,
        firstSyncCount: firstSync,
        prePqlRate: signups > 0 ? Math.round((firstSync / signups) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.signupCount - a.signupCount)
      .slice(0, 10);
  } catch (err) {
    console.error('[product-channel] CRM error:', err);
    return [];
  }
}

async function getPostHogChannel(from: string, to: string): Promise<ChannelPostHog[]> {
  if (!isPostHogConfigured()) return [];

  const query = `
    SELECT properties.$referring_domain AS domain, count() AS cnt
    FROM events
    WHERE event = 'Tạo doanh nghiệp thành công'
      AND timestamp >= toDateTime('${from}')
      AND timestamp <= toDateTime('${to}')
    GROUP BY domain
    ORDER BY cnt DESC
    LIMIT 15
  `;

  try {
    const rows = await hogql<Array<[string | null, number]>>(query);
    return (rows ?? [])
      .filter(([domain]) => !POSTHOG_NOISE.has(domain as any))
      .map(([domain, cnt]) => ({
        domain: normalizePostHogDomain(domain ?? 'unknown'),
        count: Number(cnt),
      }))
      .slice(0, 10);
  } catch (err) {
    console.error('[product-channel] PostHog error:', err);
    return [];
  }
}

export function normalizeSource(source: string): string {
  const lower = source.toLowerCase().trim();
  if (lower.startsWith('home') || lower === 'homepage') return 'home';
  if (lower.includes('facebook') || lower === 'fb' || lower.includes('faceboo')) return 'facebook';
  if (lower.includes('adscheck')) return 'adscheck';
  if (lower === 'link') return 'link';
  if (lower.includes('google')) return 'google';
  if (lower.includes('zalo')) return 'zalo';
  return lower;
}

export function normalizePostHogDomain(domain: string): string {
  const lower = domain.toLowerCase().trim();
  if (lower.includes('facebook.com')) return 'facebook';
  if (lower.includes('google.com') || lower.includes('google.com.')) return 'google';
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('zalo.me') || lower.includes('zalo.com')) return 'zalo';
  if (lower.includes('bing.com') || lower.includes('yahoo.com')) return 'other-search';
  return lower;
}
