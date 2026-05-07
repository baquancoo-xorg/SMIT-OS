# Brainstorm — PostHog Integration cho Tab Product (Dashboard)

**Date:** 2026-05-07 16:09 (Asia/Saigon)
**Owner:** dominium
**Scope:** Phase 1 — Build UI tab Product trong `DashboardOverview.tsx` để hiển thị data PostHog
**Status:** Design proposed, awaiting approval

---

## 1. Problem Statement

Tab `Product` trong `src/pages/DashboardOverview.tsx:122-123` hiện đang là empty state ("Dashboard cho Product đang được chuẩn bị"). Cần biến nó thành **command center** đo lường toàn bộ hành trình khách hàng:

```
Website (click "Dùng thử") → SMIT User signup → Phone OTP verify
  → SMIT Agency creation → Onboarding → In-app usage
```

PostHog đã được đấu nối FE (per `docs/ai-context-snapshot.md`), Session Replay bật, nhưng:
- Event taxonomy chưa chốt (Sprint 2 blocker: "Chờ MKT chốt luồng UI/UX")
- Cross-domain stitching chưa được verify e2e
- Chưa có UI nội bộ để tổng hợp/visualize → admin phải mở PostHog riêng

## 2. Current State Audit (đã verify)

| Item | Trạng thái |
|---|---|
| PostHog SDK FE đấu nối | ✅ Đã có (Sprint 1) |
| Session Replay | ✅ Bật được |
| Event taxonomy chính thức | ⚠️ Đang chờ MKT chốt |
| Cross-domain identity stitching | ⚠️ Chưa verify e2e |
| Personal API key cho Query API | ❌ Chưa setup ở SMIT-OS backend |
| `posthog-node` / `posthog-js` trong package.json SMIT-OS | ❌ Chưa có |
| Tab Product UI | ❌ Empty state |

## 3. Requirements (chốt qua interview)

### Functional
- KPI custom: **Funnel chuyển đổi trọn hành trình + drop-off**, **Top features**, **Retention cohort**
- Embed insight cho retention (UX gốc PostHog tốt hơn tự build)
- Link-out cho session replay (không thể tự build)
- Tracking sâu downstream: replay + heatmap + feature flags (Phase 2)

### Non-functional
- Render < 2s với cache
- Không expose PostHog Personal API Key ra FE
- Phù hợp design system hiện tại (Recharts, `dashboard/ui/*`)

## 4. Approaches Evaluated

### A. Pure Embed (shared-link iframe cho mọi insight)
**Pros:** Build trong 1-2 ngày, không maintain query, full PostHog feature.
**Cons:** UI rời rạc với SMIT-OS, không join data nội bộ (CRM lead, AE), share-link công khai = rủi ro lộ.
**Verdict:** ❌ Không phù hợp — funnel là view chiến lược, cần custom.

### B. Pure Custom (backend proxy → HogQL → Recharts)
**Pros:** UI đồng nhất 100%, join data CRM/lead được, không leak link.
**Cons:** Tốn 2-3 tuần dev, phải re-implement retention/replay/heatmap (mà không bao giờ bằng PostHog), maintain HogQL queries.
**Verdict:** ❌ Vi phạm KISS/YAGNI — re-build cái PostHog đã giỏi.

### C. **Hybrid** ← Recommended
**Custom** cho top-level (Funnel, KPI cards, Top features) + **Embed** cho retention cohort + **Link-out** cho session replay.
**Pros:** Best UX-cost ratio, tận dụng PostHog đúng chỗ, custom đúng chỗ cần join data nội bộ.
**Cons:** 2 codepath song song (proxy + iframe) — cần convention rõ ràng.
**Verdict:** ✅ Chọn — 1.5-2 tuần dev, mở rộng được.

## 5. Final Design — Hybrid Architecture

### 5.1 Component layout (Tab Product)

```
┌──────────────────────────────────────────────────────────────────┐
│  TAB PRODUCT (replaces empty state at DashboardOverview.tsx:122) │
├──────────────────────────────────────────────────────────────────┤
│  ROW 1 — KPI Summary Cards (CUSTOM, backend proxy)               │
│    [Total Signups] [Activation %] [DAU/MAU] [Time-to-value]      │
├──────────────────────────────────────────────────────────────────┤
│  ROW 2 — Funnel Hành trình (CUSTOM Recharts BarChart)            │
│    Click → Signup → Verify → Agency → Onboard → Feature_used     │
│    Có drop-off % mỗi step, click row drill-down (Phase 2)        │
├──────────────────────────────────────────────────────────────────┤
│  ROW 3 — Top Features Table (CUSTOM)                             │
│    [Feature] [Users] [Total uses] [Avg session min] [Last used]  │
│    Click row → mở PostHog với filter event=feature_used          │
├──────────────────────────────────────────────────────────────────┤
│  ROW 4 — Retention Cohort (EMBED PostHog shared insight iframe)  │
│    PostHog native cohort heatmap, không tự render                │
├──────────────────────────────────────────────────────────────────┤
│  ROW 5 — Session Replay Quick Access (LINK-OUT)                  │
│    Button "Xem replay user mới nhất" → mở tab PostHog mới        │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Data flow

```
React Query (5min staleTime)
    │
    ▼
SMIT-OS Backend  /api/dashboard/product/*
    ├── /summary       → HogQL aggregate: signups, activation, DAU/MAU, TTV
    ├── /funnel        → POST /api/projects/{id}/insights/funnel
    └── /top-features  → HogQL: SELECT event, count() FROM events GROUP BY event
    │
    ▼ (cache layer: in-memory LRU 5min — KISS, không cần Redis ở phase này)
PostHog Cloud Query API
    Authorization: Bearer ${POSTHOG_PERSONAL_API_KEY}
```

### 5.3 File structure (new + modified)

```
src/pages/DashboardOverview.tsx                  [MODIFY] line 122-123
src/components/dashboard/product/                [NEW]
  ├── product-section.tsx                        (entry component)
  ├── product-kpi-cards.tsx
  ├── product-funnel-chart.tsx
  ├── product-top-features-table.tsx
  ├── product-retention-embed.tsx                (iframe wrapper)
  └── product-replay-link.tsx
src/hooks/use-product-dashboard.ts               [NEW]
src/types/dashboard-product.ts                   [NEW]

server/routes/dashboard-product.routes.ts        [NEW]
server/services/posthog/                         [NEW]
  ├── posthog-client.ts                          (axios wrapper, auth)
  ├── posthog-cache.ts                           (LRU 5min)
  ├── product-summary.service.ts
  ├── product-funnel.service.ts
  └── product-features.service.ts
server/types/dashboard-product.types.ts          [NEW]
server/schemas/dashboard-product.schema.ts       [NEW Zod]

.env.example                                     [MODIFY]
  POSTHOG_HOST=https://eu.posthog.com  (or us)
  POSTHOG_PROJECT_ID=
  POSTHOG_PERSONAL_API_KEY=                       (server-only, KHÔNG dùng VITE_*)
  POSTHOG_RETENTION_INSIGHT_SHARE_URL=            (link iframe shared insight)
```

**Tuân thủ rule "200 lines/file":** mỗi service/component < 200 dòng. Funnel/feature service tách helper riêng nếu cần.

### 5.4 Event taxonomy giả định (cần MKT chốt — Phase 0 dependency)

```
Funnel events (theo thứ tự):
  trial_button_clicked       (website)
  signup_started             (smit-user)
  signup_phone_verified      (smit-user)
  agency_created             (smit-agency)
  onboarding_completed       (app)
  feature_used               (app, có property feature_name)
```

User properties cần stitching:
- `distinct_id` thống nhất cross-domain (xem 6.3)
- `$user_id` = SMIT User ID sau khi identify

## 6. Risks & Mitigations

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | Event taxonomy chưa chốt → funnel sai | High | Phase 0 task: lock taxonomy với MKT trước khi code funnel; dùng config-driven funnel steps để dễ thay |
| 2 | Cross-domain identity drift | High | E2E test 1 phiên thật trước khi launch; config cookie domain `.smit.tld`, hoặc pass distinct_id qua URL param khi redirect |
| 3 | PostHog Query API rate limit | Med | Cache LRU 5min ở backend; batch queries; ưu tiên `/insights/{id}/refresh` qua saved insight thay vì HogQL ad-hoc |
| 4 | Personal API key leak | High | CHỈ ở server `.env`, không VITE_; review code-reviewer trước merge |
| 5 | Session replay chi phí ($0.005/recording) | Med | Phase 2: bật sampling 10-30%, mask sensitive fields |
| 6 | Embed iframe lộ shared link | Low | Dùng "Embed code" của PostHog (có domain whitelist), không paste link công khai |
| 7 | PostHog instance/region không xác định | Med | Phase 0: hỏi admin chính → confirm `app.posthog.com` vs `eu.posthog.com` vs self-hosted |

## 7. Phase 0 — Pre-flight checklist (1-2 ngày, song song planning)

- [ ] Confirm PostHog instance URL + project ID + region
- [ ] Tạo Personal API Key (read-only nếu PostHog hỗ trợ scope) → save vào `.env`
- [ ] List events đang chảy về (audit `/api/projects/{id}/event_definitions`)
- [ ] Chốt event taxonomy với MKT (6 funnel events ở 5.4)
- [ ] Verify cross-domain stitching: 1 user click "Dùng thử" → vào app → PostHog hiện 1 distinct_id duy nhất
- [ ] Tạo saved insight cho Retention Cohort + lấy share URL

## 8. Out of Scope (Phase 2+)

- Cài/refactor PostHog SDK ở các sản phẩm khác (website, SMIT User, SMIT Agency, app) — đã có sẵn theo report Sprint 1, chỉ cần verify
- Heatmap UI riêng (dùng PostHog native qua link-out)
- A/B test feature flags integration
- Drill-down từ Top features → list user → từng user replay (Phase 3 nếu cần)
- Alerting (Slack notify khi drop-off > threshold)

## 9. Success Criteria

- [ ] Tab Product render 5 block đúng layout, data từ PostHog thật
- [ ] Funnel hiển thị đủ 6 step + drop-off %
- [ ] Top features table sortable, click → mở PostHog đúng filter
- [ ] Retention iframe load < 3s, không CORS error
- [ ] Replay link mở tab PostHog đúng project
- [ ] Backend cache hit > 80% trong 1 giờ
- [ ] Không leak Personal API key (grep test trong build output)
- [ ] Lighthouse perf score tab Product ≥ 80

## 10. Implementation Considerations

- **YAGNI:** Không cần Redis ở phase này — in-memory LRU đủ cho 1 instance Express. Khi scale horizontal mới chuyển.
- **DRY:** Tái dùng `dashboard/ui/*` (DashboardPanel, DashboardSectionTitle, DashboardEmptyState) — không tạo wrapper mới.
- **KISS:** Funnel dùng Recharts BarChart đơn giản trước, không cần custom funnel SVG.
- **Type safety:** Zod schema ở backend cho mọi response từ PostHog (PostHog API có thể đổi shape).
- **Testing:** Mock PostHog client ở unit test; integration test với fixture response.
- **Error handling:** Nếu PostHog xuống → tab Product hiển thị `DashboardEmptyState` với message thân thiện, không crash.

## 11. Next Steps

1. User approve design này
2. Run `/ck:plan` để tạo plan chi tiết với phases:
   - Phase 0: Audit + taxonomy lock + env setup
   - Phase 1: Backend (PostHog client + 3 service + routes + cache)
   - Phase 2: Frontend (5 component + hook + types)
   - Phase 3: Wire-up + e2e test + docs

## 12. Unresolved Questions

1. **PostHog instance region:** US Cloud, EU Cloud, hay self-hosted? (cần admin chính confirm)
2. **Funnel time window:** đo trong 7/30/90 ngày? Có cho user chọn date range giống tab Overview không?
3. **Multi-tenant:** Tab Product có cần filter theo agency/tenant không, hay chỉ aggregate toàn hệ thống?
4. **Permission:** Ai trong SMIT-OS được xem tab Product? Cần role check không?
5. **Refresh frequency:** Real-time (polling), 5min cache, hay manual refresh button?
