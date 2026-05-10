# Phase 04 — Batch 3: Organisms

**Date:** 2026-05-10
**Session:** `/ck:cook` Phase 4 batch 3 (continuation of batches 1+2)
**Effort actual:** ~2h (vs ~4-5h estimate)
**Status:** ✅ DONE

---

## Deliverables — 7 Organisms in `src/components/ui/v2/`

| # | Component | File | Highlights |
|---|---|---|---|
| 1 | GlassCard | `glass-card.tsx` (+ story) | 4 variants (surface/raised/ghost/outlined) × 4 padding (none/sm/md/lg) + interactive hover + decorative blob (5 accent colors). Replaces 30+ ad-hoc usages from Phase 1 audit. |
| 2 | Modal | `modal.tsx` (+ story) | Headless UI `Dialog` + `Transition`. 5 sizes (sm/md/lg/xl/fullscreen). Mobile = bottom sheet, desktop = centered. Lazy mount. ESC + outside click + focus trap (Headless UI). Optional icon header + accent. |
| 3 | ConfirmDialog | `confirm-dialog.tsx` (+ story) | Modal preset for destructive/warning/info confirms. **Type-to-confirm** option for irreversible actions. Async-aware (`isLoading` disables ESC + close). |
| 4 | DropdownMenu | `dropdown-menu.tsx` (+ story) | Headless UI `Menu` wrapper. Items support icon, destructive style, link/button, disabled, trailing separator. Anchor positioning (4 corners). Bonus `<DropdownTriggerChevron>` helper. |
| 5 | NotificationToast | `notification-toast.tsx` (+ story) | Full toast system: `ToastProvider` context + `useToast()` hook + `<NotificationToast>` visual. 4 tones (success/warning/error/info), auto-dismiss timer, action slot, ARIA `alert`/`status` per tone. CSS keyframe `.toast-enter` added to `src/index.css`. |
| 6 | FormDialog | `form-dialog.tsx` (+ story) | Modal + native `<form>`. Submit on Enter works. Caller manages validation (Zod, RHF, controlled — all work). Submit button uses `form="form-dialog-form"` attr to live in footer. Optional `footerLeft` for "Required" notice. |
| 7 | DataTable | `data-table.tsx` (+ story) | Generic typed `<T>`. Sort (controlled or uncontrolled). Pagination (always controlled). Density (compact/normal/comfortable). Loading (skeleton rows). Row click. Column responsive hiding (`hideBelow: sm/md/lg`). Empty state slot (defaults to `<EmptyState variant="inline">`). |

### Barrel updated
`src/components/ui/v2/index.ts` now exports 18 components (6 atoms + 5 molecules + 7 organisms) with all type aliases.

### CSS addition
`src/index.css` gained `@keyframes toast-slide-in` + `.toast-enter` utility class (with `prefers-reduced-motion` respect). Reason: tailwindcss-animate not in deps; using a single hand-rolled keyframe avoids dep churn.

---

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ Clean (after relaxing DataTable story Meta type to drop generic ComponentType cast) |
| `npx vite build` | ✅ Clean 2.14s |
| `npm run build-storybook` | ✅ Clean 3.42s, **18/18 stories** present in `storybook-static/assets/` |
| Existing pages | ✅ Unchanged (v2 namespace + new CSS keyframe is additive) |

---

## Design Token Adherence

All 7 organisms drive styling **only** from Phase 2 tokens:
- Color: semantic only (`bg-error-container`, `text-on-warning-container`, etc.)
- Radius: semantic (`rounded-card`, `rounded-modal`, `rounded-button`, `rounded-chip`)
- Z-index: `z-modal` (Modal+ConfirmDialog), `z-dropdown` (DropdownMenu), `z-toast` (NotificationToast)
- Motion: `motion-fast`/`motion-medium` + `ease-standard`/`ease-decelerate`. Headless UI `Transition` enter/leave durations referenced via `motion-medium` + `motion-fast` classes.
- Focus: relies on global `:focus-visible` rule
- Toast `.toast-enter` keyframe uses `--duration-medium` + `--ease-decelerate` tokens

Zero motion-library dep. Zero ad-hoc colors.

---

## Decisions Locked

- **D10**: Toast system = full Provider + hook (vs visual-only). Reason: 6/8 pages will need imperative toasts (save, error, sync). Cost is one `useContext` lookup per call site — negligible.
- **D11**: FormDialog uses **native HTML form** + caller-managed validation. NO react-hook-form. Reason: RHF adds ~20KB and forces a paradigm; native form + Zod (already in deps) covers all SMIT-OS forms (≤ 8 fields each). Submit button uses `form="form-dialog-form"` attribute trick to render outside the form element while still submitting.
- **D12**: ConfirmDialog `typeToConfirm` is opt-in (not auto). Reason: type-to-confirm friction is justified only for irreversible ops with high blast radius (delete entire project), not routine deletes (delete one OKR).
- **D13**: DataTable sort is **column-supplied comparator** (`col.sort: (a,b) => number`), not key-based auto-sort. Reason: explicit > magic; supports custom locale-aware string sort, numeric, date, etc. without runtime type sniffing.
- **D14**: DataTable pagination is **always controlled**. Reason: caller already owns query state (page from URL, query string, etc.); built-in state would force prop drilling for every fetch. Total page count derived from `total / pageSize`.
- **D15**: NotificationToast keyframe added to `src/index.css` (not Tailwind plugin). Reason: one keyframe is cheaper than `tailwindcss-animate` plugin (~50KB devDep + plugin config). Single source: `src/index.css` (where Phase 2 tokens already live).
- **D16**: Modal mobile pattern = bottom sheet (slides up + rounded top corners), desktop = centered card. Headless UI `Transition` handles enter/leave with `sm:` breakpoint switching the transform.

---

## Pitfalls Recorded

1. **Generic component + Storybook Meta**: DataTable is generic over `<T>`, but `Meta<typeof DataTable>` infers concrete type and conflicts with `data` array shape. Fix: drop the typed annotation, use bare `Meta` and `StoryObj` for the file. Stories still type-check internally because they `render: () => <DataTable<Lead>...>` with concrete data.
2. **`tailwindcss-animate` not installed**: Initial NotificationToast tried `animate-in slide-in-from-right`. Fix: hand-roll `@keyframes toast-slide-in` in `src/index.css`. Token-driven duration + easing.
3. **Headless UI v2 imports**: All 4 Headless UI primitives used (`Dialog`, `Menu`, `Popover`, `Transition`) imported as named subcomponents (`DialogPanel`, `MenuItem`, etc.) per v2 API. No legacy `Headless.X` namespace usage.
4. **Form submit from Modal footer**: Submit button needs to live in Modal footer (per design) but must trigger the form's submit handler. Solution: give the `<form>` an `id="form-dialog-form"` and the button an `attr="submit"` + `form="form-dialog-form"`. Works without Modal/Form being aware of each other.

---

## Component Coverage Status (Phase 4)

| Tier | Target | Done | Pending |
|---|---|---|---|
| Atoms | 6 | ✅ 6 | — |
| Molecules | 5 | ✅ 5 | — |
| Organisms | 7 | ✅ 7 | — |
| Layout | 5 | 0 | Sidebar, Header, AppLayout, NotificationCenter, OkrCycleCountdown |
| Misc | 3 | 0 | ErrorBoundary v2, NotFoundPage, LoadingSkeleton (overlap with Skeleton atom — drop?) |
| **Total** | **26** | **18 (69%)** | **8** |

---

## Next Batch — Layout (Batch 4)

**Components (5):**
1. `<Sidebar />` — nav items + group + active state. Headless UI Disclosure for collapsible groups? Or simple flat list?
2. `<Header />` — logo + breadcrumb slot + user menu (DropdownMenu) + notification bell
3. `<AppLayout />` — composition wrapper. Slots: sidebar, header, main, footer
4. `<NotificationCenter />` — slide-in panel (Headless UI Dialog with side variant?)
5. `<OkrCycleCountdown />` — Q-deadline countdown widget rendered in Header

**Estimate:** ~2-3h. Sidebar + AppLayout are the heaviest (~150 LOC each). Others light.

**Open Q before Batch 4:** Sidebar mobile pattern — slide-out overlay or bottom-nav? Existing v1 sidebar is desktop-only with a hamburger trigger. Decision: keep slide-out overlay (matches mockup batch 1) — Headless UI Dialog with `side="left"` variant. Defer to next session start.

---

## Files Changed (Batch 3)

```
A  src/components/ui/v2/glass-card.tsx
A  src/components/ui/v2/glass-card.stories.tsx
A  src/components/ui/v2/modal.tsx
A  src/components/ui/v2/modal.stories.tsx
A  src/components/ui/v2/confirm-dialog.tsx
A  src/components/ui/v2/confirm-dialog.stories.tsx
A  src/components/ui/v2/dropdown-menu.tsx
A  src/components/ui/v2/dropdown-menu.stories.tsx
A  src/components/ui/v2/notification-toast.tsx
A  src/components/ui/v2/notification-toast.stories.tsx
A  src/components/ui/v2/form-dialog.tsx
A  src/components/ui/v2/form-dialog.stories.tsx
A  src/components/ui/v2/data-table.tsx
A  src/components/ui/v2/data-table.stories.tsx
M  src/components/ui/v2/index.ts                          (added 7 organism exports + types)
M  src/index.css                                          (+ @keyframes toast-slide-in + .toast-enter)
M  plans/260510-0358-ui-system-redesign/plan.md
M  plans/260510-0358-ui-system-redesign/phase-04-component-library.md
A  plans/260510-0358-ui-system-redesign/reports/phase-04-batch-3-organisms.md  (this file)
```

---

## Open Questions

- Sidebar mobile collapse pattern — confirmed: Headless UI Dialog overlay (Phase 3 mockup batch 1 already shows this).
- `LoadingSkeleton` planned in misc tier overlaps with `Skeleton` atom. Drop from plan or keep as preset wrappers (e.g., `<TableLoadingSkeleton />`)? Recommendation: drop — caller composes Skeleton atoms instead. Phase 4 misc tier shrinks from 3 to 2.
- Header `NotificationCenter` toggle — same component as standalone `<NotificationCenter>` org or separate? Plan to merge: NotificationCenter exposes `<NotificationCenter.Trigger />` + `<NotificationCenter.Panel />` compound API. Defer to Batch 4.
