---
title: "PostHog Integration cho Tab Product Dashboard"
description: "Hybrid architecture: backend proxy HogQL + embed retention + link-out replay cho tab Product"
status: done
priority: P2
effort: 8-12 days
branch: main
tags: [dashboard, posthog, analytics, product-tab, integration]
created: 2026-05-07
---

# Plan — PostHog Integration cho Tab Product Dashboard

## Context
- **Brainstorm:** `plans/reports/brainstorm-260507-1609-posthog-product-tab-integration.md`
- **Source code target:** `src/pages/DashboardOverview.tsx:122` (empty state hiện tại)
- **Architecture:** Hybrid — Custom backend proxy (KPI/Funnel/Top features) + Embed iframe (Retention) + Link-out (Replay)
- **5 decisions chốt:** US Cloud `app.posthog.com` · 30d default + date picker · aggregate toàn hệ thống · cache 5min + manual refresh · auth-only (mọi user đăng nhập)

## Phases

| # | Phase | File | Status | Effort |
|---|---|---|---|---|
| 0 | Pre-flight & Audit | [phase-00-preflight-audit.md](./phase-00-preflight-audit.md) | ✅ done | 1-2d |
| 1 | Backend (PostHog services + routes + cache) | [phase-01-backend-posthog-services.md](./phase-01-backend-posthog-services.md) | ✅ done | 3-4d |
| 2 | Frontend (5 components + hook + types) | [phase-02-frontend-product-tab-components.md](./phase-02-frontend-product-tab-components.md) | ✅ done | 3-4d |
| 3 | Wire-up + Test + Docs | [phase-03-wireup-test-docs.md](./phase-03-wireup-test-docs.md) | ✅ done | 1-2d |
| 4 | **Metrics Revamp (Business-centric)** | [phase-04-metrics-revamp.md](./phase-04-metrics-revamp.md) | ✅ done | 2-3d |

## Metric Definitions (Revised 2026-05-08)

| Metric | Definition | Data Source | Query |
|--------|------------|-------------|-------|
| **Total Signup** | Số Business được tạo | PostHog | `Tạo doanh nghiệp thành công` |
| **FirstSync** | Đồng bộ TKQC lần đầu thành công | CRM | `has_first_sync = true` |
| **PQL** | FirstSync + Feature activated + Second sync | CRM | `is_pql = true` |
| **Activation** | Business có ≥2h online time | PostHog | Session duration per `business_id` |
| **Activation Rate** | Activation / Total Signup × 100 | Computed | - |
| **DAU** | Businesses đạt Activation trong ngày | PostHog | Distinct `business_id` with ≥2h/day |
| **MAU** | Businesses đạt Activation trong tháng | PostHog | Distinct `business_id` with ≥2h/30days |
| **DAU/MAU** | Tỷ lệ DAU/MAU × 100 | Computed | - |

## Key Dependencies
- **Phase 0 blocker:** MKT chốt event taxonomy (6 events) trước khi Phase 1 funnel service code-được
- **Phase 0 blocker:** PostHog admin cấp `POSTHOG_PROJECT_ID` + Personal API Key
- **Phase 0 blocker:** Saved insight Retention Cohort tạo trên PostHog UI để lấy share URL
- **Phase 1 → Phase 2:** types match Zod schema (single source of truth)
- **Phase 2 → Phase 3:** wire-up cần component `<ProductSection />` từ Phase 2

## Architecture (high-level)
```
React Query (5min staleTime, manual refresh)
   ↓
Express /api/dashboard/product/{summary,funnel,top-features}
   ↓ (LRU cache 5min, in-memory)
PostHog Cloud Query API (app.posthog.com, Personal API Key, server-only)
```

## Success Criteria (top-level)
- ✅ KPI cards render 6 metrics (Signup, FirstSync, PQL, Activation, DAU, DAU/MAU)
- ✅ Funnel hiển thị 4 step business journey + drop-off %
- ⏭️ Date picker removed per user request (default 30d)
- ✅ Manual refresh button invalidate cache
- ✅ Build output không leak `POSTHOG_PERSONAL_API_KEY` (server-only)
- ⏳ Retention iframe: pending `VITE_POSTHOG_RETENTION_INSIGHT_URL` config

## Top Risks (xem chi tiết §6 brainstorm)
1. Event taxonomy chưa lock → funnel sai (High)
2. Cross-domain identity drift → distinct_id phân mảnh (High)
3. Personal API key leak ra FE (High)
4. PostHog Query API rate limit (Med)

## Out of Scope (Phase 2+)
- Heatmap UI riêng · A/B feature flags · Drill-down user replay · Slack alerting · Multi-tenant filter · Role-based access

## Open Questions (resolve trong Phase 0/1)

| # | Question | Resolve in | Owner |
|---|---|---|---|
| 1 | PostHog Insights funnel response shape — capture fixture từ instance thật | Phase 0 Step 4 (audit) | dev |
| 2 | Helmet CSP có block PostHog iframe? Cần update `frame-src 'self' https://app.posthog.com`? | Phase 1 Step 9 (wire route) hoặc Phase 3 Step 7 | dev |
| 3 | DateRangePicker — Phase 1 preset-only hay full custom range ngay? | Phase 2 Step 3 (build component) | dev |
| 4 | Type sync FE/BE — manual mirror hay script `gen-types.ts`? | Phase 1 Step 4 + Phase 2 Step 1 | dev |

⚠️ Các câu này KHÔNG block start Phase 0. Nếu Phase 0 audit phát hiện vấn đề lớn → revisit plan.
