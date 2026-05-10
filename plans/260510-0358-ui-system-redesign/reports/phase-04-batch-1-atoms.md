# Phase 04 — Batch 1: Atoms + Storybook Setup

**Date:** 2026-05-10
**Session:** `/ck:cook` Phase 4 batch 1
**Effort actual:** ~1.5h (vs ~3-4h estimate)
**Status:** ✅ DONE

---

## Deliverables

### Storybook 10 setup
- `npx storybook@latest init` → React + Vite stack auto-detected
- Addons: `@storybook/addon-vitest`, `@storybook/addon-a11y`, `@storybook/addon-docs`, `@storybook/addon-onboarding`, `@chromatic-com/storybook`
- Preview config (`.storybook/preview.ts`):
  - Imports `src/index.css` → all Phase 2 design tokens available
  - 3 backgrounds: `surface` (default #f7f5ff), `white`, `container`
  - A11y test mode: `todo` (show violations, don't fail CI yet)
- Sample boilerplate stories deleted (`src/stories/` removed)
- Scripts added: `npm run storybook` (dev :6006) + `npm run build-storybook`
- `storybook-static` already in `.gitignore`
- Static build: ✅ 2.90s, 6/6 atom stories compiled

### 6 Atoms shipped — `src/components/ui/v2/`

| # | Component | File | Variants | Notes |
|---|---|---|---|---|
| 1 | Button | `button.tsx` + `button.stories.tsx` | 4 variants × 3 sizes + loading + icon slots + fullWidth | `rounded-button` (pill), `motion-fast ease-standard`, no motion lib dep |
| 2 | Input | `input.tsx` + `input.stories.tsx` | label, helperText, error, iconLeft/Right, all input types | Auto-gen `useId()` for label/aria-describedby; ARIA `role="alert"` for errors |
| 3 | Badge | `badge.tsx` + `badge.stories.tsx` | 6 variants × 2 sizes × soft/solid | Soft default (container tokens); pill `rounded-chip` |
| 4 | StatusDot | `status-dot.tsx` + `status-dot.stories.tsx` | 5 variants × 3 sizes + pulse | `animate-ping` ring respects `prefers-reduced-motion` (global rule) |
| 5 | Spinner | `spinner.tsx` + `spinner.stories.tsx` | 4 sizes, currentColor stroke, hideLabel | ARIA `role="status" aria-live="polite"` |
| 6 | Skeleton | `skeleton.tsx` + `skeleton.stories.tsx` | text/circle/rect + multi-line text auto-shortens last | Multi-line wrapper = `<div>` to avoid invalid HTML nesting |

### Barrel export — `src/components/ui/v2/index.ts`
Re-exports all 6 atoms + their type aliases (`ButtonVariant`, `BadgeSize`, etc).

---

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ Clean (after fixing `Info` collision in badge.stories) |
| `npx vite build` | ✅ Clean 2.07s, no v2 imports affecting prod bundle (yet) |
| `npm run build-storybook` | ✅ Clean 2.90s, all 6 stories present in `storybook-static/assets/` |
| Existing pages | ✅ Unchanged (v2 namespace isolated) |

---

## Design Token Adherence

All 6 atoms drive styling **only** from Phase 2 tokens:
- Color: semantic (`bg-success`, `text-on-error-container`, etc.) — no hex inline
- Radius: semantic (`rounded-button`, `rounded-input`, `rounded-chip`)
- Typography: clamp-based via `[length:var(--text-body-sm)]`
- Motion: token utilities (`motion-fast`, `ease-standard`)
- Focus ring: relies on global `:focus-visible { box-shadow: var(--shadow-focus) }` from `src/index.css`

Zero ad-hoc colors, zero `rounded-2xl` violations, zero motion-library dep in atoms.

---

## Decisions Locked

- **D1**: Storybook 10 (latest stable) > simple `/dev/components` page. Reason: a11y addon + isolation + docs > setup overhead (~150MB devDeps, acceptable).
- **D2**: Atoms use plain CSS transitions, not `motion/react`. Reason: simpler, smaller bundle, behaves correctly under `prefers-reduced-motion` (global rule).
- **D3**: Multi-line Skeleton wrapper changed from `<span>` to `<div>` mid-implementation to fix invalid HTML (block-in-inline). Component now uses `HTMLDivElement` ref.
- **D4**: Badge default `soft={true}` (container tokens). Solid variants opt-in. Aligns with M3 `*-container` palette spec from Phase 2.

---

## Pitfalls Recorded

1. **Lucide icon `Info` collides with story export `Info`** in TypeScript merged-declaration check. Fixed via `import { Info as InfoIcon }`. **Lesson**: stories that import lucide icons named after semantic variants (Info/Warning/Error) need aliasing.
2. **Storybook 10 default a11y mode = `todo`** (warns only). Switch to `error` in CI once baseline is clean.

---

## Next Batch — Molecules (Batch 2)

**Components (5):**
1. `<PageHeader />` — breadcrumb + title italic accent + action slot (signature pattern from Phase 1 audit)
2. `<TabPill />` — pill-style tab toggle (replace 4 page-header variants found in audit)
3. `<DateRangePicker />` — preset shortcuts + custom range
4. `<EmptyState />` — icon + label + action slot
5. `<KpiCard />` — Bento metric with decorative blob, hover anim (signature element, only 1/8 pages had it)

**Estimate:** ~3-4h. Same Storybook isolation pattern.

**Blocker check before Batch 2:** Need to decide on KpiCard hover animation lib — stay vanilla CSS, or use `motion/react` for spring physics? Defer decision to next session.

---

## Files Changed (Batch 1)

```
A  .storybook/main.ts
A  .storybook/preview.ts
A  .storybook/vitest.setup.ts          (auto by storybook init)
A  vitest.config.ts                    (auto by storybook init)
A  vitest.workspace.ts                 (auto by storybook init)
A  src/components/ui/v2/index.ts
A  src/components/ui/v2/button.tsx
A  src/components/ui/v2/button.stories.tsx
A  src/components/ui/v2/input.tsx
A  src/components/ui/v2/input.stories.tsx
A  src/components/ui/v2/badge.tsx
A  src/components/ui/v2/badge.stories.tsx
A  src/components/ui/v2/status-dot.tsx
A  src/components/ui/v2/status-dot.stories.tsx
A  src/components/ui/v2/spinner.tsx
A  src/components/ui/v2/spinner.stories.tsx
A  src/components/ui/v2/skeleton.tsx
A  src/components/ui/v2/skeleton.stories.tsx
M  package.json                        (storybook deps + scripts)
M  package-lock.json
M  .gitignore                          (auto-added storybook-static)
D  src/stories/                        (sample boilerplate removed)
M  plans/260510-0358-ui-system-redesign/plan.md
M  plans/260510-0358-ui-system-redesign/phase-04-component-library.md
A  plans/260510-0358-ui-system-redesign/reports/phase-04-batch-1-atoms.md  (this file)
```

---

## Open Questions

- KpiCard motion lib choice (vanilla CSS vs motion/react) — defer to Batch 2 kickoff.
- Should v2 atoms include a `cn()` className-merge helper? Currently using inline filter+join. Plan: ship if a v2 organism (DataTable) actually needs conditional class composition. YAGNI for now.
- Lighthouse a11y baseline run on Storybook static — defer until Batch 4 (full demo coverage).
