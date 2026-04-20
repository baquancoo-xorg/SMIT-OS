# Phase 03 - Backlog Tree View

## Context
- Plan: [plan.md](plan.md)
- File su1eeda: `src/pages/ProductBacklog.tsx` (hiu1ec7n 669 lu00f2ng)
- Types: `src/types/index.ts` u2014 `BACKLOG_TYPES = ['Epic', 'UserStory']`
- API: `GET /api/work-items` tru1ea3 vu1ec1 `parent` + `children` (1 cu1ea5p)

## Overview

**Priority:** High
**Status:** pending

Refactor ProductBacklog tu1eeb flat list sang tree view: Epic lu00e0 collapsible header, UserStory nu1eb1m du01b0u1edbi Epic cu00f3 task count badge. Khu00f4ng thu00eam type mu1edbi, khu00f4ng thu00eam Tasks vu00e0o Backlog u2014 Tasks vu1eabn thu1ed9c team boards. Backlog chu1ec9 quu1ea3n lu00fd Epic vu00e0 Story.

**Thay u0111u1ed5i chiu1ebfn lu01b0u1ee3c:**
- Gu00f9i group "Grouped" view u2192 tree view (Epic u2192 Stories)
- Gu00f9i Table view u2192 giu1eef ngu1ecbu00eau, thu00eam cu1ed9t "Parent Epic"
- Story hiu1ec3n thu1ecb task count badge (tu1eeb `children` array)
- Epic khu00f4ng cu00f3 Story nu1eb1m trong nhuu1edm "Orphan Epics"
- Story khu00f4ng cu00f3 Epic nu1eb1m trong nhuu1edm "Unlinked Stories"

## Architecture

**Tree building logic:**
```ts
// Fetch only BACKLOG_TYPES (Epic + UserStory) u2014 GIu1ef2 NGUYU00caN
const backlogItems = allItems.filter(i => BACKLOG_TYPES.includes(i.type));

// Epics: khu00f4ng cu00f3 parentId
const epics = backlogItems.filter(i => i.type === 'Epic');

// Stories grouped by parentId (epicId)
const storiesByEpic = backlogItems
  .filter(i => i.type === 'UserStory')
  .reduce((acc, s) => {
    const key = s.parentId ?? '__unlinked__';
    acc[key] = [...(acc[key] ?? []), s];
    return acc;
  }, {} as Record<string, WorkItem[]>);
```

**Story task count:** Du00f9ng `item.children?.length ?? 0` tu1eeb API response (cu00f3 su1eb5n)

## Related Code Files

**Su1eeda:**
- `src/pages/ProductBacklog.tsx` u2014 phu1ea7n `fetchData` + `view=board` render

**Khu00f4ng su1eeda:**
- BacklogTableView u2014 chu1ec9 thu00eam cu1ed9t Parent Epic
- TaskModal u2014 giu1eef nguyu00ean

## Implementation Steps

1. **`fetchData`** u2014 khu00f4ng u0111u1ed5i, vu1eabn filter `BACKLOG_TYPES`

2. **Tree view component** u2014 tu1ea1o `EpicTreeGroup` inline trong file:
   ```tsx
   function EpicTreeGroup({
     epic, stories, selectedIds, onToggleSelect,
     onDelete, onEdit, onViewDetails, users
   })
   ```
   - Header: Epic info + expand/collapse icon + `[+ Add Story]` button
   - Content (khi expanded): danh su00e1ch StoryRow
   - Default: collapsed nu1ebfu cu00f3 > 5 stories, expanded nu1ebfu u2264 5

3. **StoryRow inline component:**
   ```tsx
   function StoryRow({ story, users, ... })
   ```
   - Indent tru00e1i `ml-6` + du01b0u1eddng nu1ed1i du1ecdc `border-l-2 border-primary/20`
   - Task count badge: `{story.children?.length ?? 0} tasks`
   - Cu00e1c nu00fat action: view, edit, delete

4. **Unlinked Stories section** u2014 nu1ebfu cu00f3 stories vu1edbi `parentId = null`:
   ```tsx
   {storiesByEpic['__unlinked__']?.length > 0 && (
     <UnlinkedStoriesGroup stories={...} />
   )}
   ```

5. **Board view render** u2014 thu00eay thu1ebf `Object.entries(groupedByType).map(...)` bu1eb1ng:
   ```tsx
   {epics.map(epic => (
     <EpicTreeGroup
       key={epic.id}
       epic={epic}
       stories={storiesByEpic[epic.id] ?? []}
       ...
     />
   ))}
   {storiesByEpic['__unlinked__']?.length > 0 && <UnlinkedStoriesGroup />}
   ```

6. **Table view** u2014 thu00eam cu1ed9t "Parent Epic":
   ```tsx
   <td>{item.parent?.title ?? u2018u2014u2019}</td>
   ```

7. **`[+ New Item]` button** u2014 giu1eef nguyu00ean, mu1edf TaskModal vu1edbi `allowedTypes=['Epic','UserStory']`

8. **`[+ Add Story]` trong EpicTreeGroup** u2014 mu1edf TaskModal vu1edbi `defaultType='UserStory'`, `defaultParentId=epic.id`
   - TaskModal cu1ea7n u0111u01b0u1ee3c mu1edf ru1ed9ng parentId: kiu1ec3m tra props cu1ee7a TaskModal vu00e0 thu00eam `defaultParentId` nu1ebfu chu01b0a cu00f3

## Todo

- [ ] Refactor board view: thu00eam `EpicTreeGroup` + `StoryRow`
- [ ] Logic build tree tu1eeb backlogItems
- [ ] `[+ Add Story]` linked Epic
- [ ] Unlinked stories section
- [ ] Thu00eam cu1ed9t Parent Epic vu00e0o table view
- [ ] Kiu1ec3m tra TaskModal cu00f3 hu1ed7 tru1ee3 `defaultParentId` khu00f4ng, nu1ebfu khu00f4ng thu00eam prop

## Success Criteria

- Board view hiu1ec3n thu1ecb Epic u2192 Story hierarchy
- Story row cu00f3 task count badge
- Epic collapsible u0111u01b0u1ee3c
- Stories khu00f4ng cu00f3 Epic vu1eabn hiu1ec3n thu1ecb (Unlinked section)
- Table view cu00f3 cu1ed9t Parent Epic
- Tu1ea1o Story tu1eeb tree u2192 auto-linked Epic

## Risk

- TaskModal cu00f3 thu1ec3 chu01b0a cu00f3 `defaultParentId` prop u2014 cu1ea7n kiu1ec3m tra tru01b0u1edbc, cu00f3 thu1ec3 cu1ea7n thu00eam
- File ProductBacklog.tsx u0111u00e3 669 du00f2ng u2014 sau refactor nu1ebfu > 200 du00f2ng nu1eefng vu1ea7n, tu00e1ch `epic-tree-group.tsx` ra file riu00eang
