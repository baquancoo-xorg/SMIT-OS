# Research: Table Action Button Patterns

**Date:** 2026-04-27 | **Scope:** ProductBacklog, TaskTableView, ReportTableView, DailySync

---

## Three Distinct Patterns Found

### Pattern A — Inline Icon Trio (source of truth candidate)
Location: `ProductBacklog.tsx` — `BacklogTableView` (table rows) + `StoryTreeRow` + `EpicTreeGroup`

```tsx
// Exact classes from BacklogTableView td actions column:
<div className="flex items-center justify-end gap-1">
  <button onClick={...} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
    <Eye size={14} />
  </button>
  <button onClick={...} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
    <Edit2 size={14} />
  </button>
  <button onClick={...} className="p-2 text-slate-400 hover:text-error hover:bg-error/5 rounded-lg transition-all">
    <Trash2 size={14} />
  </button>
</div>
```

Variant in tree rows (grouped view): `p-1.5` padding, `size={12}` icons, `opacity-0 group-hover:opacity-100` — hidden until row hover.
Variant in table: `p-2`, `size={14}`, always visible.

**Actions:** View, Edit, Delete (ordered consistently)

---

### Pattern B — Overflow Dropdown Menu (more_horiz)
Location: `TaskTableView.tsx`

```tsx
<button onClick={() => setOpenMenuId(...)} className="w-8 h-8 ... rounded-xl">
  <span className="material-symbols-outlined">more_horiz</span>
</button>
// Opens AnimatePresence dropdown: View Details / Edit Task / [divider] / Delete Task
```

Dropdown is `absolute right-8 top-12 w-48 bg-white rounded-2xl shadow-lg z-20`.
Each item: `w-full flex items-center gap-3 px-4 py-3 text-sm font-bold`.
Delete separated by `h-px bg-slate-100` divider.

**Actions:** View Details, Edit, Delete (destructive visually separated)

---

### Pattern C — Single Eye-only (read-only action)
Location: `DailySync.tsx` (inline table), `ReportTableView.tsx` (no actions column at all)

```tsx
// DailySync table — single action button:
<button className="p-2 min-h-[44px] min-w-[44px] text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
  <Eye size={16} />
</button>
```

`ReportTableView` has zero action buttons — row click triggers `onViewDetail`. No actions column.

---

## Q1: Source of Truth

**Pattern A (ProductBacklog `BacklogTableView`)** is the source of truth.

Reasons:
- Most complete: 3 actions (view / edit / delete), matching the full CRUD intent
- Consistent ordering: Eye → Edit2 → Trash2 (read → write → destroy)
- Semantic color split: primary for safe actions, error-toned for destructive
- Already used across two sub-components in the same file (tree + table), proving reusability intent
- Button class formula is exact and minimal: `p-2 text-slate-400 hover:text-{color} hover:bg-{color}/5 rounded-lg transition-all`
- Icon size `14` is the standard for table density; `12` is only for compact tree rows

Pattern B (dropdown) is feature-rich but adds z-index/positioning complexity and AnimatePresence state (`openMenuId`) per table — over-engineered for standard CRUD. Acceptable for dense feature tables (TaskTableView context) but not the baseline.

Pattern C is read-only context — not a template for editable tables.

---

## Q2: Where Should the Shared Component Live

`src/components/ui/` is the correct home. Evidence:
- Existing shared primitives already there: `PrimaryActionButton.tsx`, `ViewToggle.tsx`, `CustomFilter.tsx`, `Badge.tsx`, `Button.tsx`
- All pages import from `../components/ui/` or `../../components/ui/`
- No existing `table-action-buttons.tsx` — gap to fill

**Proposed file:** `src/components/ui/table-row-actions.tsx`

Minimal API:
```tsx
interface TableRowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  size?: number;          // default 14
  compact?: boolean;      // p-1.5 + size 12, opacity-0 group-hover:opacity-100
}
```

Keep it frontend-only, no business logic, no fetch calls. ~40 lines.

---

## Q3: Safe File Ownership / Parallel Split

| Owner | Files | Safe? |
|---|---|---|
| Dev-A | `src/components/ui/table-row-actions.tsx` (new) | Safe — new file, no conflict |
| Dev-A | `ProductBacklog.tsx` — replace inline action buttons | Safe — single file |
| Dev-B | `TaskTableView.tsx` — replace dropdown with Pattern A | Safe — single file |
| Dev-B | `DailySync.tsx` — replace single Eye button | Safe — single file |
| Dev-C (optional) | `ReportTableView.tsx` — add actions column if needed | Safe — currently no actions |

**Dependency:** component must exist before any consumer is touched. Dev-A creates `table-row-actions.tsx` first; Dev-B/Dev-C can proceed in parallel once it's committed.

`ReportTableView` is currently read-only by design (row click = view). Only add an actions column if a product requirement exists — YAGNI applies.

---

## Bulk-Delete Bar (same in both Pattern A + B)

Both `ProductBacklog` and `TaskTableView` share identical bulk-action bar markup — already a de-facto standard:
```tsx
<motion.div className="flex items-center justify-between bg-error/5 p-4 rounded-3xl border border-error/20">
  <p className="text-sm font-bold text-error">{n} item(s) selected</p>
  <div className="flex items-center gap-3">
    <button className="px-4 py-2 rounded-full font-bold text-xs text-slate-500 hover:bg-slate-100">Clear</button>
    <button className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs bg-error text-white hover:scale-95">
      <Trash2 size={14} /> Delete Selected
    </button>
  </div>
</motion.div>
```
Could be extracted as `BulkActionBar` in same UI dir — separate task, not in scope here.

---

## Unresolved Questions

1. Does `ReportTableView` need edit/delete actions added, or stay read-only permanently?
2. Should the compact (tree-row) variant with `group-hover:opacity-100` be a prop on the shared component, or left inline in `ProductBacklog`?
3. Is Pattern B (dropdown) worth preserving in `TaskTableView` for its visual separation of the destructive action, or replace uniformly with Pattern A?
