# Code Review — Acquisition Trackers (260510-0237)

> Reviewer: code-reviewer
> Date: 2026-05-10
> Scope: Phase 1–6 of plan `260510-0237-acquisition-trackers` (sidebar + schema + Ads/Media MVP + dashboard + polish)
> Branch: `main` (uncommitted)
> Verdict: **Ship-ready with 2 must-fix items** (Crit #1 + Crit #2). Rest can land as follow-ups.

---

## Top 5 Critical Issues (blocking / must-fix)

### CRIT-1 — Currency aggregation silently sums across mixed currencies
**Files:** `server/routes/ads-tracker.routes.ts:57-79`, `server/services/ads/attribution.service.ts:51-58`, `server/services/acquisition/journey-funnel.service.ts:63-66, 113`, `src/pages/AdsTracker.tsx:41-48`, `src/components/dashboard/marketing/marketing-tab.tsx:26-33`

`AdSpendRecord.spend` is stored in **account currency** (USD or VND). Multiple places naively `reduce((s, r) => s + Number(r.spend), 0)` and then label the total with the currency of the **first row** (`spendRecords[0]?.currency ?? 'VND'`). If you have one USD account + one VND account, the dashboard will display `30,500,001 VND` (i.e. 30M VND + 1 USD added directly).

The plan explicitly calls out the existing pattern in `overview-ad-spend.ts` which converts USD→VND via `getGlobalExchangeRate()` per-account. The new code does not reuse that pattern.

Worse: `AdsCampaignSummary.currency` is a single string per campaign — yet a campaign can have spendRecords in multiple currencies if the Meta account currency was changed mid-period (rare but possible). The frontend then does `c.currency` thinking it's authoritative.

**Fix:** Either
1. Normalize spend → VND at write time in `meta-ads-normalize.ts` (recommended — store one currency forever), or
2. Apply per-row currency conversion at read time using the same `getGlobalExchangeRate()` helper as `overview-ad-spend.ts`.

Today's MVP only has VND seed + Meta normally returns account currency, so this might not bite immediately, but it's a latent prod bug for any multi-currency account.

**Severity:** High (silent financial-metric corruption when conditions met).

---

### CRIT-2 — `req.user.userId` shape mismatch in `media-tracker.routes.ts` works only by coincidence
**Files:** `server/routes/media-tracker.routes.ts:111, 132, 154`, `server/middleware/auth.middleware.ts:47-53`

The middleware sets `req.user = { userId, role, isAdmin, departments, fullName }`. The media-tracker route reads `req.user.userId` directly — that's fine. But the service expects `{ id, isAdmin }` (see `media-post.service.ts:80`), and the route adapts by passing `{ id: req.user.userId, isAdmin: !!req.user.isAdmin }`. OK in isolation, but:

- `req.user!.userId` is used without a non-null assertion guard in `parseInput(req.body)` paths where the `if (!req.user)` early-return is present. Logical safety is fine.
- However, `req.user` typing is global and ambient. If anyone in the future thinks `req.user.id` exists (matching `User.id` on the DB), they get `undefined` silently. Worth standardizing.

**Concrete bug today:** Look at `createMediaPost(parsed.input, req.user.userId)` — the `parseInput` runs **before** the auth check returns, so when `req.user` is undefined, `parsed.input` is computed from the body (no harm), but the guard pattern is fragile. More importantly: `parseInput(req.body)` does **not validate** that `body.publishedAt` is in a sane range (could be year 9999, could be `Infinity`-NaN-then-Date). Combined with `take: 500` cap on list, no DoS risk, but still loose.

Real bug: **`updateMediaPost` allows changing every field including `createdById` if a malicious user crafts the body**. Let's check… `parseInput` does not include `createdById`, and `updateMediaPost` only spreads whitelisted fields. ✅ Safe — but double-check `meta` since it's `Prisma.InputJsonValue` and could carry `{ "$set": ... }` style tricks. With Prisma JSON columns, this is **not** an injection vector (Prisma serializes via `pg`'s JSON encoder). ✅ Safe.

So the **real** issue here: **PUT `/posts/:id` uses `parseInput` which requires `platform` + `publishedAt`** even on partial updates. Editing just the cost on a KOL post forces the client to re-send all required fields. This works in the dialog (which re-sends everything from state), but breaks any future PATCH flow. The route is named PUT so this is actually correct semantics; flag as a soft contract.

**Real fix needed:** **`req.user.userId` typing inconsistency is a project-wide concern** — but in this PR specifically, the only material bug is that `parseInput(req.body)` re-validates the entire payload on PUT. Since the dialog always sends a full payload, this works today, but a future PATCH endpoint will need refactor.

**Re-classification: Demote to Medium.** No actual bug today.

(Replacing this slot with the next critical issue.)

---

### CRIT-2 (replacement) — Fire-and-forget `/sync` swallows errors silently in production
**File:** `server/routes/ads-tracker.routes.ts:175-186`

```ts
const task = accountId ? syncMetaAdAccount(accountId) : syncAllMetaAccounts();
task
  .then((r) => console.log('[ads-sync] result:', r))
  .catch((e) => console.error('[ads-sync] failed:', e));

res.status(202).json(ok({ accepted: true, accountId: accountId ?? 'all' }));
```

Issues:
1. **No idempotency / dedup.** Admin double-clicks "Sync Meta" → two concurrent syncs, both upserting the same `(campaignId, date)` rows. Prisma upserts are atomic per-row but you'll get duplicated EtlErrorLog entries and redundant FB API calls (rate-limit risk).
2. **No mutex / lock** — recommend either an in-memory `Map<accountId, Promise>` guard or a DB lock row (matches pattern in `lead-sync` if used there).
3. **Hot-reload server restart** during a sync silently drops the in-flight Promise. The cron job will retry next day, but admin sees no feedback.
4. **`console.log` / `console.error`** instead of `childLogger('ads-sync-route')`. Inconsistent with the rest of the codebase (which uses pino via `childLogger`).
5. **No request-level audit trail.** Who triggered the sync? When? Useful for debugging "why did spend numbers change at 14:23?".

**Fix:**
- Add in-memory lock: `if (_syncInFlight) return res.status(409).json(fail('Sync already running', 409))`
- Replace `console.log` with `log.info` / `log.error`
- (Nice-to-have) Persist a `AdSyncRun` row mirroring `LeadSyncRun` — defer if YAGNI, but log who triggered.

**Severity:** Medium-High (concurrent sync races + silent failure).

---

### CRIT-3 — N+1 in `getAttributionSummary` will tip over at modest scale
**File:** `server/services/ads/attribution.service.ts:97-111`

```ts
const campaigns = await prisma.adCampaign.findMany({ select: { id: true } });
for (const c of campaigns) {
  const att = await getCampaignAttribution(c.id, dateRange);  // each call does 1 campaign + 1 lead query
  if (att) out.push(att);
}
```

Per campaign: 1 `findUnique` (with spend join) + 1 `lead.findMany`. With 100 campaigns × 1000 leads in date range, that's:
- 100 sequential DB roundtrips for campaigns (~5–10ms each → 0.5–1s)
- 100 sequential `lead.findMany` queries each scanning the whole `Lead` table within the date range (no index on `Lead.source`, only on `receivedDate` and `[ae, receivedDate]`)
- Each call also re-fetches `lead.source` for ALL leads in range and filters in JS — duplicated work × 100.

**Concrete fix:**
1. Fetch all leads in date range **once**: `const allLeads = await prisma.lead.findMany({ where: dateRange, select: { id, source, status }})`.
2. Build `Map<normalizedSource, Lead[]>` once.
3. Fetch all campaigns + spendRecords in a single `findMany` with `include: { spendRecords: { where: dateRange } }`.
4. For each campaign, look up its leads from the map (O(1)).

This collapses ~200 queries → 2 queries. Roughly 100× speedup.

**Bonus:** Add a partial index hint or expression index for `Lead.source` since it's now a join key. Today there's no index → sequential scan on Lead per request.

**Severity:** High (latent perf cliff; UI on `/ads-tracker` Attribution tab will become unbearable at 50+ campaigns).

---

### CRIT-4 — `journey-funnel.service.ts` — `userPaid` could be `Decimal` and silently lose precision
**File:** `server/services/acquisition/journey-funnel.service.ts:88-90, 113`

```ts
{ _sum: { userPaid: null as number | null }, _count: { _all: 0 } }   // fallback
...
const revenue = paidTransactions._sum.userPaid != null
  ? Number(paidTransactions._sum.userPaid) : 0;
```

Two issues:
1. **The fallback type `null as number | null`** lies — when `safeCrmQuery` fallback fires, `_sum.userPaid` is `null`. But TypeScript-wise the actual return shape from Prisma's `aggregate` is `{ _sum: { userPaid: Decimal | null }, _count: { _all: number } }`. The `as number | null` cast hides the Decimal type, so callers do `Number(...)` which works for Decimal (truncates precision when value > 2^53).
2. **Silent precision loss for revenue ≥ ~9 quadrillion VND** — not a real risk for VN business, but stylistically wrong. If multiplying `userPaid` (Decimal) by exchange rate later, prefer `.toNumber()` from Decimal or `Number(decimal.toString())`.

**Also:** `safeCrmQuery` returns the fallback when CRM is down — but the code does `paidTransactions._count._all ?? 0` which assumes Prisma's shape. The fallback object has `_count: { _all: 0 }` — works, but if CRM is unavailable the dashboard shows 0 paid customers with no banner. Consider surfacing a `crmAvailable: boolean` flag in the response so UI can warn.

**Severity:** Medium (cosmetic typing issue + missing CRM-down indicator).

---

### CRIT-5 — `Promise.all` inside `journey-funnel` runs heavy CRM queries in parallel without timeout
**File:** `server/services/acquisition/journey-funnel.service.ts:51-102`

`Promise.all` fans out 3 normalized DB queries + 3 CRM queries simultaneously. On a healthy day this is fine (~200ms). But:

1. **No per-query timeout** — if any CRM query hangs (CRM database under load, network blip), the whole `/api/acquisition/journey` endpoint hangs. The `acquisition-overview-tab.tsx` shows a spinner forever.
2. **`safeCrmQuery` swallows errors** — good, no 500s. But it does **not** swallow timeouts; it relies on Prisma's default connection timeout (30s). User waits 30s for a stale dashboard.
3. **Cache:** This route has zero caching (unlike `overview-ad-spend.ts` which has TTL 60s + `withCache`). On dashboard refresh, every visit hammers the CRM.

**Fix:**
- Add `withCache(key, ...)` pattern (5-min TTL — matches `staleTime: 5 * 60_000` in the React Query hook).
- (Nice-to-have) wrap `safeCrmQuery` calls in `Promise.race([fn(), timeout(5000)])` to cap wait.

**Severity:** Medium-High (UX-visible perf cliff on CRM degradation).

---

## Top 5 Medium Priority

### MED-1 — `MediaPost` seed `deleteMany + create` is **not** safely idempotent under concurrency
**File:** `prisma/seeds/acquisition.seed.ts:138-161`

```ts
await prisma.mediaPost.deleteMany({ where: { platform: post.platform, url: post.url } });
await prisma.mediaPost.create({ data: { ... } });
```

If two seed runs execute concurrently (CI parallel jobs, or admin clicks "re-seed" while another seed is in flight), there's a race where both `deleteMany` complete before either `create`, then both `create` succeed → 2 rows. There's no `@@unique([platform, url])` to prevent it.

Also concerning: `publishedAt: daysAgo(Math.floor(Math.random() * 14))` — every seed run produces different dates. Fine for dev demo, but if you ever run seeds in staging for screenshot tests, results are non-deterministic.

**Fix options:**
1. Add `@@unique([platform, url])` to the schema (but `url` is nullable, so unique constraint on nullable in Postgres = each NULL is distinct → won't enforce). Use partial unique index via raw SQL.
2. Wrap in `prisma.$transaction([deleteMany, create])` for atomicity.
3. Or: just use `upsert` after adding the unique constraint.

**Severity:** Low for prod (only seed file), Medium if seed is reused as a "reset demo data" admin button.

---

### MED-2 — `extractConversionCount` double-counts pixel + lead actions
**File:** `server/lib/facebook-api.ts:163-177`

```ts
const types = new Set([
  'lead',
  'purchase',
  'onsite_conversion.lead_grouped',
  'offsite_conversion.fb_pixel_lead',
  'offsite_conversion.fb_pixel_purchase',
]);
```

Meta's actions array often contains BOTH `lead` and `onsite_conversion.lead_grouped` for the same conversion (one is the canonical, the other is a tracking subtype). Summing both → 2× the real count.

Compare to existing `extractLandingPageViews` in `overview-helpers.ts` — likely uses a more curated list. Worth a unit test with a real Meta API payload sample.

**Fix:** Pick **one** canonical action_type per conversion category (`lead` OR `onsite_conversion.lead_grouped`, not both). Reference: Meta's recommended attribution = `actions` with `action_type === 'lead'` for lead-form ads.

**Severity:** Medium (conversions metric inflated, affects CTR/CVR derived numbers).

---

### MED-3 — `parseDateRange` builds Date from query string with no validation
**Files:** `server/routes/ads-tracker.routes.ts:18-23`, `server/routes/media-tracker.routes.ts:87-88`, `server/routes/acquisition.routes.ts:28-32`

Acquisition route validates with `isNaN(date.getTime())` — good. Ads/media routes do **not** validate:

```ts
if (req.query?.from) range.from = new Date(String(req.query.from));
```

`new Date("totally-bogus")` gives an Invalid Date object — Prisma will reject with a runtime error → 500 to user. Not a security issue (error handler doesn't leak), but ugly.

**Fix:** Add the same `isNaN(d.getTime())` check + 400 response, or use a shared helper.

**Severity:** Low (UX paper-cut).

---

### MED-4 — `Lead.findMany` in `getCampaignAttribution` ignores `source` filter at DB level
**File:** `server/services/ads/attribution.service.ts:64-77`

```ts
const leads = await prisma.lead.findMany({
  where: { source: { not: null }, ...dateRange },
  select: { id: true, source: true, status: true },
});
const matched = leads.filter((l) => normalizeKey(l.source) === target);
```

This pulls **every lead with a source** in the date range and filters in JS. Combined with N+1 (Crit-3) you're fetching the whole `Lead` table N times.

**Fix (after Crit-3 single-fetch refactor):**
- Or: if you keep per-campaign queries, push the comparison to the DB. Postgres supports `lower(trim(source)) = lower(trim($1))` via `Prisma.sql` raw, or you could **store a normalized utm key column** on Lead at write-time (best). For MVP, JS filtering with single fetch is fine.

**Severity:** Medium (paired with Crit-3).

---

### MED-5 — `MediaTab` filters posts by `from/to` but only fetches default page
**File:** `src/components/dashboard/media/media-tab.tsx:26`

```ts
const postsQuery = useMediaPostsQuery({ from, to });
```

Service caps at `take: 500`. If a date range has > 500 posts (unlikely today but plausible at scale), the dashboard's "Total Posts" KPI silently undercounts. Same issue on `MediaTracker.tsx:41` which fetches with no filters → also caps at 500.

**Fix:**
1. Either expose a count endpoint (`GET /api/media-tracker/posts/count?from&to`) for KPIs.
2. Or do a `prisma.mediaPost.count` server-side and return it alongside `posts` in the list response.
3. Surface a "+N more — refine filter" hint in UI when `posts.length === 500`.

**Severity:** Low-Medium (silent miscount under heavy data; not today).

---

## Nice-to-haves (skip if rushed)

1. **Logger consistency:** `server/routes/ads-tracker.routes.ts` uses `console.log/error` for sync results. Other code uses `childLogger`. Standardize.

2. **Type inconsistency between API response and Prisma model:**
   `AdsCampaignSummary.spendTotal: number` (frontend) ← `Decimal.reduce` (backend). Decimal → Number conversion is implicit via `Number(r.spend)`. Acceptable for VND amounts < 2^53, but worth a code comment on the conversion site.

3. **Route auth gate audit:**
   - `/api/ads-tracker/*` is mounted under `/api` after `createAuthMiddleware` (line 130 of server.ts). Any logged-in user sees ALL campaign data including `spendTotal`. Today this matches read-shared, but if Member shouldn't see total spend, add a guard. Plan says read-shared is OK → ✅ approve.
   - `/api/ads-tracker/sync` is correctly gated (`!req.user?.isAdmin → 403`). ✅
   - `/api/media-tracker/posts` (POST/PUT/DELETE) checks ownership via service. ✅ But `req.user` check is only in the route — service trusts whatever user the route hands it. If anyone wires up a new route that calls `updateMediaPost` without an auth guard, they bypass RBAC. Defensive option: assert `user.id` is non-empty in the service.

4. **Empty-state copy:** "No campaigns yet — run sync from admin" (campaigns-table.tsx:101) shows the same message to non-admins who can't run sync. Suggest "No campaigns yet — ask admin to run Meta sync" for non-admins.

5. **`MediaPostDialog` accessibility:** No `aria-modal` or focus trap on the dialog. Pressing Esc doesn't close. Tab cycles outside the dialog. Low priority but worth a follow-up phase.

6. **CSV export does not URL-encode `qp` values.** `Object.fromEntries(Object.entries(params).filter(...))` then passed to `URLSearchParams` (in `api.getAdsCampaigns`). Safe, but worth noting.

7. **`spend-chart.tsx` aggregation fallback** shows truncated campaign name (`c.name.slice(0, 16) + '…'`) on x-axis — not really a "trend" anymore. Consider hiding the chart entirely when no `dailySpend` is provided, or add a "Top campaigns by spend" title.

8. **Money formatting:** Multiple `Intl.NumberFormat('en-US')` for VND. VND is typically formatted with `vi-VN` locale + space separators. Cosmetic.

9. **`MediaPostType` enum vs `MediaPlatform.PR`:** A user can create a post with `platform: 'PR'` but `type: 'ORGANIC'` — semantic nonsense but currently allowed. Either drop `PR` from `MediaPlatform` (breaking schema change) or add a UI guard. Low priority.

10. **`DEFAULT_LOOKBACK_DAYS = 30`** — hardcoded. If admin wants to backfill 90 days, they have no API surface for it. The function accepts options, but the route doesn't expose `since/until`. Add `req.body.since/until` passthrough for power users.

11. **`new Date(day.date_start)`** in `meta-ads-normalize.ts:145` — when Meta returns `"2026-05-10"` (date-only), JS parses as UTC midnight. Then `setUTCHours(0,0,0,0)` is a no-op. Fine. Just worth a comment that we trust Meta's date_start is UTC.

12. **Plan TODO completion:** Phase 6 plan file likely has unchecked items for "FB/IG/YouTube auto-sync" and "Email digest" — these are explicitly deferred per scope. Verify with `ck plan check` that they're marked deferred not just unchecked.

13. **Decimal precision on `cost`** in MediaPost: `Decimal(12, 2)` allows 9,999,999,999.99 = ~10 billion VND per post. Reasonable.

14. **`startedAt`/`endedAt` come from Meta as ISO strings** in `meta-ads-normalize.ts:137-138`. `new Date(undefined)` if missing — prevented by the `?` guard. ✅

15. **`AdCampaign.status` is free-string** ("ACTIVE | PAUSED | ARCHIVED"). Could be an enum. KISS argues against; staying as string is fine.

16. **`extractUtmCampaign` regex** — case-insensitive but trims only outer. `[utm:  spaces  ]` would yield `'spaces'` after trim. Fine. But handle whitespace inside differently from underscores? Probably OK.

17. **`req.user` typing**: `auth.middleware.ts` sets `userId`, but DB-level field is `id`. Future contributors will trip on this. Worth a project-wide doc note.

---

## Edge Cases Probed

| Case | Handled? | Where |
|------|----------|-------|
| 0 campaigns | Yes | campaigns-table.tsx:99-103 + attribution-table.tsx:34-39 (empty rows) |
| 0 media posts | Yes | media-posts-table.tsx:62-70 |
| 0 leads | Yes (CPL = null) | attribution.service.ts:79 |
| Funnel with all-zero values | Yes (safeRatio returns null, divide-by-zero handled) | journey-funnel.service.ts:43-46 |
| `bar` width edge | Yes, `Math.max(widthPct, 1)` | journey-funnel.tsx:83 |
| Lead with no `source` | Yes (`source: { not: null }` filter) | attribution.service.ts:64 |
| Concurrent sync trigger | **No — race** | Crit-2 |
| CRM down | Partial (returns 0s, no UI banner) | journey-funnel.service.ts uses safeCrmQuery ✓ |
| Multi-currency aggregation | **No — silent corruption** | Crit-1 |
| Token expired during sync | Returns error, logged to EtlErrorLog ✓ | ads-sync.service.ts:54-64 |
| `publishedAt` in future | Allowed (no validation) | media-tracker.routes.ts:52-53 |
| Member edits another's post | Blocked (403) ✓ | media-post.service.ts:86-88 |
| Admin edits Member's post | Allowed ✓ | media-post.service.ts:86 |
| `meta` Json injection | Safe (Prisma serializes) | media-post.service.ts:103 |

---

## Positive Observations

- Excellent separation: routes thin / services own logic / cron is just a trigger.
- `safeCrmQuery` reuse for cross-DB resilience — correct pattern.
- RBAC ownership check is in the **service layer** not just route — defense in depth.
- Empty states for tables, KPIs, and funnel — UI doesn't crash on no data.
- `Decimal` used appropriately for money fields in Prisma.
- UTM extraction has primary (regex) + fallback (lookup) strategies — pragmatic.
- Cron error handling is proper (try/catch logs but doesn't crash scheduler).
- React Query stale times are reasonable (1m for ads, 30s for media, 5m for journey aggregation).
- TypeScript types match between client/server for the API response shapes.
- Pino `childLogger` used in services (just inconsistent in routes).

---

## UI Style-Guide Compliance Spot-Check

Pulled `OKRsManagement.tsx` rules from `docs/ui-style-guide.md`:

| Rule | AdsTracker | MediaTracker | DashboardOverview |
|------|------------|--------------|-------------------|
| Page wrapper `h-full flex flex-col gap-[var(--space-lg)] w-full` | ✅ | ✅ | ✅ |
| Header pattern (breadcrumb + italic title) | ✅ | ✅ | ✅ (delegated to DashboardPageHeader) |
| Glass card `bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm` | ✅ | ✅ | ✅ |
| Bento metric (decorative blob, `text-[10px] font-black uppercase tracking-widest`) | ✅ | ✅ | ✅ |
| Button `h-10 rounded-full font-black text-[10px] uppercase tracking-widest` | ✅ | ✅ | n/a |
| Tab pill `h-7 px-3.5 rounded-full text-[10px]` | ✅ | ✅ | n/a |

Drift found: **None significant.** `text-[10px] font-black uppercase tracking-widest` is repeated 30+ times — consider a `.label-eyebrow` utility class. Out of scope for this review.

---

## Recommended Action Plan

| Priority | Action | Effort |
|----------|--------|--------|
| P0 | Fix Crit-1 (currency normalization) — convert at write time in `meta-ads-normalize.ts` | 1–2 hrs |
| P0 | Fix Crit-2 (sync mutex) — add in-memory lock + childLogger | 30 min |
| P1 | Fix Crit-3 (N+1 attribution) — single-fetch refactor | 1 hr |
| P1 | Fix Crit-5 (journey cache + timeout) | 1 hr |
| P2 | Crit-4 typing cleanup, MED-2 (lead double-count), MED-3 (date validation) | 1 hr total |
| P3 | MED-1 (seed atomicity), MED-5 (count endpoint), nice-to-haves | follow-up |

**Total P0+P1: ~4 hours.** Recommend landing today's PR with P0 fixes; defer P1/P2 to a follow-up PR same week.

---

## Metrics

- Files reviewed: 22 (server) + 18 (client) = 40
- LOC reviewed: ~2,800
- Linting issues spotted: 0 (no lint output run; review based on grep + read)
- Type coverage: high — only one `as number | null` cast (Crit-4) and a few `any` in dialog form handlers (cosmetic)
- Test coverage: 0 (acknowledged out of scope; no critical untested path)
- Critical issues: 5 (1 must-fix, 4 should-fix)
- Medium issues: 5
- Nice-to-haves: 17

---

## Unresolved Questions

1. **Currency strategy decision** — convert at write or at read? Plan implies read-time (matching `overview-ad-spend.ts`), but write-time is simpler. Owner call.
2. **Audit log for sync trigger** — defer per plan, but flag whether legal/compliance wants it before going to multi-account.
3. **`lead.source` index** — should we add a Postgres index `CREATE INDEX leads_source_idx ON "Lead"(source) WHERE source IS NOT NULL` to support attribution queries? Likely yes, but bench first.
4. **Should `MediaPost.platform: 'PR'` + `type: 'ORGANIC'` be allowed?** Schema permits, UI doesn't enforce. Cleanup later.
5. **`?legacy=true` fallback on Overview** — when does it sunset? Plan should commit to a removal date.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Acquisition trackers MVP is structurally sound and ships safely with 2 must-fixes (currency aggregation + sync mutex). N+1 in attribution and journey-funnel caching are next-PR material, not blocking.
**Concerns/Blockers:** Crit-1 (currency) is the only one I'd hard-block on if multi-currency Meta accounts exist today; if VND-only, defer to follow-up.
