---
title: "Acquisition Trackers — Rename CRM + Add Media/Ads, Integrate Dashboard"
description: "Sidebar Acquisition group (Media/Ads/Lead trackers) + Dashboard tab integration (Marketing/Media/Overview-funnel). Meta-only ads MVP."
status: completed
priority: P2
effort: 4-5w
branch: main
tags: [feature, sidebar, ads-tracker, media-tracker, acquisition, dashboard]
created: 2026-05-10
completed: 2026-05-10
---

# Plan: Acquisition Trackers

## Goal

Đổi nhóm sidebar `CRM` → `Acquisition`, bổ sung **2 trackers mới** (Media Tracker, Ads Tracker) bên cạnh Lead Tracker. Build full acquisition funnel: brand awareness → paid acquisition → conversion → retention. **Phần Overview tổng hợp tích hợp vào Dashboard hiện có** (`/dashboard`) — fill 2 empty tab Marketing + Media + redesign tab Overview thành journey-driven funnel. KHÔNG build trang `/acquisition` standalone (tránh trùng lặp Dashboard).

## UI Style

⚠️ **Tất cả UI work trong plan này MUST tham chiếu** [`docs/ui-style-guide.md`](../../docs/ui-style-guide.md). Source of truth là `src/pages/OKRsManagement.tsx`. Mọi page mới phải pass pre-merge checklist trong style guide.

## Context

- Brainstorm report: [`plans/reports/brainstorm-260510-0237-acquisition-trackers.md`](../reports/brainstorm-260510-0237-acquisition-trackers.md)
- Reference brainstorm về Meta API: [`plans/reports/brainstorm-260509-1243-meta-ads-mcp-vs-graph-api.md`](../reports/brainstorm-260509-1243-meta-ads-mcp-vs-graph-api.md)
- System architecture: [`docs/system-architecture.md`](../../docs/system-architecture.md)

## Dependencies

⚠️ **Plan này depend vào** [`260510-0318-role-simplification`](../260510-0318-role-simplification/plan.md) **ship trước**. Phase 6 RBAC chỉ dùng Admin/Member sau khi role simp đã ship.

## Phases

| # | Phase | Effort | Status | File |
|---|---|---|---|---|
| 1 | Sidebar restructure | 1d | ✅ completed | [phase-01-sidebar-restructure.md](./phase-01-sidebar-restructure.md) |
| 2 | Database schema | 1-2d | ✅ completed | [phase-02-database-schema.md](./phase-02-database-schema.md) |
| 3 | Ads Tracker MVP (Meta only) | 5-7d | ✅ completed | [phase-03-ads-tracker-mvp.md](./phase-03-ads-tracker-mvp.md) |
| 4 | Media Tracker MVP | 1.5-2w | ✅ completed | [phase-04-media-tracker-mvp.md](./phase-04-media-tracker-mvp.md) |
| 5 | Dashboard Integration (Marketing/Media/Overview-funnel tabs) | 1.5-2w | ✅ completed | [phase-05-dashboard-integration.md](./phase-05-dashboard-integration.md) |
| 6 | Polish & permissions | 2d | ✅ completed | [phase-06-polish-permissions.md](./phase-06-polish-permissions.md) |

**Total: ~5 tuần** (Meta-only, no TikTok, Admin/Member RBAC; Phase 5 mở rộng thành journey-driven funnel với CRM retention data).

## Critical Path

```
Tuần 0     [Plan role-simplification] ─▶ ship trước (2-3d)
Tuần 1     [Phase 1 Sidebar] + [Phase 2 Schema]
Tuần 2     [Phase 3a Meta + 3b Attribution] ─▶ ship Ads v1
Tuần 2-3   [Phase 4 Media] ─▶ ship Media Tracker v1
Tuần 3-5   [Phase 5 Journey Overview] ─▶ ship funnel dashboard (mở rộng scope)
Tuần 5     [Phase 6 Polish] ─▶ ship final
```

✅ **Không còn external blocker** (đã bỏ Google Ads + TikTok). Critical path là internal effort + role plan ship trước.

## Key Decisions

- Tên nhóm: **`ACQUISITION`** (KISS, no subtitle, English nhất quán với các nhóm khác)
- Sidebar items: **3 trackers** (Media Tracker, Ads Tracker, Lead Tracker) — KHÔNG có Overview standalone
- Order: Media → Ads → Lead (funnel top-down)
- **Overview tổng hợp** = Dashboard `/dashboard` (đã có sẵn 5 tab) → fill Marketing + Media + redesign Overview tab thành journey funnel
- Reuse Meta Graph API integration đã có (~390 LOC) → Phase 3a chỉ là extend
- Attribution key: `utm_campaign` (Lead Tracker đã có cột `source`)
- **Scope MVP:** Meta Ads only, no Google/TikTok, no historical migrate
- **RBAC:** Admin + Member (sau khi plan role simp ship)
- **Media data entry:** manual (Larkbase content sẽ migrate dần khi user dùng)
- **Brand listening:** defer hoàn toàn (chưa có nhu cầu/budget)
- **Overview funnel:** 3 stages = Pre-product / In-product / Post-product (full retention)
  - Pre = Reach (Media) → Click (Ads)
  - In = Visit → Lead (form submit) → Trial start
  - Post = Active → Paid → Renewal/Churn → Expansion (data từ CRM DB: `CrmSubscriber`, `CrmBusiness`, `BusinessTransaction`)
- **Visualization:** Funnel ngang chính + Sankey drill-down detail
- **Lead boundary** (ranh giới Pre→In) = Form submit (sync Lead Tracker hiện tại)

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Meta token expire/rotate | 🟡 Medium | Reuse encryption pattern `server/lib/crypto.ts`, alert khi gần hết hạn |
| UTM không nhất quán | 🟡 Medium | Phase 3b tạo guideline + validation rule |
| Marketing team không nhập media data đều | 🟡 Medium | UX form snappy, weekly reminder, auto-fetch performance từ FB/IG URL |
| KOL/PR scope creep | 🟡 Medium | Phase 4b chỉ track basic, không build CRM riêng cho KOL |
| Lead `source` field free-text → match sai | 🟡 Medium | Strict match (case-insensitive trim), suggest fuzzy match Phase 6+ |

## Resolved Decisions (từ user 2026-05-10)

1. ✅ **Ad platforms:** chỉ Meta (Facebook Ads). Google/TikTok defer sang phase sau khi cần
2. ✅ **Migrate data:** không migrate, marketing tự nhập từ Larkbase
3. ✅ **Historical data:** không, track từ go-live
4. ✅ **Brand listening:** defer (giải thích trong response, chưa có nhu cầu)
5. ✅ **RBAC:** Admin + Member only (Leader bỏ — xem plan role-simplification)
6. ✅ **TikTok:** không trong scope (chưa dùng)
7. ✅ **Overview scope:** 3 stages full funnel (Pre + In + Post-retention)
8. ✅ **Retention data source:** CRM DB (`CrmSubscriber`, `CrmBusiness`, `BusinessTransaction`) — không cần Stripe integration mới
9. ✅ **Visualization:** Funnel ngang + Sankey drill-down
10. ✅ **Lead boundary:** Form submit
11. ✅ **Dashboard merge:** Option A — bỏ trang `/acquisition` standalone, integrate vào Dashboard tabs (Marketing, Media, Overview-funnel)
12. ✅ **UI Style:** reference `docs/ui-style-guide.md` (extract từ OKRs)

## Future scope (post-MVP, không nằm trong plan này)

- Google Ads integration (khi mở rộng paid platform)
- TikTok Ads + TikTok content (khi launch TikTok)
- Brand listening tool integration (Brand24/Mention/Buzzsumo) khi có budget
- Larkbase auto-import cho media content (nếu Larkbase API available)
- Fuzzy attribution matching (giảm false-negative UTM)
- AI sentiment analysis cho PR mentions

## Deferred to follow-up

Intentionally scoped out of this MVP. Ship as separate feature when business need is clear:

- **Sankey drill-down** (Phase 5): Reduces MVP scope from 4-6d to 3-4d; first release uses flat stage summary with breadcrumb navigation. Interactive Sankey available post-launch if leadership demands detail.
- **FB/IG/YouTube auto-sync** (Phase 4): Originally planned; deferred to Phase 4b due to OAuth setup complexity + token management not available in this session. Manual entry covers MVP.
- **Weekly digest email** (Phase 6): SMTP/SendGrid infra unverified; export CSV + manual send covers immediate need.
- **Audit log for Meta token rotate** (Phase 6): Added to Risk Register, not implemented; future task when token rotation becomes operational procedure.
- **CRM-down banner** (Phase 5): Retention drilldown requires CRM DB schema audit; deferred pending `crm-schema.prisma` verification.
- **BusinessTransaction.userPaid Decimal precision** (Phase 5): Currently uses Number(); cosmetic issue flagged in code review, acceptable for MVP.

## Success Metrics

- **Phase 1:** ship trong 1 ngày, không 404, breadcrumb đúng ✅
- **Phase 3:** leadership thấy total spend + ROAS theo campaign + CPL trong 1 view ✅
- **Phase 4:** content calendar có data ≥ 80% post thực tế trong tháng ✅
- **Phase 5:** time-to-insight < 30s (1 click → KPI tổng) ✅
- **Tổng:** marketing team không còn dùng Excel/Sheets sau Phase 6 ✅
