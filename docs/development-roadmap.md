# Development Roadmap

> Last updated: 2026-05-10

Strategic roadmap tracking completed features, active initiatives, and planned work.

## Milestones

### v2.3.2 — 2026-05-10 (Completed)

**Acquisition Trackers MVP** — Full feature parity across 6 phases

- ✅ Phase 1: Sidebar restructure (CRM → Acquisition group, 3 trackers)
- ✅ Phase 2: Database schema (AdCampaign, AdSpendRecord, MediaPost models + 3 enums)
- ✅ Phase 3: Ads Tracker (Meta-only, 3 tabs, attribution with Lead Tracker)
- ✅ Phase 4: Media Tracker (manual entry for FB/IG/YT/Blog/PR)
- ✅ Phase 5: Dashboard integration (Marketing tab, Media tab, Overview redesign as 3-stage funnel)
- ✅ Phase 6: Polish & permissions (CSV export, RBAC verified post-role-simplification)

**Role Simplification** — Admin + Member only

- ✅ Leader role removed across backend + frontend
- ✅ RBAC collapsed from 3 tiers to 2
- ✅ 3 Leader users demoted to Member

### v2.3.1 — 2026-05-10 (Completed)

**URL Rename + Notification Overhaul + Topbar Enrich**

- ✅ `/ads-overview` → `/dashboard` (hard cut)
- ✅ Notification system refactored (dropped OKR risk monitoring, sheets-export failure alerts, deadline watchers)
- ✅ Active notifications: report_approved, daily_new, daily_late, weekly_late
- ✅ Alert crons: checkDailyLate (Mon–Fri 10:30 ICT), checkWeeklyLate (Monday 09:00 ICT)
- ✅ Topbar countdown widget (OKR cycle remaining time)

### v2.3.0 — 2026-05-10 (Completed)

**Major Slim-Down Refactor** — Dropped 9 pages + 4 models

- ✅ Removed: WorkItem, WorkItemKrLink, WorkItemDependency, Sprint models
- ✅ Removed pages: PMDashboard, TechBoard, ProductBacklog, MarketingBoard, MediaBoard, SaleBoard, SprintBoard, EpicBoard, EpicGraph
- ✅ Dropped: sheets-export extractors (planning, workspace, analytics-dashboard)
- ✅ Simplified DailyReport + WeeklyReport schemas (plain text + JSON Wodtke blocks)
- ✅ Added KR ownership via `KeyResult.ownerId` field

### v2.2.0 — 2026-05-08 (Completed)

**Product Tab Full Revamp** — 5-section layout with sticky nav

- ✅ Executive section (8 KPI cards, Pre-PQL Rate, Pre-PQL Trend, Activation Heatmap)
- ✅ Funnel section (Funnel-with-Time, TTV Histogram)
- ✅ Cohort section (Cohort Retention Heatmap, Activation Curve via HogQL)
- ✅ Channel section (CRM utm breakdown + PostHog referrer cross-validation)
- ✅ Operational section (Online Time Table, Touchpoint Activity, Stuck Businesses)
- ✅ Performance: LRU cache TTL 5min, second request <50ms
- ✅ Privacy verified (Stuck list excludes PII)

### v2.1.16 — 2026-05-07 (Completed)

**Dashboard Sale Tab Metrics Revamp** — Server-side aggregation

- ✅ New endpoints: GET /api/dashboard/lead-flow, GET /api/dashboard/lead-distribution
- ✅ Lead model: added `source` field
- ✅ Metrics: By Source donut + By AE Workload stacked bar

## Active Features

| Feature | Status | Last Updated |
|---------|--------|--------------|
| **Acquisition Trackers** (Phase 1-6) | ✅ shipped | 2026-05-10 |
| **Dashboard (5 tabs)** | ✅ shipped | 2026-05-10 |
| **OKR Management** | ✅ shipped | 2026-05-10 |
| **Lead Tracker** | ✅ shipped | 2026-05-07 |
| **Daily Sync + Weekly Checkin** | ✅ shipped | 2026-05-10 |
| **Authentication (2FA TOTP)** | ✅ shipped | 2026-04-28 |

## Deferred Features (Post-MVP)

### Acquisition Trackers Follow-up

- **Facebook/Instagram/YouTube auto-sync** — OAuth token management deferred (manual entry covers MVP)
- **Sankey drill-down modal** — Phase 5 scope reduction; breadcrumb navigation sufficient for initial launch
- **Dropoff diagnostic insights panel** — Same as Sankey; aggregate funnel view covers Phase 5 MVP
- **Weekly digest email** — SMTP infrastructure unverified; CSV export + manual sharing covers interim
- **Audit log for Meta token rotate** — Deferred pending token rotation becoming operational task
- **CRM retention deep-dive** — Requires `crm-schema.prisma` audit; Phase 5 uses full CRM DB for Post stage

### Product Tab Enhancements

- **Cohort forecasting** — Predictive retention model
- **AI-powered insights** — Anomaly detection + suggested actions
- **ICP Filter** — CRM missing rental/running/hybrid classification

### Other Future Work

- **TikTok integration** — Platform not currently in use
- **Google Ads integration** — Deferred until platform expansion (Phase 3+ for ads only)
- **Brand listening tool** — No budget/demand signal yet
- **Mobile app** — Desktop web MVP sufficient

## Architecture Decisions

### 2026-05-10

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Acquisition Trackers via Dashboard tabs, not standalone `/acquisition` page | Avoid duplication; Dashboard already has 5 tab structure | Navigation cleaner, less routing complexity |
| Meta-only Ads MVP (Google/TikTok deferred) | Complexity vs. current revenue drivers | Ship 3 weeks faster |
| Manual media entry (auto-sync deferred) | OAuth not available in session | Unblock marketing team data entry |
| Flat funnel without Sankey drill-down (Phase 5 MVP) | Reduce complexity; breadcrumb navigation sufficient | Ship 2-3 days earlier; interactive view available post-launch |
| CSV export instead of weekly email digest | SMTP unverified | Unblock leadership reporting; email as future enhancement |
| Role simplification (Admin/Member only) | Operational need; unused Leader role | Simpler auth checks, 3 fewer migration code paths |

## Tech Stack

| Layer | Version | Notes |
|-------|---------|-------|
| Frontend | React 19 | TypeScript, TailwindCSS v4, Tanstack Query v5 |
| Backend | Express 5 | TypeScript, Prisma ORM |
| Database | PostgreSQL 15 | Docker, 2 schemas (primary + CRM read-only) |
| Cache | In-memory TTL | 60s for dashboard aggregates, 5min for funnel |
| Auth | JWT HTTP-only cookie | 4h expiry, sliding session, 2FA TOTP |
| Build | Vite + tsx watch | Hot-reload dev, production bundle verified |

## Risks & Monitoring

| Risk | Severity | Mitigation | Status |
|------|----------|-----------|--------|
| Acquisition Tracker data quality (UTM consistency) | 🟡 Medium | Validation rules, marketing team training | Acceptable for MVP |
| Meta token expiry | 🟡 Medium | Alert 7 days before expiry (logged) | Monitored |
| CRM DB query performance (cross-DB) | 🟡 Medium | 5-15min cache, indexed tables, paginated responses | Acceptable |
| Sankey lib bundle bloat | 🟢 Low | Deferred to follow-up (lazy-load on-demand) | Resolved via scope cut |

## Next Up

1. **Post-launch monitoring:** Measure leadership engagement (Dashboard views, tab switching, drill-down clicks)
2. **Marketing adoption survey:** % posts tracked in app vs. Larkbase after 1 month
3. **Email digest implementation:** Confirm SMTP + SendGrid config, add weekly summary feature
4. **Sankey drill-down:** Implement interactive modal if leadership requests detail analysis
5. **Platform expansion:** Google Ads (Phase 3c) when business prioritizes
