---
title: "UI Rebuild v4 — Foundation-First Parallel Migration"
description: "Build src/design/v4 from scratch with locked token system, rebuild 10 pages via parallel routes, cutover at week 9."
status: completed
completed: 2026-05-12
follow_up_plan: 260512-0936-v4-deep-migration-and-cleanup
priority: P1
effort: 8-10 weeks
branch: feat/api-key-middleware
tags: [ui, rebuild, design-system, tokens, frontend, refactor]
created: 2026-05-12
---

## Context

Source of truth: `plans/reports/brainstorm-260512-0145-ui-rebuild-v4-foundation-first.md` (approved 2026-05-12). Tech stack: React 19 + TS + Tailwind v4 + Express 5 + Prisma 6 + react-router v7 + TanStack Query v5. No test framework, no Storybook.

## Problem

v3 tokens exist (`src/index.css` 405 lines) but code does not enforce them — mixed `bg-blue-600` + `bg-error-container`, opacity zoo `/5 /20 /30 /40 /50 /60 /80 /90 /95`, invalid class `bg-error-container/30/50`. Root cause: **process gap** (no lint gate), not design gap. Rewrite without enforcement = drift returns in 2-3 months.

## Strategy

Foundation-first parallel migration. Build `src/design/v4/` (tokens + 30 self-built primitives) behind lint gate from week 0. Mount `/v4/*` parallel routes guarded by `User.uiVersion` flag. Rebuild 10 pages one-by-one, cutover at week 9, delete v3 at week 10.

## Phases

| # | Name | Status | Effort | Depends On | Link |
|---|---|---|---|---|---|
| 00 | Audit + Lint Gate | **completed** 2026-05-12 | <1d (actual) | — | [phase-00-audit-and-lint-gate.md](./phase-00-audit-and-lint-gate.md) |
| 01 | Design Tokens v4 | **completed** 2026-05-12 | <1d (actual) | 00 + visual ref ✅ | [phase-01-design-tokens-v4.md](./phase-01-design-tokens-v4.md) |
| 02 | Components Batch 1 (8) | **completed** 2026-05-12 | <1d (actual) | 01 | [phase-02-component-primitives-batch-1.md](./phase-02-component-primitives-batch-1.md) |
| 03 | Visual Integration + Batch 2 (22) | **completed** 2026-05-12 | <1d (actual) | 02 + 5-screen approval | [phase-03-visual-integration-and-batch-2.md](./phase-03-visual-integration-and-batch-2.md) |
| 04 | Dashboard Rebuild + Feature Flag | **completed** 2026-05-12 | <1d (actual) | 03 | [phase-04-dashboard-rebuild.md](./phase-04-dashboard-rebuild.md) |
| 05 | AdsTracker + LeadTracker | **completed** 2026-05-12 | <1d (actual) | 04 | [phase-05-ads-and-lead-tracker.md](./phase-05-ads-and-lead-tracker.md) |
| 06 | MediaTracker + OKRs + DashboardOverview | **completed** 2026-05-12 | <1d (actual) | 04 | [phase-06-media-okr-overview.md](./phase-06-media-okr-overview.md) |
| 07 | DailySync + WeeklyCheckin | **completed** 2026-05-12 (deferred sub-content) | <1d (actual) | 04 | [phase-07-dailysync-weeklycheckin.md](./phase-07-dailysync-weeklycheckin.md) |
| 08 | Settings + Profile + LoginPage | **completed** 2026-05-12 (Login kept v3) | <1d (actual) | 04 | [phase-08-settings-profile-login.md](./phase-08-settings-profile-login.md) |
| 09 | Cutover + Cleanup | **partial-completed** 2026-05-12 — root redirects to /v4, v3 kept for eval; deep delete deferred to user signal | <1d (actual) | 04-08 | [phase-09-cutover-and-cleanup.md](./phase-09-cutover-and-cleanup.md) |

## Open Questions (resolve at Phase 1 design review)

1. ~~Dark mode v4: include or defer?~~ — **resolved 2026-05-12: dark-primary + light-follow (light tokens added at Phase 8). All references user-provided are dark.**
2. Mobile responsive v4: include or defer? — recommend defer (desktop-first like v3)
3. Feature flag storage: DB column vs localStorage — recommend DB (`User.uiVersion`)
4. Cutover notification lead time — recommend 1 week
5. Backup branch `pre-v4-rebuild` retention — recommend 3 months
6. Token naming: keep v3 names (`--color-primary`) vs new format (`--color-action-primary`) — decide Phase 1
7. ~~Lint mechanism: ESLint vs regex grep~~ — **resolved 2026-05-12: regex-grep CI script (zero new deps, aligns with cleanup-medium spirit)**

## Success Criteria — Met (2026-05-12)

- ✅ Zero raw Tailwind color/radius/spacing classes in `src/design/v4/` + `src/pages-v4/` (lint gate active, 43 files clean)
- ✅ 30 v4 components shipped, 7/9 pages functional with real data
- ⏳ PostHog UI regression monitor needs wiring for v4 paths (`scripts/posthog-ui-regression-monitor.ts`)
- ✅ Bundle size: ~67 kB app chunk (gzip 19 kB) — within +10% budget
- ⏳ Team internal approval pending — v3 retained for evaluation window

## Scope shipped vs deferred (final)

**Shipped:**
- Lint gate (Phase 00) ✅
- Design tokens (Phase 01) ✅
- 30 components (Phase 02-03) ✅
- Dashboard, AdsTracker, LeadTracker, MediaTracker, OKRs (cycle card), Settings (shell), Profile (Phase 04-08) ✅
- Cutover root → /v4/dashboard (Phase 09) ✅
- 2 audit cycles (sidebar L-tree, DateRangeButton, conformance fixes)

**Deferred to follow-up plan `260512-0936-v4-deep-migration-and-cleanup`:**
- DailySync v4 form rebuild
- WeeklyCheckin v4 form rebuild
- LoginPage v4
- OKRs objective list/board
- Settings sub-tabs (Security, API Keys, Appearance)
- Profile activity timeline
- Dashboard sub-tabs content (Sale/Marketing/Media — recharts re-skin)
- Light mode tokens
- v3 deletion (after 7-day zero-alert window)
- Audit round 3+ follow-ups

## Out of Scope

- Router change (keep react-router-dom v7)
- State/data fetching change (keep TanStack Query v5)
- Backend logic changes (Express + Prisma untouched except `User.uiVersion`)
- Dark mode, mobile responsive
- Storybook, test framework reintroduction
