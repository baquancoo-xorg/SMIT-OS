# Phase 02 — Sprint 2: Cohort + Channel (4d, UTM Fix DEFERRED post-audit)

> **Post-audit revision (2026-05-08):** UTM tracking fix DEFERRED — CRM `crm_subscribers_utm` đã có 8+ clean source. Channel section dùng CRM primary + PostHog secondary. Effort 5d → 4d.

## Context Links
- Brainstorm §3 Cohort + §4 Channel + §UTM Tracking Fix
- Phase 1 Retention Embed: `src/components/dashboard/product/product-retention-embed.tsx` (sẽ deprecate)
- Phase 0 audit verdict cho `$referring_domain` + person property `first_referring_domain`

## Overview
- **Priority:** P2
- **Status:** pending (blocked by phase-01)
- Build §3 Cohort (Retention Heatmap thay iframe + Activation Curve) + §4 Channel (Domain Breakdown + Pre-PQL by Source + UTM Status Badge) + UTM tracking fix song song

## Key Insights
- Cohort retention = HIGH RISK HogQL (custom, dễ slow). Bucket by week, cache 1h, fallback empty state
- **Channel data source: CRM `crm_subscribers_utm` primary** (8+ clean source: Home, Faceboookads, Link, fb, Adscheck, ...) — verdict phase-00
- **PostHog `$referring_domain` secondary** widget riêng (94% noise nhưng giá trị cross-validation)
- **UTM tracking fix DEFERRED** — CRM data đủ tốt, không cần touch posthog-js init
- Cohort retention thay thế iframe → loại bỏ env `VITE_POSTHOG_RETENTION_INSIGHT_URL`
- Source normalization cần thiết: `Home`/`Homepage` consolidate, `fb`/`Facebook`/`facebook`/`Faceboookads` consolidate

## Requirements

### Functional
- Cohort Retention Heatmap: cohort-week × {D0, D1, D7, D14, D30}, value = % active
- Cohort Activation Curve: 4-6 cohort gần nhất, line chart % active by day-since-signup (0-30)
- Channel Referring Domain Breakdown: top 10 domain (normalize facebook.com→facebook, t.co→twitter, ...) + "Other"
- Pre-PQL Rate by Source: bar chart so sánh % FirstSync per source
- UTM Status Badge: warning chip "UTM tracking pending — fallback to referrer" nếu UTM vẫn NULL
- UTM tracking fix: posthog-js init capture URL params + `$set_once` person property

### Non-functional
- Cohort cache 1h (heavy query)
- Channel cache 30min
- Cohort retention timeout 10s → fallback empty state với message
- UTM fix không break existing identify call (canary deploy)

## Architecture
```
Backend
  routes/dashboard-product.routes.ts
    ├── GET /cohort  → product-cohort.service.ts → PostHog HogQL bucket-by-week + CRM lookup
    └── GET /channel → product-channel.service.ts → PostHog $referring_domain group + CRM PQL join

Frontend
  product-section.tsx
    ├── §3 Cohort
    │   ├── product-cohort-retention.tsx (NEW, replace iframe)
    │   └── product-cohort-activation-curve.tsx (NEW)
    ├── §4 Channel
    │   ├── product-channel-breakdown.tsx (NEW)
    │   ├── product-prepql-by-source.tsx (NEW)
    │   └── product-utm-status-badge.tsx (NEW, conditional)
    └── (deprecated) product-retention-embed.tsx → REMOVE

UTM Fix (parallel)
  src/lib/posthog-init.ts (or wherever posthog.init() lives)
    + capture utm_source/medium/campaign từ URL params
    + posthog.identify(id, { $set_once: { first_utm_source, first_referring_domain } })
```

## Related Code Files

### Modify
- `/Users/dominium/Documents/Project/SMIT-OS/server/routes/dashboard-product.routes.ts` — thêm 2 endpoint
- `/Users/dominium/Documents/Project/SMIT-OS/server/types/dashboard-product.types.ts` — thêm Cohort/Channel types
- `/Users/dominium/Documents/Project/SMIT-OS/src/types/dashboard-product.ts` — mirror
- `/Users/dominium/Documents/Project/SMIT-OS/src/hooks/use-product-dashboard.ts` — thêm hooks
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-section.tsx` — wire-up §3 §4, remove iframe
- (UTM fix) PostHog init file — locate via grep `posthog.init` trong `src/`

### Create (Backend)
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/posthog/product-cohort.service.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/posthog/product-channel.service.ts`

### Create (Frontend)
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-cohort-retention.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-cohort-activation-curve.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-channel-breakdown.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-prepql-by-source.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-utm-status-badge.tsx`

### Delete
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-retention-embed.tsx` (sau khi cohort-retention live)

## Implementation Steps

### Backend (2.5d)

1. **Types** — extend types:
   ```ts
   ProductCohortResponse: { cohorts: [{ week, size, retention: { d0, d1, d7, d14, d30 } }] }
   ProductChannelResponse: { sources: [{ domain, signupCount, firstSyncCount, prePqlRate }], utmStatus: 'live'|'pending' }
   ```
2. **`product-cohort.service.ts`** (HIGH RISK):
   - HogQL CTE: cohort = `toStartOfWeek(min(timestamp))` per `business_id` từ event 'Tạo doanh nghiệp thành công'
   - Retention: count distinct active business by `dateDiff('day', cohort, activity_date)` IN (0,1,7,14,30)
   - **EXPLAIN PLAN trong dev trước khi prod** — confirm <5s
   - **Timeout** wrapper 10s, return empty cohorts với warning message nếu vượt
   - Cache TTL 1h (custom, override default)
3. **`product-channel.service.ts`** (POST-AUDIT REWRITE):
   - **Primary CRM query:** JOIN `crm_subscribers_utm` × `crm_subscribers` × `crm_businesses` × `crm_business_pql_status`
     ```sql
     SELECT u.utm_source, count(DISTINCT b.id) AS signups,
            count(DISTINCT CASE WHEN p.has_first_sync THEN b.id END) AS first_sync_count
     FROM crm_subscribers_utm u
     JOIN crm_subscribers s ON s.id = u.subscriber_id
     JOIN crm_businesses b ON b.created_by = s.id
     LEFT JOIN crm_business_pql_status p ON p.business_id = b.id
     WHERE u._PEERDB_IS_DELETED = false AND b._PEERDB_IS_DELETED = false
     GROUP BY u.utm_source ORDER BY signups DESC LIMIT 15
     ```
   - **Normalize helper** `normalizeUtmSource()`: Home/Homepage → 'home', fb/Facebook/facebook/Faceboookads → 'facebook', etc.
   - **Secondary PostHog query:** `SELECT properties.$referring_domain, count() FROM events GROUP BY ref ORDER BY count() DESC LIMIT 10` — exclude `$direct` và `agency.smit.vn`
   - Cache TTL 30min
   - Index check: confirm `crm_subscribers_utm.subscriber_id`, `crm_businesses.created_by` đã index
4. **Routes** — 2 endpoint mới
5. **Empty state contract** — clear interface giữa BE/FE: BE trả `data: { cohorts: [], message: 'Query timeout, fallback' }` thay vì throw

### Frontend (1.5d)

6. **Types mirror + hooks** — `useProductCohort()`, `useProductChannel()`
7. **`product-cohort-retention.tsx`** — heatmap grid, Y=cohort week, X=D0/D1/D7/D14/D30, color scale 0-100%, hover tooltip "X% of N businesses active", ~130 LOC
8. **`product-cohort-activation-curve.tsx`** — Recharts multi-line, top 4-6 cohort, ~70 LOC
9. **`product-channel-breakdown.tsx`** — horizontal bar, top 10 domain + "Other" stack, ~100 LOC
10. **`product-prepql-by-source.tsx`** — bar chart so sánh % FirstSync per source (CRM data), ~80 LOC
11. **`product-channel-posthog-secondary.tsx`** — bar chart PostHog $referring_domain (filtered noise), ~80 LOC. Replaces UTM Status Badge.
12. **Wire-up §4** trong `product-section.tsx`: 3 widget — Channel Breakdown (CRM) · Pre-PQL by Source (CRM) · PostHog Referring Domain (secondary)
13. **Wire-up §3 + delete iframe**: `product-retention-embed.tsx` → DELETE + remove env `VITE_POSTHOG_RETENTION_INSIGHT_URL` reference

### ~~UTM Tracking Fix~~ — DEFERRED post-audit
> CRM `crm_subscribers_utm` đã có UTM data clean. Không cần fix posthog-js init. Tiết kiệm 1d.

## Todo List
- [ ] Backend types Cohort + Channel
- [ ] `product-cohort.service.ts` + EXPLAIN check + timeout wrapper
- [ ] `product-channel.service.ts` (CRM primary + PostHog secondary) + utm_source normalize
- [ ] CRM index verify (subscriber_id, created_by)
- [ ] Routes 2 endpoint + cache TTL override
- [ ] Frontend types + hooks
- [ ] `product-cohort-retention.tsx`
- [ ] `product-cohort-activation-curve.tsx`
- [ ] `product-channel-breakdown.tsx` (CRM)
- [ ] `product-prepql-by-source.tsx` (CRM)
- [ ] `product-channel-posthog-secondary.tsx` (PostHog cross-validation)
- [ ] Wire-up §3 §4 trong `product-section.tsx`
- [ ] Delete `product-retention-embed.tsx` + remove env `VITE_POSTHOG_RETENTION_INSIGHT_URL`
- [ ] Smoke test §3 §4

## Success Criteria
- ✅ Cohort Retention Heatmap render real data thay iframe
- ✅ Cohort Activation Curve hiển thị 4-6 cohort gần nhất
- ✅ Channel Breakdown top 10 + "Other"
- ✅ Pre-PQL by Source GO (nếu phase-00 verdict GO) hoặc placeholder
- ✅ UTM Status Badge hiển thị đúng trạng thái
- ✅ UTM tracking fix live trên prod sau canary OK
- ✅ Cohort query <5s với cache, <10s timeout fallback
- ✅ Loại env `VITE_POSTHOG_RETENTION_INSIGHT_URL` thành công

## Risk Assessment
- 🔴 **HIGH** — Cohort HogQL slow → mitigation: cache 1h + timeout 10s + fallback empty state
- 🔴 **HIGH** — UTM fix break existing identify → mitigation: feature flag rollout, canary 1-2d trước prod
- 🟡 **MED** — `$referring_domain` <30% identifiable (phase-00 verdict) → simplified breakdown (top 5 + Other)
- 🟡 **MED** — Pre-PQL by source phụ thuộc person property — defer nếu chưa có

## Security Considerations
- HogQL không expose business name nếu data sensitive — chỉ cohort week + count
- UTM params có thể chứa PII (utm_term campaign tracking) — chỉ capture source/medium/campaign, KHÔNG term/content
- `POSTHOG_PERSONAL_API_KEY` server-only
- Empty state message không leak query/SQL string ra UI

## Next Steps
- Sprint 2 done → input cho Sprint 3 (Operational + Polish)
- UTM data fresh sau 1-2 tuần → có thể replace fallback referring_domain logic Sprint 4+
- Demo cuối Sprint 2 cho user duyệt §3 §4
