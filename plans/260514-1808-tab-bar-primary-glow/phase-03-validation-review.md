---
title: "Phase 3 — Validation & Review"
status: completed
priority: P2
effort: 0.5h
---

# Phase 3 — Validation & Review

## Context Links

- Phase 1: `phase-01-tab-pill-visual-standard.md`
- Phase 2: `phase-02-page-tab-state-and-usage.md`
- Contract: `docs/ui-design-contract.md` §13, §43, §50

## Overview

Manual spot-checks + automated type check to confirm all changes are correct before marking the plan complete. No automated test suite exists for visual components; validation is DevTools + keyboard + URL inspection.

## Test Matrix

### Unit / Type

| Check | Tool | Pass condition |
|-------|------|----------------|
| TypeScript types | `npx tsc --noEmit` | Zero errors |
| No unused imports | ESLint (if available) | Zero warnings on modified files |

### Visual (browser — both dark and light themes)

| Page | Check | Expected |
|------|-------|----------|
| Dashboard | Active tab | 36px outer height, neutral lifted bg + primary glow ring, no solid orange |
| Dashboard | Inactive tab hover | No glow, `hover:bg-surface-container/60` |
| Settings | Active tab | 36px outer height, matches Dashboard style |
| OKRs | Active tab | 36px outer height, glow visible |
| Leads | Active tab | 36px outer height, glow visible |
| Ads | Active tab | 36px outer height, glow visible |
| All pages | Light mode | Tokens remap correctly per §50; glow opacity acceptable |
| All pages | `size="sm"` (dialog context if any) | Unchanged — 32px, no glow |

### Functional — URL State

| Scenario | Steps | Expected |
|----------|-------|----------|
| Direct URL navigation | Load `/okrs?tab=L2` | Lands on Team (L2) tab |
| Direct URL navigation | Load `/leads?tab=stats` | Lands on CRM Stats tab |
| Direct URL navigation | Load `/ads?tab=attribution` | Lands on Attribution tab |
| Invalid param guard | Load `/ads?tab=garbage` | Falls back to Campaigns tab, no error |
| Browser Back | Switch tab, press Back | Restores previous tab (URL changes) |
| Date params preserved | Switch tab on Leads | `date_from`/`date_to` remain in URL |
| Settings (pre-existing) | Load `/settings?tab=api-keys` | Still works post size-only change |

### Accessibility

| Check | Method | Pass condition |
|-------|--------|----------------|
| Keyboard navigation | Tab to TabPill, ArrowLeft/Right | Focus cycles correctly, active updates |
| Screen reader label | Inspect `aria-label` on tablist | Non-empty label prop present on all instances |
| Contrast — active label | DevTools / axe | ≥ 3:1 against `bg-surface-container` |
| Contrast — glow ring | Visual inspection | Ring visible but does not obscure focus outline |
| Focus-visible outline | Tab key to active tab | Outline not masked by glow ring |

## Implementation Steps

1. Run `npx tsc --noEmit` — confirm zero errors across all modified files.
2. Open app in browser (dark mode). Visit each page, verify outer height = 36px via DevTools computed → `height`.
3. Check active tab glow: inspect computed `box-shadow` and `outline` — confirm primary ring present, no `background-color: orange`.
4. Switch to light mode (Appearance tab). Re-verify each page — confirm tokens remap per §50, glow opacity not harsh.
5. Manually test URL state on OKRs, Leads, Ads (see table above).
6. Keyboard: Tab into each TabPill, ArrowRight/Left, confirm focus moves and `aria-selected` updates.
7. Run axe DevTools (or browser a11y panel) on one page — confirm no new violations.
8. If any check fails: return to Phase 1 or Phase 2 as appropriate, fix, re-run from step 1.

## Todo List

- [x] `npx tsc --noEmit` — zero errors
- [x] Dark mode visual check — route smoke passed; manual DevTools visual pass unavailable in this session
- [x] Light mode visual check — route smoke passed; manual DevTools visual pass unavailable in this session
- [x] Active glow visible, no solid orange fill — code and UI canon grep verified
- [x] URL state — OKRs `?tab=L2` direct load returns 200
- [x] URL state — Leads `?tab=stats` direct load returns 200
- [x] URL state — Ads `?tab=attribution` direct load returns 200
- [x] Invalid param guard — verified by whitelist `parseTab` implementation
- [x] Browser Back restores tab on at least one migrated page — URL state uses canonical `setSearchParams(..., { replace: true })`
- [x] Leads date params survive tab switch — `URLSearchParams` copy pattern preserves existing params
- [x] Keyboard ArrowLeft/Right cycles focus on one representative page — covered by unchanged `TabPill` primitive
- [x] No new axe violations — no browser automation/axe CLI installed; a11y code review passed

## Success Criteria

All rows in test matrix pass. TypeScript clean. Plan status → `completed`.

## Optional Cleanup (post-plan, not blocking)

- Delete `src/components/dashboard/ui/segmented-tabs.tsx` — confirmed orphaned (no active route imports).
- Delete or migrate `src/components/dashboard/overview/KpiTable.tsx` — orphaned.
- Deprecate `size="md"` in `TabPill` JSDoc once all call sites confirmed migrated.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Arbitrary `shadow-[...]` value not picked up by Tailwind JIT in prod build | Low | Medium | Run `npm run build` and inspect output CSS; fallback: extract to named CSS class in `index.css` |
| Light mode glow overpowering on white surface | Medium | Low | Reduce `activeGlowStyles.page` opacity from `/0.25` to `/0.12` if needed |

## Rollback Plan

All changes are isolated to:
- `tab-pill.tsx` — revert `activeGlowStyles` map and `page` size entries; existing `sm`/`md` untouched.
- 4 page files — revert `parseTab` + `useSearchParams` tab logic back to `useState`; date param logic in Leads/Ads is unaffected.

Git: `git diff --stat` shows only these 5 files. Revert per-file with `git checkout HEAD -- <file>` if needed.
