# Phase 03 — Sprint 3: Operational + Polish (4d, ICP Filter DEFERRED post-audit)

> **Post-audit revision (2026-05-08):** ICP Filter DEFERRED — CRM không có column phân loại rental/running/hybrid. Stuck list = TRACKING-ONLY (không Sale Concierge action). Effort 5d → 4d.

## Context Links
- Brainstorm §5 Operational + §Layout sticky nav
- Master Plan §1.4 Concierge: stuck businesses >7d → Sale gọi
- Phase 0 audit verdict: ICP filter GO/SIMPLIFIED/DEFER · stuck threshold confirm

## Overview
- **Priority:** P2
- **Status:** pending (blocked by phase-02)
- Build §5 Operational (Online Time Table + Touchpoint Table + Stuck List + ICP Filter) + sticky section nav + polish toàn page

## Key Insights
- **Stuck list = TRACKING-ONLY** (user clarification post-audit): SMIT OS là phần mềm giám sát, không trigger Sale action
- **ICP Filter DEFERRED:** CRM không có column phân loại rental/running/hybrid (audit verdict)
- Online time table reuse session_duration data đã verify (912k events có $session_id)
- Sticky nav giúp user navigate giữa 5 section dài
- Lazy section render bằng IntersectionObserver — performance optimization initial load

## Requirements

### Functional
- Online Time Table: business × last 7d, cell = session_duration minutes, sortable by total/business name
- Touchpoint Table: top 50 business by event count, sortable, pagination 25/page
- Stuck Businesses List **TRACKING-ONLY**: business signup >7d AND has_first_sync=false, hiển thị business_id/name/days_stuck/signup_at — KHÔNG copy email/phone
- ~~ICP Filter~~ DEFERRED post-audit
- Sticky Section Nav: 5 anchor jumping smooth scroll
- Lazy section render: §3 §4 §5 chỉ fetch khi scroll vào view

### Non-functional
- Online time table virtualization nếu >50 row (react-window hoặc tương đương)
- Stuck list cache 5min (data fresh)
- Sticky nav performance: không jank khi scroll
- A11y: ARIA labels cho table sort, nav anchor

## Architecture
```
Backend
  routes/dashboard-product.routes.ts
    ├── GET /operational  → product-operational.service.ts
    │   ├── online_time_per_business_per_day (PostHog session aggregate)
    │   └── touchpoint_count_per_business (PostHog event count)
    └── GET /stuck        → product-stuck.service.ts → CRM filter

Frontend
  product-section.tsx
    ├── product-section-nav.tsx (NEW, sticky top)
    └── §5 Operational
        ├── product-icp-filter.tsx (NEW, conditional)
        ├── product-online-time-table.tsx (NEW)
        ├── product-touchpoint-table.tsx (NEW)
        └── product-stuck-list.tsx (NEW)

Polish
  IntersectionObserver wrapper cho lazy fetch §3/§4/§5
  Smooth scroll behavior + a11y
```

## Related Code Files

### Modify
- `/Users/dominium/Documents/Project/SMIT-OS/server/routes/dashboard-product.routes.ts` — thêm 2 endpoint
- `/Users/dominium/Documents/Project/SMIT-OS/server/types/dashboard-product.types.ts` — thêm Operational/Stuck types
- `/Users/dominium/Documents/Project/SMIT-OS/src/types/dashboard-product.ts` — mirror
- `/Users/dominium/Documents/Project/SMIT-OS/src/hooks/use-product-dashboard.ts` — thêm hooks
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-section.tsx` — wire-up §5 + sticky nav + lazy

### Create (Backend)
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/posthog/product-operational.service.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/posthog/product-stuck.service.ts`

### Create (Frontend)
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-section-nav.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-online-time-table.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-touchpoint-table.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-stuck-list.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-icp-filter.tsx`

## Implementation Steps

### Backend (2d)

1. **Types** — extend:
   ```ts
   ProductOperationalResponse: {
     onlineTime: [{ businessId, businessName, dailyMinutes: [m0..m6] }],
     touchpoints: [{ businessId, businessName, eventCount, lastActiveAt }]
   }
   ProductStuckResponse: {
     thresholdDays: number,
     items: [{ businessId, businessName, email, phone, signupAt, daysStuck }]
   }
   ```
2. **`product-operational.service.ts`**:
   - HogQL online time: `SELECT properties.business_id, toDate(timestamp) as day, sum(properties.$session_duration)/60 as minutes FROM events WHERE business_id IS NOT NULL AND timestamp > now() - INTERVAL 7 DAY GROUP BY business_id, day`
   - HogQL touchpoint: `SELECT properties.business_id, count() FROM events ... GROUP BY business_id ORDER BY count() DESC LIMIT 50`
   - JOIN business name từ CRM bằng business_id (lookup map per request, cache 5min)
3. **`product-stuck.service.ts`** (TRACKING-ONLY):
   - CRM query: `crmBusinessPqlStatus.findMany({ where: { has_first_sync: false, created_at: { lt: subDays(new Date(), 7) } } })`
   - JOIN `crm_businesses` chỉ lấy `name` (KHÔNG email/phone — privacy + scope)
   - Constant: `STUCK_THRESHOLD_DAYS = 7` (audit confirmed)
   - Return items: `{ businessId, businessName, signupAt, daysStuck }` sorted by `daysStuck DESC`
4. **Routes** — 2 endpoint mới + auth check + cache 5min
5. **Filter param** — endpoint hỗ trợ `?icp=rental|running|hybrid` (conditional, no-op nếu phase-00 verdict DEFER)

### Frontend (2d)

6. **Types mirror + hooks** — `useProductOperational(icp?)`, `useProductStuck(icp?)`
7. **`product-section-nav.tsx`** — sticky top, 5 anchor button, active section highlight (IntersectionObserver), smooth scroll, ~70 LOC
8. **`product-online-time-table.tsx`** — table 7-day grid, sortable header, virtualization nếu >50 row, color cell theo minute count, ~120 LOC
9. **`product-touchpoint-table.tsx`** — table top 50 + pagination 25/page, sortable, ~100 LOC
10. **`product-stuck-list.tsx`** — list view tracking-only, hiển thị business_id/name/days_stuck/signup_at, total count badge. KHÔNG copy/export action. ~70 LOC
11. ~~`product-icp-filter.tsx`~~ DEFERRED post-audit — không build component này

### Polish (1d)

12. **`product-section.tsx` final layout:**
    ```tsx
    <ProductSectionNav />
    <Section id="executive">...</Section>
    <Section id="funnel">...</Section>
    <Section id="cohort">...</Section>
    <Section id="channel">...</Section>
    <Section id="operational">
      <ProductIcpFilter /> {/* conditional */}
      <ProductOnlineTimeTable />
      <ProductTouchpointTable />
      <ProductStuckList />
    </Section>
    ```
13. **Lazy fetch** — wrap §3/§4/§5 trong `IntersectionObserver` HOC; trigger React Query fetch khi scroll vào view
14. **A11y pass** — ARIA labels nav anchor, table sort headers, focus management
15. **Smooth scroll** CSS `scroll-behavior: smooth` + offset cho sticky nav height
16. **Smoke test** — full page load, scroll qua 5 section, copy stuck list, ICP filter switch

## Todo List
- [x] Backend types Operational + Stuck
- [x] `product-operational.service.ts` + business name lookup
- [x] `product-stuck.service.ts` (tracking-only) + STUCK_THRESHOLD_DAYS=7
- [x] Routes 2 endpoint
- [x] Frontend types + hooks
- [x] `product-section-nav.tsx` (sticky + active highlight)
- [x] `product-online-time-table.tsx`
- [x] `product-touchpoint-table.tsx`
- [x] `product-stuck-list.tsx` (tracking-only display)
- [x] `product-section.tsx` final layout 5 section
- [~] Lazy fetch IntersectionObserver §3/§4/§5 — sticky nav + scroll-margin handle navigation; full lazy fetch deferred (React Query staleTime đã đủ tốt, build pass)
- [x] A11y pass + smooth scroll (aria-current, aria-label, focus ring, scroll-mt-24)
- [x] Compile + build verify (npx tsc --noEmit pass · npm run build pass · no API key leak)

## Success Criteria
- ✅ §5 Operational render đầy đủ: 3 table + filter
- ✅ Sticky nav highlight active section khi scroll
- ✅ Stuck list copy-to-clipboard action work
- ✅ ICP filter conditional render dựa phase-00 verdict
- ✅ Lazy fetch giảm initial load — chỉ §1 §2 fetch ngay
- ✅ Initial load <2s · scroll smooth không jank
- ✅ A11y: keyboard navigation đầy đủ, screen reader đọc được table

## Risk Assessment
- 🟡 **MED** — Online time table 381 business × 7 day = 2667 cell render — virtualization bắt buộc
- 🟡 **MED** — Stuck list join CRM email/phone có thể lộ PII trong dev log → mask trong console.log
- 🟢 **LOW** — Sticky nav code pattern phổ biến (CSS `position: sticky` + IntersectionObserver)
- 🟢 **LOW** — IntersectionObserver browser support tốt (>96% market)

## Security Considerations
- Stuck list email/phone → role check: chỉ Sale/Admin xem, không lộ cho user thường
- Copy-to-clipboard không log raw data ra console
- ICP filter param sanitize backend (whitelist values)
- Business name lookup cache không leak ra client side

## Next Steps
- Sprint 3 → tail-in `phase-04-test-docs.md`
- Demo final cho user duyệt toàn page 5 section
- Sau test/docs done → archive plan + journal
