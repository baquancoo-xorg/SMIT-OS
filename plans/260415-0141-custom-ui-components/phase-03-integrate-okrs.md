# Phase 3: Integrate OKRsManagement

## Overview
- **Priority:** High
- **Status:** pending
- **Effort:** 1h
- **Depends on:** Phase 1

Replace native selects trong OKRsManagement page.

## Target File
[src/pages/OKRsManagement.tsx](../../src/pages/OKRsManagement.tsx)

## Changes Required

### Department Filter (Line ~307)
Replace với CustomFilter (pill style, rounded-full)

```tsx
// Current: native select in filter bar
<select
  className="text-[10px] font-black bg-transparent..."
  value={departmentFilter}
  onChange={(e) => setDepartmentFilter(e.target.value)}
>
  <option value="All">All Departments</option>
  ...
</select>

// Replace with:
<CustomFilter
  value={departmentFilter}
  onChange={setDepartmentFilter}
  options={[
    { value: 'All', label: 'All Departments' },
    { value: 'Tech', label: 'Tech' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Media', label: 'Media' },
    { value: 'Sale', label: 'Sale' }
  ]}
  icon={<Filter size={14} />}
/>
```

### Modal Selects (Lines ~1239, ~1264, ~1349, ~1442, ~1457)
Replace với CustomSelect trong các modals:
- Add L1 Objective modal - Department select
- Add L2 Objective modal - Parent L1 select
- Add KR modal - selects
- Edit modals - various selects

## Implementation Steps

1. Import CustomSelect, CustomFilter
2. Replace department filter với CustomFilter
3. Replace modal selects với CustomSelect
4. Test filter functionality
5. Test modal forms

## Todo
- [ ] Import components
- [ ] Replace department filter (line ~307)
- [ ] Replace Add L1 Objective modal select
- [ ] Replace Add L2 Objective modal selects
- [ ] Replace Add KR modal selects
- [ ] Replace Edit modal selects
- [ ] Test filtering works
- [ ] Test form submissions

## Success Criteria
- Filter dropdown matches Topbar style
- Modal selects match TaskModal style
- All CRUD operations work
- Department filter state persists
