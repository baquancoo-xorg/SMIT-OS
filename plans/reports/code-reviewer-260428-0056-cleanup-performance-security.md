# Code Review Report
# Plan: 260428-0000-cleanup-performance-security-parallel

**Reviewer:** code-reviewer
**Date:** 2026-04-28 00:56 ICT
**Branch:** main (uncommitted working tree)
**Build:** PASS (clean `npm run build`, zero TS errors via `tsc --noEmit`)

---

## Scope

| File | Change |
|------|--------|
| `server.ts` | CORS tightening, CSP, body limit, general rate limiter, admin auth |
| `server/middleware/auth.middleware.ts` | Add `fullName` to auth context |
| `server/types/express.d.ts` | Extend `Request.user` with `fullName?` |
| `server/lib/prisma.ts` | NEW - Prisma singleton |
| `server/lib/currency-converter.ts` | Migrate to singleton |
| `server/routes/admin-fb-config.routes.ts` | Migrate to singleton |
| `server/services/facebook/fb-sync-scheduler.service.ts` | Migrate to singleton |
| `server/services/facebook/fb-token.service.ts` | Migrate to singleton |
| `server/services/dashboard/overview-ad-spend.ts` | In-process TTL cache (60s) |
| `server/services/lead-sync/crm-lead-sync.service.ts` | N+1 -> batch-fetch per batch |
| `src/contexts/SprintContext.tsx` | NEW - React Query singleton for active sprint |
| `src/main.tsx` | Wrap App in SprintProvider |
| `src/components/layout/SprintContextWidget.tsx` | Consume SprintContext |
| `src/components/lead-tracker/daily-stats-tab.tsx` | useState -> useQuery |
| `src/components/lead-tracker/lead-logs-tab.tsx` | useState -> useQuery |
| `src/pages/PMDashboard.tsx` | 6x useEffect+fetch -> 6x useQuery |
| Deleted: `ProtectedRoute.tsx`, `use-users.ts`, `use-objectives.ts`, `use-sprints.ts` | No remaining imports confirmed |

---

## Critical Issues

None. No auth bypass, no data leak, no SQL injection vector introduced.

---

## High Priority

### H1 - Thundering-herd gap in `overview-ad-spend.ts` in-process cache

**File:** `server/services/dashboard/overview-ad-spend.ts:10-15`

The `withCache` implementation has a classic thundering-herd window. When a cache entry expires, multiple concurrent requests for the same key all find `hit === undefined`, all call the DB function simultaneously, and each writes the result back independently.

```ts
// current - races on cold start and after every TTL expiry
async function withCache<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = _cache.get(key);
  if (hit && Date.now() < hit.expiresAt) return hit.data as T;
  const data = await fn();          // all concurrent callers reach here
  _cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
  return data;
}
```

Fix - store the in-flight Promise so concurrent callers coalesce:

```ts
const _inFlight = new Map<string, Promise<unknown>>();

async function withCache<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = _cache.get(key);
  if (hit && Date.now() < hit.expiresAt) return hit.data as T;
  const existing = _inFlight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const p = fn().then((data) => {
    _cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
    _inFlight.delete(key);
    return data;
  }).catch((e) => { _inFlight.delete(key); throw e; });
  _inFlight.set(key, p as Promise<unknown>);
  return p;
}
```

**Impact:** Under concurrent dashboard loads, every 60s TTL boundary can produce a burst of redundant `groupBy` queries against Postgres. With frontend `staleTime: 60_000` and backend `TTL_MS = 60_000` cycling at the same cadence, this happens predictably every minute at scale.

---

### H2 - `deriveResolvedDate` is still an N+1 CRM query inside the inner batch loop

**File:** `server/services/lead-sync/crm-lead-sync.service.ts:185`

The batch-fetch fix eliminates the local Postgres N+1, but `deriveResolvedDate` issues a CRM DB query **per subscriber** for any row whose status is `Qualified` or `Unqualified`:

```ts
for (const sub of batch) {
  const resolvedDate = await deriveResolvedDate(sub.id, ...);  // CRM query per qualifying row
  ...
}
```

For a batch of 50 where 30 are qualified, this fires 30 sequential CRM queries. The fix is to pre-batch the activity lookup before the inner loop:

```ts
// After batch fetch, identify which IDs need CRM resolution
const qualifyingIds = batch
  .filter(s => {
    const status = statusMap[s.status ?? ''] ?? FALLBACK_STATUS;
    return status === 'Qualified' || status === 'Unqualified';
  })
  .map(s => Number(s.id));

// Single CRM query for all qualifying subscribers
const activityRows = qualifyingIds.length > 0
  ? await safeCrmQuery(
      () => crm.crm_activities.findMany({
        where: {
          subscriber_id: { in: qualifyingIds },
          action: 'change_status_subscriber',
          PEERDB_IS_DELETED: false,
        },
        orderBy: { created_at: 'desc' },
        distinct: ['subscriber_id'],
        select: { subscriber_id: true, created_at: true },
      }),
      []
    )
  : [];

const resolvedDateMap = new Map(
  activityRows.map(r => [BigInt(r.subscriber_id), r.created_at ?? null])
);
// Then in the inner loop:
const resolvedDate = resolvedDateMap.get(sub.id) ?? null;
```

**Impact:** Sync throughput is O(n) CRM round-trips for qualified-heavy datasets. This was the primary performance goal of Phase 04; the partial fix leaves the worst-case unchanged.

---

### H3 - `generalApiLimiter` applied before auth middleware; auth routes counted twice

**File:** `server.ts:107, 94-98`

The general limiter at `app.use('/api/', generalApiLimiter)` fires on **all** `/api/*` paths including `/api/auth/login`. Login already has its own strict limiter (10 req / 15 min). The shared general-limiter bucket means:

1. Auth traffic and API traffic compete for the same 200 req/min counter.
2. A traffic spike from authenticated users can push the general bucket to 429, which **blocks login itself** - a self-inflicted lockout scenario.

Fix - exclude the public auth prefix from the general limiter:

```ts
app.use('/api/', (req, res, next) => {
  if (req.path.startsWith('/auth')) return next();
  return generalApiLimiter(req, res, next);
});
```

**Impact:** Low probability today (internal tool with few users), but becomes a correctness issue if any automated agent, health-check, or webhook hammers `/api/` paths.

---

## Medium Priority

### M1 - Duplicate `requireAdmin` guard on `/api/admin`

**Files:** `server.ts:132` and `server/routes/admin-fb-config.routes.ts:21`

```ts
// server.ts
app.use("/api/admin", requireAdmin, createAdminFbConfigRoutes());

// inside createAdminFbConfigRoutes():
router.use(requireAdmin);  // fires again
```

Double `requireAdmin` is not a security bug (the inner guard is stricter than redundant), but it is dead code and misleads anyone reading the route file into thinking the route self-protects independently. The `requireAdmin` inside `admin-fb-config.routes.ts` should be removed now that the outer mount handles it. Alternatively, keep only the inner guard and remove it from the mount line - but the current mixed state is confusing.

Also, `server.ts` still defines its own local `requireAdmin` function at line ~56 that is identical to the one in `admin-fb-config.routes.ts`. The singleton pattern was applied to Prisma; the same cleanup should apply to this duplicated middleware.

---

### M2 - PMDashboard error state removes the retry button with no alternative

**File:** `src/pages/PMDashboard.tsx:248-256`

The migration from `useState` to `useQuery` removed the manual retry button:

```tsx
// before: had a Retry button calling fetchData()
// after: static message with no recovery action
<p className="text-error font-bold mb-4">Failed to load dashboard data. Please try again.</p>
```

React Query retries once by default (configured in `query-client.ts:retry: 1`) and does not automatically retry on user action from a static render. Users who land on this error screen have no escape except a full page reload.

Fix - expose at least one query's `refetch` and wire a retry button, or use `useQueryClient().invalidateQueries()` on button click:

```tsx
const { refetch: retryAll } = useQuery({ queryKey: ['pm-dashboard', 'work-items'], ... });
// or collect all refetch handles and call them together
<button onClick={() => retryAll()}>Retry</button>
```

Alternatively, since all six queries share the `['pm-dashboard', ...]` prefix, a single `queryClient.invalidateQueries({ queryKey: ['pm-dashboard'] })` on a button click refetches all of them.

---

### M3 - CSP `reportOnly` is deployed with no `report-uri` or `report-to` endpoint

**File:** `server.ts:69-74`

```ts
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    reportOnly: true,
  },
}));
```

Helmet's default CSP does not configure a `report-uri` or `report-to` directive. The browser will generate violation reports but silently discard them because there is no endpoint to send them to. The golden-path checklist item "Check response headers include `Content-Security-Policy-Report-Only`" will pass (header is present), but you receive zero observability value from violations.

This is intentional if the goal is just to add the header as a first step. If so, document it. If violations should actually be captured, add a report endpoint:

```ts
contentSecurityPolicy: {
  useDefaults: true,
  reportOnly: true,
  directives: {
    'report-uri': ['/api/csp-report'],
  },
},
```

---

### M4 - `queryKey` uses a plain object reference for filter params - React Query key equality

**Files:** `src/components/lead-tracker/daily-stats-tab.tsx:26`, `src/components/lead-tracker/lead-logs-tab.tsx:127`

```ts
// Constructed inline on every render
const params: Record<string, string> = {};
if (dateFrom) params.dateFrom = dateFrom;
if (dateTo) params.dateTo = dateTo;

useQuery({ queryKey: ['lead-daily-stats', params], ... });
```

React Query serializes query keys via deep equality, so this is functionally correct - the library does compare object contents, not reference identity. However, a new `params` object is created on every render, which means React Query must deep-compare on every render to determine staleness. More importantly, property insertion order determines deep equality; `{ dateFrom: 'x', dateTo: 'y' }` and `{ dateTo: 'y', dateFrom: 'x' }` are treated as **different keys** by React Query's default hasher.

The current code always inserts `dateFrom` before `dateTo` (same insertion order), so there is no active bug. But it is a latent correctness trap if key construction order ever changes. Fix by sorting keys or using a canonical tuple:

```ts
queryKey: ['lead-daily-stats', dateFrom ?? '', dateTo ?? ''],
```

---

## Low Priority

### L1 - `server/lib/prisma.ts` singleton has no connection pool configuration

**File:** `server/lib/prisma.ts`

```ts
export const prisma = new PrismaClient();
```

This is correct for a singleton but the old instantiation sites also used bare `new PrismaClient()`, so connection pool size was not previously configured either. Now that there is a single file to change, it is a good time to set reasonable pool limits via the `datasourceUrl` connection string or `__internal` configuration, especially given the sync scheduler and cron jobs that run concurrently with the web server. Not blocking.

---

### L2 - `conversionRatesCache` in `overview-ad-spend.ts` is a second independent cache alongside `_cache`

**File:** `server/services/dashboard/overview-ad-spend.ts:18-33`

There are now two separate cache implementations in the same file: the `_cache` Map used by `withCache`, and the standalone `conversionRatesCache` object. The `conversionRatesCache` is also missing the in-flight deduplication from H1. Consider routing `getConversionRates` through `withCache` too:

```ts
export async function getConversionRates() {
  return withCache('conversion-rates', async () => { ... });
}
```

This removes the separate cache variable and closes the same thundering-herd window for exchange-rate fetches.

---

### L3 - `server.ts` still instantiates its own `new PrismaClient()` directly

**File:** `server.ts:44`

```ts
const prisma = new PrismaClient();
```

Phase 02 migrated service files to `import { prisma } from './server/lib/prisma'` but `server.ts` itself still creates a second PrismaClient instance. This means the application runs **two** Prisma connection pools simultaneously: one in `server.ts` (used for route factories that accept `prisma` as argument) and one in `server/lib/prisma.ts` (used by migrated service files). The `grep -rn 'new PrismaClient'` validation check from the plan would catch this.

Fix:

```ts
// server.ts
import { prisma } from './server/lib/prisma';
// remove: const prisma = new PrismaClient();
```

All route factories that receive `prisma` as a parameter will continue to work unchanged.

**Note:** This makes L3 the highest-priority item in the Low group because two pools means double the DB connections held open and divergent lifecycle management.

---

## Positive Observations

- Auth guard layering on `/api/admin` is now correct: `createAuthMiddleware` fires first (line 116), then `requireAdmin` (line 132), then the route handler. Identity check and authorization check are both present in the right order.
- CORS missing-origin allowance is correctly scoped to non-production only (`allowMissingOrigin = process.env.NODE_ENV !== 'production'`).
- The `fullName` addition to `req.user` is typed as optional (`fullName?: string`) in `express.d.ts`, which is correct given that older JWTs in circulation will not carry the field.
- Deleted hook files (`use-users.ts`, `use-objectives.ts`, `use-sprints.ts`, `ProtectedRoute.tsx`) have zero remaining imports - clean removal confirmed.
- `SprintContext.tsx` is a textbook React Query context wrapper: single fetch, shared across all consumers, correct `refetch` forwarding.
- `lead-logs-tab.tsx` mutation handlers correctly call `queryClient.invalidateQueries({ queryKey: ['leads'] })` after every write, maintaining cache consistency.
- The `existingMap` key lookup in `crm-lead-sync.service.ts` correctly uses `BigInt` for both the Map key and the lookup - type-safe.
- Body limit raised to `2mb` exactly matches the plan validation decision.

---

## Recommended Actions (Priority Order)

1. **[L3 - treat as blocking]** Remove `const prisma = new PrismaClient()` from `server.ts` and import from `./server/lib/prisma`. This is the only item that partially invalidates a stated Phase 02 goal (Prisma singleton).
2. **[H1]** Add in-flight deduplication to `withCache` in `overview-ad-spend.ts` to prevent thundering-herd on every 60s TTL boundary.
3. **[H2]** Batch-fetch `crm_activities` before the inner loop in `crm-lead-sync.service.ts` to complete the N+1 elimination for `deriveResolvedDate`.
4. **[H3]** Exclude `/api/auth` paths from the `generalApiLimiter` to prevent competing rate-limit buckets blocking login under load.
5. **[M1]** Remove the redundant `requireAdmin` from inside `createAdminFbConfigRoutes` now that the mount-site guard is in place, and remove the duplicate `requireAdmin` function definition from `server.ts`.
6. **[M2]** Restore a retry button in the PMDashboard error state using `queryClient.invalidateQueries({ queryKey: ['pm-dashboard'] })`.
7. **[M4]** Replace object-shaped query keys with ordered tuples in `daily-stats-tab.tsx` and `lead-logs-tab.tsx`.
8. **[L2]** Route `getConversionRates` through `withCache` to eliminate the separate `conversionRatesCache` and close the same thundering-herd window.

---

## Metrics

- TypeScript errors: 0
- Build: PASS
- Remaining `new PrismaClient()` outside singleton: 2 (expected 1: `server/lib/crm-db.ts`; unexpected 1: `server.ts`)
- Dead-code grep (ProtectedRoute, use-users, use-objectives, use-sprints): 0 hits - clean
- Auth path: `createAuthMiddleware` -> `requireAdmin` -> route handler - correct order confirmed

---

## Unresolved Questions

1. Is there a plan to graduate CSP from `reportOnly` to enforced? If so, a `report-uri` endpoint must be added before enforcement to avoid blind spots.
2. Is `server.ts`'s own `PrismaClient` instance intentionally kept separate (e.g. for lifecycle isolation during shutdown), or is this an oversight from Phase 02 scope?
3. The general rate limiter has no `keyGenerator` and no `app.set('trust proxy', ...)`. Behind a reverse proxy (Nginx/Caddy in production), `req.ip` will be the proxy IP, making the limiter a global counter rather than per-client. Is this deployment behind a proxy?

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Build is clean, auth guard is correctly layered, dead-code removal is clean, and the frontend query migration is solid. Four blocking or near-blocking concerns: the Prisma singleton is incomplete (server.ts still holds a second instance), the cache has a thundering-herd window, the N+1 fix is partial (CRM queries still per-row), and the general rate limiter covers public auth routes.
**Concerns:** See H1, H2, H3, L3 above.
