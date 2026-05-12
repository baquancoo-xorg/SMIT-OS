---
title: "v4 Deep Migration + v3 Cleanup"
description: "Finish v4-foundation deferred items: forms (DailySync/WeeklyCheckin/Login), domain UI (OKRs/Settings/Dashboard charts), light mode, v3 deletion."
status: pending
priority: P2
effort: 3-5 weeks
branch: feat/api-key-middleware
tags: [ui, v4, polish, cleanup]
created: 2026-05-12
predecessor: 260512-0145-ui-rebuild-v4-foundation-first
---

## Context

Predecessor plan `260512-0145-ui-rebuild-v4-foundation-first` shipped v4 foundation, 30 components, 7 functional pages. This plan continues with deferred deep-content + cleanup.

## Strategy

Sequential phases by risk + dependency:
1. Forms first (LoginPage isolated, then DailySync + WeeklyCheckin)
2. Domain UI (OKRs board + Dashboard charts + Settings sub-tabs + Profile activity)
3. Light mode tokens (visual additive, low risk)
4. v3 deletion (terminal, after 7-day clean window)

## Phases

| # | Name | Status | Effort | Depends On | Link |
|---|---|---|---|---|---|
| 01 | Forms — Login + DailySync + WeeklyCheckin | pending | 1-2 wks | predecessor | [phase-01-forms.md](./phase-01-forms.md) |
| 02 | Domain UI — OKRs board + Dashboard charts + Settings tabs + Profile activity | pending | 1-2 wks | 01 (optional) | [phase-02-domain-ui.md](./phase-02-domain-ui.md) |
| 03 | Light mode tokens | pending | 3-4d | 02 (Settings appearance tab) | [phase-03-light-mode.md](./phase-03-light-mode.md) |
| 04 | v3 deletion + cleanup | pending | 2-3d | 01-03 + 7-day clean window | [phase-04-v3-deletion.md](./phase-04-v3-deletion.md) |

## Open Questions

1. DailySync + WeeklyCheckin form complexity: 1-to-1 v3 parity or simplified UX? (rec: 1-to-1 first, simplify later)
2. OKRs board: kanban-style cards or list table? (decide after viewing v3 OKR usage patterns)
3. Dashboard sub-tabs: re-implement recharts in v4 colors or replace with v4 KpiCard + DataTable layout? (rec: replace where possible, keep recharts for time-series)
4. Light mode trigger: system preference (`prefers-color-scheme`) or user toggle in Settings → Appearance? (rec: both)
5. v3 deletion timing: 7-day rolling window from cutover (2026-05-12 → 2026-05-19 earliest)?
6. Test coverage: vitest was dropped in cleanup-medium. Add back for v4 critical paths or stay no-test?

## Success Criteria

- LoginPage v4 ships with TOTP support
- DailySync + WeeklyCheckin v4 forms shipped, redirects from v3 removed
- OKRs page renders objectives/key-results list with v4 components
- Settings Security/API Keys/Appearance tabs functional
- Dashboard sub-tabs show real data (not "coming soon")
- Light mode tokens active under `[data-theme="light"]`
- `src/components/ui/*` deleted, `src/pages/*.tsx` deleted, `src/index.css` v3 tokens removed
- Bundle size reduced after v3 deletion (~30-40% lighter expected)
- `npm run lint` + `npm run build` exit 0 throughout

## Out of Scope

- Backend changes (Express + Prisma untouched except eventual `User.uiVersion` column if needed)
- Router migration (keep react-router-dom v7)
- State management migration (keep TanStack Query v5)
- Test framework reintroduction (decide via OQ6)
- Mobile responsive deep work (desktop-first)
