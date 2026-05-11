# Phase 03 — Visual Integration + Components Batch 2

## Context Links

- Plan overview: [plan.md](./plan.md)
- Brainstorm: `/Users/dominium/Documents/Project/SMIT-OS/plans/reports/brainstorm-260512-0145-ui-rebuild-v4-foundation-first.md` §4.1 week 3, §4.4
- Phase 01 tokens: `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/tokens.css`
- Phase 02 batch 1: `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/components/`
- v3 reference for 22 remaining primitives: `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/`

## Overview

- Date: 2026-05-12 (week 3)
- Priority: P1
- Status: **completed** 2026-05-12 03:25
- Goal: with full visual reference in hand, finalize token values + 5-screen mockup approval gate, then expand to the remaining 22 components. After this phase, v4 component library is complete.

## Key Insights

- BLOCKED BY visual reference. If not delivered, Phase 02 batch 1 stays in placeholder palette and Phase 03 cannot finalize tokens.
- 5-screen mockup gate sequence: Dashboard → AdsTracker → DailySync → Settings → LoginPage. Approval here = commitment to the visual direction; rejection after this point = real rebuild cost.
- 22 remaining components are mostly compositions over batch 1 (e.g. `confirm-dialog` = modal + button×2). Effort is half of batch 1 once foundation locked.

## Requirements

**Functional:**
- Tokens fine-tuned vs visual reference: colors, type scale, radii, shadow values
- 5 page mockups built using batch 1 + draft batch 2 components, presented to user
- All 22 remaining components from brainstorm §4.4 inventory shipped
- `index.ts` barrel updated
- Lint green on full `src/design/v4/**`

**Non-functional:**
- a11y consistent with batch 1 (focus visible, keyboard nav, ARIA)
- Bundle: tree-shakeable; total v4 chunk < +10% vs v3 (success criterion)
- Each `.tsx` < 200 lines (split where needed)

## Architecture

22 remaining components per brainstorm §4.4 (final 30 list):

```
Layout (4 remaining)        Form (5 remaining)         Data (4 remaining)
  app-shell                   select                     sortable-th
  sidebar                     custom-select              table-row-actions
  header                      date-picker                kpi-card
  surface-card (renamed       date-range-picker          filter-chip
    from glass-card,
    SHIPPED batch 1)

Feedback (5 remaining)      Overlay (5 remaining)      Misc (3 remaining)
  status-dot                  form-dialog                tab-pill
  spinner                     confirm-dialog             not-found-page
  skeleton                    notification-center        okr-cycle-countdown
  empty-state                 notification-toast
  error-boundary
```

Total batch 2 = 22 components. Batch 1 = 8. Total = 30.

## Related Code Files

**Modify:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/tokens.css` — fine-tune values per visual ref
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/index.ts` — add 22 exports

**Create:** 22 files under `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/components/`
- `app-shell.tsx`, `sidebar.tsx`, `header.tsx`
- `select.tsx`, `custom-select.tsx`, `date-picker.tsx`, `date-range-picker.tsx`
- `sortable-th.tsx`, `table-row-actions.tsx`, `kpi-card.tsx`, `filter-chip.tsx`
- `status-dot.tsx`, `spinner.tsx`, `skeleton.tsx`, `empty-state.tsx`, `error-boundary.tsx`
- `form-dialog.tsx`, `confirm-dialog.tsx`, `notification-center.tsx`, `notification-toast.tsx`
- `tab-pill.tsx`, `not-found-page.tsx`, `okr-cycle-countdown.tsx`

Mockup files (temporary, deleted at phase end):
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/__mockups/dashboard.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/__mockups/ads-tracker.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/__mockups/daily-sync.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/__mockups/settings.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/__mockups/login.tsx`

**Delete:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/__playground.tsx` (from Phase 02)
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/__mockups/` (after approval)

## Implementation Steps

1. Confirm user delivered visual reference. If incomplete, escalate.
2. Tune `tokens.css` values: pick final colors, type scale, radii, shadows. Document each change in commit message.
3. Build 5 page mockups using batch 1 components + placeholder batch 2 components (HTML stubs). Each mockup `.tsx` < 200 lines.
4. Present 5 mockups to user via dev server. Approval gate — do not proceed if rejected.
5. Iterate tokens until approved (max 2 rounds).
6. Build batch 2 components in dependency order: foundation (status-dot, spinner, skeleton) → mid (filter-chip, kpi-card, tab-pill) → composite (confirm-dialog, form-dialog, notification-toast, notification-center) → layout (app-shell, sidebar, header) → form (select, custom-select, date-picker, date-range-picker) → table aux (sortable-th, table-row-actions, error-boundary, empty-state, not-found-page, okr-cycle-countdown).
7. Each component: types + variants + a11y + JSDoc, lint green.
8. Update barrel `index.ts`.
9. Delete `__mockups/` and `__playground.tsx` after approval recorded.
10. Run `npm run build`; check bundle size delta vs v3 baseline; record in commit.
11. Append entry to `docs/project-changelog.md`.

## Todo List

- [ ] Visual reference confirmed received
- [ ] Token values fine-tuned
- [ ] 5 mockups built
- [ ] User approval gate passed
- [ ] 22 batch 2 components built (one checkbox per: app-shell, sidebar, header, select, custom-select, date-picker, date-range-picker, sortable-th, table-row-actions, kpi-card, filter-chip, status-dot, spinner, skeleton, empty-state, error-boundary, form-dialog, confirm-dialog, notification-center, notification-toast, tab-pill, not-found-page, okr-cycle-countdown)
- [ ] Barrel `index.ts` updated
- [ ] Delete `__mockups/` + `__playground.tsx`
- [ ] Bundle delta < +10% recorded
- [ ] Lint + build green
- [ ] Append changelog entry

## Success Criteria

- 30 components total exported from `src/design/v4/index.ts`
- 5 mockup pages render and were user-approved
- Bundle size delta vs v3 baseline < +10%
- Lint green; `npm run build` green
- Every component file < 200 lines

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Visual reference rejected at mockup gate | Medium | Critical | Cap iteration at 2 rounds; if rejected twice, escalate to user for fundamental direction change |
| Batch 2 inherits batch 1 footguns | Medium | Medium | Treat batch 1 components as locked APIs; only token values change |
| Date-picker complexity blows up | Medium | Medium | Use native `<input type="date">` for v4; defer fancy picker to post-cutover |
| `notification-center` requires state mgmt | Medium | Medium | Co-locate Zustand-lite store in `primitives/notifications-store.ts`; no global state lib |
| Token fine-tune cascades into batch 1 visual breakage | High | Low | Batch 1 consumes tokens — visual change is desired; QA mockup again |
| Bundle size exceeds +10% | Medium | High | Audit per-component cost; defer non-critical (e.g. date-range-picker animations) |

## Security Considerations

- `error-boundary` must not leak stack traces to UI in production builds.
- `notification-toast` must escape HTML in message content (XSS).
- `not-found-page` must not reveal app structure (no internal route listing).

## Next Steps

- Unlocks Phase 04 (dashboard rebuild + feature flag infra).
- Handoff: 30 components ready, token values frozen, mockup approval recorded in plan.md changelog.
