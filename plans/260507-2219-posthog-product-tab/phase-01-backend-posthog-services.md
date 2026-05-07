# Phase 1 — Backend (PostHog services + routes + cache)

## Context Links
- Parent plan: [plan.md](./plan.md)
- Brainstorm: [../reports/brainstorm-260507-1609-posthog-product-tab-integration.md](../reports/brainstorm-260507-1609-posthog-product-tab-integration.md) §5.2, §5.3
- Phase 0: [phase-00-preflight-audit.md](./phase-00-preflight-audit.md) (depends on env + taxonomy lock)
- PostHog HogQL: https://posthog.com/docs/hogql
- PostHog Insights API: https://posthog.com/docs/api/insights

## Overview
- **Date:** 2026-05-07
- **Priority:** P1
- **Effort:** 3-4 days
- **Status:** ⬜ Not started · blocked by Phase 0
- **Description:** Build server-side proxy: 3 services (summary/funnel/top-features) + LRU cache + 3 routes. Personal API Key chỉ tồn tại ở backend.

## Key Insights
- HogQL nhanh hơn Insights API cho aggregate queries; dùng Insights API cho funnel vì có drop-off built-in
- Cache key phải include `dateRange` (`from`, `to` ISO date) — nếu không, refetch khác range trả cache cũ
- LRU cache size 100 entries quá đủ cho aggregate (3 endpoints × ~10 date ranges)
- Pattern routes hiện tại: factory `createXxxRoutes(prisma)` → wire vào `server.ts`. PostHog không cần Prisma → factory không param

## Requirements
- **Functional:** 3 endpoints GET trả JSON validated bởi Zod. Cache 5min in-memory. Auth-required (middleware hiện có), không role check thêm.
- **Non-functional:** Response time < 1s with cache hit · < 3s with cache miss · Personal API Key không leak ra response · graceful degradation khi PostHog 5xx

## Architecture
```
Express route
  ↓ requireAuth middleware (existing)
  ↓ Zod validate query params (from, to)
  ↓ check LRU cache (key = endpoint + from + to)
  ├─ HIT  → return cached
  └─ MISS → call PostHog client → Zod validate response → set cache → return
```

## Related Code Files
**New:**
- `server/services/posthog/posthog-client.ts` — axios wrapper, auth header, base URL
- `server/services/posthog/posthog-cache.ts` — LRU 5min, max 100 entries
- `server/services/posthog/product-summary.service.ts` — 4 KPI HogQL queries
- `server/services/posthog/product-funnel.service.ts` — Insights funnel POST
- `server/services/posthog/product-features.service.ts` — top events HogQL
- `server/services/posthog/event-taxonomy.config.ts` — 6 funnel events array
- `server/types/dashboard-product.types.ts` — TS types (re-export from Zod)
- `server/schemas/dashboard-product.schema.ts` — Zod schemas (request + response)
- `server/routes/dashboard-product.routes.ts` — 3 GET endpoints

**Modify:**
- `server.ts` — wire `createDashboardProductRoutes()` vào app

## Implementation Steps

### Step 1 — `posthog-client.ts` (~80 lines)
```ts
import axios, { AxiosInstance } from 'axios';
const host = process.env.POSTHOG_HOST!;
const projectId = process.env.POSTHOG_PROJECT_ID!;
const apiKey = process.env.POSTHOG_PERSONAL_API_KEY!;

export const posthogClient: AxiosInstance = axios.create({
  baseURL: `${host}/api/projects/${projectId}`,
  headers: { Authorization: `Bearer ${apiKey}` },
  timeout: 15_000,
});

export async function hogql<T>(query: string): Promise<T> {
  const { data } = await posthogClient.post('/query/', {
    query: { kind: 'HogQLQuery', query },
  });
  return data.results as T;
}
```
Validate env vars on import; throw nếu thiếu.

### Step 2 — `posthog-cache.ts` (~40 lines)
```ts
import { LRUCache } from 'lru-cache';
const cache = new LRUCache<string, unknown>({ max: 100, ttl: 5 * 60_000 });
export const cacheKey = (endpoint: string, from: string, to: string) =>
  `${endpoint}:${from}:${to}`;
export function getCached<T>(key: string): T | undefined { ... }
export function setCached<T>(key: string, val: T): void { ... }
export function invalidateAll(): void { cache.clear(); }
```

### Step 3 — `event-taxonomy.config.ts` (~20 lines)
```ts
// Updated based on PostHog audit 2026-05-07
export const FUNNEL_EVENTS = [
  'onboarding_started',
  'business_created',
  'Hoàn thành tất cả nhiệm vụ',
  'feature_activated',
] as const;

// Deferred to Phase 2+ (need tracking implementation):
// - trial_button_clicked (website)
// - signup_phone_verified (SMIT User)
```

### Step 4 — `dashboard-product.schema.ts` (Zod, ~120 lines)
```ts
export const dateRangeQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});
export const productSummarySchema = z.object({
  totalSignups: z.number(),
  activationPct: z.number(),
  dau: z.number(), mau: z.number(),
  timeToValueMinutes: z.number(),
});
export const funnelStepSchema = z.object({
  name: z.string(), count: z.number(), dropOffPct: z.number(),
});
export const productFunnelSchema = z.object({ steps: z.array(funnelStepSchema) });
export const topFeatureSchema = z.object({
  feature: z.string(), users: z.number(),
  totalUses: z.number(), avgSessionMinutes: z.number(), lastUsed: z.string(),
});
export const topFeaturesSchema = z.object({ items: z.array(topFeatureSchema) });
```

### Step 5 — `product-summary.service.ts` (~150 lines)
4 HogQL queries song song qua `Promise.all`:
- Signups: `SELECT count() FROM events WHERE event='signup_started' AND timestamp BETWEEN {from} AND {to}`
- Activation: signups → onboarding_completed (count ratio)
- DAU/MAU: distinct persons trong day vs 30 day
- TTV: `avg(date_diff(...))` từ signup_started → feature_used per user

Parse response, validate Zod, return.

### Step 6 — `product-funnel.service.ts` (~120 lines)
POST `/insights/funnel/` với body:
```json
{
  "events": [{"id":"trial_button_clicked","order":0}, ...],
  "date_from": "{from}", "date_to": "{to}",
  "funnel_window_interval": 30, "funnel_window_interval_unit": "day"
}
```
Map response → `{ steps: [{name, count, dropOffPct}, ...] }`

### Step 7 — `product-features.service.ts` (~80 lines)
HogQL:
```sql
SELECT event, count(distinct person_id) AS users, count() AS uses,
       max(timestamp) AS last_used
FROM events
WHERE event = 'feature_used'
  AND timestamp BETWEEN {from} AND {to}
GROUP BY properties.feature_name
ORDER BY uses DESC LIMIT 20
```
avgSessionMinutes — Phase 2 nếu cần (không block ship).

### Step 8 — `dashboard-product.routes.ts` (~120 lines)
```ts
export function createDashboardProductRoutes() {
  const router = Router();
  router.get('/summary', asyncHandler(async (req, res) => {
    const { from, to } = dateRangeQuerySchema.parse(req.query);
    const key = cacheKey('summary', from, to);
    const cached = getCached(key);
    if (cached) return res.json(cached);
    const data = await getProductSummary(from, to);
    setCached(key, data);
    res.json(data);
  }));
  router.get('/funnel', ...);
  router.get('/top-features', ...);
  return router;
}
```
Error middleware: catch axios error → if `status >= 500` → respond `{ code: 'POSTHOG_UNAVAILABLE' }` 503.

### Step 9 — Wire vào `server.ts`
```ts
import { createDashboardProductRoutes } from './server/routes/dashboard-product.routes';
app.use('/api/dashboard/product', requireAuth, createDashboardProductRoutes());
```

## Todo List
- [ ] `posthog-client.ts` + env validation
- [ ] `posthog-cache.ts` LRU
- [ ] `event-taxonomy.config.ts`
- [ ] `dashboard-product.schema.ts` Zod schemas
- [ ] `product-summary.service.ts` (4 queries)
- [ ] `product-funnel.service.ts`
- [ ] `product-features.service.ts`
- [ ] `dashboard-product.routes.ts` (3 endpoints + cache wrap)
- [ ] Wire route vào `server.ts`
- [ ] `dashboard-product.types.ts` (re-export Zod inferred types)
- [ ] Smoke test 3 endpoints với real PostHog data

## Success Criteria
- [ ] 3 endpoints `/api/dashboard/product/{summary,funnel,top-features}` trả 200 + JSON đúng schema
- [ ] Cache hit thứ 2 (cùng range) trả < 100ms
- [ ] PostHog down (mock 500) → endpoint trả 503 với `code: POSTHOG_UNAVAILABLE`
- [ ] Mỗi file < 200 lines (split helper nếu cần)
- [ ] Zod parse fail PostHog response → log + 502 `code: POSTHOG_SCHEMA_DRIFT`
- [ ] `npx tsc --noEmit` pass

## Risk Assessment
| Risk | Severity | Mitigation |
|---|---|---|
| HogQL syntax sai | Med | Test query trên PostHog UI trước khi paste vào code |
| PostHog rate limit | Med | LRU 5min đã giảm tải; nếu vẫn limit → tăng TTL 15min |
| API key leak | High | Code review grep, không log err object thô (axios error chứa headers) |
| Schema drift | Med | Zod safeParse + log diff + degrade gracefully |

## Security Considerations
- Personal API Key chỉ đọc từ `process.env`, không hard-code
- Axios error handler scrub `Authorization` header trước khi log
- Response không echo lại request headers
- `requireAuth` middleware bắt buộc — không có public endpoint

## Next Steps
→ [Phase 2 — Frontend components](./phase-02-frontend-product-tab-components.md)
