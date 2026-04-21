# Phase 02 u2014 Cu1eadp nhu1eadt 4 Board Pages

## Overview

- **Priority:** High
- **Status:** pending
- **Mu00f4 tu1ea3:** u00c1p du1ee5ng `useGroupBoardFilters` hook, thu00eam 2 `CustomFilter` UI (Assigned, Status), fix bug table view bu1ecf qua filter

## Context Links

- Phase 01: `phase-01-create-filter-hook.md`
- TechBoard (mu1eabu): `src/pages/TechBoard.tsx`
- MarketingBoard: `src/pages/MarketingBoard.tsx`
- MediaBoard: `src/pages/MediaBoard.tsx`
- SaleBoard: `src/pages/SaleBoard.tsx`
- CustomFilter: `src/components/ui/CustomFilter.tsx`
- AuthContext: `src/contexts/AuthContext.tsx`

## Key Insights

- Cu1ea3 4 board giu1ed1ng nhau 95% u2014 su1eeda theo pattern tu1eeb TechBoard, u00e1p du1ee5ng u0111u1ed3ng nhu1ea5t cho cu00f2n lu1ea1i
- `useAuth()` u0111u00e3 u0111u01b0u1ee3c import trong mu1ed7i board (chu1ec9 destructure `currentUser`), cu1ea7n thu00eam `users`
- Sprint auto-select logic hiu1ec7n u0111u1eb7t trong `fetchData` u2014 giu1eef nguyu00ean, chu1ec9 chuyu1ec3n state quu1ea3n lu00fd sang hook
- Table view hiu1ec7n nhu1eadn `items` raw (bug) u2014 u0111u1ed5i sang `filteredItems`
- Dept string cho tu1eebng board: Tech / Marketing / Media / Sale

## Changes Per Board

### 1. Import hook
```ts
import { useGroupBoardFilters } from '../hooks/use-group-board-filters';
```

### 2. Destructure `users` tu1eeb `useAuth()`
```ts
// Tru01b0u1edbc:
const { currentUser } = useAuth();
// Sau:
const { currentUser, users } = useAuth();
```

### 3. Xu00f3a state `selectedSprintId` cu0169, thay bu1eb1ng hook
```ts
// Xu00f3a:
const [selectedSprintId, setSelectedSprintId] = useState<string>('');

// Thu00eam sau khi `items` vu00e0 `sprints` state u0111u01b0u1ee3c khai bu00e1o:
const {
  selectedSprintId, setSelectedSprintId,
  statusFilter, setStatusFilter,
  assigneeFilter, setAssigneeFilter,
  sprintOptions, statusOptions, assigneeOptions,
  filteredItems,
} = useGroupBoardFilters({ dept: 'Tech', items, sprints, users });
// Lu01b0u u00fd: thay 'Tech' bu1eb1ng dept tu01b0u01a1ng u1ee9ng cu1ee7a mu1ed7i board
```

### 4. Xu00f3a `sprintItems` vu00e0 `statsItems` cu0169
```ts
// Xu00f3a tou00e0n bu1ed9 2 du00f2ng nu00e0y:
const sprintItems = selectedSprintId
  ? items.filter(i => i.sprintId === selectedSprintId)
  : items.filter(i => i.sprintId);
const statsItems = selectedSprintId
  ? items.filter(i => i.sprintId === selectedSprintId)
  : items.filter(i => i.sprintId);

// Thay thu1ebf: du00f9ng `filteredItems` tu1eeb hook cho cu1ea3 kanban vu00e0 stats
```

### 5. Cu1eadp nhu1eadt Sprint Filter Bar u2014 thu00eam 2 filter mu1edbi
```tsx
{/* Tru01b0u1edbc u2014 chu1ec9 cu00f3 Sprint filter: */}
<CustomFilter
  value={selectedSprintId}
  onChange={setSelectedSprintId}
  options={[
    { value: '', label: 'All Sprints' },
    ...sprints.map(s => ({ value: s.id, label: s.name }))
  ]}
/>

{/* Sau u2014 3 filter: */}
<CustomFilter value={selectedSprintId} onChange={setSelectedSprintId} options={sprintOptions} />
<CustomFilter value={assigneeFilter} onChange={setAssigneeFilter} options={assigneeOptions} />
<CustomFilter value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
```

### 6. Cu1eadp nhu1eadt Stats counts: thay `statsItems` u2192 `filteredItems`

Khu00f4ng cu00f3 thay u0111u1ed5i JSX nu1ebfu rename variable. Nu1ebfu u0111u00e3 xu00f3a `statsItems`, tu00ecm-replace `statsItems` u2192 `filteredItems` trong JSX.

### 7. Fix table view: thay `items` u2192 `filteredItems`
```tsx
{/* Tru01b0u1edbc: */}
<TaskTableView
  items={items}
  ...
/>

{/* Sau: */}
<TaskTableView
  items={filteredItems}
  ...
/>
```

### 8. Cu1eadp nhu1eadt kanban columns: thay `sprintItems` u2192 `filteredItems`
```tsx
{/* Tru01b0u1edbc: */}
const columnItems = sprintItems.filter(i => i.status === col);

{/* Sau: */}
const columnItems = filteredItems.filter(i => i.status === col);
```

## Dept Strings per Board

| Board | Dept string trong hook |
|---|---|
| TechBoard | `'Tech'` |
| MarketingBoard | `'Marketing'` |
| MediaBoard | `'Media'` |
| SaleBoard | `'Sale'` |

## Todo

- [ ] **TechBoard.tsx**: import hook, destructure `users`, xu00f3a state cu0169, u00e1p du1ee5ng hook, 3 filters UI, fix table, fix kanban
- [ ] **MarketingBoard.tsx**: tu01b0u01a1ng tu1ef1 TechBoard, dept=`'Marketing'`
- [ ] **MediaBoard.tsx**: tu01b0u01a1ng tu1ef1, dept=`'Media'`
- [ ] **SaleBoard.tsx**: tu01b0u01a1ng tu1ef1, dept=`'Sale'`
- [ ] Kiu1ec3m tra Sprint auto-select vu1eabn hou1ea1t u0111u1ed9ng (logic u1edf `fetchData`, gu1ecdi `setSelectedSprintId` tu1eeb hook)
- [ ] Kiu1ec3m tra drag & drop vu1eabn du00f9ng `selectedSprintId` u0111u00fang (tu1eeb hook return)

## Success Criteria

- 3 filter hiu1ec7n thu1ecb `[Sprint u25be] [Assigned u25be] [Status u25be]` trong stats bar tu1ea5t cu1ea3 4 boards
- Chu1ecdn bu1ea5t ku1ef3 combo filter u2192 kanban + stats + table u0111u1ec1u cu1eadp nhu1eadt u0111u1ed3ng bu1ed9
- Assigned dropdown chu1ec9 hiu1ec7n member cu1ee7a dept tu01b0u01a1ng u1ee9ng
- Drag & drop vu1eabn hou1ea1t u0111u1ed9ng bu00ecnh thu01b0u1eddng
- `npm run build` khu00f4ng cu00f3 TypeScript error
