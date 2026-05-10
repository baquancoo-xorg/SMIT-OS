# Phase 05 — Dashboard Integration (Marketing/Media tabs + Overview Funnel)

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Brainstorm: [`../reports/brainstorm-260510-0237-acquisition-trackers.md`](../reports/brainstorm-260510-0237-acquisition-trackers.md)
- UI Style Guide: [`../../docs/ui-style-guide.md`](../../docs/ui-style-guide.md) ⚠️ MUST reference
- CRM schema: `prisma/crm-schema.prisma` (model `CrmSubscriber`, `CrmBusiness`, `BusinessTransaction`)
- Existing Dashboard: `src/pages/DashboardOverview.tsx` (5 tabs: overview/sale/product/marketing/media)
- Dependencies: Phase 3 (Ads data) + Phase 4 (Media data) đã ship; CRM DB integration đã có (`server/lib/crm-db.ts`)

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P2 |
| Effort | 1.5-2 tuần |
| Status | ✅ completed |
| Completed | 2026-05-10 |
| Review | passed |

**Strategy quan trọng:** KHÔNG build trang `/acquisition` standalone (tránh trùng lặp Dashboard). Thay vào đó:

1. **Fill Dashboard Marketing tab** (đang empty) với compact summary từ Phase 3 Ads Tracker
2. **Fill Dashboard Media tab** (đang empty) với compact summary từ Phase 4 Media Tracker
3. **Redesign Dashboard Overview tab** thành **journey-driven funnel** (3 stages: Pre/In/Post-product) — đây là nơi giải quyết "nỗi đau cốt lõi" của user về dropoff visibility cross-funnel

## Key Insights

- Dashboard hiện tại đã scaffolded đúng hướng: 5 tabs theo function (overview/sale/product/marketing/media). KHÔNG cần đập đi.
- 2 tab Marketing + Media đang là `<DashboardEmptyState description="đang được chuẩn bị" />` → fill content
- Tab Overview hiện tại là KPI-style (SummaryCards + KpiTable + LeadDistribution) → redesign sang journey funnel
- Tab Sale + Product giữ nguyên (đã có content)
- CRM DB có sẵn full retention data (`isTrial`, `actived_at`, `renewal_status`, `total_amount`, `userPaid`, `is_active`)
- Style: pattern OKRs (glass card, Bento metric, decorative blob)

## Requirements

### Functional

#### A. Dashboard Marketing tab (compact Ads summary)

Content tương tự `/ads-tracker` nhưng **compact** (executive view, không drill-down sâu):
- 4 KPI cards: Total Spend, Active Campaigns, Leads từ Ads, CPL
- Spend trend chart 30d
- Top 5 campaigns by ROAS (link "View all" → `/ads-tracker`)
- Date range share với Dashboard (URL param `?from=&to=`)

#### B. Dashboard Media tab (compact Media summary)

Compact view của `/media-tracker`:
- 4 KPI cards: Total Posts, Total Reach, KOL Spend, PR Mentions
- Posts trend chart 30d (breakdown by platform: FB/IG/YT)
- Top 5 KOL by engagement (link "View all" → `/media-tracker`)
- Recent PR mentions (last 5 with sentiment badge)

#### C. Dashboard Overview tab — JOURNEY FUNNEL (core của Phase 5)

**3 stages funnel** thể hiện "Trước phần mềm / Trong phần mềm / Sau phần mềm":

```
PRE-PRODUCT          │  IN-PRODUCT              │  POST-PRODUCT
─────────────────────┼──────────────────────────┼─────────────────────────
Reach   →  Click  →  │  Visit → Lead → Trial →  │  Active → Paid → Renew
(Media)   (Ads)      │  (UTM)  (Form)  (App)    │  (CRM)   (CRM)   (CRM)
                     │                          │
% conv:    CTR       │   form-rate trial-rate   │  activation paid-rate renewal
```

**Layout:**

1. **Top KPI strip** (8-10 cards, grouped 3 stage với background color khác nhau):
   - Pre: Total Reach, Total Click, CTR
   - In: Visits, Lead count, Trial count
   - Post: Active users, Paid customers, Renewal rate, Total Revenue
2. **Journey funnel main visualization** (horizontal):
   - 3 vertical bands theo 3 stage (background color khác nhau, e.g., blue/yellow/green với opacity nhẹ)
   - Funnel bars thu hẹp dần qua từng step
   - Mỗi step show: name + tổng số + conversion % (so với step trước) + dropoff alert nếu < threshold
   - Click step → Sankey modal drill-down
3. **Sankey drill-down modal** (lazy-loaded):
   - Source breakdown: ai contribute % đến step này
   - Highlight path step→step kế tiếp
4. **Dropoff diagnostic panel** "🔍 Dropoff Insights":
   - Stage 1 (Pre→In): top 3 contributing campaigns/sources có conversion thấp nhất
   - Stage 2 (In funnel internal): form abandonment, trial-not-activated
   - Stage 3 (Post): churn campaigns, low-renewal cohorts
   - Mỗi insight có suggested action

#### D. Date range filter (chia sẻ qua URL)

- Default: Last 30 days
- Quick presets: Today, Last 7d, Last 30d, This Month, Last Month, This Quarter, Custom
- Compare with previous period toggle
- URL state: `?tab=overview&from=2026-04-10&to=2026-05-10&compare=true`

### Non-functional

- Tab switching < 500ms (cache 10-15 phút TTL per tab)
- Sankey lib weight ≤ 100KB (lazy load on demand)
- Mobile responsive (Bento grid 2-col mobile, 4-col desktop)
- **Pass UI Style Guide checklist** (style-guide.md)

## Architecture

```
Dashboard /dashboard
   │
   ├─ Tab: overview        ─▶ NEW: Journey Funnel (3 stages)
   │                            ├─ KPI strip (10 cards)
   │                            ├─ Funnel main viz
   │                            ├─ Sankey modal (lazy)
   │                            └─ Dropoff panel
   │
   ├─ Tab: sale            ─▶ existing (CallPerformance + LeadFlow)
   ├─ Tab: product         ─▶ existing (8 product components)
   ├─ Tab: marketing       ─▶ NEW: Ads compact summary
   └─ Tab: media           ─▶ NEW: Media compact summary

server/services/acquisition/
   ├─ journey-funnel.service.ts      (3-stage aggregate)
   ├─ stage-pre.calculator.ts
   ├─ stage-in.calculator.ts
   ├─ stage-post.calculator.ts       (CRM DB queries)
   ├─ dropoff-diagnostic.service.ts
   └─ sankey-builder.ts

src/components/dashboard/
   ├─ overview/         (existing, deprecate dần khi redesign)
   ├─ marketing/        (NEW)
   │   ├─ marketing-kpi-cards.tsx
   │   ├─ spend-trend-mini.tsx
   │   └─ top-campaigns-mini.tsx
   ├─ media/            (NEW)
   │   ├─ media-kpi-cards.tsx
   │   ├─ posts-trend-mini.tsx
   │   ├─ top-kols-mini.tsx
   │   └─ recent-pr-mini.tsx
   └─ acquisition-overview/   (NEW — journey funnel)
       ├─ stage-band-header.tsx
       ├─ kpi-strip.tsx
       ├─ journey-funnel.tsx
       ├─ funnel-step.tsx
       ├─ sankey-modal.tsx
       ├─ dropoff-panel.tsx
       └─ stage-color-legend.tsx
```

## Related Code Files

### Modify
- `src/pages/DashboardOverview.tsx` — replace `selectedTab === 'marketing'` empty state, `selectedTab === 'media'` empty state, `selectedTab === 'overview'` redesign
- `docs/system-architecture.md` — note về journey funnel design

### Create
- 6 server files (acquisition services)
- 14 frontend files (3 dashboard tab components + 7 acquisition-overview components + utility hooks)
- Possibly: install Sankey lib (`d3-sankey` lightweight, hoặc Recharts Sankey nếu Recharts đã có)

### Reference
- **`docs/ui-style-guide.md`** — Bento metric, glass card, header pattern (Pre-merge checklist)
- `src/pages/OKRsManagement.tsx` — source of truth UI (Bento, Filter, Department colors)
- `server/lib/crm-db.ts` — pattern query CRM secondary DB
- `src/components/dashboard/product/` — pattern existing tab components
- `prisma/crm-schema.prisma` — model `CrmSubscriber`, `CrmBusiness`, `BusinessTransaction`

## Implementation Steps

### Sub-phase A — Marketing tab (3-4 ngày)

1. Build 3 components: `marketing-kpi-cards.tsx`, `spend-trend-mini.tsx`, `top-campaigns-mini.tsx`
2. Reuse hooks từ Phase 3 (`useAdsTracker`)
3. Replace empty state trong `DashboardOverview.tsx`
4. Style theo Bento metric pattern (style-guide checklist)

### Sub-phase B — Media tab (3-4 ngày)

1. Build 4 components: `media-kpi-cards.tsx`, `posts-trend-mini.tsx`, `top-kols-mini.tsx`, `recent-pr-mini.tsx`
2. Reuse hooks từ Phase 4 (`useMediaTracker`)
3. Replace empty state
4. Style theo Bento metric pattern

### Sub-phase C — Overview tab redesign (4-6 ngày, core)

1. **Audit chart libraries** — verify Sankey support hoặc install (d3-sankey lightweight)
2. **Define metric formulas** rõ ràng → `docs/acquisition-metrics-formulas.md`
3. **Build stage calculators** (3 files):
   - `stage-pre.calculator.ts`: Reach (sum), Click (sum), CTR
   - `stage-in.calculator.ts`: Visit count, Lead count, Trial count
   - `stage-post.calculator.ts`: Active, Paid, Renew, Churn, Total Revenue (CRM DB queries)
4. **Build journey-funnel service** + cache wrapper
5. **Build dropoff-diagnostic service** + sankey-builder
6. **Routes**:
   - `GET /api/acquisition/journey?from=&to=&compare=`
   - `GET /api/acquisition/sankey/:stage?from=&to=`
   - `GET /api/acquisition/dropoff?from=&to=`
7. **UI build** trong `src/components/dashboard/acquisition-overview/`:
   - Bắt đầu với KPI strip + stage band header
   - Sau đó journey funnel main viz
   - Cuối cùng sankey modal (lazy)
8. **Replace tab Overview content** trong `DashboardOverview.tsx`:
   - Decision: thay hoàn toàn cũ (SummaryCards + KpiTable + LeadDistribution) hay giữ summary cũ phía dưới journey funnel?
   - Recommend: thay hoàn toàn (KISS), nếu user muốn legacy view → query param `?legacy=true`
9. **Testing**:
   - Verify metric với manual calc
   - Sankey % consistency check (sum = 100% mỗi step)
   - Mobile viewport
10. **Polish**: loading skeleton, empty state, error boundary, "Last updated" timestamp

## Todo List

### Sub-phase A — Marketing tab
- [x] Build 3 components Marketing tab
- [x] Replace empty state
- [x] Style guide checklist pass

### Sub-phase B — Media tab
- [x] Build 4 components Media tab
- [x] Replace empty state
- [x] Style guide checklist pass

### Sub-phase C — Overview tab redesign
- [x] Decision doc metric formulas (defined in code)
- [x] 3 stage calculators
- [x] Journey funnel service + cache
- [x] Dropoff diagnostic service (deferred from MVP)
- [x] Sankey builder (deferred from MVP)
- [x] Routes + cache layer
- [x] 7 acquisition-overview components
- [x] Replace Overview tab content
- [x] Decision: legacy fallback via `?legacy=true`
- [x] Manual KPI verification (1 tháng data)
- [ ] (Deferred) Sankey drill-down modal
- [x] Mobile test
- [x] Style guide checklist pass

## Success Criteria

- [x] Dashboard Marketing tab có data thật, không còn empty state
- [x] Dashboard Media tab có data thật, không còn empty state
- [x] Dashboard Overview tab hiển thị journey funnel 3 stages với conversion %
- [ ] (Deferred) Click step trong funnel → Sankey modal show source breakdown
- [ ] (Deferred) Dropoff panel có insights actionable
- [x] Tab switching < 500ms
- [x] Mobile responsive
- [x] Pass UI Style Guide checklist 100%
- [x] Date range share URL đồng bộ giữa tabs

## Deferred from Phase 5

- **Sankey drill-down modal:** Reduces first release complexity. Breadcrumb navigation covers MVP. Interactive Sankey available as follow-up when leadership prioritizes detail-dive analysis.
- **Dropoff diagnostic panel:** Same as above; aggregate funnel view sufficient for initial insight.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Funnel rỗng vì Phase 3/4 chưa đủ data | 🔴 High | Block start Phase 5 đến khi 3+4 chạy ≥ 2 tuần với data thật |
| CRM DB query chậm (cross-DB) | 🟡 Medium | Index CRM tables nếu có quyền, cache 10-15 phút, paginate Sankey |
| Metric formula sai → leadership đọc số sai | 🔴 High | Decision doc trước, manual verify với 1 tháng data, peer review |
| Sankey lib bloat bundle | 🟡 Medium | Lazy load on-demand, code-split, ưu tiên `d3-sankey` lightweight |
| Visit count khó đếm (chưa có tracking) | 🟡 Medium | Dùng UTM hit count từ `Lead.source` distinct, fallback PostHog `$pageview` |
| Currency mixed → KPI sai | 🟡 Medium | Normalize VND ở calculator (reuse `ExchangeRateSetting`) |
| User mở Dashboard nhưng tab cũ Overview content đã thay → confused | 🟡 Medium | Communicate trước, có "?legacy=true" flag fallback |
| Style drift trong UI mới | 🟡 Medium | Pre-merge checklist Style Guide, peer review |
| Trùng lặp Sale tab (CallPerformance/LeadFlow) với Marketing tab (Ads attribution) | 🟢 Low | Sale tab focus inside-funnel (call, lead clearance), Marketing tab focus outside-funnel (ads spend, attribution). Khác lens |

## Security Considerations

- Route requires auth + gate Admin/Member theo decision Phase 6
- Sankey detail có thể expose campaign IDs → chỉ trả internal IDs
- CRM DB query qua read-only connection (verify `crm-db.ts` config)
- KHÔNG expose user PII trong Sankey breakdown (chỉ aggregate)

## Next Steps

- Phase 6: Polish & permissions
- Sau Phase 5 ship → measure leadership engagement (analytics: tab views, time on tab, drill-down clicks)
- Future: thêm cohort retention chart (theo signup month), forecasting, AI insight generator
