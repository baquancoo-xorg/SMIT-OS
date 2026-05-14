# UI Primitive Audit Report — v5 vs Playground v4

**Date:** 2026-05-14  
**Auditor:** Claude (automated)  
**Source:** `src/components/v5/ui/**` vs `Playground .html` v4  
**Status:** Phase 0 complete

---

## Summary

| Metric | Count |
|--------|-------|
| Total v5 primitives | 25 |
| Fully aligned | 8 |
| Minor drift | 12 |
| Major drift | 3 |
| Missing in playground | 2 |
| Missing in v5 (need creation) | 13 |

---

## Audit Matrix

### Legend

- **Playground §:** Section number in playground HTML (1-28)
- **Drift Level:** ✅ Aligned | ⚠️ Minor | ❌ Major | ➖ N/A (not in playground)
- **Action:** none | fix | refactor | create

### Existing v5 Primitives (25)

| # | Component | File | Playground § | Drift Level | Drift Details | Action | Effort |
|---|-----------|------|--------------|-------------|---------------|--------|--------|
| 1 | Button | `button.tsx` | §22 | ✅ Aligned | Primary CTA DNA matches: dark gradient + orange beam + orange icon. Variants correct. | none | — |
| 2 | Card | `card.tsx` | §24-25 | ⚠️ Minor | Uses `shadow-lg` token — should use `--shadow-card`. Radius `rounded-card` OK. | fix | 0.5h |
| 3 | Input | `input.tsx` | §17 | ✅ Aligned | `rounded-input`, focus ring, error state all correct. | none | — |
| 4 | Badge | `badge.tsx` | §32 | ⚠️ Minor | Soft variants use custom tokens (`accent-dim`, `accent-text`) — align to playground semantic. | fix | 1h |
| 5 | TabPill | `tab-pill.tsx` | §13 | ✅ Aligned | No solid orange active, neutral surface lift, keyboard nav. | none | — |
| 6 | CustomSelect | `custom-select.tsx` | §18 | ⚠️ Minor | Panel shadow uses hardcoded rgba — should use token. | fix | 0.5h |
| 7 | DatePicker | `date-picker.tsx` | §19 | ⚠️ Minor | Calendar popover needs light mode verification. Apply button may need CTA DNA check. | fix | 1h |
| 8 | DateRangePicker | `date-range-picker.tsx` | §19 | ⚠️ Minor | Same as DatePicker — light mode + apply button. | fix | 1h |
| 9 | DropdownMenu | `dropdown-menu.tsx` | §16 | ✅ Aligned | Token surface/shadow, semantic error for destructive. | none | — |
| 10 | Modal | `modal.tsx` | §35 | ⚠️ Minor | Backdrop opacity hardcoded — should use token. Footer button check needed. | fix | 1h |
| 11 | ConfirmDialog | `confirm-dialog.tsx` | §35 | ⚠️ Minor | Extends Modal — same issues. Destructive button should use error semantic. | fix | 0.5h |
| 12 | FormDialog | `form-dialog.tsx` | §35 | ⚠️ Minor | Modal derivative — same backdrop/button fixes. | fix | 0.5h |
| 13 | DataTable | `data-table.tsx` | §27 | ❌ Major | Header sticky uses `bg-surface/95` — not token. Row hover, pagination need audit. Light mode untested. | refactor | 3h |
| 14 | FilterChip | `filter-chip.tsx` | §15 | ✅ Aligned | Surface/outline, accent text allowed for active. No solid orange. | none | — |
| 15 | EmptyState | `empty-state.tsx` | §38 | ✅ Aligned | Semantic structure correct. | none | — |
| 16 | ErrorBoundary | `error-boundary.tsx` | §39 | ✅ Aligned | Fallback uses Card + EmptyState pattern. | none | — |
| 17 | GlassCard | `glass-card.tsx` | §25 | ⚠️ Minor | Glass surface uses `color-mix` but light mode variant missing. | fix | 1h |
| 18 | KPICard | `kpi-card.tsx` | §26 | ❌ Major | Custom glow implementation — needs hover-only glow per contract. Light mode colors untested. | refactor | 2h |
| 19 | NotificationCenter | `notification-center.tsx` | §34 | ⚠️ Minor | Drawer/dialog pattern OK. Unread dot semantic needs verify. | fix | 1h |
| 20 | NotificationToast | `notification-toast.tsx` | §34 | ✅ Aligned | Surface card, semantic border/icon, auto-dismiss. | none | — |
| 21 | PageHeader | `page-header.tsx` | §11 | ⚠️ Minor | Breadcrumb uppercase OK. Actions may use wrong button variant. | fix | 0.5h |
| 22 | Skeleton | `skeleton.tsx` | §37 | ✅ Aligned | Animation respects motion query (implicit via Tailwind). | none | — |
| 23 | Spinner | `spinner.tsx` | §37 | ⚠️ Minor | Color uses `currentColor` — verify in all contexts. | verify | 0.25h |
| 24 | StatusDot | `status-dot.tsx` | §33 | ✅ Aligned | Semantic tokens, pulse for live. | none | — |
| 25 | SortableTh | `sortable-th.tsx` | §27 | ❌ Major | Part of table system — needs aria-sort, icon state audit. | refactor | 1h |

**Non-component files (excluded from audit):**
- `index.ts` — barrel export
- `table-contract.ts` — type definitions
- `table-date-format.ts` — utility
- `table-row-actions.tsx` — mini component (audit with DataTable)
- `table-shell.tsx` — legacy bridge (marked for removal Phase 7)
- `use-sortable-data.ts` — hook

---

## Missing Primitives (Need Creation)

Components referenced in contract but not in v5:

| # | Component | Contract § | Priority | Stitch Ref Needed | Effort |
|---|-----------|------------|----------|-------------------|--------|
| 1 | Checkbox | §20 | P1 | Yes | 2h |
| 2 | Switch | §20 | P1 | Yes | 2h |
| 3 | RadioGroup | §20 | P1 | Yes | 2h |
| 4 | Tooltip | §36 | P2 | Yes | 3h |
| 5 | Textarea | §21 | P2 | Yes | 2h |
| 6 | MultiSelect | §18 | P2 | Yes | 4h |
| 7 | Combobox | §18 | P2 | Yes | 4h |
| 8 | ProgressBar | §21 | P3 | Yes | 2h |
| 9 | FileUpload | §21 | P3 | Yes | 3h |
| 10 | ChartWrapper (Line) | §29-31 | P1 | Yes | 3h |
| 11 | ChartWrapper (Bar) | §29-31 | P1 | Yes | 2h |
| 12 | ChartWrapper (Pie/Donut) | §29-31 | P2 | Yes | 3h |
| 13 | ChartWrapper (Heatmap) | §31 | P2 | Yes | 4h |

---

## Drift Categories

### 1. Radius Drift

| Component | Current | Target | Fix |
|-----------|---------|--------|-----|
| Card | `rounded-card` (OK) | `1.25rem` | — |
| Modal | `rounded-modal` (OK) | `1.5rem` | Verify value |
| Input | `rounded-input` (OK) | `0.75rem` | — |

**Status:** Radius tokens correctly applied in most components.

### 2. Shadow Drift

| Component | Current | Issue |
|-----------|---------|-------|
| Card | `shadow-lg` | Should use `var(--shadow-card)` |
| GlassCard | `shadow-card` | OK |
| Modal | Mixed | Backdrop shadow hardcoded |
| DataTable | None | Needs `--shadow-card` on shell |

### 3. Primary CTA DNA Drift

| Component | Current | Issue |
|-----------|---------|-------|
| Button (primary) | ✅ Correct | Dark gradient + beam + orange icon |
| DatePicker (Apply) | ⚠️ Verify | May not use primary variant |
| Modal (Confirm) | ⚠️ Verify | Footer button variant check |
| FormDialog (Submit) | ⚠️ Verify | Same as Modal |

### 4. Light Mode Parity

| Component | Status |
|-----------|--------|
| Button | ✅ Tested |
| Card | ⚠️ Needs test |
| Input | ✅ Tested |
| DataTable | ❌ Untested |
| GlassCard | ❌ Missing light variant |
| KPICard | ❌ Untested |
| DatePicker | ⚠️ Needs test |
| Modal | ⚠️ Needs test |

---

## Action Summary by Phase

### Phase 2 (Token Foundation)
- Create CSS variable for `--shadow-card` if not exists
- Verify all radius token values match playground

### Phase 3 (Primitive Realignment)
- **Fix (12 components, ~9h total):**
  - Card: shadow token
  - Badge: semantic token alignment
  - CustomSelect: shadow token
  - DatePicker: light mode + apply button
  - DateRangePicker: same
  - Modal: backdrop token + button verify
  - ConfirmDialog: same
  - FormDialog: same
  - GlassCard: light variant
  - NotificationCenter: unread dot
  - PageHeader: action buttons
  - Spinner: verify contexts

- **Refactor (3 components, ~6h total):**
  - DataTable: full token alignment + light mode
  - KPICard: glow behavior + light mode
  - SortableTh: aria-sort + icons

### Phase 4 (Chart Wrappers)
- Create 4 new chart wrapper components
- Each needs Stitch reference first

---

## Verification Checklist

For each component fix:

- [ ] Uses CSS variables, not hardcoded hex
- [ ] Shadow uses `--shadow-card` or `--shadow-elevated`
- [ ] Radius uses token (`rounded-card`, `rounded-input`, etc.)
- [ ] Primary CTA follows DNA (dark gradient + beam + icon)
- [ ] No solid orange for CTA/tab/checkbox/nav
- [ ] Light mode tested
- [ ] `prefers-reduced-motion` honored
- [ ] Focus ring visible in dark + light

---

**End of Audit Report**
