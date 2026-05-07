// Product Metrics Service - Hybrid PostHog + CRM
// Metrics follow business-centric definitions (2026-05-08)

import { hogql, isPostHogConfigured, PostHogError } from './posthog-client';
import { getCrmClient } from '../../lib/crm-db';

interface ProductMetrics {
  // From PostHog
  totalSignups: number;        // Business Created count
  // From CRM
  firstSyncCount: number;      // Businesses with first sync
  pqlCount: number;            // Businesses that achieved PQL
  // From PostHog (session-based)
  activationCount: number;     // Businesses with ≥2h online time
  activationRate: number;      // activationCount / totalSignups * 100
  dau: number;                 // Daily active businesses (≥2h today)
  mau: number;                 // Monthly active businesses (≥2h in 30d)
  dauMauRatio: number;         // DAU/MAU * 100
}

interface FunnelMetrics {
  steps: Array<{
    name: string;
    displayName: string;
    count: number;
    dropOffPct: number;
  }>;
}

const ACTIVATION_THRESHOLD_SECONDS = 2 * 60 * 60; // 2 hours in seconds

export async function getProductMetrics(from: string, to: string): Promise<ProductMetrics> {
  const [posthogMetrics, crmMetrics] = await Promise.all([
    getPostHogMetrics(from, to),
    getCrmMetrics(from, to),
  ]);

  const activationRate = posthogMetrics.totalSignups > 0
    ? Math.round((posthogMetrics.activationCount / posthogMetrics.totalSignups) * 100)
    : 0;

  const dauMauRatio = posthogMetrics.mau > 0
    ? Math.round((posthogMetrics.dau / posthogMetrics.mau) * 100)
    : 0;

  return {
    totalSignups: posthogMetrics.totalSignups,
    firstSyncCount: crmMetrics.firstSyncCount,
    pqlCount: crmMetrics.pqlCount,
    activationCount: posthogMetrics.activationCount,
    activationRate,
    dau: posthogMetrics.dau,
    mau: posthogMetrics.mau,
    dauMauRatio,
  };
}

async function getPostHogMetrics(from: string, to: string) {
  if (!isPostHogConfigured()) {
    return { totalSignups: 0, activationCount: 0, dau: 0, mau: 0 };
  }

  try {
    const [signups, activation, dauMau] = await Promise.all([
      getSignupsCount(from, to),
      getActivationCount(from, to),
      getDauMau(to),
    ]);

    return {
      totalSignups: signups,
      activationCount: activation,
      dau: dauMau.dau,
      mau: dauMau.mau,
    };
  } catch (err) {
    console.error('[product-metrics] PostHog error:', err);
    return { totalSignups: 0, activationCount: 0, dau: 0, mau: 0 };
  }
}

async function getCrmMetrics(from: string, to: string) {
  const crmClient = getCrmClient();
  if (!crmClient) {
    return { firstSyncCount: 0, pqlCount: 0 };
  }

  try {
    const [firstSync, pql] = await Promise.all([
      crmClient.crmBusinessPqlStatus.count({
        where: {
          has_first_sync: true,
          first_sync_at: { gte: new Date(from), lte: new Date(to) },
          PEERDB_IS_DELETED: false,
        },
      }),
      crmClient.crmBusinessPqlStatus.count({
        where: {
          is_pql: true,
          pql_achieved_at: { gte: new Date(from), lte: new Date(to) },
          PEERDB_IS_DELETED: false,
        },
      }),
    ]);

    return { firstSyncCount: firstSync, pqlCount: pql };
  } catch (err) {
    console.error('[product-metrics] CRM error:', err);
    return { firstSyncCount: 0, pqlCount: 0 };
  }
}

async function getSignupsCount(from: string, to: string): Promise<number> {
  const query = `
    SELECT count() as count
    FROM events
    WHERE event = 'Tạo doanh nghiệp thành công'
      AND timestamp >= toDateTime('${from}')
      AND timestamp <= toDateTime('${to}')
  `;
  const results = await hogql<Array<[number]>>(query);
  return Number(results?.[0]?.[0] ?? 0);
}

async function getActivationCount(from: string, to: string): Promise<number> {
  // Count businesses with ≥20 tracked events (custom events with business_id)
  // Note: autocapture events don't have business_id, so threshold is lower
  const query = `
    SELECT count() as count
    FROM (
      SELECT properties.business_id as business_id, count() as event_count
      FROM events
      WHERE timestamp >= toDateTime('${from}')
        AND timestamp <= toDateTime('${to}')
        AND properties.business_id IS NOT NULL
        AND properties.business_id != ''
      GROUP BY business_id
      HAVING event_count >= 20
    )
  `;

  try {
    const results = await hogql<Array<[number]>>(query);
    return Number(results?.[0]?.[0] ?? 0);
  } catch (err) {
    console.error('[product-metrics] Activation count error:', err);
    return 0;
  }
}

async function getDauMau(toDate: string): Promise<{ dau: number; mau: number }> {
  const to = new Date(toDate);

  // DAU: businesses with activity in last 24 hours
  const dauQuery = `
    SELECT count(DISTINCT properties.business_id) as count
    FROM events
    WHERE timestamp >= now() - INTERVAL 1 DAY
      AND properties.business_id IS NOT NULL
      AND properties.business_id != ''
  `;

  // MAU: businesses with activity in last 30 days
  const mauQuery = `
    SELECT count(DISTINCT properties.business_id) as count
    FROM events
    WHERE timestamp >= now() - INTERVAL 30 DAY
      AND properties.business_id IS NOT NULL
      AND properties.business_id != ''
  `;

  try {
    const [dauResult, mauResult] = await Promise.all([
      hogql<Array<[number]>>(dauQuery),
      hogql<Array<[number]>>(mauQuery),
    ]);

    return {
      dau: Number(dauResult?.[0]?.[0] ?? 0),
      mau: Number(mauResult?.[0]?.[0] ?? 0),
    };
  } catch (err) {
    console.error('[product-metrics] DAU/MAU error:', err);
    return { dau: 0, mau: 0 };
  }
}

export async function getBusinessFunnel(from: string, to: string): Promise<FunnelMetrics> {
  const crmClient = getCrmClient();

  // Funnel steps based on business journey
  const steps = [
    { name: 'signup', displayName: 'Business Created' },
    { name: 'first_sync', displayName: 'First Sync' },
    { name: 'feature_activated', displayName: 'Feature Activated' },
    { name: 'pql', displayName: 'PQL Achieved' },
  ];

  if (!isPostHogConfigured() && !crmClient) {
    return {
      steps: steps.map(s => ({ ...s, count: 0, dropOffPct: 0 })),
    };
  }

  try {
    // Get counts for each step
    const [signups, firstSync, featureActivated, pql] = await Promise.all([
      getSignupsCount(from, to),
      crmClient?.crmBusinessPqlStatus.count({
        where: {
          has_first_sync: true,
          first_sync_at: { gte: new Date(from), lte: new Date(to) },
          PEERDB_IS_DELETED: false,
        },
      }) ?? 0,
      crmClient?.crmBusinessPqlStatus.count({
        where: {
          has_feature_activated: true,
          feature_activated_at: { gte: new Date(from), lte: new Date(to) },
          PEERDB_IS_DELETED: false,
        },
      }) ?? 0,
      crmClient?.crmBusinessPqlStatus.count({
        where: {
          is_pql: true,
          pql_achieved_at: { gte: new Date(from), lte: new Date(to) },
          PEERDB_IS_DELETED: false,
        },
      }) ?? 0,
    ]);

    const counts = [signups, firstSync, featureActivated, pql];

    return {
      steps: steps.map((step, i) => {
        const count = counts[i];
        const prevCount = i === 0 ? count : counts[i - 1];
        const dropOffPct = i === 0 || prevCount === 0
          ? 0
          : Math.round(((prevCount - count) / prevCount) * 100);

        return { ...step, count, dropOffPct };
      }),
    };
  } catch (err) {
    console.error('[product-metrics] Funnel error:', err);
    return {
      steps: steps.map(s => ({ ...s, count: 0, dropOffPct: 0 })),
    };
  }
}
