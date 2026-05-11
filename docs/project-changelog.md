# Project Changelog

Tracks significant changes — features, removals, migrations, infra updates.

## 2026-05-12 — UI Rebuild v4 Phase 3 (Batch 2 — 22 primitives)

Built remaining 22 v4 primitives. Full v4 component library now at 30 components.

### Created (`src/design/v4/components/`)
- Feedback: `spinner`, `skeleton`, `status-dot`, `empty-state`, `error-boundary`
- Controls: `tab-pill`, `filter-chip`, `kpi-card`, `table-row-actions`
- Forms: `select` (native), `custom-select` (rich), `date-picker`, `date-range-picker`
- Dialogs: `form-dialog`, `confirm-dialog`
- Notifications: `notification-toast`, `notification-center` (with `NotificationProvider` + `useNotifications` hook)
- Misc: `not-found-page`, `okr-cycle-countdown`
- Layout: `header`, `sidebar` (collapsible sections, active orange-accent bar), `app-shell`

### Created (`src/design/v4/`)
- `playground-batch-2.tsx` — extends playground with batch 2 demos (Sidebar mini-mockup uses AppShell composition).
- Barrel `index.ts` — exports all 30 components + types.

### Validation
- `npm run lint` exit 0 (32 v4 files, 0 raw-token violations, tsc clean).
- `npm run build` exit 0, playground chunk 48.06 kB (gzip 12.85 — was 20.62 with 8 components).
- TS fixes: omit `title` HTMLAttribute collision in EmptyState; remove unused `@ts-expect-error` in Sidebar.

### Components total: 30 (target met)
- Batch 1 (Phase 2): 8 — button, input, badge, surface-card, modal, dropdown-menu, data-table, page-header
- Batch 2 (Phase 3): 22 — listed above

### Notes
- Date inputs use native `<input type="date">` with `[color-scheme:dark]` for dark calendar popup. No custom calendar UI built (KISS for v4 launch; can replace later if needed).
- `NotificationProvider` is global — wrap once at app root (Phase 4 AppShell will include).
- Sidebar collapses to icon-only rail when `collapsed=true`. Used by AppShell mini-mockup in playground.

---

## 2026-05-12 — UI Rebuild v4 Phase 2 (Component Primitives Batch 1)

Built 8 self-built primitives (no shadcn) + 4 a11y hooks + dev playground. All under [data-ui="v4"] scope.

### Hooks (`src/design/v4/primitives/`)
- `use-escape-key.ts` — Escape close handler
- `use-click-outside.ts` — pointerdown outside ref
- `use-focus-trap.ts` — Tab loop within container, restores prior focus
- `use-keyboard-list-nav.ts` — ArrowUp/Down/Home/End/Enter list navigation

### Components (`src/design/v4/components/`)
- `button.tsx` — primary (signature DNA: gradient + orange beam via ::before), secondary, ghost, destructive. sm/md/lg sizes. `splitLabel` for compound CTAs.
- `badge.tsx` — 10 task states + 4 feedback + neutral. Glassmorphic pill with optional glow halo.
- `surface-card.tsx` — replaces v3 glass-card. flat/raised/elevated, card/callout radius, `warm` variant.
- `input.tsx` — label + helper + error slots, leftIcon/rightIcon, `pill` variant for search.
- `page-header.tsx` — title + subtitle + breadcrumb + action slot.
- `modal.tsx` — portal + focus trap + scroll lock + escape + overlay click. sm/md/lg/full sizes.
- `dropdown-menu.tsx` — anchored popover with keyboard nav. ArrowUp/Down/Enter/Space/Escape.
- `data-table.tsx` — sortable headers (asc/desc/none), empty/loading states, row click, sticky header.

### Token rename for clean Tailwind utility names
- `--color-bg-*` → `--color-surface-*` (utilities: `bg-surface`, `bg-surface-elevated`, etc.)
- `--color-text-*` → `--color-fg-*` (utilities: `text-fg`, `text-fg-muted`)
- `--color-border-*` → `--color-outline-*` (utilities: `border-outline`, `border-outline-subtle`)
- Tier 1 raw scales moved OUT of @theme into :root (prevents `bg-brand-500` utility bypass of semantic layer).
- `--glow-accent-*` → `--shadow-glow-*` (utilities: `shadow-glow-sm/md/lg`).

### Dev preview
- `src/design/v4/playground.tsx` — renders all 8 components with examples. Bypasses auth + AppLayout via `/v4/*` top-level route.
- `src/App.tsx` — adds path-prefix bypass: `location.pathname.startsWith('/v4/')` → renders v4 routes only, no auth.

### Validation
- `npm run lint` exit 0 (9 v4 files scanned, 0 raw-token violations; tsc clean).
- `npm run build` exit 0, playground chunk 20.62 kB (gzip 6.53).
- File sizes: button 113, badge 95, surface-card 83, input 117, page-header 92, modal 144, dropdown-menu 121, data-table 158 lines — all <200 per development-rules.

### Access
- Browse `/v4/playground` (auth bypassed) for visual review before Phase 03 batch 2.

---

## 2026-05-12 — UI Rebuild v4 Phase 1 (Design Tokens v4)

User decisions (locked):
- Direction: dark-first warm cinematic B2B. Anchored on `#FF6D29` (orange) + `#453027` (warm brown) + `#161316` (base).
- Font: Inter (free Google Fonts) — Neue Montreal alternative.
- Dark mode: primary; light mode tokens deferred to Phase 8 under `[data-theme="light"]`.
- Status taxonomy: 10 task states (in-progress, to-do, in-review, design-review, rework, done, not-started, blocked, on-hold, archived) + 4 feedback (success/warning/error/info) retained for parity.

### Created
- `src/design/v4/tokens.css` — 3-tier CSS variables (primitive → semantic → component). Activates under `[data-ui="v4"]` selector. v3 untouched.
- `src/design/v4/lib/cn.ts` — zero-dep className combiner.
- `src/design/v4/index.ts` — barrel export.
- `src/design/v4/README.md` — usage guide + DO/DON'T + status taxonomy + signature glow utility.
- `plans/.../reports/01-visual-reference-analysis.md` — visual reference brief from 4 user-provided images.

### Validation
- Temp-imported `tokens.css` into `src/main.tsx`, ran `npm run build` → exit 0, CSS 168.24 kB (gzip 28.07 kB). Revert applied.
- `npm run lint` exit 0 (token gate + tsc clean).

### Resolved Open Questions
- OQ1 (dark mode) → dark-primary, light follow Phase 8.
- New OQ-A (font licensing) → Inter (free).
- New OQ-C (status taxonomy) → all 10 states.

---

## 2026-05-12 — UI Rebuild v4 Phase 0 (Audit + Lint Gate)

Branch `feat/api-key-middleware`. Foundation-first parallel migration kickoff per brainstorm `plans/reports/brainstorm-260512-0145-ui-rebuild-v4-foundation-first.md`.

### Frontend Lint Gate (no new deps)
- `feat(scripts)`: add `scripts/raw-tokens-config.ts` — shared regex patterns + suggestion text for raw-token detection.
- `feat(scripts)`: add `scripts/audit-raw-tokens.ts` — informational scanner, emits markdown report grouped by severity.
- `feat(scripts)`: add `scripts/check-raw-tokens.ts` — CI/lint gate, scoped to `src/design/v4/**` + `src/pages-v4/**`, exits 1 on any raw Tailwind color/radius/spacing class or invalid double-opacity suffix.
- `feat(package)`: add `lint:tokens`, `audit:tokens` scripts; `lint` now runs token check before `tsc --noEmit`.
- Q7 resolved: regex-grep CI script (NOT ESLint) — zero new devDeps, aligns with cleanup-medium spirit.

### Audit Findings (v3 baseline)
- 1226 hits across 115 .tsx files. Severity: invalid 0 (post-fix), color 49, radius 43, spacing 1134.
- Top offender: `src/components/okr/okr-accordion-cards.tsx` (213 hits).
- Report committed at `plans/260512-0145-ui-rebuild-v4-foundation-first/reports/00-audit-v3-token-usage.md`.

### v3 Typo Fixes (exception to no-v3-changes rule)
- `fix(ui)`: 5 invalid double-opacity classes — Tailwind silently dropped them. Replaced `X/30/50` → `X/30` (preserve first slash).
- Files: `src/components/modals/WeeklyCheckinModal.tsx` (3 occurrences), `src/components/okr/okr-accordion-cards.tsx` (2 occurrences).

### Gate Verification
- Planted offender in `src/design/v4/__sanity.tsx` → gate caught 6 violations (1 per category × 4 + 2 extra) and exited 1.
- Removed offender → gate exit 0. Confirmed before closing phase.

### Plan Status
- Phase 00 marked completed. Phase 01 (Design Tokens v4) blocked by user-delivered visual reference.

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
