# Project Changelog

Tracks significant changes — features, removals, migrations, infra updates.

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
