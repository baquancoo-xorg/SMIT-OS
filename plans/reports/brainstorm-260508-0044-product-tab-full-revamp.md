---
title: "Brainstorm — Product Tab Full Revamp (Phase 2)"
date: 2026-05-08
branch: main
related_plans:
  - plans/260507-2219-posthog-product-tab/ (Phase 1 — done)
  - docs/SMIT-Master-Plan-2026-05-05.md
status: approved
effort: 3 sprints (15 working days)
---

# Brainstorm — Product Tab Full Revamp (Phase 2)

## Problem Statement

Sau khi hoàn thành `plans/260507-2219-posthog-product-tab/` (Phase 1), tab Product mới có 4 widget core (KPI cards 6-cell · Funnel 4 step · Top Features table · Retention iframe). Còn thiếu nhiều chỉ số/biểu đồ critical cho việc theo dõi PLG Gate đặt ra trong Master Plan §3 (12 điều kiện cần pass trước khi launch quốc tế).

User cần bổ sung:
1. Heatmap activation business
2. Time-to-Value chart (Business Created → FirstSync → PQL)
3. Bảng theo ngày: online time + touchpoint count per business
4. v.v… (Pre-PQL trend, cohort retention, channel attribution, stuck businesses)

## Goals

- Cover toàn bộ 4 dashboard concept của Master Plan Sub-Plan 0: **Executive · Funnel · Cohort · Channel Attribution** + thêm **Operational** view cho Concierge/Onboarding workflow
- Pre-PQL Rate (= FirstSync / Signup × 100) hiển thị prominent — đây là PLG Gate item #1
- Phục vụ 2 audience: Executive (KPI overview) + Operational (drill-down theo business)
- Effort budget: 3 sprint (15 working days)

## Decisions Locked

| # | Decision | Rationale |
|---|---|---|
| 1 | Layout = scroll-down 5 section + sticky sub-nav | "Data-rich dashboard feel"; user từ chối sub-tabs/accordion |
| 2 | Pre-PQL = FirstSync (đúng Master Plan: "add tài khoản QC đầu tiên") | Match PLG Gate item #1 + 12 điều kiện international |
| 3 | Channel Attribution: fallback `$referring_domain` (UTM hiện tại 100% NULL/912k events) | Vẫn build dashboard, song song fix UTM tracking trong Sprint 2 |
| 4 | Heatmap: 1 component, dropdown switch 3 views (Hour×Day · Cohort×Days · Business×Days) | Linh hoạt nhất, user chuyển perspective theo nhu cầu |
| 5 | Time-to-Value: 2 chart riêng (histogram + funnel-with-time) | Đầy đủ — distribution + funnel context |
| 6 | Audience = cả Executive + Operational, chia 2 layer | Tab phục vụ executive review HÀNG TUẦN + ops daily |
| 7 | Scope = full revamp 4 dashboard Master Plan + Operational | User chốt full coverage |

## Approaches Evaluated

### Approach A — Sub-tabs (5 tab nhỏ trong Product tab)
- ✅ Code clean, render lazy, URL có query param
- ❌ User cần click chuyển → mất context tổng quan
- **Verdict:** Reject (user từ chối)

### Approach B — Scroll dài với section heading ⭐ CHOSEN
- ✅ "Data-rich" cảm giác, sticky nav cho điều hướng nhanh
- ✅ Một lần load thấy toàn cảnh, screenshot share executive review tiện
- ❌ Initial load lớn — mitigation: stagger HogQL request + cache aggressive
- ❌ Mobile responsive khó hơn — out-of-scope phase này

### Approach C — Accordion (5 section collapse)
- ✅ Cân bằng performance + density
- ❌ Hidden content → user dễ miss insight
- **Verdict:** Reject

## Final Solution — Architecture

### Layout

```
[Sticky top: § Executive · § Funnel · § Cohort · § Channel · § Operational    ↻ Refresh]

═════════════════════════════════════════════════════
§1 EXECUTIVE
   • 8 KPI Cards: Signup · FirstSync · Pre-PQL Rate · PQL · Activation · DAU · MAU · DAU/MAU
   • Pre-PQL Rate Trend (line chart, 30/60/90d toggle) ◄ PLG Gate #1
   • Activation Heatmap (dropdown 3 views)
═════════════════════════════════════════════════════
§2 FUNNEL
   • Business Funnel (existing 4 step + drop-off %)
   • Funnel-with-Time (avg days giữa step)
   • Time-to-Value Histogram (Created→FirstSync, FirstSync→PQL · p50/p90)
═════════════════════════════════════════════════════
§3 COHORT  (replace iframe Phase 1)
   • Cohort Retention Heatmap (cohort-week × D0/D1/D7/D14/D30)
   • Cohort Activation Curve (line %active by day-since-signup)
═════════════════════════════════════════════════════
§4 CHANNEL ATTRIBUTION
   • Referring Domain Breakdown (bar — facebook/google/direct/...)
   • Pre-PQL Rate by Source (bar so sánh)
   • UTM Status Badge (warning: tracking pending → fallback referring_domain)
═════════════════════════════════════════════════════
§5 OPERATIONAL
   • Daily Online Time Table (business × last 7d, sortable)
   • Touchpoint Table (event count per business, top 50 + pagination)
   • Stuck Businesses List (signup >7d, no FirstSync) — Concierge target Master Plan §1.4
   • ICP Filter (rental/running/hybrid — pending CRM column verify)
═════════════════════════════════════════════════════
```

### Backend — 7 New Services

| Service | Endpoint | Source | Cache TTL |
|---|---|---|---|
| `product-trends.service.ts` | `GET /api/dashboard/product/trends?metric=&days=` | PostHog timeseries + CRM | 15min |
| `product-heatmap.service.ts` | `GET /api/dashboard/product/heatmap?view=hour-day\|cohort\|business` | PostHog HogQL | 30min |
| `product-time-to-value.service.ts` | `GET /api/dashboard/product/ttv` | CRM (diff `first_sync_at - created_at`, etc.) | 30min |
| `product-cohort.service.ts` | `GET /api/dashboard/product/cohort` | PostHog + CRM | 1h (heavy) |
| `product-channel.service.ts` | `GET /api/dashboard/product/channel` | PostHog `$referring_domain` | 30min |
| `product-operational.service.ts` | `GET /api/dashboard/product/operational` | PostHog session_duration + CRM | 5min |
| `product-stuck.service.ts` | `GET /api/dashboard/product/stuck` | CRM filter `created_at + has_first_sync` | 5min |

Reuse: `posthog-client.hogql()`, existing LRU cache, `getCrmClient()`.

### Frontend — 13 New Components

Mỗi file <200 LOC theo development-rules.

| Component | Section | LOC est. |
|---|---|---|
| `product-section-nav.tsx` (sticky) | top | 70 |
| `product-pre-pql-trend.tsx` | §1 Executive | 80 |
| `product-activation-heatmap.tsx` (dropdown switch 3 views) | §1 Executive | 150 |
| `product-funnel-with-time.tsx` | §2 Funnel | 90 |
| `product-ttv-histogram.tsx` | §2 Funnel | 100 |
| `product-cohort-retention.tsx` | §3 Cohort | 130 |
| `product-cohort-activation-curve.tsx` | §3 Cohort | 70 |
| `product-channel-breakdown.tsx` | §4 Channel | 100 |
| `product-prepql-by-source.tsx` | §4 Channel | 80 |
| `product-online-time-table.tsx` | §5 Ops | 120 |
| `product-touchpoint-table.tsx` | §5 Ops | 100 |
| `product-stuck-list.tsx` | §5 Ops | 80 |
| `product-icp-filter.tsx` | §5 Ops header | 60 |

Existing component update: `product-kpi-cards.tsx` mở rộng 6 → 8 cards (thêm Pre-PQL Rate).

### Data Source Verification (đã pre-flight)

| Data | Status | Notes |
|---|---|---|
| `$session_id` | ✅ 912k events có (last 30d) | Session duration metrics OK |
| `business_id` | ✅ 381 distinct businesses | Multi-tenant breakdown OK |
| `$referring_domain` | ⚠️ chưa verify coverage | Phase 0 sprint 1 audit |
| `$initial_utm_source` | ❌ 100% NULL | Fix tracking song song Sprint 2 |
| CRM `first_sync_at`, `pql_achieved_at`, `feature_activated_at` | ✅ available | TTV chart OK |
| CRM ICP column (rental/running/hybrid) | ⚠️ chưa verify | Phase 0 sprint 1 — nếu thiếu defer ICP filter |
| PostHog person property `first_referring_domain` | ⚠️ chưa verify | Phase 0 audit, có thể trigger `$set_once` |

## Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | Cohort retention HogQL phức tạp, slow query | 🔴 HIGH | Bucket by week, cache 1h, EXPLAIN trước deploy, fallback empty state nếu timeout |
| 2 | "Pre-PQL by source" cần person property `first_referring_domain` | 🔴 HIGH | Phase 0 audit; nếu chưa có → trigger PostHog `$set_once` từ FE init code |
| 3 | `$referring_domain` quá nhiều "direct"/empty → widget vô nghĩa | 🟡 MED | Phase 0 sample query; nếu <30% identifiable → show warning + simplified breakdown |
| 4 | Heatmap business×days lag với 381 businesses | 🟡 MED | Top 50 limit, virtualization, search input |
| 5 | CRM ICP column có/không | 🟡 MED | Phase 0 verify; thiếu → defer ICP filter, không block Operational table |
| 6 | 5+ widgets parallel HogQL → rate limit | 🟡 MED | Stagger requests via Promise.all chunked, cache aggressive |
| 7 | UTM tracking fix (Sprint 2) breaks existing identify call | 🟡 MED | Feature flag + canary deploy |
| 8 | Initial scroll-load >2s | 🟢 LOW | Lazy section render bằng IntersectionObserver |

## Effort Breakdown — 3 Sprints (15d)

### Sprint 1 (5d) — Executive + Funnel
- **Phase 0 audit (1d):** ICP column · `$referring_domain` coverage · person-property `first_referring_domain` · stuck threshold confirm
- **Backend (2d):** `product-trends.service.ts` · `product-heatmap.service.ts` (3-view variant) · `product-time-to-value.service.ts` · routes wire-up
- **Frontend (1.5d):** Expand KPI cards 8-cell · `product-pre-pql-trend.tsx` · `product-activation-heatmap.tsx` · `product-funnel-with-time.tsx` · `product-ttv-histogram.tsx`
- **Wire-up + smoke test (0.5d)**

### Sprint 2 (5d) — Cohort + Channel
- **Backend (2.5d):** `product-cohort.service.ts` (heavy HogQL, EXPLAIN check) · `product-channel.service.ts`
- **Frontend (1.5d):** `product-cohort-retention.tsx` (replace iframe) · `product-cohort-activation-curve.tsx` · `product-channel-breakdown.tsx` · `product-prepql-by-source.tsx`
- **UTM tracking fix parallel (1d):** FE posthog-js init capture UTM · backend verify · A/B canary

### Sprint 3 (5d) — Operational + Polish
- **Backend (2d):** `product-operational.service.ts` · `product-stuck.service.ts` · ICP filter logic
- **Frontend (2d):** `product-online-time-table.tsx` · `product-touchpoint-table.tsx` · `product-stuck-list.tsx` · `product-icp-filter.tsx` · `product-section-nav.tsx`
- **Test + docs (1d):** Unit test core services · `docs/system-architecture.md` update · a11y pass

## Success Criteria

- ✅ 5 sections render real data, không "Coming soon" trừ UTM Status Badge
- ✅ Pre-PQL Rate hiển thị prominent — match PLG Gate item #1 Master Plan
- ✅ Heatmap dropdown switch 3 views, không re-fetch (single endpoint param)
- ✅ Operational table sortable + ICP filter (nếu CRM có column)
- ✅ Initial load <2s · scroll smooth (no jank) · cache hit >70%
- ✅ Build output không leak `POSTHOG_PERSONAL_API_KEY`
- ✅ Cohort retention thay thế iframe (loại bỏ dependency `VITE_POSTHOG_RETENTION_INSIGHT_URL`)
- ✅ Stuck businesses list export-ready cho Sale Concierge workflow (Master Plan §1.4)

## Out of Scope (Phase 3+)

- A/B test framework integration (Master Plan Sub-Plan 1)
- Drill-down session replay (link-out only, không embed)
- Slack alerting cho stuck threshold breach
- Multi-tenant role-based filter
- Mobile responsive polish (desktop-first)
- CSV/Excel export (defer)

## Open Questions (Resolve in Phase 0)

| # | Question | Block | Owner |
|---|---|---|---|
| 1 | CRM `crmBusinessPqlStatus` (hoặc bảng business chính) có column ICP/tag? | ICP filter Sprint 3 | dev audit |
| 2 | `$referring_domain` coverage thực tế trên 912k events | Channel value Sprint 2 | dev audit |
| 3 | PostHog person property `first_referring_domain` đã capture chưa? | Pre-PQL by source Sprint 2 | dev audit |
| 4 | Stuck threshold = 7d (theo Master Plan §1.4 — Sale gọi user stuck >7d)? | Confirm trước Sprint 3 | user confirm |

## Next Steps

1. Tạo plan dir `plans/260508-0044-product-tab-full-revamp/` với 4-5 phase file
2. Phase 0 audit (1d) trước khi spike
3. Theo thứ tự Sprint 1 → 2 → 3
4. Mỗi sprint có smoke test + demo cuối tuần
5. Sau Sprint 3 xong → journal entry + sync `docs/system-architecture.md`

## Dependencies

- **Phase 1 done** (PostHog services + KPI cards 6-cell + Funnel + Top Features) ✅
- **Master Plan §3** PLG Gate definitions
- **CRM `crmBusinessPqlStatus`** schema (`first_sync_at`, `pql_achieved_at`, `feature_activated_at`)
- **PostHog Cloud US** (`POSTHOG_PERSONAL_API_KEY` server-side)
- **Existing `posthog-client.hogql()` + LRU cache** (reuse, không build mới)
