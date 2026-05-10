# System Architecture

> Last updated: 2026-05-10

## Overview

SMIT-OS is a full-stack monorepo. The frontend (React SPA) and backend (Express API) share the same repo and are served from the same Node process in development.

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, TailwindCSS v4, Tanstack Query v5 |
| Backend | Express 5, TypeScript, Prisma ORM |
| Database | PostgreSQL 15 (Docker) |
| Auth | HTTP-only cookie JWT (4h expiry, sliding session) |
| Build | Vite, tsx watch (dev) |

## Directory Structure

```
smit-os/
├── server/
│   ├── routes/         # Express route handlers
│   ├── services/       # Business logic
│   ├── middleware/     # Auth, RBAC, validation
│   ├── schemas/        # Zod validation schemas
│   ├── lib/            # Shared utilities (crypto, db, date, etc.)
│   ├── jobs/           # Background jobs
│   ├── controllers/    # (thin controllers where used)
│   └── types/          # Shared TypeScript types
├── src/                # React frontend
├── prisma/
│   ├── schema.prisma   # Primary schema (smitos_db)
│   └── crm-schema.prisma
├── server.ts           # Express app entry point
└── package.json
```

## Authentication

### JWT Cookie Strategy

- Token stored as `jwt` HTTP-only cookie (`sameSite: strict`, `secure` in production)
- Standard session token expires in **4 hours**
- **Sliding session**: when remaining time < 1h on any authenticated request, token auto-refreshes to full 4h (user active continuously = never logout)
- User idle > 4h = cookie expires = logout (security)
- Token payload: `{ userId, role, isAdmin, purpose? }`
- On every authenticated request, `auth.middleware.ts` fetches fresh user data from DB (role changes take effect immediately)

### Two-Factor Authentication (TOTP)

Opt-in per user. Login uses a two-step flow when 2FA is enabled.

**Login flow:**

```
POST /api/auth/login
  ├─ 2FA disabled → issue full JWT (4h) → done
  └─ 2FA enabled  → issue totp-pending JWT (5 min)
                        ↓
               POST /api/auth/login/totp
                 ├─ valid TOTP code   → issue full JWT (4h)
                 └─ valid backup code → consume code, issue full JWT (4h)
```

The `totp-pending` JWT has `purpose: 'totp-pending'` in its payload. `requireAuth` middleware rejects these tokens; they are only accepted by `POST /api/auth/login/totp`.

**2FA management endpoints** (all require full session JWT):

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/2fa/setup` | Generate encrypted secret + `otpauthUrl` for QR scan |
| `POST` | `/api/auth/2fa/enable` | Verify TOTP code, activate 2FA, return 8 backup codes |
| `POST` | `/api/auth/2fa/disable` | Deactivate 2FA (requires password) |
| `POST` | `/api/auth/2fa/admin-reset/:userId` | Admin: reset 2FA for any user |

**Storage:**

- `totpSecret` — AES-256-GCM encrypted (via `server/lib/crypto.ts`)
- `totpBackupCodes` — 8 codes, bcrypt-hashed, consumed on use
- Library: `otpauth` (RFC 6238)

**Rate limiting** (`server.ts`):

- `POST /api/auth/login` and `POST /api/auth/login/totp` share the same limiter
- Configured via `express-rate-limit` v8

### Authorization

- `auth.middleware.ts` — validates JWT, attaches `req.user`
- `admin-auth.middleware.ts` — requires `isAdmin === true`
- `rbac.middleware.ts` — role-based access control
- `ownership.middleware.ts` — resource ownership checks

**Role model (since 2026-05-10, plan `260510-0318-role-simplification`):** two roles only — **Admin** and **Member**. The legacy `Leader` role was removed; existing Leader users were demoted to Member. RBAC presets: `RBAC.adminOnly`, `RBAC.authenticated`, `RBAC.selfOrAdmin`. Access pattern across resources is **read-shared, write-own**: list/detail GETs are open to every authenticated user; PUT/PATCH/DELETE require ownership (`resource.userId === req.user.userId` for reports; `resource.ownerId === req.user.userId` for KRs; `lead.ae === req.user.fullName` for leads) **or** `isAdmin`. Approve actions on daily/weekly reports + Objective L1 mutations + KR create/delete + CRM sync are admin-only.

## Data Layer

- Prisma ORM with PostgreSQL 15
- Primary DB: `smitos_db` (port 5435)
- Secondary schema: `prisma/crm-schema.prisma` (CRM data via `server/lib/crm-db.ts`)
- No raw SQL in application code; all queries via Prisma client

### Active Models (as of 2026-05-10)

Lead, LeadAuditLog, OkrCycle, FbAdAccountConfig, RawAdsFacebook, ExchangeRateSetting, EtlErrorLog, GoogleIntegration, SheetsExportRun, LeadSyncRun, LeadStatusMapping, User, Notification, Objective, KeyResult, DailyReport, WeeklyReport, **AdCampaign, AdSpendRecord, MediaPost** (Phase 2 acquisition).

**Dropped models (2026-05-10 slim-down):** WorkItem, WorkItemKrLink, WorkItemDependency, Sprint.

### Acquisition Tracking (2026-05-10, plan `260510-0237-acquisition-trackers`)

**Complete MVP shipped** across 6 phases: Sidebar restructure → Schema → Ads Tracker (Meta) + Media Tracker (manual) → Dashboard integration (Marketing/Media/Overview-funnel tabs) → CSV export + RBAC.

Two-layer Meta-ads pipeline keeps existing raw layer untouched and adds a normalized layer for UI/aggregate queries:

| Layer | Models | Source |
|---|---|---|
| Raw (existing) | `RawAdsFacebook` | Meta Graph API insights, ad-level granularity |
| Normalized (Phase 3) | `AdCampaign`, `AdSpendRecord` | Daily sync via `ads-sync.cron.ts` (02:00 UTC), cached in `AdCampaign` + `AdSpendRecord` |
| Owned/earned media (Phase 4) | `MediaPost` | Manual entry for all 3 platforms (FB/IG/YT/Blog/PR); auto-sync deferred |

**Services (Phase 3-5):**
- `ads-sync.service.ts` — Meta campaign ETL, upserts `AdCampaign` + `AdSpendRecord`
- `meta-ads-normalize.ts` — Raw → normalized transformer
- `attribution.service.ts` — Join `Lead.source` ↔ `AdCampaign.utmCampaign` (case-insensitive trim), calculates CPL/ROAS
- `journey-funnel.service.ts` — 3-stage funnel aggregator (Pre/In/Post-product), 5-min cache + in-flight de-dup
- `csv-export.ts` — Shared CSV utility for Ads + Media export

**Enums:** `AdPlatform` (META only), `MediaPlatform` (FACEBOOK/INSTAGRAM/YOUTUBE/BLOG/PR/OTHER), `MediaPostType` (ORGANIC/KOL/KOC/PR).

**Attribution key:** `AdCampaign.utmCampaign` (and `MediaPost.utmCampaign`) match `Lead.source` via case-insensitive trim.

**RBAC:** `MediaPost.createdById` enables read-shared/write-own pattern (Member edits own records, Admin edits any) per `260510-0318-role-simplification`.

**Performance:** Sync mutex (409 if in-flight prevents double-click), all currency normalized to VND, N+1 queries eliminated via batch fetches.

**Seed:** `npm run db:seed:acquisition` populates 1 Meta campaign + 7 daily spend records + 5 media posts (2 ORGANIC, 1 KOL, 1 KOC, 1 PR).

**Deferred to follow-up:** Facebook/Instagram/YouTube auto-sync (OAuth not available), Sankey drill-down, weekly digest email (SMTP unverified), audit log for token rotate, CRM retention deep-dive.

### Prisma Client Singleton

All application code imports the shared singleton from `server/lib/prisma.ts`:

```ts
import { prisma } from '../lib/prisma';
```

`server/lib/crm-db.ts` is intentionally a separate client pointing at the CRM database — do not consolidate. Every other server file must use the singleton; creating additional `new PrismaClient()` instances is a bug.

## Server Security

Configured in `server.ts` (hardened 2026-04-28):

| Control | Configuration |
|---------|---------------|
| JSON body limit | `express.json({ limit: '2mb' })` — returns 413 on oversized payloads |
| CSP | Helmet `contentSecurityPolicy` in **report-only** mode — adds `Content-Security-Policy-Report-Only` header without blocking assets |
| CORS blank-origin | Allowed only when `NODE_ENV !== 'production'`; production requires origin to match `ALLOWED_ORIGINS` |
| General API rate limit | 200 requests/minute on `/api/` (on top of existing auth-route limiter) |
| Admin route auth | `/api/admin/*` is gated by `requireAdmin` middleware — returns 403 for non-admin requests |

## Product Dashboard (Phase 2 — 2026-05-08)

5-section scroll-down layout with sticky sub-nav (Executive · Funnel · Cohort · Channel · Operational). Replaces the Phase 1 KPI-only layout.

| Layer | Files |
|---|---|
| Routes | `server/routes/dashboard-product.routes.ts` — 9 GET endpoints + 1 POST refresh |
| Services | `server/services/posthog/product-{metrics,features,trends,heatmap,time-to-value,cohort,channel,operational,stuck}.service.ts` |
| Schemas | `server/schemas/dashboard-product.schema.ts` — Zod single source of truth |
| Cache | `server/services/posthog/posthog-cache.ts` — LRU TTL 5min default |
| FE hooks | `src/hooks/use-product-dashboard.ts` — React Query staleTime 5min |
| FE components | `src/components/dashboard/product/*.tsx` — 16 files |

**Pre-PQL Rate** = `firstSyncCount / totalSignups × 100` is the Master Plan PLG Gate metric #1, surfaced as a KPI card with badge.

**Channel attribution** uses CRM `crm_subscribers_utm` as primary source (8+ clean utm_source values after normalization in `normalizeSource()`); PostHog `$referring_domain` is secondary cross-validation only (94% noise per audit).

**Cohort retention** runs a HogQL CTE bucketing by `toStartOfWeek(min(timestamp))`, with a 10s timeout wrapper that falls back to empty cohorts + user-facing message. Replaces the legacy `VITE_POSTHOG_RETENTION_INSIGHT_URL` iframe.

**Stuck list** is TRACKING-ONLY (Master Plan §1.4 monitoring). Privacy contract: response items contain only `businessId`, `businessName`, `signupAt`, `daysStuck` — never email/phone. Threshold = 7 days hardcoded as `STUCK_THRESHOLD_DAYS`. Verified via `product-stuck.service.test.ts`.

**Security:** `POSTHOG_PERSONAL_API_KEY` lives only in `server/services/posthog/posthog-client.ts`; verified absent from `src/` and from `dist/` after `npm run build`.

## Backend Performance

### Dashboard Overview Cache

`server/services/dashboard/overview-ad-spend.ts` wraps expensive CRM aggregation queries with an in-process TTL cache (60 s). Cache key is the query signature; cache is a module-level `Map` — no Redis dependency. Second request within TTL resolves in <50 ms.

### Lead Sync Batch Query

`server/services/lead-sync/crm-lead-sync.service.ts` pre-fetches all existing leads for a sync batch with a single `prisma.lead.findMany({ where: { crmSubscriberId: { in: batchIds } } })` before the processing loop, then uses an in-memory `Map` for O(1) lookups. This replaces the previous O(n) per-lead `findUnique` pattern.

## Notification System & Alerts

**Active notification types (as of v2.3.1):**

| Type | Trigger | Recipients | Service Method |
|------|---------|-----------|-----------------|
| `report_approved` | Weekly report approved by an admin | Report owner | (built-in) |
| `daily_new` | Daily report submitted | Admins | `notifyDailyNew()` |
| `daily_late` | Daily report due but not submitted (10:30 ICT) | Submitter + admins | `notifyDailyLate()` |
| `weekly_late` | Weekly report due but not submitted (09:00 ICT Monday) | Submitter + admins | `notifyWeeklyLate()` |

**Deduplication:** `Notification` model uses `@@unique([userId, type, entityType, entityId])` constraint + atomic `createMany({skipDuplicates:true})` to prevent duplicate notifications in a single check run.

**Alert crons** (all timezone: `Asia/Ho_Chi_Minh`, configured in `server/jobs/alert-scheduler.ts`):

| Cron | Schedule | Handler | Purpose |
|------|----------|---------|---------|
| `30 10 * * 1-5` | Mon–Fri 10:30 ICT | `checkDailyLate()` | Find members with unpublished daily reports, notify admins + the late member |
| `0 9 * * 1` | Monday 09:00 ICT | `checkWeeklyLate()` | Find members with unpublished weekly reports, notify admins + the late member |

**Daily report flow:** POST `/api/daily-reports` fans out `daily_new` notifications to admins (excluding submitter). Notification service failures are caught and logged; they never block the report creation response.

**Dropped (v2.3.0–v2.3.1):** OKR risk monitoring (`checkOKRRisks` cron + handler), sheets-export failure alerts (`notifyFailure`), deadline + sprint watchers (`notifyDeadlineWarning`, `notifySprintEnding`).

## API Conventions

- All routes prefixed `/api/`
- Request bodies validated with Zod schemas (`server/schemas/`)
- Error responses: `{ error: string }`
- Auth errors: HTTP 401; authorization errors: HTTP 403

## Frontend UI Architecture

### Design Token Foundation (Phase 2 — 2026-05-10)

CSS custom properties now centralize all design decisions: semantic colors (8 scales), department colors (BOD refreshed), spacing, radius, typography, shadow, motion, z-index. Source of truth: `src/index.css` + `docs/design-tokens-spec.md`. Usage guidelines: `docs/design-system-foundation.md`.

### Route Map (as of 2026-05-10)

Final routes: `/`, `/dashboard` (landing), `/okrs`, `/daily-sync`, `/checkin`, `/lead-tracker`, `/settings`, `/profile`. Wildcard routes redirect to `/dashboard` (changed from `/ads-overview` in v2.3.1).

**Dropped pages (2026-05-10 slim-down):** PMDashboard, TechBoard, ProductBacklog, MarketingBoard, MediaBoard, SaleBoard, SprintBoard, EpicBoard, EpicGraph.

### Shared Table UI Contract (added 2026-04-27)

A shared table design contract now centralizes table presentation tokens for two variants:

- `standard` — operational/business tables
- `dense` — analytics/high-column-density tables

Core primitives:

- `src/components/ui/table-contract.ts` — variant class contract map (shell, header, body, row, cell, actions, empty state)
- `src/components/ui/table-shell.tsx` — shell wrapper component applying contract classes per variant
- `src/components/ui/table-date-format.ts` — unified helpers for date-only and date-time rendering

Action controls:

- `src/components/ui/table-row-actions.tsx` supports variant-aware behavior (including dense compact treatment)

Rollout status (as of 2026-05-10):

- **Phase 01 — Foundation + pilots:** `src/components/dashboard/overview/KpiTable.tsx` (dense) — TaskTableView removed with board components
- **Phase 02 — Standard rollout:** operational module tables and modal-embedded tables fully migrated, including `src/components/modals/WeeklyCheckinModal.tsx` and `src/components/modals/ReportDetailDialog.tsx`; shared `formatTableDate` helper adopted across all standard tables
- **Phase 03 — Dense rollout:** call-performance analytics tables migrated — `src/components/dashboard/call-performance/call-performance-ae-table.tsx` and `src/components/dashboard/call-performance/call-performance-conversion.tsx` both use `variant="dense"` with `getTableContract('dense')` tokens

**Dropped UI components (2026-05-10):** src/components/sprint/, src/components/work-item/, TaskCard, TaskModal, TaskTableView, EpicCard, board task components. ReportTableView retained.

This architecture keeps table business logic in feature modules while consolidating visual shell behavior and formatting contracts in reusable UI primitives.

### UI System Redesign — Phases 1–8 completed (2026-05-10)

Full 8-phase redesign shipped trong 1 ngày (JIT pivot — see plan `260510-0358-ui-system-redesign`).

**Source of truth (post Phase 8):**
- **Design tokens:** [`docs/design-tokens-spec.md`](./design-tokens-spec.md) — 70+ semantic tokens (color/spacing/typography/shadow/motion/z-index)
- **Usage rules:** [`docs/design-system-foundation.md`](./design-system-foundation.md) — a11y, motion, breakpoints, patterns
- **Component library:** `src/components/ui/v2/` — 25 components (atoms/molecules/organisms/layout) + Storybook
- **DEPRECATED:** [`docs/ui-style-guide.md`](./ui-style-guide.md) — superseded by design-tokens-spec + design-system-foundation

**Phase 8 migration (2026-05-10):**
- v2 promoted to default cho 10 pages (App.tsx `useIsV2` → `useIsV1`)
- v1 source kept cho rollback (`?v=1`) + because v2 reuse nhiều v1 sub-components
- v1 hard-delete deferred until sub-component migration follow-up phase

**v2 page status:**
| Page | Status | Phase |
|---|---|---|
| LoginPage | full v2 | 5 |
| Profile | full v2 | 5 |
| Settings | full v2 (5 sub-tabs migrated) | 5 |
| DailySync | full v2 | 6 |
| WeeklyCheckin | shell + reuse v1 multi-step modal | 6 |
| LeadTracker | shell + reuse v1 sub-components | 6 |
| MediaTracker | shell + reuse v1 sub-components | 6 |
| AdsTracker | shell + reuse v1 sub-components | 6 |
| DashboardOverview | shell + reuse v1 5 tab content | 7 |
| OKRsManagement | shell + reuse v1 accordion (13 features parity) | 7 |

**Audit findings recap (Phase 1):** 5.5% design token adoption, 39 card variants, 91 `rounded-2xl` violations, form abstraction missing — all addressed by Phase 4 component library + Phase 8 default flip.
