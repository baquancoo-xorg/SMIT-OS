# Phase 01 - Epic Board Page

## Context
- Plan: [plan.md](plan.md)
- Types: `src/types/index.ts`
- App entry: `src/App.tsx`
- Sidebar: `src/components/layout/Sidebar.tsx`
- API: `GET /api/work-items` tru1ea3 vu1ec1 `children[]` + `krLinks[]` + `parent`

## Overview

**Priority:** High — u0111u00e2y lu00e0 trang mu1edbi, u0111iu1ec3m vu00e0o cu1ee7a tou00e0n bu1ed9 Epic workflow
**Status:** pending

Tu1ea1o trang Epic Board cross-team: hiu1ec3n thu1ecb tu1ea5t cu1ea3 Epics du01b0u1edbi du1ea1ng card grid, mu1ed7i card cu00f3 progress bar, thu00f4ng tin owner, teams liu00ean quan, KR link, su1ed1 stories/tasks. Click vu00e0o card u2192 mu1edf Epic Detail Panel (Phase 02).

## Requirements

**Functional:**
- Hiu1ec3n thu1ecb tu1ea5t cu1ea3 WorkItems cu00f3 `type === 'Epic'`
- Tu00ednh progress: `completedTasks / totalTasks * 100` tu1eeb tou00e0n bu1ed9 descendant tasks (Stories + Tasks)
- Filter by: Status (Active/Done/All), KR link
- `[+ New Epic]` button mu1edf TaskModal vu1edbi `defaultType='Epic'`
- Click card u2192 callback `onSelectEpic(epic)` u2192 Phase 02 panel

**Non-functional:**
- Re-use TaskModal u0111u00e3 cu00f3 cho create/edit
- Progress tu00ednh client-side tu1eeb `children` (API u0111u00e3 tru1ea3 vu1ec1)
- Khu00f4ng cu1ea7n API mu1edbi

## Architecture

```
src/pages/EpicBoard.tsx          u2190 page chu00ednh
src/components/board/
  epic-card.tsx                  u2190 card UI (tu00e1ch khu1ecfi page)
  EpicDetailPanel.tsx            u2190 Phase 02
```

**Data flow:**
```
fetchAllWorkItems()
  u2514u2500 filter type=Epic u2192 epics[]
  u2514u2500 filter typeu2260Epic,u2260UserStory u2192 tasks[]
  u2514u2500 computeEpicProgress(epic, allItems) u2192 { total, done, pct }
```

**Progress tu00ednh thuu1eadt tou00e1n:**
```ts
// tu1eeb allItems, u0111u1ec7 quy lu1ea5y tu1ea5t cu1ea3 descendants cu1ee7a epicId
function getDescendants(epicId: string, allItems: WorkItem[]): WorkItem[] {
  const direct = allItems.filter(i => i.parentId === epicId);
  return direct.flatMap(child => [child, ...getDescendants(child.id, allItems)]);
}

function computeEpicProgress(epicId: string, allItems: WorkItem[]) {
  const all = getDescendants(epicId, allItems);
  const tasks = all.filter(i => i.type !== 'Epic' && i.type !== 'UserStory');
  const done = tasks.filter(t => t.status === 'Done').length;
  return { total: tasks.length, done, pct: tasks.length ? Math.round(done / tasks.length * 100) : 0 };
}
```

## Related Code Files

**Tu1ea1o mu1edbi:**
- `src/pages/EpicBoard.tsx`
- `src/components/board/epic-card.tsx`

**Su1eeda:**
- `src/App.tsx` u2014 thu00eam `'epics'` vu00e0o `ViewType`, thu00eam `{currentView === 'epics' && <EpicBoard />}`
- `src/components/layout/Sidebar.tsx` u2014 thu00eam nav item Epic Board du01b0u1edbi section Planning

## Implementation Steps

1. **`src/App.tsx`** u2014 thu00eam `'epics'` vu00e0o `ViewType` union, thu00eam `'epics'` vu00e0o `SCROLLABLE_VIEWS` nu1ebfu cu1ea7n, thu00eam render branch

2. **`src/components/layout/Sidebar.tsx`** u2014 thu00eam nav item:
   ```tsx
   <NavItem
     icon="flag"
     label="Epic Board"
     onClick={() => onViewChange('epics')}
     active={currentView === 'epics'}
   />
   ```
   u0110u1eb7t sau Backlog item trong section Planning.

3. **`src/components/board/epic-card.tsx`** u2014 component EpicCard:
   ```tsx
   interface EpicCardProps {
     epic: WorkItem;
     progress: { total: number; done: number; pct: number };
     storyCount: number;
     onSelect: () => void;
     onEdit: () => void;
     onDelete: () => void;
     users: User[];
   }
   ```
   UI:
   - Title + priority badge + type chip
   - Owner avatar + name
   - Progress bar `[████░░] 67%`
   - Meta row: `X stories · Y tasks · Due: DD/MM`
   - KR link badges (tu1eeb `krLinks`)
   - Hover: Edit/Delete actions

4. **`src/pages/EpicBoard.tsx`**:
   - `useState`: `allItems`, `selectedEpic`, `isModalOpen`, `isPanelOpen`, `filters`
   - `fetchData()`: `GET /api/work-items` u2192 lu01b0u `allItems`
   - `epics = allItems.filter(i => i.type === 'Epic')`
   - Render: header + filter bar + grid of EpicCard
   - Click EpicCard u2192 `setSelectedEpic(epic); setIsPanelOpen(true)`
   - Import EpicDetailPanel (Phase 02) vu00e0 render khi `isPanelOpen`

## Todo

- [ ] Thu00eam `'epics'` vu00e0o `ViewType` trong `src/App.tsx`
- [ ] Thu00eam render branch `EpicBoard` trong `src/App.tsx`
- [ ] Thu00eam nav item Sidebar
- [ ] Tu1ea1o `src/components/board/epic-card.tsx`
- [ ] Tu1ea1o `src/pages/EpicBoard.tsx`
- [ ] Test: tu1ea1o Epic mu1edbi, hiu1ec3n thu1ecb u0111u00fang card, progress tu00ednh u0111u00fang

## Success Criteria

- Truy cu1eadp u0111u01b0u1ee3c qua Sidebar nav
- Hiu1ec3n thu1ecb u0111u00fang tu1ea5t cu1ea3 Epics
- Progress bar reflect u0111u00fang % task done
- `[+ New Epic]` tu1ea1o u0111u01b0u1ee3c Epic mu1edbi
- Click card mu1edf panel (Phase 02)

## Risk

- API tru1ea3 vu1ec1 `children` chu1ec9 1 cu1ea5p u2192 progress cu1ea7n fetch all items ru1ed3i compute client-side (du00f9ng `parentId` filter) u2014 u0111u00e3 xu1eed lu00fd trong algorithm tru00ean
