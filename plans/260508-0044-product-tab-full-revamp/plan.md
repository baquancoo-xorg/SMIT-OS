---
title: "Product Tab Full Revamp — Phase 2 (Master Plan Sub-Plan 0 Coverage)"
description: "Mở rộng Product tab Dashboard từ 4 widget thành 5 section đầy đủ (Executive · Funnel · Cohort · Channel · Operational) theo Master Plan Sub-Plan 0 — phục vụ PLG Gate metrics + Concierge workflow"
status: completed
priority: P2
effort: "3 sprints (~13d after audit)"
branch: main
created: 2026-05-08
completed: 2026-05-08
tags: [dashboard, posthog, product-tab, plg-gate, master-plan]
---

# Plan — Product Tab Full Revamp (Phase 2)

## Context Links
- **Brainstorm:** `plans/reports/brainstorm-260508-0044-product-tab-full-revamp.md`
- **Master Plan:** `docs/SMIT-Master-Plan-2026-05-05.md` (§3 PLG Gate, §1.4 Concierge)
- **Phase 1 (done):** `plans/260507-2219-posthog-product-tab/plan.md`
- **Backend reuse:** `server/services/posthog/posthog-client.ts` · `server/services/posthog/posthog-cache.ts`
- **Frontend section root:** `src/components/dashboard/product/product-section.tsx`

## Architecture (Scroll-Down 5 Section + Sticky Sub-Nav)

```
[Sticky: § Executive · § Funnel · § Cohort · § Channel · § Operational  ↻]
§1 EXECUTIVE  → 8 KPI cards · Pre-PQL Trend · Activation Heatmap (3 views)
§2 FUNNEL     → Funnel hiện tại · Funnel-with-Time · TTV Histogram (p50/p90)
§3 COHORT     → Retention Heatmap (replace iframe) · Activation Curve
§4 CHANNEL    → Referring Domain Breakdown · Pre-PQL by Source · UTM Status Badge
§5 OPERATIONAL→ Online Time Table · Touchpoint Table · Stuck List · ICP Filter
```

**Backend:** 7 service mới + extend routes `dashboard-product.routes.ts` · cache 5min/30min/1h.
**Frontend:** 13 component mới + `product-kpi-cards.tsx` extend 6→8 cards · sticky nav.

## Phases

| # | Phase | File | Status | Effort |
|---|---|---|---|---|
| 0 | Pre-flight Audit | [phase-00-preflight-audit.md](./phase-00-preflight-audit.md) | ✅ done | 1d |
| 1 | Sprint 1 — Executive + Funnel | [phase-01-sprint1-executive-funnel.md](./phase-01-sprint1-executive-funnel.md) | ✅ done | 5d |
| 2 | Sprint 2 — Cohort + Channel (UTM fix DEFERRED) | [phase-02-sprint2-cohort-channel.md](./phase-02-sprint2-cohort-channel.md) | ✅ done | 4d |
| 3 | Sprint 3 — Operational + Polish (ICP filter DEFERRED) | [phase-03-sprint3-operational-polish.md](./phase-03-sprint3-operational-polish.md) | ✅ done | 4d |
| 4 | Test + Docs | [phase-04-test-docs.md](./phase-04-test-docs.md) | ✅ done | (sprint 3 tail) |

**Audit report:** [`reports/phase-00-audit.md`](./reports/phase-00-audit.md)

## Top Risks (post-audit)

1. 🔴 **Cohort retention HogQL slow** — bucket by week, cache 1h, EXPLAIN check, fallback empty state
2. ✅ **Pre-PQL by source person property** — RESOLVED: dùng CRM `crm_subscribers_utm` thay PostHog
3. ✅ **`$referring_domain` coverage thấp** — RESOLVED: switch sang CRM (PostHog 94% noise)
4. ✅ **CRM ICP column** — RESOLVED: không tồn tại → DEFER ICP filter Sprint 3
5. 🟡 **CRM JOIN performance** (mới — `crm_subscribers_utm` × `crm_subscribers` × `crm_businesses`) — index check Sprint 2

## Success Criteria

- ✅ 5 sections render real data, không "Coming soon" trừ UTM Status Badge
- ✅ Pre-PQL Rate hiển thị prominent (PLG Gate metric #1)
- ✅ Heatmap dropdown switch 3 views không re-fetch (single endpoint variant param)
- ✅ Operational table sortable + ICP filter (nếu CRM có column)
- ✅ Initial load <2s · scroll smooth · cache hit >70%
- ✅ Build output không leak `POSTHOG_PERSONAL_API_KEY`
- ✅ Cohort retention thay iframe (loại `VITE_POSTHOG_RETENTION_INSIGHT_URL`)
- ✅ Stuck list export-ready cho Sale Concierge (Master Plan §1.4)

## Key Dependencies

- Phase 1 (260507-2219) ✅ done — KPI cards 6-cell · Funnel · Top Features · Retention iframe đang chạy
- CRM `crmBusinessPqlStatus` schema (`first_sync_at`, `pql_achieved_at`, `feature_activated_at`, `has_first_sync`)
- PostHog Cloud US — `POSTHOG_PERSONAL_API_KEY` server-side
- Reuse `posthog-client.hogql()` + LRU cache (không build mới)

## Out of Scope (Phase 3+)

A/B test framework · Drill-down replay embed · Slack alerting · Multi-tenant RBAC · Mobile responsive · CSV export

## Resolved Open Questions (Phase 0 audit)

| # | Question | Verdict |
|---|---|---|
| 1 | CRM ICP column? | ❌ DEFER — không có column phân loại rental/running/hybrid |
| 2 | `$referring_domain` coverage? | ❌ Switch CRM `crm_subscribers_utm` (PostHog 94% noise) |
| 3 | Person property `first_referring_domain`? | N/A — dùng CRM thay |
| 4 | Stuck threshold? | ✅ 7d, **tracking-only** (no Sale Concierge trigger) |
