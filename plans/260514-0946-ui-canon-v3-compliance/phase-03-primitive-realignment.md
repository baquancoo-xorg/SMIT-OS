# Phase 3 — Primitive Realignment (25 existing + 13 missing)

## Context Links
- Parent: [plan.md](plan.md)
- Prev: [phase-02-token-foundation.md](phase-02-token-foundation.md)
- Audit: `docs/ref-ui-playground/audit-report.md` (from Phase 0)
- Contract: `docs/ui-design-contract.md` §17-§23 (forms), §32-§34 (feedback), §36 (overlay), §41 (profile), §27 (table), §51 (missing primitive specs)
- Stitch ref: `docs/ref-ui-playground/stitch-screens/05,06,07,08,09.png`

## Overview
- **Date:** 2026-05-14
- **Priority:** P1
- **Status:** pending
- **Description:** Refactor 25 existing v5/ui primitives per audit matrix + author 13 missing primitives per §51, all with dark+light parity.

## Key Insights
- Primitives are reused across 10 pages — drift here = drift everywhere.
- "Primitive hot-add" rule per Phase 6 may inject extra primitives mid-flight; D9 contract backfill allowed.
- Radix UI is established pattern (custom-select, dropdown-menu use Radix) → continue for new ones.
- Light parity ⇒ no `bg-white`/`text-black` ad-hoc; use surface/foreground tokens.
- File size cap 200 lines per `docs/code-standards.md` — split where needed.

## Requirements

### Functional
**Sub-phase A (25 existing — refactor):**
- Apply audit matrix actions per primitive.
- Eliminate forbidden patterns (hex, bg-white, shadow-lg|xl, rounded-xl|2xl, font-black) per Phase 2 gate.
- Dark + light variant each.

**Sub-phase B (13 missing — create):**
- `tooltip.tsx` — Radix tooltip wrap, keyboard reachable (§36)
- `checkbox.tsx` — Radix checkbox, surface + accent border/check, NO solid orange (§20)
- `switch.tsx` — Radix switch (§20)
- `radio.tsx` — Radix radio-group (§20)
- `textarea.tsx` — auto-resize optional (§21)
- `progress-bar.tsx` — determinate + indeterminate (§21)
- `file-upload.tsx` — drag-drop + a11y (§21)
- `multi-select.tsx` — chip-based selection (§18)
- `combobox.tsx` — searchable + async load support (§18)
- `banner.tsx` — info/success/warn/error variants (§32)
- `search-input.tsx` — wrap Input iconLeft=Search (§17)
- `avatar.tsx` — token radius, no arbitrary shadow (§41)
- `pagination.tsx` — icon buttons + text (§27)

### Non-Functional
- Each primitive file ≤200 lines.
- All Radix-based have keyboard nav + aria attributes verified.
- Each primitive has dark + light visual confirmed against Stitch ref / playground.
- Export from `src/components/v5/ui/index.ts`.

## Architecture
```
src/components/v5/ui/
├── (25 existing — refactored)
│   badge, button, card, confirm-dialog, custom-select, data-table,
│   date-picker, date-range-picker, dropdown-menu, empty-state,
│   error-boundary, filter-chip, form-dialog, glass-card, input,
│   kpi-card, modal, notification-center, notification-toast,
│   page-header, skeleton, sortable-th, spinner, status-dot,
│   tab-pill, table-row-actions, table-shell
├── tooltip.tsx              (NEW)
├── checkbox.tsx             (NEW)
├── switch.tsx               (NEW)
├── radio.tsx                (NEW)
├── textarea.tsx             (NEW)
├── progress-bar.tsx         (NEW)
├── file-upload.tsx          (NEW)
├── multi-select.tsx         (NEW)
├── combobox.tsx             (NEW)
├── banner.tsx               (NEW)
├── search-input.tsx         (NEW)
├── avatar.tsx               (NEW)
├── pagination.tsx           (NEW)
└── index.ts                 (extend)
```

Primitive contract pattern (all NEW primitives):
```
- Interface signature per §51
- State machine (idle / hover / focus / disabled / error)
- a11y contract (aria-*, keyboard map, screen-reader label)
- Dark + light visual via token consumers only
- Storybook-like demo wired into /v5/playground (Phase 5)
```

## Related Code Files

**Sub-phase A modify (25):**
- `src/components/v5/ui/badge.tsx`
- `src/components/v5/ui/button.tsx`
- `src/components/v5/ui/card.tsx`
- `src/components/v5/ui/confirm-dialog.tsx`
- `src/components/v5/ui/custom-select.tsx`
- `src/components/v5/ui/data-table.tsx`
- `src/components/v5/ui/date-picker.tsx`
- `src/components/v5/ui/date-range-picker.tsx`
- `src/components/v5/ui/dropdown-menu.tsx`
- `src/components/v5/ui/empty-state.tsx`
- `src/components/v5/ui/error-boundary.tsx`
- `src/components/v5/ui/filter-chip.tsx`
- `src/components/v5/ui/form-dialog.tsx`
- `src/components/v5/ui/glass-card.tsx`
- `src/components/v5/ui/input.tsx`
- `src/components/v5/ui/kpi-card.tsx`
- `src/components/v5/ui/modal.tsx`
- `src/components/v5/ui/notification-center.tsx`
- `src/components/v5/ui/notification-toast.tsx`
- `src/components/v5/ui/page-header.tsx`
- `src/components/v5/ui/skeleton.tsx`
- `src/components/v5/ui/sortable-th.tsx`
- `src/components/v5/ui/spinner.tsx`
- `src/components/v5/ui/status-dot.tsx`
- `src/components/v5/ui/tab-pill.tsx`
- `src/components/v5/ui/table-row-actions.tsx`
- `src/components/v5/ui/table-shell.tsx`

**Sub-phase B create (13):**
- `src/components/v5/ui/tooltip.tsx`
- `src/components/v5/ui/checkbox.tsx`
- `src/components/v5/ui/switch.tsx`
- `src/components/v5/ui/radio.tsx`
- `src/components/v5/ui/textarea.tsx`
- `src/components/v5/ui/progress-bar.tsx`
- `src/components/v5/ui/file-upload.tsx`
- `src/components/v5/ui/multi-select.tsx`
- `src/components/v5/ui/combobox.tsx`
- `src/components/v5/ui/banner.tsx`
- `src/components/v5/ui/search-input.tsx`
- `src/components/v5/ui/avatar.tsx`
- `src/components/v5/ui/pagination.tsx`

**Modify:** `src/components/v5/ui/index.ts` (extend exports)

## Implementation Steps
1. Open `audit-report.md` matrix → group 25 by effort (S/M/L).
2. **Sub-phase A — refactor in 3 batches**:
   - Batch A1 (Small): badge, status-dot, spinner, skeleton, glass-card, filter-chip, tab-pill, page-header → quick drift fixes.
   - Batch A2 (Medium): button, input, card, kpi-card, custom-select, dropdown-menu, date-picker, date-range-picker, sortable-th, table-row-actions, empty-state, error-boundary, notification-toast.
   - Batch A3 (Large): data-table, table-shell, modal, form-dialog, confirm-dialog, notification-center.
3. Per primitive: read existing → apply audit action → light variant → grep clean → smoke test in `/v4/playground` (or `/v5/playground` once Phase 5).
4. **Sub-phase B — 13 NEW primitives** (group by complexity):
   - Batch B1 (Radix wraps simple): tooltip, checkbox, switch, radio.
   - Batch B2 (Form inputs): textarea, search-input, progress-bar.
   - Batch B3 (Compound): file-upload, multi-select, combobox.
   - Batch B4 (Feedback + nav): banner, avatar, pagination.
5. Per NEW primitive:
   - Read Stitch ref screen for visual canon.
   - Read §51 spec → interface signature.
   - Write component file ≤200 lines.
   - Add to `index.ts` export.
   - Wire to playground demo route (Phase 5 delivers route; stub demo entries here).
6. Run `npm run lint:ui-canon` after each batch — fix violations.
7. Run `npm run build` after each batch — must compile.
8. Manual dark+light smoke per primitive.

## Todo List

### Sub-phase A — refactor existing
- [ ] Batch A1 (Small × 8): badge, status-dot, spinner, skeleton, glass-card, filter-chip, tab-pill, page-header
- [ ] Batch A2 (Medium × 13): button, input, card, kpi-card, custom-select, dropdown-menu, date-picker, date-range-picker, sortable-th, table-row-actions, empty-state, error-boundary, notification-toast
- [ ] Batch A3 (Large × 6): data-table, table-shell, modal, form-dialog, confirm-dialog, notification-center
- [ ] Run `lint:ui-canon` post Sub-phase A — zero new violations
- [ ] `npm run build` clean

### Sub-phase B — create missing
- [ ] Batch B1 (Radix simple × 4): tooltip, checkbox, switch, radio
- [ ] Batch B2 (Form inputs × 3): textarea, search-input, progress-bar
- [ ] Batch B3 (Compound × 3): file-upload, multi-select, combobox
- [ ] Batch B4 (Feedback+nav × 3): banner, avatar, pagination
- [ ] Extend `src/components/v5/ui/index.ts` exports
- [ ] Run `lint:ui-canon` — zero violations
- [ ] `npm run build` clean
- [ ] Manual dark+light smoke per primitive

## Success Criteria
- 25 existing primitives refactored per audit matrix.
- 13 missing primitives created per §51 spec.
- All files ≤200 lines.
- `lint:ui-canon` violations in `v5/ui/**` = 0.
- `index.ts` exports complete.
- `npm run build` clean.
- Dark + light visual verified per primitive.

## Risk Assessment
| Risk | Severity | Mitigation |
|---|---|---|
| File > 200 lines on complex primitive (multi-select, combobox, data-table) | Med | Split into sub-modules (e.g. `data-table/` folder with `cell.tsx`, `header.tsx`) |
| Radix peer-dep version mismatch | Low | Use same Radix major version as existing primitives |
| Breaking changes to primitive API affect existing pages | High | Document API diff in audit notes; defer page consumer update to Phase 6 |
| Light variant breaks dark in untouched paths | Med | Use token references only — no theme conditionals in primitive code |
| Storybook-like demo absent until Phase 5 | Low | Stub demo entries; defer wiring until `/v5/playground` lands |

## Security Considerations
- File upload primitive: validate file type + size client-side per §51 spec (server-side validation out of scope).
- A11y per WCAG 2.1 AA: keyboard nav + aria labels for every interactive primitive.

## Next Steps
- Blocks Phase 4 (chart wrappers may use tooltip primitive).
- Blocks Phase 5 (shell uses avatar, banner, search-input).
- Blocks Phase 6 (all pages consume primitives).
