# Phase 04 — Batch 4: Layout + Misc (FINAL)

**Date:** 2026-05-10
**Session:** `/ck:cook` Phase 4 batch 4 — closing batch
**Effort actual:** ~1.5h (vs ~2-3h estimate)
**Status:** ✅ DONE — Phase 4 implementation complete

---

## Deliverables — 5 Layout + 2 Misc in `src/components/ui/v2/`

| # | Component | File | Highlights |
|---|---|---|---|
| 1 | Sidebar | `sidebar.tsx` (+ story) | Desktop static (lg+), mobile = Dialog overlay slide-in (`-translate-x-full → 0`). Items flat or grouped (Disclosure collapsible). Active item: container bg + accent stripe + `aria-current="page"`. |
| 2 | OkrCycleCountdown | `okr-cycle-countdown.tsx` (+ story) | Live-ticking pill (`setInterval` 60s). Severity color shifts: safe >14d, soon ≤14d, urgent ≤3d, neutral past. ARIA `role="timer"`. |
| 3 | NotificationCenter | `notification-center.tsx` (+ story) | Compound API: `NotificationCenter.Trigger` (bell + count badge with `99+` cap) + `NotificationCenter.Panel` (right slide-in Dialog). Notifications list with relative-time + unread dot + tone-tinted icon. |
| 4 | Header | `header.tsx` (+ story) | Sticky `z-header` + `backdrop-blur-md`. Mobile: hamburger + logo. Desktop: breadcrumb + countdown (md+) + right slot. Logo auto-hides on lg+ when Sidebar shows it (override via `showLogoLg`). |
| 5 | AppLayout | `app-layout.tsx` (+ story) | Composition wrapper — sidebar | (header + main). `<main id="main-content" tabIndex={-1}>` for skip-link target. Optional `withPagePadding`. |
| 6 | ErrorBoundary | `error-boundary.tsx` (+ story) | React class component. Default fallback = GlassCard + retry. `resetKey` auto-resets on change. Dev-mode error message disclosure (`import.meta.env.DEV`). |
| 7 | NotFoundPage | `not-found-page.tsx` (+ story) | Full-page 404 with **dual Bento blobs** (primary top-right + secondary bottom-left). Customizable actions for router integration. |

### Barrel updated — final
`src/components/ui/v2/index.ts` exports **25 components** + all type aliases:
- 6 atoms · 5 molecules · 7 organisms · 5 layout · 2 misc

### Decision: LoadingSkeleton **dropped**
Overlapped with `Skeleton` atom. Pages compose Skeleton primitives directly (e.g., `<Skeleton variant="text" lines={3} />` for paragraph loading). No separate preset wrapper needed — YAGNI.

---

## Final Phase 4 Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ Clean |
| `npx vite build` | ✅ Clean 2.11s |
| `npm run build-storybook` | ✅ Clean 3.48s |
| Stories built | ✅ **25/25** present in `storybook-static/assets/` |
| Existing pages | ✅ Unchanged (v2 namespace + 1 CSS keyframe addition only) |

---

## Decisions Locked

- **D17**: Sidebar mobile = full overlay Dialog (not drawer). Reason: Phase 3 mockup batch 1 confirms overlay pattern. Dialog gives free focus trap + ESC + scroll lock.
- **D18**: NotificationCenter as **compound API** (`Trigger` + `Panel`) instead of single component with optional bell. Reason: Trigger lives in Header, Panel attaches anywhere. Cleaner separation, two render contexts.
- **D19**: Header logo auto-hides on lg+. Reason: Sidebar already renders the logo on lg+; rendering twice creates visual duplication. `showLogoLg` prop overrides for layouts without Sidebar (Login, Onboarding).
- **D20**: AppLayout `<main>` has `tabIndex={-1}` + `id="main-content"`. Reason: enables skip-to-content links from screen readers (a11y best practice). Currently no skip link rendered, but the target exists for Phase 5 to wire up.
- **D21**: OkrCycleCountdown ticks every 60s (not 1s). Reason: minute granularity is sufficient for Q-deadlines (always days/hours away). Saves React renders.
- **D22**: ErrorBoundary uses `import.meta.env?.DEV` (with optional chaining) for dev message visibility. Reason: optional chaining survives Storybook context where `import.meta.env` may be undefined.
- **D23**: NotFoundPage uses dual blobs for stronger Bento signature on a "destination" page (vs single blob on standard cards). Establishes hierarchy.

---

## Pitfalls Recorded

1. **`tabIndex` on `<main>` requires `outline-none`** — otherwise focus shows browser default ring. Fixed by adding `outline-none` class; global `:focus-visible` rule still applies.
2. **`import.meta.env.DEV` undefined in Storybook** — Storybook does inject Vite env, but use optional chaining (`?.`) defensively to handle test runners or other consumers.
3. **NotFoundPage `min-h-[calc(100dvh-var(--header-h))]`** — uses Tailwind v4 arbitrary value with CSS var. Requires `dvh` support (modern browsers); fallback handled by existing `@supports not (height: 100dvh)` block in `src/index.css`.
4. **ErrorBoundary class component cannot use hooks** — implementation uses class lifecycle methods. Pure class component, no hooks-based alternatives in React 19 yet.
5. **`<a>` element with `tabIndex={-1}` would be invalid** for AppLayout main; only used `<main>` element which is fine.

---

## Phase 4 Completion Snapshot

| Metric | Value |
|---|---|
| Plan target | ≥ 20 components (+ Storybook) |
| **Delivered** | **25 components + Storybook 10 + 25 stories** |
| Total LOC v2 | ~3,800 (estimated, src/components/ui/v2/) |
| Total session time | ~6h actual (Batches 1-4) vs ~12-15h plan estimate |
| Build size impact | 0 KB to prod (v2 not yet imported by pages) |
| New devDeps | Storybook 10 + addons (~150MB on disk, 0 KB to prod) |
| New runtime deps | None |

### Acceptance vs original Success Criteria

| Criterion | Status |
|---|---|
| ≥ 20 components built | ✅ 25 |
| Each component has demo + props doc | ✅ Storybook story per component, argTypes documented |
| All variants + states render | ✅ 25/25 stories build clean |
| Lighthouse Accessibility ≥ 95 on demo page | ⚠️ deferred to Phase 8 polish |
| User review demo page → sign-off Phase 5 | 🚦 **BLOCKER** — needs user run `npm run storybook` and sign off |

---

## Files Changed (Batch 4)

```
A  src/components/ui/v2/sidebar.tsx
A  src/components/ui/v2/sidebar.stories.tsx
A  src/components/ui/v2/header.tsx
A  src/components/ui/v2/header.stories.tsx
A  src/components/ui/v2/app-layout.tsx
A  src/components/ui/v2/app-layout.stories.tsx
A  src/components/ui/v2/okr-cycle-countdown.tsx
A  src/components/ui/v2/okr-cycle-countdown.stories.tsx
A  src/components/ui/v2/notification-center.tsx
A  src/components/ui/v2/notification-center.stories.tsx
A  src/components/ui/v2/error-boundary.tsx
A  src/components/ui/v2/error-boundary.stories.tsx
A  src/components/ui/v2/not-found-page.tsx
A  src/components/ui/v2/not-found-page.stories.tsx
M  src/components/ui/v2/index.ts                          (final barrel — 25 components)
M  plans/260510-0358-ui-system-redesign/plan.md           (Phase 4 status: implementation_done)
M  plans/260510-0358-ui-system-redesign/phase-04-component-library.md
A  plans/260510-0358-ui-system-redesign/reports/phase-04-batch-4-layout-misc.md  (this file)
```

---

## Next Steps

1. **User review (BLOCKER for Phase 5)**:
   ```bash
   npm run storybook
   # Open http://localhost:6006 — review all 25 components
   # Sign-off in this report or follow-up message
   ```
2. **Phase 5: Pages Small (Auth + Profile + Settings)** — start once user signs off. JIT mockup per page.
3. **Phase 8 (deferred)**: Lighthouse a11y audit + component library doc + style guide deprecation.

---

## Open Questions

- Should v2 ship a `Tooltip` primitive? Phase 1 audit didn't flag it. Defer until Phase 5 hits a need.
- `<DataTable>` lacks row selection (checkbox). Audit didn't flag it. Defer.
- `<Form>` validation pattern: leaving caller-managed. If Phase 5 finds a recurring boilerplate, consider extracting `useFormFields()` helper into v2.
- Should Storybook a11y addon `test: 'todo'` flip to `'error'` after Phase 5? Yes — once first page migrates, baseline should be enforced.
