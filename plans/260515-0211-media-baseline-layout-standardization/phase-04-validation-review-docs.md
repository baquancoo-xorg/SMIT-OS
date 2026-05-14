---
title: "Phase 4 — Validation, Review, and Docs"
status: completed
priority: P2
effort: 1h
---

# Phase 4 — Validation, Review, and Docs

## Context Links

- Phase 1: `phase-01-shared-page-layout-primitives.md`
- Phase 2: `phase-02-growth-workspace-migration.md`
- Phase 3: `phase-03-remaining-v5-pages-and-settings.md`
- Contract: `docs/ui-design-contract.md` §1-2, §42-43, §48, §50
- Changelog: `docs/project-changelog.md`

## Overview

Validate that Media-derived layout standardization is correct, accessible, theme-safe, and documented. This phase should catch visual drift, route regressions, and accidental contract violations before completion.

## Test Matrix

### Automated

| Check | Tool | Pass condition |
|-------|------|----------------|
| TypeScript | `npm run typecheck` | Zero errors |
| UI canon | `npm run lint:ui-canon` | Zero violations |
| Unit/integration tests | `npm run test` | All tests pass |
| Production build | `npm run build` | Build succeeds |

### Route Smoke

| Route | Expected |
|-------|----------|
| `/` | Loads dashboard |
| `/media` | Media baseline still correct |
| `/ads` | Growth layout aligned |
| `/leads` | Growth layout aligned |
| `/reports` | Reports layout aligned |
| `/daily-sync` | No layout regression |
| `/checkin` | No layout regression |
| `/okrs` | No layout regression |
| `/settings` | Settings included and usable |
| `/profile` | No layout regression |

### Visual / Accessibility

| Area | Check | Expected |
|------|-------|----------|
| Toolbar | Desktop alignment | Search/Group/Filter left; Action/Date right; one baseline |
| Toolbar | Mobile/narrow | Controls wrap without clipping, focus order preserved |
| KPI cards | Hover | Subtle neutral lift/glow only |
| Tables | Hover | Neutral row hover, no solid orange |
| Settings | Semantics | No fake KPI cards; cards/tables/forms aligned |
| Light mode | Tokens | Hierarchy remains readable, borders visible |
| A11y | Icon actions | `aria-label` present |
| A11y | Focus | Visible focus rings not masked by glow |

## Implementation Steps

1. Run `npm run typecheck`.
2. Run `npm run lint:ui-canon`.
3. Run `npm run test`.
4. Run `npm run build`.
5. Smoke test listed routes against local dev server.
6. If browser access is available, inspect dark and light mode for Media, Ads, Leads, Reports, Settings.
7. Run code review with `code-reviewer` agent.
8. Update phase checkboxes and `plan.md` statuses after validation passes.
9. Update `docs/project-changelog.md` with a concise entry.

## Todo List

- [x] `npm run typecheck` passes
- [x] `npm run lint:ui-canon` passes
- [x] `npm run test` passes
- [x] `npm run build` passes
- [x] Route smoke passes
- [x] Dark mode visual check completed or limitation documented
- [x] Light mode visual check completed or limitation documented
- [x] Accessibility/code review completed
- [x] Plan statuses synced
- [x] Changelog updated

## Success Criteria

- All automated validation gates pass.
- Media remains the visual baseline.
- Growth pages and relevant v5 pages align to the baseline.
- Settings is included without semantic distortion.
- Plan and changelog accurately reflect final implementation.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Browser visual QA unavailable | Medium | Low | Document limitation and rely on route smoke + code review |
| UI canon lint misses subtle visual drift | Medium | Low | Spot-check Media/Ads/Leads/Settings manually if possible |
| Build catches Tailwind arbitrary class issue late | Low | Medium | Run build before marking complete |

## Accessibility Considerations

- Validate focus order after responsive toolbar wrapping.
- Confirm no icon-only button lost `aria-label` during migration.
- Confirm table semantics remain intact.

## Security Considerations

- Ensure no `.env`, tokens, or secrets are touched or staged.
- Settings visual changes must not alter API key/token handling logic.

## Rollback Plan

All implementation should be isolated to v5 UI layout primitives and v5 page/component usage. If regression appears, revert page migrations first while keeping primitives, or revert the primitive files and direct imports together.
