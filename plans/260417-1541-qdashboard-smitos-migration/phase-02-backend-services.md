# Phase 2 — Backend Services

**Priority:** P1  •  **Status:** pending  •  **Effort:** 4 days  •  **Days:** 4–7

## Context

- Plan: [../plan.md](./plan.md)
- Depends on: Phase 1 (Prisma clients ready)
- Source qdashboard:
  - `src/services/dashboard/overview.service.ts` (1309 lines — chỉ trích `getSummaryMetrics`, `getKpiMetrics`, helpers)
  - `src/services/facebook/fb-sync.service.ts` (210 lines)
  - `src/services/facebook/fb-ads.service.ts` (272 lines — chỉ phần `getDecryptedToken`)
  - `src/lib/currency-converter.ts`
  - `src/lib/facebook-api.ts` (fetchInsights, parseInsightRow)
  - `src/types/dashboard/overview.types.ts`

## Overview

Port logic services giữ nguyên 100% behavior. Strip `react.cache` (Next.js-only), thay bằng request-scoped memo nếu cần. Strip Next-only imports. Split `overview.service.ts` thành nhiều file <200 dòng theo CLAUDE.md.

## Key insights

- `react.cache(fn)` chỉ tồn tại trong React Server Components → trong Express phải bỏ (mỗi request là instance mới, không cần dedup).
- `getMqlTierData` dùng raw SQL với `$queryRaw` — giữ nguyên cú pháp `${MQL_TIERS.X.budget}` parametrize an toàn.
- `getKpiMetrics` query 4 CRM tables song song + main DB (raw_ads_facebook) → bottleneck là CRM. Giữ `Promise.all`.
- FB sync dùng `prisma.$transaction([upsert,...])` cho từng chunk. Giữ.

## Requirements

**Functional**
- `getSummaryMetrics(from, to, prevFrom, prevTo) → SummaryMetrics` trả đúng schema cũ.
- `getKpiMetrics(from, to) → KpiMetricsResponse` daily breakdown chuẩn.
- `syncFbAdAccount(accountId, dateStart, dateEnd)` ghi `raw_ads_facebook`, log lỗi `etl_error_log`, update `last_sync_at`.
- `getGlobalExchangeRate()` đọc default row, fallback 27000.

**Non-functional**
- File <200 lines (split overview.service vào helpers, summary, kpi).
- No `any` ngoài chỗ Prisma raw return.
- Unit-testable: helper pure functions exportable.

## Architecture

```
src/
├── lib/
│   ├── db.ts                           # Phase 1
│   ├── crm-db.ts                       # Phase 1
│   ├── crypto.ts                       # Phase 1
│   ├── currency-converter.ts           # New (port)
│   ├── facebook-api.ts                 # New (port from qdashboard)
│   └── date-utils.ts                   # New (formatDate, getDateRange)
├── services/
│   ├── dashboard/
│   │   ├── overview-helpers.ts         # MQL constants, calculateTrend, safeDivide, toNumber
│   │   ├── overview-ad-spend.ts        # getAdSpendTotal, getAdSpendByDate, getSessionsByDate, getConversionRates
│   │   ├── overview-mql.ts             # getMqlTierData (raw SQL)
│   │   ├── overview-summary.service.ts # getSummaryMetrics
│   │   └── overview-kpi.service.ts     # getKpiMetrics + getEmptyKpiMetrics
│   └── facebook/
│       ├── fb-token.service.ts         # getDecryptedToken
│       └── fb-sync.service.ts          # syncFbAdAccount, splitDateRange
└── types/
    └── dashboard/
        └── overview.types.ts           # Strict subset (no Cohort/Charts)
```

## Files

**Create**
- `src/types/dashboard/overview.types.ts`
- `src/lib/date-utils.ts`
- `src/lib/currency-converter.ts`
- `src/lib/facebook-api.ts`
- `src/services/dashboard/overview-helpers.ts`
- `src/services/dashboard/overview-ad-spend.ts`
- `src/services/dashboard/overview-mql.ts`
- `src/services/dashboard/overview-summary.service.ts`
- `src/services/dashboard/overview-kpi.service.ts`
- `src/services/facebook/fb-token.service.ts`
- `src/services/facebook/fb-sync.service.ts`

## Implementation steps

### 1. Port `types/dashboard/overview.types.ts`

Subset chỉ giữ types cần thiết (bỏ Cohort/Charts):

```typescript
export interface DateRange { from: Date; to: Date }
export interface DateRangeWithComparison extends DateRange {
  previousFrom: Date;
  previousTo: Date;
}

export interface MetricWithTrend {
  value: number;
  previousValue: number;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface SummaryMetrics {
  revenue: MetricWithTrend;
  adSpend: MetricWithTrend;
  signups: MetricWithTrend;
  roas: MetricWithTrend;
}

export interface KpiMetricsRow {
  date: string;
  adSpend: number; sessions: number; costPerSession: number;
  signups: number; costPerSignup: number;
  trials: number; trialRate: number; trialAvgDays?: number; costPerTrial: number;
  opportunities: number; opportunityRate: number; oppsAvgDays?: number; costPerOpportunity: number;
  orders: number; orderRate: number; orderAvgDays?: number; costPerOrder: number;
  revenue: number; roas: number;
  mql: number; mqlRate: number; mqlAvgDays?: number;
  mqlBronze: number; mqlBronzeRate: number;
  mqlSilver: number; mqlSilverRate: number;
  mqlGold: number; mqlGoldRate: number;
  prePql: number; prePqlRate: number; prePqlAvgDays?: number;
  pql: number; pqlRate: number; pqlAvgDays?: number;
  sql: number; sqlRate: number; sqlAvgDays?: number;
}

export interface KpiMetricsResponse {
  data: KpiMetricsRow[];
  totals: KpiMetricsRow;
}

export interface OverviewQueryParams {
  from: string;
  to: string;
  previousFrom?: string;
  previousTo?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}
```

### 2. `src/lib/date-utils.ts`

```typescript
/** YYYY-MM-DD in LOCAL timezone (avoids UTC shift bug) */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDateRange(from: Date, to: Date): string[] {
  const out: string[] = [];
  const cur = new Date(from);
  while (cur <= to) {
    out.push(formatDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/** Compute previous period of same length (exclusive of `from`) */
export function previousPeriod(from: Date, to: Date) {
  const days = Math.ceil((to.getTime() - from.getTime()) / 86_400_000) + 1;
  const previousTo = new Date(from);
  previousTo.setDate(previousTo.getDate() - 1);
  const previousFrom = new Date(previousTo);
  previousFrom.setDate(previousFrom.getDate() - days + 1);
  return { previousFrom, previousTo };
}
```

### 3. `src/lib/currency-converter.ts`

Port nguyên từ qdashboard, đổi import:

```typescript
import { prisma } from './db';

export async function getGlobalExchangeRate(): Promise<number> {
  const row = await prisma.exchangeRateSetting.findFirst({
    where: { isDefault: true, accountId: null },
  });
  return row?.exchangeRate.toNumber() ?? 27000;
}

export async function getExchangeRate(accountId?: number): Promise<number> {
  if (!accountId) return getGlobalExchangeRate();
  const row = await prisma.exchangeRateSetting.findFirst({
    where: { accountId, currencyFrom: 'USD', currencyTo: 'VND' },
  });
  return row ? row.exchangeRate.toNumber() : getGlobalExchangeRate();
}
```

### 4. `src/lib/facebook-api.ts`

Port `fetchInsights` + `parseInsightRow` từ qdashboard `src/lib/facebook-api.ts`. Skeleton (giữ y nguyên implementation từ source):

```typescript
const FB_API_VERSION = process.env.FB_API_VERSION ?? 'v21.0';

export interface FetchInsightsResult {
  success: boolean;
  data?: any[];
  error?: string;
}

export async function fetchInsights(
  token: string,
  accountId: string,
  since: string,
  until: string,
): Promise<FetchInsightsResult> {
  const fields = [
    'ad_id','ad_name','adset_id','adset_name','campaign_id','campaign_name',
    'objective','spend','impressions','reach','clicks','ctr','cpm','cpc',
    'frequency','actions','video_play_actions','video_thruplay_watched_actions',
    'conversions',
  ].join(',');

  const url = new URL(`https://graph.facebook.com/${FB_API_VERSION}/act_${accountId}/insights`);
  url.searchParams.set('access_token', token);
  url.searchParams.set('level', 'ad');
  url.searchParams.set('time_range', JSON.stringify({ since, until }));
  url.searchParams.set('time_increment', '1');
  url.searchParams.set('fields', fields);
  url.searchParams.set('limit', '500');

  try {
    const all: any[] = [];
    let next: string | null = url.toString();
    while (next) {
      const res = await fetch(next);
      const json = await res.json();
      if (json.error) return { success: false, error: json.error.message };
      all.push(...(json.data ?? []));
      next = json.paging?.next ?? null;
    }
    return { success: true, data: all };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export function parseInsightRow(row: any) {
  return {
    dateStart: new Date(row.date_start),
    adId: row.ad_id,
    adName: row.ad_name,
    adsetId: row.adset_id,
    adsetName: row.adset_name,
    campaignId: row.campaign_id,
    campaignName: row.campaign_name,
    campaignObjective: row.objective,
    spend: row.spend ? Number(row.spend) : null,
    impressions: row.impressions ? BigInt(row.impressions) : null,
    reach: row.reach ? BigInt(row.reach) : null,
    clicks: row.clicks ? BigInt(row.clicks) : null,
    ctr: row.ctr ? Number(row.ctr) : null,
    cpm: row.cpm ? Number(row.cpm) : null,
    cpc: row.cpc ? Number(row.cpc) : null,
    frequency: row.frequency ? Number(row.frequency) : null,
    actions: row.actions ?? null,
    videoViews: row.video_play_actions ?? null,
    videoPlayCount: null,
    videoThruplayCount: row.video_thruplay_watched_actions
      ? Number(row.video_thruplay_watched_actions[0]?.value ?? 0)
      : null,
    conversions: row.conversions ?? null,
  };
}
```

### 5. `src/services/dashboard/overview-helpers.ts`

```typescript
import type { MetricWithTrend } from '@/types/dashboard/overview.types';

export const MQL_TIERS = {
  BRONZE: { budget: 5_000_000, accounts: 1 },
  SILVER: { budget: 500_000_000, accounts: 20 },
  GOLD: { budget: 10_000_000_000, accounts: 100 },
} as const;

export const MQL_VALID_ROLES = ['manager', 'accountant', 'owner', 'ceo', 'director'];

export function calculateTrend(current: number, previous: number): MetricWithTrend {
  const trend = previous === 0 ? 0 : ((current - previous) / previous) * 100;
  return {
    value: current,
    previousValue: previous,
    trend: Math.round(trend * 100) / 100,
    trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral',
  };
}

export function safeDivide(n: number, d: number): number {
  if (d === 0) return 0;
  return Math.round((n / d) * 100) / 100;
}

export function toNumber(v: any): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'object' && 'toNumber' in v) return v.toNumber();
  if (typeof v === 'bigint') return Number(v);
  return Number(v) || 0;
}

export function extractLandingPageViews(actions: unknown): number {
  if (!Array.isArray(actions)) return 0;
  const lpv = actions.find((a: any) => a.action_type === 'landing_page_view');
  return lpv ? parseInt(lpv.value, 10) || 0 : 0;
}
```

### 6. `src/services/dashboard/overview-ad-spend.ts`

```typescript
import { prisma } from '@/lib/db';
import { getGlobalExchangeRate } from '@/lib/currency-converter';
import { formatDate } from '@/lib/date-utils';
import { toNumber, extractLandingPageViews } from './overview-helpers';

let conversionRatesCache: { rates: Map<string, number>; expiresAt: number } | null = null;

/** Per-process 60s cache (replaces React.cache from Next.js) */
async function getConversionRates(): Promise<Map<string, number>> {
  if (conversionRatesCache && Date.now() < conversionRatesCache.expiresAt) {
    return conversionRatesCache.rates;
  }
  const globalRate = await getGlobalExchangeRate().catch(() => 27000);
  const safeRate = isFinite(globalRate) && globalRate > 0 ? globalRate : 27000;

  const accounts = await prisma.fbAdAccountConfig.findMany({
    select: { accountId: true, currency: true },
  });
  const rates = new Map<string, number>();
  accounts.forEach((a) => rates.set(a.accountId, a.currency === 'USD' ? safeRate : 1));

  conversionRatesCache = { rates, expiresAt: Date.now() + 60_000 };
  return rates;
}

export async function getAdSpendTotal(from: Date, to: Date): Promise<number> {
  const rates = await getConversionRates();
  const rows = await prisma.rawAdsFacebook.groupBy({
    by: ['accountId'],
    _sum: { spend: true },
    where: { dateStart: { gte: from, lte: to } },
  });
  let total = 0;
  rows.forEach((r) => {
    total += toNumber(r._sum.spend) * (rates.get(r.accountId) ?? 1);
  });
  return total;
}

export async function getAdSpendByDate(from: Date, to: Date): Promise<Map<string, number>> {
  const rates = await getConversionRates();
  const rows = await prisma.rawAdsFacebook.groupBy({
    by: ['dateStart', 'accountId'],
    _sum: { spend: true },
    where: { dateStart: { gte: from, lte: to } },
  });
  const out = new Map<string, number>();
  rows.forEach((r) => {
    const date = formatDate(new Date(r.dateStart));
    const v = toNumber(r._sum.spend) * (rates.get(r.accountId) ?? 1);
    out.set(date, (out.get(date) ?? 0) + v);
  });
  return out;
}

export async function getSessionsByDate(from: Date, to: Date): Promise<Map<string, number>> {
  const rows = await prisma.rawAdsFacebook.findMany({
    where: { dateStart: { gte: from, lte: to } },
    select: { dateStart: true, actions: true },
  });
  const out = new Map<string, number>();
  rows.forEach((r) => {
    const date = formatDate(new Date(r.dateStart));
    out.set(date, (out.get(date) ?? 0) + extractLandingPageViews(r.actions));
  });
  return out;
}
```

### 7. `src/services/dashboard/overview-mql.ts`

```typescript
import { crmPrisma, safeCrmQuery } from '@/lib/crm-db';
import { MQL_TIERS } from './overview-helpers';

interface MqlTierResult {
  date: string;
  mql_bronze: number;
  mql_silver: number;
  mql_gold: number;
}

export async function getMqlTierData(from: Date, to: Date) {
  const result = await safeCrmQuery(
    () => crmPrisma.$queryRaw<MqlTierResult[]>`
      SELECT
        DATE(created_at)::text AS date,
        COUNT(*) FILTER (WHERE
          CAST(NULLIF(TRIM(ad_budget_month), '') AS NUMERIC) >= ${MQL_TIERS.GOLD.budget}
          AND CAST(NULLIF(TRIM(ad_account_quantity), '') AS NUMERIC) >= ${MQL_TIERS.GOLD.accounts}
        )::int AS mql_gold,
        COUNT(*) FILTER (WHERE
          CAST(NULLIF(TRIM(ad_budget_month), '') AS NUMERIC) >= ${MQL_TIERS.SILVER.budget}
          AND CAST(NULLIF(TRIM(ad_account_quantity), '') AS NUMERIC) >= ${MQL_TIERS.SILVER.accounts}
          AND NOT (
            CAST(NULLIF(TRIM(ad_budget_month), '') AS NUMERIC) >= ${MQL_TIERS.GOLD.budget}
            AND CAST(NULLIF(TRIM(ad_account_quantity), '') AS NUMERIC) >= ${MQL_TIERS.GOLD.accounts}
          )
        )::int AS mql_silver,
        COUNT(*) FILTER (WHERE
          CAST(NULLIF(TRIM(ad_budget_month), '') AS NUMERIC) >= ${MQL_TIERS.BRONZE.budget}
          AND CAST(NULLIF(TRIM(ad_account_quantity), '') AS NUMERIC) >= ${MQL_TIERS.BRONZE.accounts}
          AND NOT (
            CAST(NULLIF(TRIM(ad_budget_month), '') AS NUMERIC) >= ${MQL_TIERS.SILVER.budget}
            AND CAST(NULLIF(TRIM(ad_account_quantity), '') AS NUMERIC) >= ${MQL_TIERS.SILVER.accounts}
          )
        )::int AS mql_bronze
      FROM crm_subscribers
      WHERE created_at >= ${from}
        AND created_at <= ${to}
        AND "_PEERDB_IS_DELETED" = false
        AND LOWER(TRIM(company_role)) = ANY(ARRAY['manager','accountant','owner','ceo','director'])
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `,
    null,
  );

  return new Map(
    (result ?? []).map((r: any) => [
      r.date,
      { bronze: Number(r.mql_bronze), silver: Number(r.mql_silver), gold: Number(r.mql_gold) },
    ]),
  );
}
```

### 8. `src/services/dashboard/overview-summary.service.ts`

```typescript
import { crmPrisma, safeCrmQuery } from '@/lib/crm-db';
import { calculateTrend, safeDivide, toNumber } from './overview-helpers';
import { getAdSpendTotal } from './overview-ad-spend';
import type { SummaryMetrics } from '@/types/dashboard/overview.types';

export async function getSummaryMetrics(
  from: Date, to: Date, prevFrom: Date, prevTo: Date,
): Promise<SummaryMetrics> {
  const [curRev, prevRev, curSign, prevSign, curAd, prevAd] = await Promise.all([
    safeCrmQuery(() => crmPrisma.business_transaction.aggregate({
      _sum: { user_paid: true },
      where: { is_trial: false, status: 'completed', created_at: { gte: from, lte: to }, PEERDB_IS_DELETED: false },
    }), { _sum: { user_paid: null } }),
    safeCrmQuery(() => crmPrisma.business_transaction.aggregate({
      _sum: { user_paid: true },
      where: { is_trial: false, status: 'completed', created_at: { gte: prevFrom, lte: prevTo }, PEERDB_IS_DELETED: false },
    }), { _sum: { user_paid: null } }),
    safeCrmQuery(() => crmPrisma.crmSubscriber.count({
      where: { created_at: { gte: from, lte: to }, PEERDB_IS_DELETED: false },
    }), 0),
    safeCrmQuery(() => crmPrisma.crmSubscriber.count({
      where: { created_at: { gte: prevFrom, lte: prevTo }, PEERDB_IS_DELETED: false },
    }), 0),
    getAdSpendTotal(from, to),
    getAdSpendTotal(prevFrom, prevTo),
  ]);

  const revenue = curRev ? toNumber(curRev._sum.user_paid) : 0;
  const prevRevenue = prevRev ? toNumber(prevRev._sum.user_paid) : 0;
  const signups = curSign ?? 0;
  const prevSignups = prevSign ?? 0;
  const roas = safeDivide(revenue, curAd);
  const prevRoas = safeDivide(prevRevenue, prevAd);

  return {
    revenue: calculateTrend(revenue, prevRevenue),
    adSpend: calculateTrend(curAd, prevAd),
    signups: calculateTrend(signups, prevSignups),
    roas: calculateTrend(roas, prevRoas),
  };
}
```

### 9. `src/services/dashboard/overview-kpi.service.ts`

Port `getKpiMetrics` từ qdashboard `overview.service.ts`. Vì file gốc khá dài (~600 dòng cho hàm này), giữ structure: query CRM song song (signups, trials, opps, orders, mql/pql/sql, prePql, oppsAvgDays, ordersAvgDays, trialsAvgDays, prePqlAvgDays, pqlAvgDays, sqlAvgDays), join với MQL tier data, ad spend, sessions theo date. Chi tiết logic xem lại source file gốc — copy nguyên xi, đổi import path:

```typescript
// from
import { crmPrisma, safeCrmQuery } from '@/lib/crm-db';
import { prisma } from '@/lib/db';
import { formatDate, getDateRange } from '@/lib/date-utils';
import { safeDivide, toNumber, MQL_VALID_ROLES } from './overview-helpers';
import { getAdSpendByDate, getSessionsByDate } from './overview-ad-spend';
import { getMqlTierData } from './overview-mql';
import type { KpiMetricsResponse, KpiMetricsRow } from '@/types/dashboard/overview.types';

export async function getKpiMetrics(from: Date, to: Date): Promise<KpiMetricsResponse> {
  const dates = getDateRange(from, to);
  const mqlTierData = await getMqlTierData(from, to);

  const crmQueries = safeCrmQuery(() => Promise.all([
    crmPrisma.crmSubscriber.groupBy({
      by: ['created_at'], _count: true,
      where: { created_at: { gte: from, lte: to }, PEERDB_IS_DELETED: false },
    }),
    crmPrisma.crmBusiness.groupBy({
      by: ['created_at'], _count: true,
      where: { created_at: { gte: from, lte: to }, is_trial: true, PEERDB_IS_DELETED: false },
    }),
    crmPrisma.crmOpportunity.groupBy({
      by: ['created_at'], _count: true,
      where: { created_at: { gte: from, lte: to }, PEERDB_IS_DELETED: false },
    }),
    crmPrisma.business_transaction.groupBy({
      by: ['created_at'], _count: true, _sum: { user_paid: true },
      where: { created_at: { gte: from, lte: to }, is_trial: false, status: 'completed', PEERDB_IS_DELETED: false },
    }),
    // ... thêm queries cho Pre-PQL, PQL, SQL theo source file gốc
  ]), null);

  const [adSpendByDate, sessionsByDate, crmResults] = await Promise.all([
    getAdSpendByDate(from, to),
    getSessionsByDate(from, to),
    crmQueries,
  ]);

  // Build rows từ dates array, lookup từng map → KpiMetricsRow[]
  // Logic tính rate (% of signups for trial/opp/order, % of trials for mql/pql/sql) theo source
  // Tính totals = aggregate all rows
  // (giữ nguyên logic từ qdashboard overview.service.ts dòng ~449-1100)

  // Pseudocode kết quả:
  const data: KpiMetricsRow[] = dates.map((date) => buildRow(date, /* ...maps */));
  const totals = aggregateTotals(data);
  return { data, totals };
}

function getEmptyKpiMetrics(): KpiMetricsResponse { /* ... */ }
function buildRow(date: string, ...): KpiMetricsRow { /* ... */ }
function aggregateTotals(rows: KpiMetricsRow[]): KpiMetricsRow { /* ... */ }
```

> **Important**: trong implementation thực tế, copy nguyên xi 600 dòng `getKpiMetrics` từ `qdashboard/src/services/dashboard/overview.service.ts` (dòng 449-1100), strip `react.cache`, đổi import. Logic CRM groupBy + map merge giữ KHÔNG ĐỔI.

### 10. `src/services/facebook/fb-token.service.ts`

```typescript
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/crypto';

export async function getDecryptedToken(accountId: string): Promise<string | null> {
  const cfg = await prisma.fbAdAccountConfig.findUnique({ where: { accountId } });
  if (!cfg?.accessTokenEncrypted) return null;
  try {
    return decrypt(cfg.accessTokenEncrypted);
  } catch (err) {
    console.error('[fb-token] decrypt failed:', (err as Error).message);
    return null;
  }
}
```

### 11. `src/services/facebook/fb-sync.service.ts`

Port nguyên từ qdashboard, đổi import. Giữ:
- `splitDateRange` (chunks 30 days)
- `syncFbAdAccount` với `prisma.$transaction([upsert,...])`
- Error log → `prisma.etlErrorLog.create`
- Update `fbAdAccountConfig.lastSyncAt/lastSyncStatus`

```typescript
import { prisma } from '@/lib/db';
import { fetchInsights, parseInsightRow } from '@/lib/facebook-api';
import { getDecryptedToken } from './fb-token.service';

const MAX_DAYS_PER_CHUNK = 30;

export interface FbSyncResult {
  accountId: string;
  success: boolean;
  rowsInserted: number;
  rowsUpdated: number;
  error?: string;
  duration: number;
}

function splitDateRange(start: string, end: string) {
  const chunks: { start: string; end: string }[] = [];
  const s = new Date(start), e = new Date(end);
  let cs = new Date(s);
  while (cs <= e) {
    const ce = new Date(cs);
    ce.setDate(ce.getDate() + MAX_DAYS_PER_CHUNK - 1);
    if (ce > e) ce.setTime(e.getTime());
    chunks.push({ start: cs.toISOString().slice(0, 10), end: ce.toISOString().slice(0, 10) });
    cs = new Date(ce);
    cs.setDate(cs.getDate() + 1);
  }
  return chunks;
}

export async function syncFbAdAccount(
  accountId: string, dateStart: string, dateEnd: string,
): Promise<FbSyncResult> {
  const t0 = Date.now();
  let rowsInserted = 0;

  try {
    const token = await getDecryptedToken(accountId);
    if (!token) {
      return { accountId, success: false, rowsInserted: 0, rowsUpdated: 0,
        error: 'Token not found', duration: Date.now() - t0 };
    }

    const chunks = splitDateRange(dateStart, dateEnd);
    for (const c of chunks) {
      const result = await fetchInsights(token, accountId, c.start, c.end);
      if (!result.success || !result.data) {
        await prisma.etlErrorLog.create({
          data: { sourceId: accountId, sourceType: 'fb_ads', errorType: 'api_error',
            errorMessage: result.error ?? 'unknown', errorDetails: { dateStart: c.start, dateEnd: c.end } },
        });
        continue;
      }

      const rows = result.data.map((r) => {
        const p = parseInsightRow(r);
        return {
          accountId, dateStart: p.dateStart, adId: p.adId ?? '',
          adName: p.adName, adsetId: p.adsetId, adsetName: p.adsetName,
          campaignId: p.campaignId, campaignName: p.campaignName, campaignObjective: p.campaignObjective,
          spend: p.spend, impressions: p.impressions, reach: p.reach, clicks: p.clicks,
          ctr: p.ctr, cpm: p.cpm, cpc: p.cpc, frequency: p.frequency,
          actions: p.actions ? JSON.parse(JSON.stringify(p.actions)) : undefined,
          conversions: p.conversions ? JSON.parse(JSON.stringify(p.conversions)) : undefined,
          videoViews: p.videoViews ? JSON.parse(JSON.stringify(p.videoViews)) : undefined,
          videoPlayCount: p.videoPlayCount, videoThruplayCount: p.videoThruplayCount,
          insightsRaw: JSON.parse(JSON.stringify(r)),
        };
      });

      await prisma.$transaction(
        rows.map((d) =>
          prisma.rawAdsFacebook.upsert({
            where: { accountId_dateStart_adId: { accountId: d.accountId, dateStart: d.dateStart, adId: d.adId } },
            update: { ...d, syncedAt: new Date() },
            create: { ...d, syncedAt: new Date() },
          }),
        ),
      );
      rowsInserted += rows.length;

      if (chunks.indexOf(c) < chunks.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    await prisma.fbAdAccountConfig.update({
      where: { accountId }, data: { lastSyncAt: new Date(), lastSyncStatus: 'success' },
    });

    return { accountId, success: true, rowsInserted, rowsUpdated: 0, duration: Date.now() - t0 };
  } catch (err) {
    await prisma.etlErrorLog.create({
      data: { sourceId: accountId, sourceType: 'fb_ads', errorType: 'sync_error',
        errorMessage: (err as Error).message },
    });
    await prisma.fbAdAccountConfig.update({
      where: { accountId }, data: { lastSyncAt: new Date(), lastSyncStatus: 'failed' },
    }).catch(() => {});

    return { accountId, success: false, rowsInserted, rowsUpdated: 0,
      error: (err as Error).message, duration: Date.now() - t0 };
  }
}
```

### 12. Setup node-cron cho auto-sync (Validated)

```bash
pnpm add node-cron
pnpm add -D @types/node-cron
```

`src/jobs/fb-sync.job.ts`:

```typescript
import cron from 'node-cron';
import { prisma } from '@/lib/db';
import { syncFbAdAccount } from '@/services/facebook/fb-sync.service';
import { formatDate } from '@/lib/date-utils';

export function startFbSyncCron() {
  // Chạy daily lúc 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('[fb-sync-cron] Starting daily sync...');
    const accounts = await prisma.fbAdAccountConfig.findMany({ where: { isActive: true } });
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    for (const acc of accounts) {
      const result = await syncFbAdAccount(acc.accountId, formatDate(yesterday), formatDate(today));
      console.log(`[fb-sync-cron] ${acc.accountId}: ${result.success ? 'OK' : 'FAILED'}`);
    }
  });
  
  console.log('[fb-sync-cron] Scheduled for 2:00 AM daily');
}
```

Gọi `startFbSyncCron()` trong `app.ts` sau khi Express server start.

## Todo

- [ ] Port types (subset)
- [ ] Implement `date-utils.ts`, `currency-converter.ts`, `facebook-api.ts`
- [ ] Implement `overview-helpers.ts`
- [ ] Implement `overview-ad-spend.ts`
- [ ] Implement `overview-mql.ts` (raw SQL)
- [ ] Implement `overview-summary.service.ts`
- [ ] Implement `overview-kpi.service.ts` (port full logic 600 dòng)
- [ ] Implement `fb-token.service.ts`, `fb-sync.service.ts`
- [ ] `tsc --noEmit` exit 0

## Success criteria

- `getSummaryMetrics(today-7, today, today-14, today-8)` trả 4 metrics > 0 với CRM live.
- `getKpiMetrics(today-7, today)` trả `data.length === 7`, totals chính xác (sum bằng tay match).
- `syncFbAdAccount('act_xxx', '2026-04-01', '2026-04-15')` insert rows vào `raw_ads_facebook`.
- Mọi file <200 lines.

## Risks

| Risk | Mitigation |
|---|---|
| Logic `getKpiMetrics` sai khi copy → totals lệch | Snapshot test với fixture CRM data |
| `react.cache` removal → multiple DB hits per request | Manual memo (60s in-memory) cho hot path |
| Decimal precision khác nhau giữa USD spend × rate | Always `Math.round(val * 100) / 100` |
| Raw SQL `${}` interpolate user input → SQL injection | `from`/`to` là Date object, MQL_TIERS là constant — an toàn |

## Security

- Token chỉ decrypt trong service, không log raw.
- CRM read-only (DB role enforce).

## Next steps

- → Phase 3: expose services qua Express routes.
