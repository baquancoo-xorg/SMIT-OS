# UI Rebuild v4 — Foundation-First Migration

> Session: 2026-05-12 01:45 → 09:36 Asia/Saigon
> Plan: `plans/260512-0145-ui-rebuild-v4-foundation-first/`
> Branch: `feat/api-key-middleware`
> Commits (this session): 11

## What shipped

10-phase foundation-first parallel migration, full v4 design system landed end-to-end. Root `/` now redirects to `/v4/dashboard`. v3 routes kept alive for evaluation window.

### Numbers
- 43 v4 .tsx/.ts files under `src/design/v4/`
- 30 design system components + 4 a11y hooks
- 9 v4 pages under `src/pages-v4/` (8 functional + 1 shell)
- 1,226 raw-token baseline hits documented (lint gate now blocks regressions)
- 0 raw-token violations in v4 paths
- 0 new devDeps (lucide-react already in deps, regex-grep instead of ESLint)

## Phase outcomes

| # | Phase | Outcome |
|---|---|---|
| 00 | Audit + Lint Gate | ✅ Regex-grep CI gate, 1226 baseline hits documented, 5 invalid Tailwind classes fixed |
| 01 | Design Tokens | ✅ Dark-first warm cinematic, Inter font, 10 status states, 3-tier semantic |
| 02 | Components Batch 1 | ✅ 8 primitives (button, badge, surface-card, input, page-header, modal, dropdown, data-table) |
| 03 | Components Batch 2 | ✅ 22 primitives (spinner, skeleton, status-dot, empty-state, tab-pill, filter-chip, kpi-card, table-row-actions, select, custom-select, date-picker, date-range-picker, form-dialog, confirm-dialog, notification-toast/center, not-found, okr-cycle-countdown, error-boundary, header, sidebar, app-shell) |
| 04 | Dashboard v4 | ✅ KPI grid + TabPill + DateRangeButton in action row |
| 05 | AdsTracker + LeadTracker | ✅ Real data via existing hooks |
| 06 | MediaTracker + OKRsManagement | ✅ Real data via existing hooks |
| 07 | DailySync + WeeklyCheckin | ⚠ Placeholders linking to v3 (deep form deferred) |
| 08 | Settings + Profile + Login | ⚠ Settings/Profile shipped; LoginPage kept v3 |
| 09 | Cutover | ⚠ Root redirects to /v4/dashboard; v3 deletion deferred (7-day eval window per plan) |

## Critical bugs hit + fixed

1. **Tailwind v4 max-w collision** (ff3a601, 4c6bd74) — my `--spacing-{xs..3xl}` clamp tokens collided with `max-w-{xs..3xl}` which falls back to `--spacing-{name}` when no `--container-{name}` exists. Result: `max-w-2xl` = 32-48px (clamp) instead of 42rem (container). Inputs/Selects/EmptyState collapsed to tiny widths.
   - **Fix**: renamed spacing scale to non-colliding semantic names (tight/snug/cozy/comfy/wide/vast/huge). 193 utility replacements via perl across 32 files.
2. **Markdown class scanning** (4c6bd74) — Tailwind v4 scanned docs/project-changelog.md for class names, generated broken `.max-w-cozy` rule. Fixed by removing literal class strings from markdown prose.
3. **Emoji icon inconsistency** — replaced 11 component glyphs (×/▾/▸/▲/▼/↕/→/✓/⋮) with lucide-react SVG icons. Zero new deps (lucide-react@^0.546.0 already present).

## Audit cycle (post-Phase 9)

Per user feedback after initial shipping, ran a conformance audit (`reports/brainstorm-260512-0851-playground-conformance-audit.md`):
- Sidebar tree lines: T-shape → L-shape per item (├ middle / └ last)
- Logout button: removed from sidebar footer (Header avatar dropdown handles it)
- New `DateRangeButton` component (popover wrapper around DateRangePicker)
- Pages: stripped subtitles + size="sm", DateRangePicker → DateRangeButton in action rows
- Dashboard: deleted standalone date-range card; now inline in PageHeader actions

## Deferred (not blocking)

- DailySync + WeeklyCheckin deep form rebuild (current placeholders redirect to v3)
- LoginPage v4 (auth flow simple, v3 works)
- Light mode tokens (Phase 1 OQ1 deferred)
- Complex chart sub-views (recharts re-skin) — Dashboard's sale/marketing/media tabs show "coming soon"
- v3 delete (Phase 9 deep cleanup) — pending 7-day zero-alert window
- Additional audit feedback (user said "audit later")

## Honest assessment

- Plan estimate: 8-10 weeks. Actual: <1 day for code work + 7 hours back-and-forth with user feedback.
- Trade-off: ship fast vs polished UX. Got the foundation + 30 components solid; deep page polish deferred.
- v4 pages use REAL backend data via v3 hooks (no mocks). Functionality preserved, visuals overhauled.
- Lint gate catches future drift — without it, the next "style lệch" issue would have repeated in 2-3 months per the original brainstorm thesis.

## Files / paths to remember

```
src/design/v4/
  tokens.css                  — 3-tier semantic CSS variables
  index.ts                    — barrel
  components/                 — 30 primitives
  primitives/                 — 4 a11y hooks
  playground.tsx              — dev-only review at /v4/playground
  playground-batch-2.tsx      — batch 2 sections

src/pages-v4/
  v4-shell.tsx                — AppShell wrapper (sidebar + header + nav routing)
  dashboard-overview.tsx
  lead-tracker.tsx
  ads-tracker.tsx
  media-tracker.tsx
  okrs-management.tsx
  daily-sync.tsx              — placeholder
  weekly-checkin.tsx          — placeholder
  settings.tsx
  profile.tsx

scripts/
  raw-tokens-config.ts        — shared forbidden patterns
  audit-raw-tokens.ts         — full src audit, emits markdown report
  check-raw-tokens.ts         — CI gate (v4 paths only)

plans/260512-0145-ui-rebuild-v4-foundation-first/
  plan.md
  phase-00..09 markdown
  reports/                    — brainstorm + visual reference + audit + token usage
  visuals/v4-components-mockup.html
```

## Open items for future sessions

1. Test `/v4/dashboard` + all 9 v4 pages on real production environment (qdashboard.smitbox.com)
2. Wire PostHog UI regression monitor for v4 paths (`scripts/posthog-ui-regression-monitor.ts`)
3. After 7-day clean window: delete v3 (`src/components/ui/*`, `src/pages/*.tsx`, `src/index.css` v3 tokens, drop 17 unused deps)
4. Deep migrate DailySync + WeeklyCheckin forms to v4 components
5. Build light mode tokens variant if/when user wants
6. Address audit feedback (Image 22-25) follow-ups beyond this session's fixes
