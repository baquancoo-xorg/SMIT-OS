# Phase 03 — Ads Tracker MVP

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Brainstorm: [`../reports/brainstorm-260510-0237-acquisition-trackers.md`](../reports/brainstorm-260510-0237-acquisition-trackers.md) (Section 6, Phase 3)
- Meta API analysis: [`../reports/brainstorm-260509-1243-meta-ads-mcp-vs-graph-api.md`](../reports/brainstorm-260509-1243-meta-ads-mcp-vs-graph-api.md)
- Dependencies: Phase 2 (schema)

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P2 |
| Effort | 5-7 ngày (2 sub-phases) |
| Status | ✅ completed |
| Completed | 2026-05-10 |
| Review | passed (post-review fixes: currency, sync mutex, N+1, caching) |

Build Ads Tracker với data từ Meta (extend integration đã có) + attribution với Lead Tracker qua `utm_campaign`. Đây là phase value-delivery chính cho leadership.

**Scope MVP:** Meta only. Google Ads + TikTok Ads defer sang phase sau khi mở rộng platform.

## Sub-phases

| # | Sub-phase | Effort | Blockers |
|---|---|---|---|
| 3a | Meta extension | 3-5d | Phase 2 |
| 3b | Attribution với Lead Tracker | 2-3d | 3a |

3a + 3b ship cùng PR hoặc PR riêng — independent với UI build (UI có thể parallel).

## Key Insights

- `server/lib/facebook-api.ts` (90 LOC) hiện chỉ lấy account-level spend → cần extend lên campaign-level
- `RawAdsFacebook` đã có raw layer → phase này thêm normalize → `AdCampaign` + `AdSpendRecord`
- Lead Tracker có sẵn cột `source` (string) → join với `AdCampaign.utmCampaign` qua exact match
- ETL job dùng pattern `EtlErrorLog` (đã có) cho error tracking
- `FbAdAccountConfig` (đã có) chứa token → reuse hoàn toàn, không cần admin UI mới

## Requirements

### Functional
- **3a Meta:** Sync daily campaigns + spend từ Meta Ads → populate `AdCampaign` + `AdSpendRecord`
- **3b Attribution:** Match `Lead.source` với `AdCampaign.utmCampaign` → tính CPL, ROAS, lead count theo campaign
- UI Ads Tracker (`/ads-tracker`) hiển thị:
  - List campaigns: name, status, spend, lead count, CPL
  - Date range filter
  - Spend trend chart (line, daily)
  - Top campaigns by ROAS table
  - Click campaign → drill-down: leads attributed, daily spend, conversion rate

### Non-functional
- Cron sync 1 lần/ngày 02:00 UTC
- Token expiry alert: log + notification 7 ngày trước expire
- Rate limit: tuân thủ quota Meta (200/h)
- Error log vào `EtlErrorLog` với đủ context (account, endpoint, response)

## Architecture

```
[Cron daily 02:00]
  └─ syncMetaAds()      → fetch /act_XXX/campaigns + insights → upsert AdCampaign + AdSpendRecord
                ↓
[AdCampaign.utmCampaign = Lead.source matching]
                ↓
[Attribution view]
  - leadsByCampaign[campaignId] = count Lead WHERE source = utmCampaign
  - cpl = sum(spend) / leadsByCampaign
  - roas = sum(revenue from leads) / sum(spend)  ← cần Lead có field revenue (defer nếu chưa)
                ↓
[UI /ads-tracker]
  - Tabs: Campaigns | Performance | Attribution
```

### Files structure mới

```
server/
├── lib/
│   └── facebook-api.ts             (existing, extend campaign-level)
├── services/
│   ├── ads/
│   │   ├── ads-sync.service.ts          (new — orchestrator)
│   │   ├── meta-ads-normalize.ts        (new — raw → AdCampaign)
│   │   └── attribution.service.ts       (new — join Lead ↔ AdCampaign)
│   └── facebook/                   (existing)
├── routes/
│   └── ads-tracker.routes.ts       (new — GET campaigns, attribution)
└── cron/
    └── ads-sync.cron.ts            (new — daily Meta sync)

src/
├── pages/
│   └── AdsTracker.tsx              (replace stub)
├── components/
│   └── ads-tracker/
│       ├── campaigns-table.tsx
│       ├── spend-chart.tsx
│       └── attribution-table.tsx
└── hooks/
    └── use-ads-tracker.ts          (TanStack Query hooks)
```

## Related Code Files

### Modify
- `server/lib/facebook-api.ts` — add `getCampaigns(accountId)`, `getCampaignInsights(campaignId, dateRange)`
- `server/services/facebook/fb-sync.service.ts` — extend để gọi API mới + normalize
- `src/pages/AdsTracker.tsx` — replace stub
- `prisma/schema.prisma` — minor adjustment if cần (e.g. thêm field `Lead.revenue` cho ROAS)

### Create
- 5 server files + 3 frontend files (xem cấu trúc trên)
- `docs/utm-guideline.md` — document UTM convention cho marketing team

### Reference
- **`docs/ui-style-guide.md`** ⚠️ — pre-merge checklist cho mọi UI component (Bento metric, glass card, page header, button, table style)
- `src/pages/OKRsManagement.tsx` — source of truth UI
- `server/services/dashboard/overview-ad-spend.ts` — pattern aggregate
- `server/cron/lead-sync.cron.ts` — pattern cron job
- `server/lib/crypto.ts` — encryption

## Implementation Steps (high-level)

### Phase 3a — Meta extension (3-5d)
1. Extend `facebook-api.ts`:
   - `getCampaigns(accountId, since?)` — fetch `/act_XXX/campaigns`
   - `getCampaignInsights(campaignId, dateRange)` — fetch insights with breakdown
2. Create `meta-ads-normalize.ts`: raw → `AdCampaign` + `AdSpendRecord`
3. Create `ads-sync.service.ts`: orchestrate Meta sync
4. Create `ads-sync.cron.ts`: daily 02:00 UTC
5. Test với 1 ad account thật, verify data trong DB

### Phase 3b — Attribution (2-3d)
1. Create `attribution.service.ts`:
   - `getCampaignAttribution(campaignId)` → leads matching `source = utmCampaign`
   - `getAttributionSummary(dateRange)` → aggregate CPL
2. Validate UTM consistency: warn if `Lead.source` không match bất kỳ campaign
3. Document UTM guideline cho marketing team (`docs/utm-guideline.md`)
4. UI: Attribution tab trong Ads Tracker

### UI build (parallel với backend, ship sau khi data có)
**⚠️ MUST follow `docs/ui-style-guide.md` patterns** (page header italic accent, glass card, Bento metric, tab pill style từ OKRs).

1. Build `AdsTracker.tsx` với tabs: Campaigns | Performance | Attribution
   - Page header pattern: breadcrumb `Acquisition > Ads Tracker` + title `Ads <span className="text-primary italic">Tracker</span>`
   - Tab toggle: pill style `bg-slate-100 rounded-full p-0.5` (giống OKRs L1/L2)
2. `campaigns-table.tsx`: sortable columns (spend desc default), reuse `TableShell` từ `src/components/ui/`
3. `spend-chart.tsx`: line chart 30 ngày trong glass card
4. `attribution-table.tsx`: campaign + lead count + CPL + ROAS
5. Hooks `useAdsTracker.ts`: TanStack Query cho list, detail, attribution
6. **Pre-merge UI checklist** (style-guide.md) MUST pass

## Todo List

### Phase 3a — Meta
- [x] Extend `facebook-api.ts` (campaign + insights endpoints)
- [x] Create `meta-ads-normalize.ts`
- [x] Create `ads-sync.service.ts` (Meta only first)
- [x] Create `ads-sync.cron.ts`
- [x] Test sync với 1 ad account thật
- [x] Verify data trong Prisma Studio

### Phase 3b — Attribution
- [x] Create `attribution.service.ts`
- [x] UTM validation logic
- [x] Document UTM guideline + publish
- [x] Attribution tab UI

### UI
- [x] Replace stub `AdsTracker.tsx`
- [x] 3 components ads-tracker
- [x] Hooks
- [x] E2E test

## Success Criteria

- [x] Meta data sync đầy đủ vào `AdCampaign` + `AdSpendRecord` daily
- [x] Click campaign trong UI → thấy daily spend chart + lead attribution
- [x] CPL hiển thị chính xác (verify manual với 2-3 campaign)
- [x] Attribution table mismatch warnings (UTM không match) ≤ 10% leads
- [x] Cron job log success/error vào `EtlErrorLog`

## Post-Review Fixes Applied

- **Currency normalization:** All ad spend aggregations now normalize USD→VND via `currency-helper.ts` (mirrors `overview-ad-spend.ts` pattern). All summary endpoints report VND.
- **Sync mutex:** POST /api/ads-tracker/sync returns 409 if a sync in-flight (prevents Meta API hammer on admin double-click).
- **N+1 prevention:** `getAttributionSummary` refactored to single-fetch + Map lookup (campaigns + leads each fetched once).
- **Caching:** `getJourneyFunnel` now has 5-min cache + in-flight de-dup matching React Query staleTime.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| UTM convention không nhất quán | 🟡 Medium | Validation + warning UI, training marketing team |
| Lead `source` field free-text → match sai | 🟡 Medium | Strict match (case-insensitive trim), suggest fuzzy match future |
| Meta token rotate gây downtime sync | 🟡 Medium | Refresh logic trong wrapper API, alert 7d trước expire |
| Currency mismatch (USD vs VND) | 🟡 Medium | Reuse `ExchangeRateSetting` (đã có) để normalize về VND |
| Rate limit Meta hit (200/h) | 🟢 Low | Backoff + retry trong wrapper, log vào EtlErrorLog |

## Security Considerations

- Reuse `FbAdAccountConfig` (đã encrypted) — không cần thêm token storage mới
- Admin-only routes cho config (`admin-auth.middleware.ts`)
- KHÔNG expose token plain text trong API response

## Next Steps

- Phase 4: Media Tracker MVP
- Sau Phase 3 ship → đo % UTM match rate → quyết định fuzzy match cho future
- Khi mở rộng paid platform: thêm Phase 3c Google Ads, Phase 3d TikTok (xem `plan.md` Future scope)
