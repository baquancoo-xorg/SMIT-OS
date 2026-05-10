# Project Changelog

## [v2.3.3] - 2026-05-10

### Acquisition Trackers MVP — Full 6-phase deployment

**Sidebar (Phase 1):**
- Renamed `CRM` group to `ACQUISITION` with 3 trackers: Media Tracker, Ads Tracker, Lead Tracker
- 2 lazy-loaded stub pages replaced with full implementations
- Breadcrumb updated across trackers

**Database (Phase 2):**
- Added 3 models: `AdCampaign` (Meta campaigns), `AdSpendRecord` (daily spend), `MediaPost` (owned/earned/KOL/PR content)
- Added 3 enums: `AdPlatform` (META), `MediaPlatform` (FB/IG/YT/Blog/PR/Other), `MediaPostType` (Organic/KOL/KOC/PR)
- Created seed file `prisma/seeds/acquisition-seed.ts` with 1 campaign + 7 spend records + 5 media posts
- Added `npm run db:seed:acquisition` script

**Ads Tracker (Phase 3):**
- Meta Graph API integration: `facebook-api.ts` extended with campaign + insights endpoints
- Backend services: `ads-sync.service.ts` (ETL), `meta-ads-normalize.ts` (raw→normalized), `attribution.service.ts` (Lead join), `ads-sync.cron.ts` (daily 02:00 UTC)
- Post-review fixes: Currency normalization (USD→VND via `currency-helper.ts`), Sync mutex (409 if in-flight), N+1 query elimination (batch fetches), 5-min cache with in-flight dedup
- UI: 3 tabs (Campaigns/Performance/Attribution), 4 KPI cards, charts, export CSV
- Documentation: `docs/utm-guideline.md` published

**Media Tracker (Phase 4):**
- Manual entry forms for Facebook, Instagram, YouTube, Blog, PR posts
- Services: `media-post.service.ts` (CRUD), `media-tracker.routes.ts` (endpoints)
- UI: 3 tabs (Owned/KOL-KOC/PR), 4 KPI cards, tables with filters, export CSV
- RBAC: read-shared/write-own via `MediaPost.createdById` (Admin/Member per role-simplification)
- Deferred to follow-up: Auto-sync for FB/IG/YT (OAuth not available)

**Dashboard Integration (Phase 5):**
- Marketing tab: 4 KPI cards (Total Spend, Campaigns, Leads, CPL), 30d spend trend, top 5 campaigns
- Media tab: 4 KPI cards (Posts, Reach, KOL Spend, PR Mentions), posts trend by platform, recent PR sentiment
- Overview tab redesigned: 3-stage journey funnel (Pre→In→Post product), 10 KPI cards, funnel visualization, shared date range
- Services: `journey-funnel.service.ts` (3-stage aggregation, 5-min cache), dropoff diagnostic (deferred), sankey builder (deferred)
- Routes: `acquisition.routes.ts` (GET campaigns, GET funnel, GET sankey placeholder)

**Polish & Permissions (Phase 6):**
- RBAC verified: Admin/Member only (Leader removed per `260510-0318-role-simplification`). Sidebar Acquisition group gated to Admin/Member.
- CSV export: Shared `src/lib/csv-export.ts` utility; Ads Tracker + Media Tracker export buttons implemented
- Deferred: Weekly digest email (SMTP unverified), audit log for token rotate, Settings UI for digest recipients

**Verification:**
- `npx tsc --noEmit` clean
- `npm run build` succeeded (production bundle generated)
- DB schema synced via `npx prisma db push`
- Seed `npm run db:seed:acquisition` executes successfully
- 3 endpoints reachable on dev server (return 401 unauthenticated, expected per auth-gating)

**Plan:** `plans/260510-0237-acquisition-trackers/`

**Architecture updated:** `docs/system-architecture.md` Acquisition Tracking section extended with service descriptions, performance notes, deferred features

## [v2.3.2] - 2026-05-10

### Role Simplification — Admin + Member only

**BREAKING:** Legacy `Leader` role removed across the stack. RBAC collapsed from 3 levels to 2.

**Migration:**
- 3 Leader users demoted to Member via `prisma/migrations/manual/demote-leader-to-member.sql` (DB backup at `plans/260510-0318-role-simplification/backups/backup-pre-role-simp-20260510-1422.sql`)
- Post-migration role distribution: Admin × 2, Member × 15

**Backend (8 files):**
- `rbac.middleware.ts` — `Role` type narrowed to `'Admin' \| 'Member'`; `RBAC.leaderOrAdmin` preset removed
- `notification.service.ts` — `findLeadersAndAdminsFor` renamed to `findAdminRecipientsFor`; queries `isAdmin: true` only (no role-string match, no department overlap filter)
- `alert-scheduler.ts` — daily/weekly late escalation now goes to admins + the late submitter
- `lead.routes.ts` — delete-request gate: AE of lead OR admin (Leader path dropped)
- `objective.routes.ts` — Objective CRUD + recalculate moved to admin-only
- `key-result.routes.ts` (newly captured) — POST/DELETE = admin-only; PUT = ownership (`KR.ownerId`) or admin
- `daily-report.routes.ts` — list = read-shared (no per-role filter); edit = own + admin; approve = admin-only
- `report.routes.ts` (weekly) — same pattern

**Frontend (6 files):**
- `types/index.ts` — comment updated
- `settings/user-management-tab.tsx` — `Leader` option + badge variant removed
- `WeeklyCheckinModal.tsx` — copy "Liên hệ Leader/Admin" → "Liên hệ Admin"
- `WeeklyCheckin.tsx`, `DailySync.tsx` — approve gate renamed `canApprove`, admin-only
- `LeadTracker.tsx` — `canManageLeads` = admin-only

**Schema:**
- `prisma/schema.prisma` — `User.role` comment updated to `// Admin, Member`

**QA:** `tsc --noEmit` clean across server + src; final `grep "Leader"` returns 0 business hits; dev server hot-reloads without error; live `/api/health` returns 401 (auth-gated, endpoint healthy).

**Plan:** `plans/260510-0318-role-simplification/`

## [v2.3.1] - 2026-05-10

### URL Rename + Notification Overhaul + Topbar Enrich

**URL routing:**
- `/ads-overview` → `/dashboard` (hard cut, no legacy redirect)
- Wildcard routes now redirect to `/dashboard` instead of `/ads-overview`

**Notification refactor:**
- Truncated legacy Notification table (154 rows removed)
- **Dropped:** notifyFailure (sheets-export-failed alerts), entire OKR risk monitoring cron (`checkOKRRisks` handler + cron job), legacy types `notifyDeadlineWarning`, `notifySprintEnding`
- **Active types (4):** `report_approved` (kept), `daily_new`, `daily_late`, `weekly_late`
- **New service methods:** `notifyDailyNew`, `notifyDailyLate`, `notifyWeeklyLate`, `findLeadersAndAdminsFor` in `notification.service.ts`
- **Schema:** Added `@@unique([userId, type, entityType, entityId])` dedup constraint + new index on `(type, entityType, entityId)` to Notification model. Migrated with `prisma db push --accept-data-loss` (safe: table emptied before migration)
- **Dedup mechanism:** Atomic `createMany({skipDuplicates:true})` replaces prior TOCTOU pattern, eliminating race conditions
- **Alert crons (2, timezone Asia/Ho_Chi_Minh):**
  - `30 10 * * 1-5` (Mon–Fri 10:30 ICT) → `checkDailyLate` handler
  - `0 9 * * 1` (Monday 09:00 ICT) → `checkWeeklyLate` handler
- **Daily report creation:** POST `/api/daily-reports` now fans out `daily_new` notifications to leaders + admins (excluding submitter); wrapped try/catch prevents notification failure from blocking report creation
- **Frontend:** NotificationCenter icon map + click routing updated for 4 types (directs to `/daily-sync` or `/checkin` based on entityType)

**Topbar enhancements:**
- New `use-active-okr-cycle.ts` hook (React Query, GET `/api/okr-cycles/active`, staleTime 1h) computes `daysLeft` + color band (green >30d, amber 7–30d, red <7d)
- New `OkrCycleCountdown.tsx` component: pill widget in header, hidden on mobile/loading/error, click routes to `/okrs`
- Header.tsx refactored: ROUTE_BREADCRUMBS map (7 routes) with resolveBreadcrumb fallback, integrated OkrCycleCountdown + NotificationCenter

**QA:** typecheck + build pass, hot-reload verified, dedup smoke test (2× run = same row count), `/dashboard` 200 OK

## [v2.3.0] - 2026-05-10

### Major Slim-Down Refactor

Architecture streamlined from 10 pages + 4 Prisma models + sprint-oriented boards to a single OKR-centric focus.

**Dropped:**
- 4 Prisma models: `WorkItem`, `WorkItemKrLink`, `WorkItemDependency`, `Sprint`
- 9 frontend pages: PMDashboard, TechBoard, ProductBacklog, MarketingBoard, MediaBoard, SaleBoard, SprintBoard, EpicBoard, EpicGraph
- 2 backend routes: `/api/work-items`, `/api/sprints`
- Settings "Sprints" tab, daily-report folder (12 team-specific form files), board task components (TaskCard, TaskModal, TaskTableView, EpicCard, etc.)
- 3 sheets-export extractors: planning, workspace, analytics-dashboard
- 3 notification handlers: `notifyDeadlineWarning`, `notifySprintEnding`, `notifyFailure` (removed in v2.3.1)
- OKR risk monitoring: dropped `checkOKRRisks` cron job (removed in v2.3.1)
- src/components/sprint/, src/components/work-item/, SprintContextWidget, SprintContext

**Schema changes:**
- `KeyResult`: added `ownerId` (FK User, nullable)
- `DailyReport`: 4 plain text fields (completedYesterday, doingYesterday, blockers, planToday); dropped tasksData, teamMetrics, teamType, impactLevel, adHocTasks
- `WeeklyReport`: repurposed for Wodtke 5-block JSON: `krProgress`, `progress`, `plans`, `blockers`; dropped score, confidenceScore, adHocTasks
- `User`: added `ownedKRs` relation

**Route changes (superseded by v2.3.1):**
- `/` → redirects to `/ads-overview` (changed to `/dashboard` in v2.3.1)
- `/sync` → renamed to `/checkin`
- `/tech`, `/backlog`, `/mkt`, `/media`, `/sale`, `/sprint` → 404 (wildcard redirects to `/ads-overview`, changed to `/dashboard` in v2.3.1)

**Backend routes (final 19):** auth, user, objective, key-result (now supports `?ownerId=`), okr-cycle, daily-report, report, notification, lead, lead-sync, google-oauth, sheets-export, dashboard-overview, dashboard-product, dashboard-call-performance, dashboard-lead-distribution, dashboard-lead-flow, admin-fb-config, fb-sync

**Active models (15):** Lead, LeadAuditLog, OkrCycle, FbAdAccountConfig, RawAdsFacebook, ExchangeRateSetting, EtlErrorLog, GoogleIntegration, SheetsExportRun, LeadSyncRun, LeadStatusMapping, User, Notification, Objective, KeyResult, DailyReport, WeeklyReport

**Settings tabs (final 5):** profile, users, okrs, fb-config, export

## [v2.2.0] - 2026-05-08

### Product Tab Full Revamp (Phase 2)

Expand Dashboard → Product tab from 4 widgets to 5 sections (Executive · Funnel · Cohort · Channel · Operational) per Master Plan Sub-Plan 0.

- **5-section layout:** sticky sub-nav (`product-section-nav.tsx`) with IntersectionObserver active highlight + smooth scroll
- **§1 Executive:** 8 KPI cards including Pre-PQL Rate (PLG Gate metric #1), Pre-PQL Trend line chart, Activation Heatmap with 3-view dropdown (hour×day · cohort × days-since-signup · top 50 business)
- **§2 Funnel:** Funnel-with-Time (avg days between steps), TTV Histogram with p50/p90 markers across 6 buckets
- **§3 Cohort:** custom Cohort Retention Heatmap (replaces legacy `VITE_POSTHOG_RETENTION_INSIGHT_URL` iframe), Cohort Activation Curve. HogQL CTE with 10s timeout fallback.
- **§4 Channel:** CRM `crm_subscribers_utm` primary breakdown + Pre-PQL Rate by Source + PostHog `$referring_domain` secondary cross-validation. `normalizeSource()` consolidates 8+ dirty values (Home/Homepage, fb/Facebook/Faceboookads).
- **§5 Operational:** Online Time Table (7-day session_duration grid), Touchpoint Activity (top 50, sortable, paginated), Stuck Businesses List (TRACKING-ONLY, no PII fields, 7d threshold)
- **Backend:** 7 new services under `server/services/posthog/` (trends, heatmap, time-to-value, cohort, channel, operational, stuck), 7 new GET endpoints
- **Cache:** LRU TTL 5min default — second request <50ms
- **Privacy:** Stuck list response shape verified to exclude email/phone via `product-stuck.service.test.ts`
- **Security:** `POSTHOG_PERSONAL_API_KEY` confirmed server-only; absent from `src/` and from production bundle
- **Tests:** 14 new tests (cohort aggregation, stuck contract, channel normalization) — all passing
- **Quality gates:** TypeScript 0 errors, build 2.43s, all 15 tests pass

### Deferred (post-audit)

- ICP Filter — CRM lacks rental/running/hybrid classification column
- UTM tracking fix — CRM `crm_subscribers_utm` already has clean source data, posthog-js init untouched

## [v2.1.16] - 2026-05-07

### Dashboard Sale Tab Metrics Revamp

- **New API endpoints:** `GET /api/dashboard/lead-flow` and `GET /api/dashboard/lead-distribution` for server-side aggregation
- **Lead model:** added `source` field to track CRM vs manual lead provenance
- **Metrics components:** refactored dashboard-tab.tsx to compute metrics server-side via new hooks, reducing frontend calculation overhead
- **New visualizations:** Lead Distribution section with By Source donut chart and By AE Workload stacked bar chart
- **Performance:** metrics now calculated at API layer, improving dashboard responsiveness

## [v2.1.15] - 2026-04-28

### Login Redesign + Sliding Session

- **Login UI**: replaced Shield icon with real PNG logo (`/logo-only.png`, 256×256, 59KB); gradient changed from royal blue to deep navy (#0F2A44 → #1E4167 → #2A6498); floating orbs updated to cyan tones
- **Sliding session**: JWT auto-refreshes when remaining time < 1h on any authenticated request — users active continuously never get logged out; idle > 4h = logout (security preserved)
- **DRY refactor**: extracted shared cookie config to `server/lib/cookie-options.ts`, used by both `auth.routes.ts` and `auth.middleware.ts`
- Added `getTokenRemaining()` helper in `auth.service.ts`
- Quality gate: TypeScript 0 errors, code review 8.5/10

## [v2.1.14] - 2026-04-28

### Security / Performance / Cleanup

- Introduced Prisma singleton at `server/lib/prisma.ts`; all server files now import from it. `server/lib/crm-db.ts` remains intentionally separate.
- Hardened `server.ts`: 2 MB JSON body limit, Helmet CSP report-only header, CORS blank-origin restricted to non-production, general API rate limiter (200 req/min), `requireAdmin` gate on `/api/admin/*`.
- Added 60 s in-memory TTL cache to `server/services/dashboard/overview-ad-spend.ts` for CRM aggregation queries.
- Fixed N+1 query pattern in `server/services/lead-sync/crm-lead-sync.service.ts`: replaced per-lead `findUnique` loop with batch `findMany` + `Map` lookup.
- Removed dead client-side hooks: `src/hooks/use-users.ts`, `src/hooks/use-objectives.ts`, `src/hooks/use-sprints.ts`.

## [v2.1.13] - 2026-04-27

### Updated: Unified Table UI Design System — Phase 03 dense rollout completed

- Completed dense contract rollout for call-performance analytics tables:
  - `src/components/dashboard/call-performance/call-performance-ae-table.tsx`
  - `src/components/dashboard/call-performance/call-performance-conversion.tsx`
- Both tables now use shared `TableShell` with `variant="dense"` and `getTableContract('dense')` tokens for header/row/cell consistency.
- Preserved existing data logic and metric formatting behavior while standardizing dense visual shell.
- Quality gate:
  - `npm run lint` passed (`tsc --noEmit`).
  - Subagent review/test checks passed.
  - Float precision follow-up resolved by using decimal formatting for `callsPerLead`, `avgDuration`, and `avgCallsBeforeClose`.

## [v2.1.12] - 2026-04-27

### Updated: Unified Table UI Design System — Phase 02 standard rollout completed

- Completed standard-table contract rollout across operational modules and modal embedded tables.
- Finalized modal migrations:
  - `src/components/modals/WeeklyCheckinModal.tsx` — replaced inline next-week plan table with `TableShell` + `getTableContract('standard')`, standardized action header/cell to `Actions` contract.
  - `src/components/modals/ReportDetailDialog.tsx` — migrated plans table to standard contract and switched deadline rendering to shared `formatTableDate` helper.
- Confirmed contract consistency in Phase 02 inventory (action header/cell and shared date formatting paths).
- Quality gate:
  - `npm run lint` passed (`tsc --noEmit`).
  - Test baseline passed (1/1).

## [v2.1.11] - 2026-04-27

### Updated: Unified Table UI Design System — Phase 01 foundation completed

- Added shared table primitives:
  - `src/components/ui/table-contract.ts`
  - `src/components/ui/table-shell.tsx`
  - `src/components/ui/table-date-format.ts`
- Updated `src/components/ui/table-row-actions.tsx` to support variant-aware behavior (`standard` / `dense`) and dense compact icon sizing.
- Migrated standard pilot table `src/components/board/TaskTableView.tsx` to shared table shell/contract, standardized action header (`Actions`), and unified table date formatting.
- Migrated dense pilot table `src/components/dashboard/overview/KpiTable.tsx` + `src/components/dashboard/overview/kpi-table-utils.ts` to shared dense contract styles and unified date helper while preserving existing sorting and scroll behavior.
- Removed unused KPI sort field `trials` from `SortField` to align with actual table columns and avoid dead sort path.

## [v2.1.10] - 2026-04-27

### Added: Shared `TableRowActions` component and standardised table action buttons

- Added `src/components/ui/table-row-actions.tsx` — reusable dropdown action component for table rows.
- Replaced inline action buttons with `TableRowActions` across ProductBacklog, TaskTableView, DailySync, ReportTableView, LeadLogs, UserManagement, and FbConfig.
- LeadLogs bulk delete: Delete button is now rendered only when the current user has `admin` or `leader_sale` role, eliminating runtime permission alerts.
- UserManagement: Delete button is hidden for the currently logged-in user to prevent self-deletion.

## [v2.1.9] - 2026-04-26

### Added: CRM lead sync + Call Performance dashboard

- Added backend route `GET /api/dashboard/call-performance` with authentication and validated query params (`from`, `to`, optional `aeId`).
- Added server-side call performance aggregation from `crm_call_history` with 4 sections: `perAe`, `heatmap`, `conversion`, `trend`.
- Added 5-minute in-memory cache for call performance payloads with max key cap to avoid unbounded growth.
- Added timezone-safe VN date bucketing for heatmap/trend and production-safe error response handling for dashboard call API.
- Added frontend Call Performance section under Overview Dashboard with:
  - per-AE performance table,
  - 7x24 heatmap,
  - conversion table,
  - trend chart (dual Y-axis for count vs avg duration).
- Integrated new React Query hook `useCallPerformance` and response types for call performance API.

### Updated: Lead Tracker phase-04 UX hardening

- Deprecated manual lead entry entry points in Lead Tracker logs UI and shifted control toward CRM sync flow.
- Added CRM sync controls and last-sync indicator in lead logs, plus source badge for CRM/manual provenance.
- Locked CRM-owned lead fields in edit modal to preserve CRM as source-of-truth.
- Restricted bulk edit to SMIT-only fields (`notes`, `leadType`, `unqualifiedType`).
