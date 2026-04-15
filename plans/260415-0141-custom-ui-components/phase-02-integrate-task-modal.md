# Phase 2: Integrate TaskModal

## Overview
- **Priority:** High
- **Status:** pending
- **Effort:** 1h
- **Depends on:** Phase 1

Replace native selects và date inputs trong TaskModal.

## Target File
[src/components/board/TaskModal.tsx](../../src/components/board/TaskModal.tsx)

## Changes Required

### Imports
```tsx
import CustomSelect from '../ui/CustomSelect';
import CustomDatePicker from '../ui/CustomDatePicker';
```

### Replace 6 Native Selects

| Field | Line | Options Source |
|-------|------|----------------|
| Type | ~166 | `typeOptions` array |
| Priority | ~179 | Low/Medium/High/Urgent |
| Assignee | ~193 | `users` array |
| Status | ~206 | Todo/In Progress/Review/Done |
| Parent | ~248 | `availableParents` array |
| (If any more) | Check file | - |

### Replace 2 Date Inputs

| Field | Line |
|-------|------|
| Start Date | ~220 |
| Due Date | ~230 |

## Implementation Steps

1. Import CustomSelect, CustomDatePicker
2. Convert options to `{ value, label }` format
3. Replace each `<select>` with `<CustomSelect>`
4. Replace each `<input type="date">` with `<CustomDatePicker>`
5. Verify form submission still works

## Example Transformation

**Before:**
```tsx
<select
  value={type}
  onChange={(e) => setType(e.target.value as WorkItemType)}
  className="w-full px-4 py-3 rounded-2xl border..."
>
  {typeOptions.map(t => (
    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
  ))}
</select>
```

**After:**
```tsx
<CustomSelect
  value={type}
  onChange={(val) => setType(val as WorkItemType)}
  options={typeOptions.map(t => ({ value: t, label: TYPE_LABELS[t] }))}
/>
```

## Todo
- [ ] Import components
- [ ] Replace Type select
- [ ] Replace Priority select
- [ ] Replace Assignee select
- [ ] Replace Status select
- [ ] Replace Parent select
- [ ] Replace Start Date input
- [ ] Replace Due Date input
- [ ] Test form submission
- [ ] Test keyboard navigation

## Success Criteria
- All fields styled consistently
- Form data submits correctly
- Modal opens/closes properly
- No console errors
