# Phase 01 u2014 Tu1ea1o `use-group-board-filters` Hook

## Overview

- **Priority:** High
- **Status:** pending
- **Mu00f4 tu1ea3:** Tu1ea1o custom hook encapsulate tou00e0n bu1ed9 filter state + computed items cho 4 group boards

## Context Links

- Brainstorm: `plans/reports/brainstorm-260421-1820-group-board-assigned-status-filter.md`
- Types: `src/types/index.ts` (WorkItem, Sprint, User)
- CustomFilter: `src/components/ui/CustomFilter.tsx`
- AuthContext: `src/contexts/AuthContext.tsx` (`users: User[]` exposed)

## Key Insights

- `useAuth()` u0111u00e3 expose `users: User[]` vu1edbi `departments: string[]` field
- `WorkItem.assigneeId?: string` tu1ed3n tu1ea1i u2014 du00f9ng u0111u1ec3 filter by assignee
- Dept filter (`item.assignee?.departments?.includes(dept)`) u0111u00e3 xu1eed lu00fd trong `fetchData` cu1ee7a tu1eebng board u2014 hook nhu1eadn `items` u0111u00e3 u0111u01b0u1ee3c lu1ecdc dept su1eb5n
- `CustomFilter` lu00e0 controlled component: `{ value, onChange, options }` u2014 hou1ea1t u0111u1ed9ng ngay
- Filter chain: sprint u2192 status u2192 assignee (AND logic)

## Requirements

- Nhu1eadn `dept`, `items`, `sprints`, `users` lu00e0m input
- Quu1ea3n lu00fd state: `selectedSprintId`, `statusFilter`, `assigneeFilter`
- Tru1ea3 vu1ec1: states + setters + options arrays + `filteredItems`
- `assigneeOptions` chu1ec9 chu1ee9a users cu00f3 dept khu1edbp vu1edbi board
- `filteredItems` u00e1p du1ee5ng cu1ea3 3 filter theo thu1ee9 tu1ef1: sprint u2192 status u2192 assignee

## Implementation

### File to Create

`src/hooks/use-group-board-filters.ts`

```ts
import { useState, useMemo } from 'react';
import { WorkItem, Sprint, User } from '../types';

interface FilterOption {
  value: string;
  label: string;
}

interface UseGroupBoardFiltersParams {
  dept: string;
  items: WorkItem[];
  sprints: Sprint[];
  users: User[];
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'All', label: 'All' },
  { value: 'Todo', label: 'Todo' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Review', label: 'Review' },
  { value: 'Done', label: 'Done' },
];

export function useGroupBoardFilters({ dept, items, sprints, users }: UseGroupBoardFiltersParams) {
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('All');

  const sprintOptions = useMemo<FilterOption[]>(() => [
    { value: '', label: 'All Sprints' },
    ...sprints.map(s => ({ value: s.id, label: s.name }))
  ], [sprints]);

  const assigneeOptions = useMemo<FilterOption[]>(() => [
    { value: 'All', label: 'All' },
    ...users
      .filter(u => u.departments.includes(dept))
      .map(u => ({ value: u.id, label: u.fullName }))
  ], [users, dept]);

  const filteredItems = useMemo(() => {
    return items
      .filter(i => !selectedSprintId ? !!i.sprintId : i.sprintId === selectedSprintId)
      .filter(i => statusFilter === 'All' || i.status === statusFilter)
      .filter(i => assigneeFilter === 'All' || i.assigneeId === assigneeFilter);
  }, [items, selectedSprintId, statusFilter, assigneeFilter]);

  return {
    selectedSprintId, setSelectedSprintId,
    statusFilter, setStatusFilter,
    assigneeFilter, setAssigneeFilter,
    sprintOptions,
    statusOptions: STATUS_OPTIONS,
    assigneeOptions,
    filteredItems,
  };
}
```

## Todo

- [ ] Tu1ea1o file `src/hooks/use-group-board-filters.ts`
- [ ] Kiu1ec3m tra type `Sprint` cu00f3 field `id`, `name`, `startDate`, `endDate`
- [ ] Kiu1ec3m tra `User.fullName` (khu00f4ng phu1ea3i `name`)

## Success Criteria

- Hook export vu00e0 compile khu00f4ng lu1ed7i
- `filteredItems` u0111u00fang khi cu1ea3 3 filter active
- `assigneeOptions` chu1ec9 chu1ee9a user cu00f3 dept khu1edbp

## Next Steps

u2192 Phase 02: u00c1p du1ee5ng hook vu00e0o 4 board pages
