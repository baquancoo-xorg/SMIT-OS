# SMIT-OS Design System v4

Dark-first warm cinematic foundation for the UI rebuild (2026-05-12 →).

> Plan: `plans/260512-0145-ui-rebuild-v4-foundation-first/`
> Brief: `plans/260512-0145-ui-rebuild-v4-foundation-first/reports/01-visual-reference-analysis.md`

## Activation

v4 tokens activate **only** under `[data-ui="v4"]`. v3 code untouched.

Route entry (Phase 4+):

```ts
import '@/design/v4/tokens.css';

// somewhere at v4 layout root
document.documentElement.dataset.ui = 'v4';
```

## 3-Tier Token Hierarchy

```
Tier 1 — Primitive       (raw color scales, font sizes, spacing values)
   └─ Tier 2 — Semantic  (bg-base, text-primary, accent, status fg/soft)
        └─ Tier 3 — Component  (button-primary-bg, sidebar-item-active-bg, ...)
```

Component code uses **Tier 3 only**. Page layout uses **Tier 2**. Tier 1 lives only inside `tokens.css`.

## DO / DON'T

### DO

```tsx
<button className="bg-button-primary-bg text-button-primary-fg rounded-pill px-cozy py-snug">
  Save
</button>

<span className="bg-done-soft text-done rounded-pill px-snug py-tight text-label">
  Done
</span>
```

### DON'T

```tsx
// Raw Tailwind color — lint gate will fail in v4 paths
<button className="bg-orange-500 text-white">

// Generic radius — lint gate will fail
<div className="rounded-lg">

// Raw spacing — lint gate will fail
<div className="p-4 m-2">

// Mixed v3 + v4 tokens
<div className="bg-surface-container-low text-primary"> // v3 names
```

## Status Taxonomy (10 task states)

| Token | Hex | Use |
|---|---|---|
| `--color-in-progress` | cyan #06b6d4 | Active work |
| `--color-to-do` | violet #8b5cf6 | Queued |
| `--color-in-review` | amber #d4a017 | Pending review |
| `--color-design-review` | purple #a855f7 | Design-specific review |
| `--color-rework` | red #dc2626 | Sent back for changes |
| `--color-done` | emerald #10b981 | Completed |
| `--color-not-started` | rose #f43f5e | Not yet begun |
| `--color-blocked` | red-bright #ef4444 | Stuck on dependency |
| `--color-on-hold` | sky #0ea5e9 | Paused intentionally |
| `--color-archived` | zinc #a1a1aa | Closed / archived |

Each has a `-soft` companion (18% alpha) for backgrounds. Feedback set (success/warning/error/info) retained separately for legacy parity.

## Signature Orange Glow

Reference Image 3 = orange beam emanating from divider. v4 utility:

```tsx
<div className="shadow-[var(--glow-accent-md)]">…</div>
```

Three intensities: `--glow-accent-sm` `--glow-accent-md` `--glow-accent-lg`. Use sparingly — primary CTA + active focus only. Overuse kills the "signature" quality.

## Surface Layering

```
bg-base       #161316  (app shell)
  └─ bg-elevated  #1d1a1c  (cards)
       └─ bg-overlay   #27252a  (hover, table rows)
            └─ bg-popover   #221f23  (modal, dropdown)

bg-warm  #453027  (cross-cutting warm callout — sidebar promo, accent areas)
```

## Light Mode

**Deferred to Phase 8** per user decision 2026-05-12. Will inject under `[data-theme="light"]` selector inside the same `tokens.css`. No code changes outside this file required.

## Lint Gate

Phase 0 enforces: no raw Tailwind colors, no generic radius (`rounded-sm/md/lg/xl/2xl/3xl`), no raw spacing (`p-4/m-2/gap-3`), no invalid double-opacity. Run `npm run lint:tokens` to check v4 paths only.

## Files

| File | Purpose |
|---|---|
| `tokens.css` | All design tokens (3 tiers, fonts, spacing, radius, shadow, motion, z) |
| `lib/cn.ts` | className combiner (clsx-like, zero deps) |
| `index.ts` | Barrel — currently exports `cn`, will add components in Phase 2-3 |
| `components/` | Component primitives (added Phase 2-3, 30 total) |

## Roadmap

| Phase | Adds |
|---|---|
| 1 ← here | tokens.css + cn + README |
| 2 | 8 core primitives (button, input, badge, surface-card, modal, dropdown, data-table, page-header) |
| 3 | 22 remaining primitives after visual mockup approval |
| 4 | First v4 page (Dashboard) + `data-ui="v4"` activation + feature flag |
| 5-8 | 9 more page rebuilds |
| 9 | Cutover + delete v3 |
