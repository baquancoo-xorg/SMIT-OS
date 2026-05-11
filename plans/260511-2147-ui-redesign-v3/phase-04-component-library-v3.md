# Phase 04 — Component Library v3

## Context Links

- Parent plan: [plan.md](./plan.md)
- Phase 3 input: v3 tokens in `src/index.css` + Storybook token stories
- Phase 2 input: wireframes in `reports/phase-02-wireframes/`
- v2 component inventory: `src/components/ui/` (15 primitives shipped 2026-05-10)
- Brainstorm: [/plans/reports/brainstorm-260511-2147-ui-system-redesign-v3-stitch-full-rewrite.md](../reports/brainstorm-260511-2147-ui-system-redesign-v3-stitch-full-rewrite.md)

## Overview

| Date | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|
| W3 + W4 ½ | P1 (blocks all page migration) | 1.5 weeks | pending | Phase 3 done (tokens stable) |

## Key Insights

- 15 v2 primitives rebuild + 5 new = ~20 components
- Motion strategy: prefer CSS `@starting-style` (zero JS) → fallback `framer-motion` only if achievable (per brainstorm Q5)
- Storybook coverage 100% = HARD gate — "no merge without story" (per brainstorm risk register)
- File ownership: `src/components/ui/` only — page-specific components stay in their dirs (e.g. `dashboard/`)
- Bento card + Aurora background = signature v3 elements per brainstorm direction prompts

## Requirements

### Functional

15 v2 primitives to rebuild (sample list, audit on Day 1):
- Button, Card (glass-card replacement), Input, Modal/FormDialog, ConfirmDialog
- Badge, FilterChip, DropdownMenu, CustomSelect, DatePicker, DateRangePicker
- DataTable, EmptyState, ErrorBoundary, AppLayout/Header

5 new components:
- BentoCard (signature)
- AuroraBackground (signature)
- PageTransition (route motion)
- SkeletonV2 (loading state)
- ToastV2 (notification)

Per component:
- v3 tokens consumed (no hardcoded colors/spacing)
- Motion via CSS `@starting-style` OR `framer-motion` (decide Day 1)
- Storybook story with ≥3 variants/states
- TypeScript strict (no `any`)
- Mobile responsive default (375px+)

### Non-functional

- Bundle delta target: ≤ +10% vs v2 baseline for component layer (full plan target ≤ +20% covers pages too)
- A11y: focus-visible + ARIA labels + keyboard nav per component
- Storybook gate: no PR merges to `src/components/ui/` without matching `.stories.tsx`

## Architecture

```
src/components/ui/
├── (15 rebuilt primitives — replace v2 in-place)
└── (5 new: bento-card, aurora-background, page-transition, skeleton-v2, toast-v2)

src/components/ui/index.ts → re-export barrel

Motion approach (decide D1):
├── Option A: CSS @starting-style only (zero JS, browser support 2024+)
└── Option B: framer-motion (40KB gz) for complex sequences

Storybook
└── 1 .stories.tsx per component (mirror existing v2 pattern)
```

## Related Code Files

### Modify (in-place rebuild)
- `src/components/ui/button.tsx` + `.stories.tsx`
- `src/components/ui/glass-card.tsx` → rename to `card.tsx` + `.stories.tsx`
- `src/components/ui/input.tsx` + `.stories.tsx`
- `src/components/ui/form-dialog.tsx` + `.stories.tsx`
- `src/components/ui/confirm-dialog.tsx` + `.stories.tsx`
- `src/components/ui/badge.tsx` + `.stories.tsx`
- `src/components/ui/filter-chip.tsx` + `.stories.tsx`
- `src/components/ui/dropdown-menu.tsx` + `.stories.tsx`
- `src/components/ui/custom-select.tsx` (+ create `.stories.tsx`)
- `src/components/ui/date-picker.tsx` (+ create `.stories.tsx`)
- `src/components/ui/date-range-picker.tsx` + `.stories.tsx`
- `src/components/ui/data-table.tsx` + `.stories.tsx`
- `src/components/ui/empty-state.tsx` + `.stories.tsx`
- `src/components/ui/error-boundary.tsx` + `.stories.tsx`
- `src/components/ui/app-layout.tsx` + `.stories.tsx` and `header.tsx` + `.stories.tsx`

### Create
- `src/components/ui/bento-card.tsx` + `.stories.tsx`
- `src/components/ui/aurora-background.tsx` + `.stories.tsx`
- `src/components/ui/page-transition.tsx` + `.stories.tsx`
- `src/components/ui/skeleton-v2.tsx` + `.stories.tsx` (or rename existing if present)
- `src/components/ui/toast-v2.tsx` + `.stories.tsx`
- `src/components/ui/index.ts` — update barrel exports

### Read for context
- v2 component source — preserve API surface where possible (props compat) → easier Phase 5 migration

## Implementation Steps

1. **Day 1 morning — Audit v2 components**: list all 15 + props/API → decide which keep API stable (most), which break (rare)
2. **Day 1 afternoon — Motion strategy decision**: spike `@starting-style` on Button + Modal; if browser support adequate → CSS-only; else add `framer-motion` to deps
3. **Day 2-3 — Atomic primitives**: Button, Input, Badge, FilterChip, EmptyState, ErrorBoundary (low complexity)
4. **Day 4-5 — Compound primitives**: Card, DropdownMenu, CustomSelect, DatePicker, DateRangePicker
5. **Day 6-7 — Heavy primitives**: DataTable, FormDialog, ConfirmDialog, AppLayout, Header
6. **Day 8 — New signatures**: BentoCard, AuroraBackground
7. **Day 9 — Motion + feedback**: PageTransition, SkeletonV2, ToastV2
8. **Day 10 — Polish**: cross-component consistency pass, barrel exports, story coverage check
9. **Build + Storybook full smoke**: `npx vite build` + `npm run storybook` → all stories render
10. **Phase exit**: commit `v3-components-ready`; Phase 5 unblocked

## Todo List

- [ ] Audit v2 component API surface
- [ ] Decide motion strategy (CSS vs framer-motion)
- [ ] Rebuild 15 v2 primitives with v3 tokens
- [ ] Create 5 new components (BentoCard, Aurora, PageTransition, Skeleton, Toast)
- [ ] Storybook stories: 100% coverage for `src/components/ui/`
- [ ] Update `src/components/ui/index.ts` barrel
- [ ] Vite build green
- [ ] Storybook full smoke test
- [ ] Cross-component consistency pass

## Success Criteria

- 20 components in `src/components/ui/` consuming v3 tokens only (grep: no hex codes, no inline px except where unavoidable)
- 100% Storybook coverage in `src/components/ui/` (CI check: file count `*.tsx` excl. `.stories.tsx` matches `.stories.tsx` count, ignoring `index.ts` + helpers)
- `npx vite build` exits 0
- Bundle delta (components layer) ≤ +10% vs v2
- TypeScript strict: 0 errors

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| API break propagates to v2 pages (Phase 5 breaks) | HIGH | Preserve v2 prop signatures; document any breaking changes; Phase 5 page migration touches one page at a time |
| Storybook drift (stories built but not maintained) | LOW | Acceptance criterion: "no PR to `src/components/ui/` merges without matching `.stories.tsx`" — enforce in review |
| Motion choice wrong (CSS too limited) | MEDIUM | Day 1 spike before committing; framer-motion is fallback ready to install |
| BentoCard / AuroraBackground hard to abstract (page-specific) | MEDIUM | Build minimal primitive; page-specific extensions live in page dirs not `ui/` |
| Bundle bloat (framer-motion + new components) | MEDIUM | Tree-shake check via `npm run build` size report; lazy-load AuroraBackground if heavy |
| Page-specific components mixed into `ui/` | LOW | File ownership rule: only generic primitives in `ui/`; page-specific stays in page dir |

## Security Considerations

- Sanitize any user-controlled content rendered in Toast/Modal (already pattern in v2 — verify retained)
- No new auth/data dependencies introduced

## Next Steps

- Phase 5 consumes: full component library; page migration uses these primitives exclusively
- Phase 6 may revise: motion durations if components feel sluggish (token tweak only, no component rewrite)
