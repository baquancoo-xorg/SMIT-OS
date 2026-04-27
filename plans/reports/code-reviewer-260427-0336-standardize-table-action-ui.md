# Code Review: Standardize TableRowActions UI

**Date:** 2026-04-27 03:36
**Branch:** main
**Scope:** 9 files — shared component + 7 call-sites

---

## Scope

| File | Change |
|------|--------|
| `src/components/ui/table-row-actions.tsx` | NEW shared component |
| `src/pages/ProductBacklog.tsx` | Adopted in grouped + table views |
| `src/components/board/TaskTableView.tsx` | Adopted |
| `src/pages/DailySync.tsx` | Adopted (view-only action) |
| `src/components/board/ReportTableView.tsx` | Adopted |
| `src/components/lead-tracker/lead-logs-tab.tsx` | Adopted (edit only; delete stays bespoke) |
| `src/components/lead-tracker/bulk-action-bar.tsx` | No functional change |
| `src/components/settings/user-management-tab.tsx` | Adopted |
| `src/components/settings/fb-config-tab.tsx` | Adopted |

LOC reviewed: ~1,800

---

## Overall Assessment

The refactor achieves its stated goal: inline icon-button clusters are replaced with a consistent `TableRowActions` component. Permissions, modal state, and data flow are untouched at every call-site. No auth/authz regressions found. Issues below are correctness/UX bugs that CI would not catch.

---

## Critical Issues

None.

---

## High Priority

### H1 — Opacity/visibility behaviour is inconsistent between `compact` and non-compact modes
**File:** `src/components/ui/table-row-actions.tsx` lines 20-23

When `compact={true}` the wrapper gets `opacity-0 group-hover:opacity-100`.
When `compact={false}` (the default) the wrapper is **always fully visible** — no hover-reveal at all.

Call-sites in `TaskTableView` and `ProductBacklog.BacklogTableView` pass no `compact` prop, so their action columns are permanently visible. Pre-refactor rows used the `group-hover:opacity-0` pattern on their own wrappers. The refactor silently changes this behaviour: the Actions column is now always visible in those two tables, making dense rows look noisier.

**Impact:** Visible UX regression in two tables; also means the `compact` prop is the only way to get hover-reveal, but its name implies layout density, not visibility.

**Fix options:**
- Add a separate `hideUnlessHovered?: boolean` prop (default `false`) and decouple it from `compact`.
- Or change the default to always hide and let callers opt out.

---

### H2 — `lead-logs-tab.tsx`: double hover-opacity wrapper causes action column to never show
**File:** `src/components/lead-tracker/lead-logs-tab.tsx` lines 381-399

```tsx
// outer div from the call-site:
<div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
  <TableRowActions onEdit={...} size={14} />
  ...
</div>
```

`TableRowActions` is called **without** `compact`, so its internal wrapper is always-visible (see H1). The outer `div` controls hover-reveal correctly. This combination works at runtime but is semantically confusing and fragile: if someone later adds `compact` to the `TableRowActions` call, the inner wrapper becomes `opacity-0` inside an already-hidden outer — the actions would **never appear**.

**Impact:** Latent bug; currently works only because `compact` is absent.

**Fix:** Either pass `compact` to `TableRowActions` and remove the outer `opacity-0` wrapper, or remove `TableRowActions`'s internal opacity and let the call-site own visibility exclusively.

---

## Medium Priority

### M1 — `DailySync.tsx`: `TableRowActions` receives a `className` with touch-target sizing but the component ignores `min-h`/`min-w` on buttons
**File:** `src/pages/DailySync.tsx` line 474

```tsx
<TableRowActions
  onView={...}
  size={16}
  className="min-h-[44px] min-w-[44px]"
/>
```

`className` is applied to the **wrapper `div`**, not to the individual `<button>` elements. `min-h-[44px] min-w-[44px]` on a flex container does not guarantee each button meets the 44px touch target — the container stretches but buttons inside remain the size of their icon + padding. The intent (mobile touch target) is not achieved.

**Fix:** Add `min-h`/`min-w` to the button-level padding classes, or add a `buttonClassName` prop.

---

### M2 — `ProductBacklog.tsx`: `handleDeleteTask` does not check the HTTP response status
**File:** `src/pages/ProductBacklog.tsx` lines 96-108

```ts
const handleDeleteTask = async (id: string) => {
  try {
    await fetch(`/api/work-items/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(item => item.id !== id));
    ...
  } catch (error) { ... }
};
```

If the server returns 403/404/500, the item is removed from local state regardless. This is a pre-existing issue, not introduced by this refactor, but the refactor wires new `onDelete` callbacks directly to this handler, making it more prominent.

**Fix:** Check `res.ok` before updating state (consistent with `handleCreateTask` which already does this).

---

### M3 — `fb-config-tab.tsx`: sync action uses `setTimeout` instead of awaiting response
**File:** `src/components/settings/fb-config-tab.tsx` lines 128-132

```ts
setTimeout(() => {
  setSyncingId(null);
  fetchAccounts();
}, 2000);
```

Not introduced by this refactor but the sync button now sits next to `TableRowActions` edit/delete. If the user clicks Edit while sync is in-flight, `editingId` is set and the form opens for a stale snapshot. Pre-existing, but worth flagging since the action column is now more prominent.

---

### M4 — `ReportTableView.tsx`: row `onClick` and `TableRowActions` `onView` duplicate the same handler
**File:** `src/components/board/ReportTableView.tsx` lines 104-196

```tsx
<tr onClick={() => !exportMode && onViewDetail(report)} ...>
  ...
  <td onClick={(e) => e.stopPropagation()}>
    <TableRowActions onView={() => onViewDetail(report)} />
  </td>
</tr>
```

The Eye button and the row click both call `onViewDetail`. The `stopPropagation` on the `<td>` correctly prevents double-firing, but if a user clicks the icon button the event path is: button click → td stops propagation → onView fires. This works, but any future action added to `TableRowActions` (edit/delete) would need the same `stopPropagation` wrapper or it will also fire the row click. The pattern is fragile.

**Fix:** Consolidate: either make the row non-clickable and rely solely on the action button, or make the row click the only trigger and remove the redundant Eye button.

---

## Low Priority

### L1 — `compact` and non-compact branches share the same Tailwind classes — no deduplication
**File:** `src/components/ui/table-row-actions.tsx` lines 20-23

Both branches repeat `flex items-center justify-end gap-1`. Minor DRY violation; acceptable for now but worth cleaning if more variants are added.

---

### L2 — `wrapperClass.trim()` is unnecessary
**File:** `src/components/ui/table-row-actions.tsx` line 26

`className` defaults to `''`, so the template literal never produces leading/trailing whitespace in the default case. `.trim()` is a no-op here.

---

### L3 — `user-management-tab.tsx` mobile card view uses `TableRowActions` without `compact`
**File:** `src/components/settings/user-management-tab.tsx` lines 272-275

Mobile card view shows buttons always-visible (no hover-reveal), which is correct for touch devices. However, the desktop table view at line 243-249 passes `className="opacity-0 group-hover:opacity-100 transition-opacity"` on the wrapper but `compact` is absent — so the component's internal wrapper is always-visible and the caller's `className` applies to the outer wrapper. This works but is inconsistent with the intent: two different patterns for the same visibility goal within the same file.

---

## Edge Cases Found

- **Empty actions div:** If `onView`, `onEdit`, and `onDelete` are all `undefined`, the component renders an empty `<div>` with padding/flex classes. No visible harm but wastes a DOM node.
- **`compact` with explicit `className` that also sets opacity:** The two opacity classes would conflict (caller's className appended after component's own classes). TailwindCSS will apply both; the last one in the stylesheet wins, which may not be predictable.
- **Keyboard accessibility:** None of the `<button>` elements have `aria-label`. Icon-only buttons are not accessible to screen readers. Pre-existing but this refactor is the right moment to fix it centrally.

---

## Positive Observations

- Single source of truth for icon sizes, colours, hover states, and padding — good DRY.
- Optional props (`onView?`, `onEdit?`, `onDelete?`) correctly allow partial action sets; unused slots render nothing.
- `e.stopPropagation()` is applied where needed (EpicTreeGroup header at ProductBacklog line 510).
- Permission guard on delete in `user-management-tab.tsx` (self-delete prevention) is preserved correctly: `onDelete={user.id !== currentUser?.id ? ... : undefined}`.
- Lead-logs bespoke delete workflow (request/approve/reject flow) is left untouched — correct decision.
- `fb-config-tab.tsx` uses `credentials: 'include'` consistently on all admin endpoints.

---

## Recommended Actions (Priority Order)

1. **(H1)** Decouple hover-reveal from `compact`. Add `hideUnlessHovered` prop or rename/split the behaviour so non-compact callers can also opt in.
2. **(H2)** In `lead-logs-tab.tsx`, decide who owns visibility: remove the outer wrapper's opacity classes and pass `compact` to `TableRowActions`, or remove the component's internal opacity and own it externally.
3. **(M1)** Fix `DailySync.tsx` touch target: apply min sizing to buttons, not the wrapper div.
4. **(M2)** Add `res.ok` guard in `handleDeleteTask` (ProductBacklog).
5. **(L-Accessibility)** Add `aria-label` to the three icon buttons in `table-row-actions.tsx` ("View", "Edit", "Delete").

---

## Unresolved Questions

- Was the always-visible action column in `TaskTableView` and `BacklogTableView` intentional (replacing the pre-refactor hover behaviour), or a side-effect of dropping `compact`?
- Should `TableRowActions` own a confirmation dialog for delete, or will callers always wrap `onDelete` with their own `confirm()`?
