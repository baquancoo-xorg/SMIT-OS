# Phase 04 — Batch 2: Molecules

**Date:** 2026-05-10
**Session:** `/ck:cook` Phase 4 batch 2 (continuation of batch 1)
**Effort actual:** ~1.5h (vs ~3-4h estimate)
**Status:** ✅ DONE

---

## Deliverables — 5 Molecules in `src/components/ui/v2/`

| # | Component | File | Highlights |
|---|---|---|---|
| 1 | PageHeader | `page-header.tsx` (+ story) | Breadcrumb (chevron sep) + title with **italic accent** word + description + action slot. Mobile collapses to vertical stack. Phase 1 audit signature pattern. |
| 2 | TabPill | `tab-pill.tsx` (+ story) | Pill-style controlled tablist. Generic `TabPillItem<T>` for typed values. Keyboard nav (Arrow/Home/End). Optional badge `count`. ARIA tablist pattern. |
| 3 | EmptyState | `empty-state.tsx` (+ story) | Icon + title + desc + actions. Optional `decorative` blob (Bento). `card` (default) or `inline` variant. Replaces 5 audit variants. |
| 4 | KpiCard | `kpi-card.tsx` (+ story) | **Bento signature** metric. Decorative blob (5 accent colors), hover scale via vanilla CSS, trend auto-inferred from delta sign. Up/down/flat icons. Loading state. |
| 5 | DateRangePicker | `date-range-picker.tsx` (+ story) | Headless UI Popover + 7 default presets (Today/Yesterday/7d/30d/ThisMonth/LastMonth/ThisQuarter) + custom from/to native date inputs. `DEFAULT_PRESETS` exported. |

### Barrel updated
`src/components/ui/v2/index.ts` now re-exports 11 components (6 atoms + 5 molecules) with all type aliases.

---

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ Clean (after fixing `satisfies Meta<typeof X>` issue on render-only stories) |
| `npx vite build` | ✅ Clean 2.08s |
| `npm run build-storybook` | ✅ Clean 3.20s, 11/11 stories present |
| Existing pages | ✅ Unchanged (v2 namespace isolated) |

---

## Design Token Adherence

All 5 molecules drive styling **only** from Phase 2 tokens:
- Color: semantic only (`bg-primary-container/50`, `text-on-success-container`, etc.)
- Radius: semantic (`rounded-card`, `rounded-button`, `rounded-input`, `rounded-chip`)
- Typography: clamp-based via `[length:var(--text-h2)]` / `var(--text-label)` etc
- Motion: `motion-fast` / `motion-medium` + `ease-standard`
- Z-index: `z-dropdown` for Popover panel
- Focus ring: relies on global `:focus-visible` rule

Zero ad-hoc colors. Zero `rounded-2xl` violations. Vanilla CSS for KpiCard hover (no motion-lib dep).

---

## Decisions Locked

- **D5**: KpiCard hover anim = vanilla CSS (`hover:scale-[1.015]` + `transition-all motion-medium`). Decision matrix: `motion/react` already in app bundle (~32KB), but vanilla covers 95% of needs and avoids cascading dep into v2. Reserve motion-lib for organisms with complex orchestration (e.g., Modal entrance choreography).
- **D6**: TabPill is generic over value type `T extends string`. Required `forwardRef` cast workaround used: `as <T extends string>(...) => React.ReactElement`. Slightly ugly but enables `<TabPill<MyEnum>>` typed usage downstream.
- **D7**: DateRangePicker uses **native `<input type="date">`** for custom range, not a custom calendar grid. Reasons: (a) accessibility built-in (keyboard, screen reader, locale), (b) no extra dep, (c) ~150 lines vs ~500 for full grid. Trade-off: less polished UI on macOS Safari, but acceptable for Phase 4 scope. Custom calendar deferred to Phase 8 if needed.
- **D8**: PageHeader title pattern is `<title text>` + optional italic accent. Italic via `<em>` (semantic + native italic). Story examples teach pattern: `title="Q2 Objectives & "` + `accent="Key Results"`.
- **D9**: All molecule stories use `Meta<typeof X>` type annotation instead of `satisfies` to allow render-only stories with required component props (avoids ~10 spurious TS2322 errors).

---

## Pitfalls Recorded

1. **`satisfies Meta<typeof Component>` strict-types render-only stories** when component has required props. Fix: switch to `const meta: Meta<typeof X> = {...}` annotation form. Loses some inference but unblocks render-only stories.
2. **Generic component + Storybook Meta type**: `TabPill` is generic but Storybook's `Meta<typeof TabPill>` infers concrete `TabPill<string>`. Acceptable since stories pass concrete string values anyway.
3. **DateRangePicker `endOfDay` helper**: must zero-pad time to `23:59:59.999` so end-of-day inclusive comparisons work. Custom range `to` is converted via `endOfDay()` on apply (not on every keystroke).

---

## Component Coverage Status (Phase 4)

| Tier | Target | Done | Pending |
|---|---|---|---|
| Atoms | 6 | ✅ 6 | — |
| Molecules | 5 | ✅ 5 | — |
| Organisms | 7 | 0 | GlassCard, DataTable, Modal, NotificationToast, FormDialog, DropdownMenu, ConfirmDialog |
| Layout | 5 | 0 | Sidebar, Header, AppLayout, NotificationCenter, OkrCycleCountdown |
| Misc | 3 | 0 | ErrorBoundary v2, NotFoundPage, LoadingSkeleton variants (overlap with Skeleton atom) |
| **Total** | **26** | **11 (42%)** | **15** |

---

## Next Batch — Organisms (Batch 3)

**Components (7):**
1. `<GlassCard />` — wrapper container (replaces 30+ ad-hoc usages found in Phase 1)
2. `<Modal />` — Headless UI Dialog wrapper, size variants, lazy mount
3. `<DropdownMenu />` — Headless UI Menu wrapper
4. `<ConfirmDialog />` — destructive action confirm
5. `<NotificationToast />` — success/error/info, auto-dismiss
6. `<DataTable />` — sortable, paginated, density variants
7. `<FormDialog />` — Modal + form combo with validation slot

**Estimate:** ~4-5h. DataTable is the heaviest (~250 lines). Modal/Dropdown/ConfirmDialog/FormDialog are layered Headless UI compositions.

**Blocker check before Batch 3:** Decide on form validation approach for FormDialog — Zod (already in deps) + react-hook-form, or controlled inputs with manual validation? RHF is not in deps; adding it = +20KB vendor chunk. Defer decision to next session kickoff.

---

## Files Changed (Batch 2)

```
A  src/components/ui/v2/page-header.tsx
A  src/components/ui/v2/page-header.stories.tsx
A  src/components/ui/v2/tab-pill.tsx
A  src/components/ui/v2/tab-pill.stories.tsx
A  src/components/ui/v2/empty-state.tsx
A  src/components/ui/v2/empty-state.stories.tsx
A  src/components/ui/v2/kpi-card.tsx
A  src/components/ui/v2/kpi-card.stories.tsx
A  src/components/ui/v2/date-range-picker.tsx
A  src/components/ui/v2/date-range-picker.stories.tsx
M  src/components/ui/v2/index.ts                          (added 5 molecule exports)
M  plans/260510-0358-ui-system-redesign/plan.md
M  plans/260510-0358-ui-system-redesign/phase-04-component-library.md
A  plans/260510-0358-ui-system-redesign/reports/phase-04-batch-2-molecules.md  (this file)
```

---

## Open Questions

- FormDialog validation lib choice — defer to Batch 3 kickoff. Zod is already in deps; RHF is not.
- Should `Sidebar` v2 use Headless UI Disclosure or build custom? Existing v1 sidebar is custom. Decision deferred to Batch 4.
- Should `Modal` lazy-mount Children only when open, or always mount + hide? Defaults to lazy for perf; needs verification with form state preservation expectations. Defer to Batch 3.
