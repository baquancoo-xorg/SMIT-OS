# Phase 01 — Design Tokens v4

## Context Links

- Plan overview: [plan.md](./plan.md)
- Brainstorm: `/Users/dominium/Documents/Project/SMIT-OS/plans/reports/brainstorm-260512-0145-ui-rebuild-v4-foundation-first.md` §4.3 row 1
- v3 reference (for naming convention decision): `/Users/dominium/Documents/Project/SMIT-OS/src/index.css`
- Vite config: `/Users/dominium/Documents/Project/SMIT-OS/vite.config.ts`
- Tailwind v4 docs: https://tailwindcss.com/docs/theme (CSS-first `@theme`)

## Overview

- Date: week 1
- Priority: P1
- Status: pending
- Goal: lock the source-of-truth token file before any component is written. Three tiers (primitive → semantic → component). Component layer can rebrand without touching primitives.

## Key Insights

- Tailwind v4 is CSS-first. Tokens defined in `@theme` block become utilities automatically.
- 3-tier hierarchy is industry pattern (Material 3, Apple, IBM Carbon). Without semantic layer, rebrand = rewrite every component.
- **BLOCKED by user delivering visual reference end of week 1.** Without reference, values are placeholders that need re-tuning at Phase 03.
- v3 used Apple Bento (`--color-primary: #007aff`). v4 must differentiate via new direction — exact palette pending visual.
- Token names: deciding now between keeping v3 names (low effort, easy diff) and switching to action/intent format (clearer semantics, more breaking).

## Requirements

**Functional:**
- `src/design/v4/tokens.css` exports CSS variables in 3 tiers
- Tailwind v4 `@theme` block consumes Tier 1 primitives so utilities `bg-blue-500` resolve to primitives — but those utilities are blocked by lint outside Tier 2/3 use
- Semantic tier (Tier 2) maps to primitive: `--color-action-primary: var(--color-blue-600)`
- Component tier (Tier 3) maps to semantic: `--button-bg-default: var(--color-action-primary)`
- All components consume only Tier 3 tokens
- `src/design/v4/README.md` with 1-page DO/DONT

**Non-functional:**
- HMR works on tokens.css edit
- No FOUC vs v3 (loaded eagerly via vite entry)
- File < 500 lines; split per-tier if larger

## Architecture

```
src/design/v4/tokens.css
├── @theme {
│     /* Tier 1 — Primitive */
│     --color-blue-50..900
│     --color-neutral-50..900
│     --space-1..16
│     --radius-none|sm|md|lg|xl|2xl|full
│     --text-xs..6xl
│     --leading-tight|snug|base|loose
│     --weight-400|500|600|700
│     --shadow-sm|md|lg|xl
│   }
├── :root {
│     /* Tier 2 — Semantic */
│     --color-action-primary: var(--color-blue-600);
│     --color-surface-base: var(--color-neutral-50);
│     --color-text-default: var(--color-neutral-900);
│     ...
│
│     /* Tier 3 — Component */
│     --button-bg-default: var(--color-action-primary);
│     --card-bg: var(--color-surface-elevated);
│     ...
│   }
```

Wire: `src/main.tsx` imports `./design/v4/tokens.css` once. `src/index.css` (v3) stays for now.

## Related Code Files

**Modify:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/main.tsx` — add side-effect import of `design/v4/tokens.css`
- `/Users/dominium/Documents/Project/SMIT-OS/vite.config.ts` — confirm CSS load order if necessary

**Create:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/tokens.css`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/README.md`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/tokens-primitive.css` (optional split)
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/tokens-semantic.css` (optional split)
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/tokens-component.css` (optional split)

**Delete:** none. `src/index.css` stays until Phase 09 cutover.

## Implementation Steps

1. Confirm visual reference delivered. If not, escalate to user before proceeding (do not invent palette).
2. Resolve Open Question Q6 (naming convention) in writing at top of `tokens.css`.
3. Draft Tier 1 primitive scale: colors (12 families × 10 shades), spacing (10 steps), radius (7 steps), text (8 sizes), weight (4 steps), shadow (4 steps).
4. Draft Tier 2 semantic: action-primary, action-secondary, action-danger, action-success, action-warning, surface-base, surface-elevated, surface-overlay, text-default, text-muted, text-inverse, border-default, border-strong, focus-ring.
5. Draft Tier 3 component slots for the 30 primitives (button, input, card, modal, dropdown, table, badge, etc.). Each primitive owns 3-8 slots.
6. Wrap Tier 1 in Tailwind `@theme` block. Wrap Tier 2 + 3 in `:root`.
7. Import in `src/main.tsx` after v3 `index.css` (v4 wins in cascade for v4 paths).
8. Build & smoke `npm run dev` — confirm no FOUC, devtools shows variables resolved.
9. Write `README.md`: hierarchy diagram + DO (use Tier 3 in components) / DON'T (skip tiers, mix with v3, add ad-hoc colors).
10. Append entry to `docs/project-changelog.md`.

## Todo List

- [ ] Visual reference received (BLOCKER)
- [ ] Resolve naming convention Q6
- [ ] Draft Tier 1 primitives
- [ ] Draft Tier 2 semantic mappings
- [ ] Draft Tier 3 component slots
- [ ] Write `tokens.css` with `@theme` + `:root`
- [ ] Import via `src/main.tsx`
- [ ] Smoke test no FOUC
- [ ] Write `src/design/v4/README.md`
- [ ] Append changelog entry

## Success Criteria

- `tokens.css` < 500 lines (or 3 split files, each < 300 lines)
- All 30 future primitives have a defined Tier 3 slot before Phase 02 starts
- Devtools shows `var(--button-bg-default)` resolving to a hex
- README explains tier rules in < 1 page

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Visual reference delayed past week 1 | Medium | High | Use "Notion warm minimal" placeholder; mark all values TUNE@Phase03; do not block Phase 02 |
| Tier 2 mappings drift back to primitives over time | Medium | High | README + lint already blocks raw colors; Phase 02 review enforces |
| `@theme` collision with v3 names | High | Medium | v4 names prefixed `--v4-*` if collision found; preferred: namespace via cascade order |
| Spacing scale picks wrong base (4 vs 8) | Low | Medium | Pick 4-base (matches Tailwind default); document rationale in README |
| Shadow tokens incompatible with surface tokens (light vs dark surface) | Medium | Low | Define shadow per surface intent in Tier 3 |

## Security Considerations

- Tokens are static CSS; no runtime exposure of secrets.
- README must not reference internal-only brand colors (none expected).

## Next Steps

- Unlocks Phase 02 (components batch 1) — all 30 component slots must exist as Tier 3 vars.
- Handoff: tier diagram + Q6 resolution committed in `tokens.css` header.
