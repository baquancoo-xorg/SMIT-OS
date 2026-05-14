# Project Changelog

Tracks significant changes — features, removals, migrations, infra updates.

## 2026-05-15 — v5 UI polish and tab validation

- Standardized page-level TabPill status docs for the primary glow rollout.
- Refined header icon buttons with clearer theme-toggle labels and notification unread screen-reader text.
- Softened primary Button hover shadow to the shared `shadow-glass` token.
- Aligned Media refresh button height with compact toolbar controls.
- Validation passed: `npm run typecheck`, `npm run lint:ui-canon`, `npm run test` (125/125), `npm run build`, route smoke for `/`, `/okrs?tab=L2`, `/leads?tab=stats`, `/ads?tab=attribution`, `/settings?tab=api-keys`.

---

## 2026-05-14 — Media Tracker auto-pull rewrite

- Drop manual input. v5/MediaTracker now auto-syncs FB Fanpage posts via Graph API (cron every 6h + manual Refresh).
- New schema: SocialChannel + MediaPost (channelId FK, canonical metrics, metricsExtra JSON) + MediaSyncRun audit.
- New admin route `/integrations` for SocialChannel CRUD with encrypted token storage + expiry warnings.
- Drop tabs Owned/KOL/PR (KOL/PR not auto-pullable via API).
- Drop legacy `MediaPost.{type, cost, utmCampaign, createdById, meta}` fields.
- FB Group support dropped entirely (Graph API removed Apr 2024).
- `impressions` field replaced with `views` (Meta deprecated post_impressions Nov 2025).

---

## 2026-05-13 — UI Ref Compliance Milestone Complete

Full alignment of SMIT OS v5 UI with Playground v4 reference style across all 10 phases.

### Summary
- **Phases 01-04 (Wave 0-1):** Token baseline, core v5 primitives, table system, shell/navigation
- **Phases 05-08 (Wave 2):** Dashboard/Reports, Growth Workspace, Execution Workspace, Admin/Profile
- **Phase 09:** Validation sweep and docs update

### Key Changes
- **CTA Signature:** All primary action buttons converted from solid orange (`bg-primary text-on-primary`) to compliant pattern (`bg-surface-container border border-accent text-on-surface`)
- **Tab/Chip Active States:** Changed from solid orange fill to neutral surface lift with accent border
- **Decorative Glow:** KPI cards and glass cards now hover-gated (opacity-0 → hover:opacity)
- **Table System:** Standardized contracts with sticky headers, backdrop blur, neutral row hover
- **Sidebar Navigation:** Active item uses surface-container + accent bar instead of orange glow
- **Checkbox States:** Migrated from bg-primary to bg-surface-container with accent border

### Files Modified
- `src/index.css` — token baseline
- `src/components/v5/ui/*` — core primitives (tab-pill, date-range-picker, kpi-card, glass-card, data-table, table-contract)
- `src/components/v5/layout/*` — shell and sidebar
- `src/components/lead-tracker/*` — checkbox, filters, bulk actions
- `src/components/ads-tracker/*` — spend chart decorative blob
- `src/components/okr/*` — CTA buttons in modals
- `src/components/modals/WeeklyCheckinModal.tsx` — submit button
- `src/components/settings/*` — department toggle chips
- `src/components/ui/table-contract.ts` — legacy table contract alignment

### Validation
- `npm run build` ✓ zero errors
- All v5 routes pass acceptance checklist

---

## 2026-05-13 — UI Ref Compliance Phase 01: Token Baseline

Aligned design tokens to playground v4 canonical values.

### Token Changes
- `--radius-card`: 1.5rem → 1.25rem (universal, per playground v4)
- `--radius-modal`: 1.5rem → 1.25rem
- `--radius-input`: 1rem → 0.75rem (universal)
- `--header-h`: 3.75rem → 4rem
- `--sys-shadow-card`: cinematic → compact (0 1px 2px, 0 1px 3px)
- `--sys-shadow-elevated`: cinematic → compact (0 4px 12px, 0 2px 4px)
- Light mode shadows reduced proportionally with warm-tinted rgba

### Contract Update
- Updated `docs/ui-design-contract.md` §6 to reflect actual playground v4 values (removed incorrect dark/light radius split)

### Validation
- `npm run build` ✓ zero errors
- Code review score: 9/10

---

## 2026-05-13 — Dark Mode Ref UI Parity

Completed full dark-mode/ref-ui alignment against `docs/ref-ui-playground/`.

### Design System
- Retokenized live legacy UI surfaces away from raw `bg-white`, `border-white/20`, `border-black/5`, and undefined `primary-hover` usage.
- Converted dashboard Recharts grids, ticks, tooltips, cursors, and series colors to semantic CSS variables.
- Converted product/call heatmaps from raw blue scales to brand primary/orange semantic scales with light/dark readability.
- Replaced raw media/OKR/lead status colors with semantic `primary`, `secondary`, `info`, `success`, `warning`, and `error` tokens.

### Quality
- Fixed review findings for undefined `primary-fixed` classes and `bg-on-surface` misuse in bulk actions.
- Bound primary/error/success filled surfaces to matching `text-on-*` tokens, including OKR department icons via `onIcon`.
- Validation gates passed: `npm run typecheck`, `npm run lint`, `npm test` (86/86), `npm run build`.
- Local HTTP smoke passed for `/` and `/v5/dashboard`.
- Manual browser visual QA remains the release follow-up because no browser automation tooling is present in the project.

---

## 2026-05-13 — SMIT OS v5 Command Center UI/UX Rebuild

Full dark-first dual-theme rebuild from page collection to Executive Command Center IA.

### UX / IA
- New workspace model: Command Center, Growth, Execution, Intelligence, Admin.
- Root route keeps `/dashboard`; legacy tracker slugs redirect to canonical Growth routes.
- V5Shell introduced with grouped navigation, header, mobile drawer, theme and density controls.

### Design System
- Added v5 token foundation, `ThemeProvider`, `DensityProvider`, `cn()` utility, and v5 UI primitives.
- Dark-first warm palette with light-mode parity and command-center CTA DNA.
- Settings Appearance tab now controls `data-theme` and `data-density` live.

### Workspaces
- Dashboard rebuilt as flagship v5 Command Center using real overview data.
- Growth pages added for Leads, Ads, and Media while preserving real tracker hooks.
- Execution routes added for OKRs, Daily Sync, and Weekly Check-in with real API flows and session-safe fetch handling.
- Reports page added with real overview hook data, stateful date range, and browser print export.
- Profile now reads authenticated user data instead of hardcoded demo values.

### Validation
- Added Node test coverage for `cn()` and v5 token contracts.
- Validation gates passed: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.
- Documentation refreshed: codebase summary, code standards, system architecture, PDR, roadmap.

---

## 2026-05-12 — Cleanup (Medium)

Branch `chore/cleanup-medium` (4 commits + housekeeping). Scope verified via brainstorm + 2 researchers + validation interview.

### Frontend
- `chore(deps)`: drop Storybook scaffold (.storybook/, storybook-static/, 26 *.stories.tsx) + 11 devDeps (`@storybook/*`, `storybook`, `@chromatic-com/storybook`, `vitest`, `playwright`, `@vitest/browser-playwright`, `@vitest/coverage-v8`).
- `chore(deps)`: drop 4 unused frontend runtime deps: `@xyflow/react`, `@dnd-kit/{core,sortable,utilities}`.
- `chore(config)`: strip Storybook/Vitest dead refs from `vite.config.ts`.
- `npm install`: 184 packages pruned, zero peer-dep errors.

### Sheets Export Domain (removed)
- `feat(cleanup)`: delete Google Sheets export domain end-to-end.
- Backend deleted: `server/routes/sheets-export.routes.ts`, `server/routes/google-oauth.routes.ts`, `server/services/google-oauth.service.ts`, `server/services/sheets-export.service.ts` + `extractors/` subdir, `server/jobs/sheets-export-scheduler.ts`, `server/lib/google-sheets-client.ts`.
- UI deleted: `src/components/settings/sheets-export-tab.tsx`; Settings tab + `'export'` union + state hooks removed from `src/pages/Settings.tsx`.
- Server.ts pruned: 4 imports + 4 mounts/inits removed.
- Runtime deps removed: `googleapis`, `google-auth-library`.
- `.env.example`: removed `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.

### Database
- `refactor(db)`: drop Prisma models `GoogleIntegration` + `SheetsExportRun` (2 DROP TABLE applied via `prisma db push --accept-data-loss`).
- `chore(prisma)`: remove stale `prisma/migrations/manual/` artifact (project uses `db push` workflow).
- Pre-migration backup: `backups/pre-sheets-drop-20260512-0126.sql` (9.4MB, gitignored).
- Models retained (researcher-verified active use): `EtlErrorLog` (fb-sync + ads-sync), `LeadAuditLog`, `Notification`, all FB/Ads/Media/Lead-sync models.

### Repo Hygiene
- `git mv DATABASE.md` → `docs/DATABASE.md`; `README.md` link updated.
- 4 one-time scripts archived to `scripts/archive/`: `backfill-crm-leads.ts`, `backfill-lead-source.ts`, `seed-exchange-rate.ts`, `seed-okrs.ts`. `package.json` script paths updated.
- `posthog-ui-regression-monitor.ts` kept in `scripts/` per user decision.
- `setup-db.ts` kept (active).
- `.gitignore`: added `backups/` top-level (prevents DB dump commit).
- Local artifacts removed: `logs/`, `dist/`.
- Stale v3 design docs + `plans/260511-2147-ui-redesign-v3/` artifacts dropped (35 files, 3636 lines) — user-confirmed intentional removal.

### Auth / Production
- Auth flow unchanged: JWT username/password + TOTP (2FA opt-in). Login NEVER used Google OAuth — researcher-verified before drop.
- Downtime: daemon `com.smitos.dev` stopped for migration window, restarted after smoke pass.
- Cloudflare tunnel: stayed up; external smoke `https://qdashboard.smitbox.com/` → HTTP 200.
- `/api/sheets-export/runs` → 401 (auth wall, no route handler — correct removal evidence).

### Plan / Reports
- Brainstorm summary: `plans/reports/brainstorm-260512-0052-codebase-cleanup-medium.md`.
- Plan: `plans/260512-0052-cleanup-medium/` (plan.md + 3 phases + 2 researcher reports + validation summary).

---

## Pre-2026-05-12

Earlier history pruned with `cd92a15` (stale v3 design docs + ui-redesign-v3 plan). See git log on `main` for the canonical history.
