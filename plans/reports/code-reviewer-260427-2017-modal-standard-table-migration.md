---
date: 2026-04-27
reviewer: code-reviewer
scope: WeeklyCheckinModal.tsx, ReportDetailDialog.tsx
task: Phase 02 standard table rollout - modal migration review
---

## Code Review: Modal Standard Table Migration

### Scope
- `src/components/modals/WeeklyCheckinModal.tsx`
- `src/components/modals/ReportDetailDialog.tsx`

---

### Critical Issues
None.

---

### Major Issues

**[ReportDetailDialog] Plans table missing `actionHeaderCell` / `actionCell` -- ACCEPTABLE**
Read-only view table: no action column needed. Not a contract violation. Confirmed intentional.

---

### Minor Issues

**1. [WeeklyCheckinModal] `formatTableDate` not used for deadline display in input cell (line 413-421)**

The `DatePicker` component manages its own display so no raw date string is rendered directly -- acceptable. However, `formatTableDate` is imported in `ReportDetailDialog` but not in `WeeklyCheckinModal`. This is consistent with the write-vs-read split: write uses `DatePicker`, read uses `formatTableDate`. No bug, correct usage.

**2. [WeeklyCheckinModal] `state mutation on array item` (lines 294-297, 309-312, 326-329)**

```tsx
const newReviews = [...krReviews];
newReviews[idx].progress_added = val;  // mutates object inside spread copy
setKrReviews(newReviews);
```

The spread creates a shallow copy -- the object at `newReviews[idx]` is still the same reference as `krReviews[idx]`. This mutates state in place, which can cause missed re-renders in strict mode or with concurrent features. Pre-existing issue, not introduced by this migration, but worth noting.

Fix:
```tsx
setKrReviews(prev => prev.map((r, i) =>
  i === idx ? { ...r, progress_added: val } : r
));
```

**3. [WeeklyCheckinModal] `crypto.randomUUID()` -- minor compatibility note (line 95, 99)**
Browser support is broad (Chrome 92+, Safari 15.4+) and this is a React frontend app. Acceptable.

---

### Contract Compliance Checklist

| Check | WeeklyCheckinModal | ReportDetailDialog |
|---|---|---|
| `TableShell` used | PASS | PASS |
| `getTableContract('standard')` | PASS | PASS |
| `headerRow` on `<tr>` in `<thead>` | PASS | PASS |
| `headerCell` on `<th>` | PASS | PASS |
| `actionHeaderCell` on action `<th>` | PASS (has action col) | N/A (read-only, no action col) |
| `body` on `<tbody>` | PASS | PASS |
| `row` on data `<tr>` | PASS | PASS |
| `cell` on data `<td>` | PASS | PASS |
| `actionCell` on action `<td>` | PASS | N/A |
| `formatTableDate` for date display | N/A (DatePicker) | PASS |
| Business logic unchanged | PASS | PASS |
| No new regressions | PASS | PASS |

---

### Conclusion

**PASS** -- Both files correctly implement the standard table contract. The one pre-existing shallow mutation bug (item 2) is minor and outside the scope of this migration. No regression, no security issue, no breaking change.

### Recommended Fix
Address the shallow state mutation in `WeeklyCheckinModal` `krReviews` update handlers (3 occurrences) using immutable map pattern. Low urgency -- functional in practice but not production-safe under React concurrent mode.
