# Phase 03 — Design Tokens v3

## Context Links

- Parent plan: [plan.md](./plan.md)
- Phase 2 input: `reports/phase-02-brand-kit.md` + `phase-02-ia-freeze.md`
- v2 tokens (replace): [src/index.css](../../src/index.css)
- v2 token docs (rewrite): [docs/design-tokens-spec.md](../../docs/design-tokens-spec.md), [docs/design-system-foundation.md](../../docs/design-system-foundation.md)

## Overview

| Date | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|
| W2 | P1 (blocks all component + page work) | 5 days | pending | Phase 2 signed (brand kit + IA freeze) |

## Key Insights

- Keep semantic naming pattern (`--color-primary`, `--color-on-surface`) — eases v2 → v3 migration find/replace
- Replace Material Design 3 tokens (v2 baseline) with v3 system seeded from Phase 2 brand kit
- Motion timing tokens REQUIRED (v2 missed micro-interactions per root cause #4)
- Storybook stories per token category = visualization gate (no merge without story)
- Bundle impact: tokens are CSS vars, negligible — concern is component cascade in Phase 4

## Requirements

### Functional

- Rewrite `src/index.css` with v3 token system covering:
  - Colors: primary/secondary/accent + neutrals + status semantic (success/warning/error/info with `-container` + `on-` variants)
  - Typography: 10-12 token scale (caption → display) with leading + tracking
  - Spacing: semantic responsive clamp scale (sm/base/md/lg/xl/2xl/3xl)
  - Radius: semantic names (button/chip/input/card/modal)
  - Shadows: 5-7 stop scale (subtle → dramatic)
  - Motion timing: 4-5 durations (instant/fast/base/slow/slower), 4 easings (standard/decel/accel/sharp)
  - Z-index: 6-8 semantic layers
- Storybook stories: 1 per token category (colors, typography, spacing, radius, shadow, motion)
- Docs rewrite: `docs/design-tokens-spec.md` + `docs/design-system-foundation.md`
- Build green: `npx vite build` clean after rewrite (no Tailwind breakage)

### Non-functional

- All tokens accessible via Tailwind utilities OR CSS var (`var(--color-primary)`)
- Breakpoints unchanged from v2 (md=768/lg=1024/xl=1280/2xl=1536) — avoid breaking responsive layout in untouched pages during Phase 5 migration
- Focus-visible ring spec global (a11y)
- `prefers-reduced-motion` handler retained

## Architecture

```
src/index.css (v3 rewrite)
├── @layer base
│   ├── :root → CSS var declarations (color/typo/spacing/radius/shadow/motion/z)
│   ├── focus-visible ring
│   └── prefers-reduced-motion handler
└── @layer components/utilities (Tailwind plugin mappings)

tailwind.config.ts
└── extend.colors/spacing/radius/shadow/motion → CSS var references

Storybook stories
├── tokens/colors.stories.tsx
├── tokens/typography.stories.tsx
├── tokens/spacing.stories.tsx
├── tokens/radius.stories.tsx
├── tokens/shadow.stories.tsx
└── tokens/motion.stories.tsx
```

## Related Code Files

### Modify
- `src/index.css` — full rewrite
- `tailwind.config.ts` — remap to v3 tokens
- `docs/design-tokens-spec.md` — full rewrite
- `docs/design-system-foundation.md` — full rewrite

### Create
- `src/stories/tokens/colors.stories.tsx`
- `src/stories/tokens/typography.stories.tsx`
- `src/stories/tokens/spacing.stories.tsx`
- `src/stories/tokens/radius.stories.tsx`
- `src/stories/tokens/shadow.stories.tsx`
- `src/stories/tokens/motion.stories.tsx`

### Read for context
- v2 `src/index.css` — extract semantic naming pattern to preserve
- `docs/design-tokens-spec.md` (current) — preserve structure, replace values

## Implementation Steps

1. **Token spec draft** (D1): write `docs/design-tokens-spec.md` with v3 values from Phase 2 brand kit
   - List every token name + value + intended use
   - Include status semantic colors (success/warning/error/info) per v2 pattern
2. **CSS rewrite** (D2): replace `src/index.css` `:root` block with v3 tokens
   - Keep `@layer base` structure
   - Preserve focus-visible + `prefers-reduced-motion`
3. **Tailwind remap** (D2 end): update `tailwind.config.ts` `theme.extend.*` to reference v3 CSS vars
4. **Build verification**: `npx vite build` → 0 errors; spot check 2-3 v2 pages still render (visually broken OK, semantically standing)
5. **Storybook stories** (D3): 1 file per token category, show swatches/scales/examples
6. **Foundation doc rewrite** (D4): `docs/design-system-foundation.md` — usage rules, a11y, motion, implementation checklist
7. **Cross-check vs Phase 2 wireframes** (D5 morning): pick 2 wireframes, validate v3 tokens cover all visual properties shown
8. **Build + Storybook smoke test** (D5 afternoon): `npm run storybook` opens, all 6 token stories render
9. **Phase exit**: commit + tag `v3-tokens-ready`; Phase 4 unblocked

## Todo List

- [ ] Draft token spec (`docs/design-tokens-spec.md`)
- [ ] Rewrite `src/index.css` v3
- [ ] Remap `tailwind.config.ts`
- [ ] Vite build verification
- [ ] 6 token Storybook stories
- [ ] Rewrite `docs/design-system-foundation.md`
- [ ] Cross-check vs Phase 2 wireframes
- [ ] Storybook smoke test
- [ ] Commit + tag

## Success Criteria

- `npx vite build` exits 0
- Storybook renders all 6 token stories without errors
- Every token from Phase 2 brand kit represented in `src/index.css`
- Both docs (`design-tokens-spec.md`, `design-system-foundation.md`) regenerated, accurate to code
- v2 pages still render (visually broken acceptable — proves token cascade works)

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Token rewrite breaks v2 pages catastrophically before Phase 5 ready | HIGH | Keep semantic naming identical to v2; visual break OK, structural break NOT OK; smoke test after each commit |
| Tailwind config drift (utilities reference dead vars) | MEDIUM | One file owner (this phase); update `tailwind.config.ts` in same commit as `index.css` |
| Storybook breaks during token swap | MEDIUM | Keep token stories self-contained (no component dependencies) |
| Motion tokens added but components don't consume in Phase 4 | LOW | Motion API documented in `design-system-foundation.md`; Phase 4 acceptance checklist enforces motion usage |
| Breakpoint accidentally changed | MEDIUM | Explicit "DO NOT change breakpoints" comment in `tailwind.config.ts`; visual regression check on 2 pages at 768/1024/1280 |

## Security Considerations

- N/A (CSS tokens only, no auth/data layer)

## Next Steps

- Phase 4 consumes: tokens via CSS vars + Tailwind utilities; motion timing for component animations
- Phase 6 may revise: motion timing if components feel sluggish/jumpy
