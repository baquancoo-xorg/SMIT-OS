# Phase 02 - Epic Detail Panel

## Context
- Plan: [plan.md](plan.md)
- Phase 01: [phase-01-epic-board-page.md](phase-01-epic-board-page.md) u2014 phu1ea3i xong tru01b0u1edbc
- API: `GET /api/work-items` cu00f3 `parent` + `children`
- Existing modals: `src/components/board/TaskModal.tsx`, `src/components/board/TaskDetailsModal.tsx`

## Overview

**Priority:** High u2014 Epic Board khu00f4ng cu00f3 giu00e1 tru1ecb nu1ebfu khu00f4ng drill-down u0111u01b0u1ee3c
**Status:** pending u2014 blocked by Phase 01

Slide-over panel hiu1ec3n thu1ecb khi click vu00e0o Epic card. Chu1ee9a: Epic info header, danh su00e1ch Stories collapsible, tasks khu00f4ng thuu1ed9c Story, quick create Story/Task.

**Du00f9ng slide-over (khu00f4ng phu1ea3i trang mu1edbi)** u2014 giu1eef context Epic Board phu00eda sau, du1ec5 u0111u00f3ng lu1ea1i.

## Requirements

**Functional:**
- Header: title, owner, priority, due date, progress ring, KR links
- Stories section: mu1ed7i Story lu00e0 collapsible row hiu1ec3n thu1ecb tasks bu00ean trong
- Task row: status chip, assignee, priority, click u2192 TaskDetailsModal
- Orphan tasks (direct children cu1ee7a Epic, khu00f4ng phu1ea3i Story): nhu00f3m riu00eang phu00eda du01b0u1edbi
- `[+ New Story]` u2192 TaskModal defaultType='UserStory', parentId=epicId
- `[+ New Task]` trong Story row u2192 TaskModal defaultType team-task, parentId=storyId
- Edit Epic button u2192 TaskModal vu1edbi initialData=epic

**Non-functional:**
- Khu00f4ng fetch API mu1edbi u2014 du00f9ng `allItems` prop tu1eeb EpicBoard
- Animate slide-in tu1eeb phu1ea3i (framer-motion `x: '100%'` u2192 `x: 0`)
- Click overlay u2192 u0111u00f3ng panel

## Architecture

```
src/components/board/epic-detail-panel.tsx   u2190 slide-over panel
```

**Props:**
```ts
interface EpicDetailPanelProps {
  epic: WorkItem;
  allItems: WorkItem[];   // tu1ea5t cu1ea3 work items u0111u1ec3 build tree
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;  // refresh allItems sau create/edit
}
```

**Data derivation (client-side):**
```ts
const stories = allItems.filter(i => i.parentId === epic.id && i.type === 'UserStory');
const orphanTasks = allItems.filter(i => i.parentId === epic.id && i.type !== 'UserStory');
const getStoryTasks = (storyId: string) =>
  allItems.filter(i => i.parentId === storyId);
```

**Layout:**
```
u250cu2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2510
u2502  u2190 [X]  Payment Integration         u2502
u2502  Owner: Minh u00b7 Due: 30/06           u2502
u2502  [u2588u2588u2588u2588u2588u2588u2588u2588u2591u2591u2591u2591] 67%  u00b7 KR: +30%        u2502
u2502  [Edit Epic]  [+ New Story]          u2502
u251cu2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2524
u2502  Stories (3)                         u2502
u2502  u25bc Checkout Flow  [60%]  [+ Task]    u2502
u2502    u251cu2500 u2714 API endpoint        @An     u2502
u2502    u251cu2500 u2714 UI checkout page   @Bu00ecnh   u2502
u2502    u2514u2500 u25cb Integration test    @An     u2502
u2502  u25ba Payment Gateway  [100%]           u2502
u2502  u25bc Invoice Generation [20%] [+ Task] u2502
u2502    u251cu2500 u25cf Design invoice UI   @Cu00e1t   u2502
u2502    u2514u2500 u25cb PDF export          @Du0169ng  u2502
u251cu2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2524
u2502  Tasks khu00f4ng cu00f3 Story (2) [+ Task]  u2502
u2502  u251cu2500 u25cb Security audit       @Minh   u2502
u2502  u2514u2500 u25cb Performance testing  @An     u2502
u2514u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2518
```

## Related Code Files

**Tu1ea1o mu1edbi:**
- `src/components/board/epic-detail-panel.tsx`

**u0110u1ecdc u0111u1ec3 tu00e1i su1eed du1ee5ng:**
- `src/components/board/TaskModal.tsx` u2014 cu00e1ch pass `parentId` + `defaultType`
- `src/components/board/TaskDetailsModal.tsx` u2014 cu00e1ch trigger view details

## Implementation Steps

1. **`src/components/board/epic-detail-panel.tsx`** u2014 skeleton:
   ```tsx
   export default function EpicDetailPanel({ epic, allItems, users, isOpen, onClose, onUpdate }: EpicDetailPanelProps)
   ```

2. **Overlay + panel container** vu1edbi framer-motion:
   ```tsx
   <AnimatePresence>
     {isOpen && (
       <>
         <motion.div  // overlay
           initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
           className="fixed inset-0 bg-black/20 z-40"
           onClick={onClose}
         />
         <motion.div  // panel
           initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
           transition={{ type: 'spring', damping: 30, stiffness: 300 }}
           className="fixed right-0 top-0 h-full w-[480px] bg-white z-50 shadow-2xl overflow-y-auto"
         >
           {/* content */}
         </motion.div>
       </>
     )}
   </AnimatePresence>
   ```

3. **Epic header section** u2014 title, owner, due date, progress bar, KR chips

4. **Stories section** u2014 map stories, mu1ed7i story cu00f3 `isExpanded` state (local), collapsible task list bu00ean trong

5. **StoryRow sub-component** (inline trong file, khu00f4ng cu1ea7n file riu00eang):
   ```tsx
   function StoryRow({ story, tasks, users, onAddTask, onViewTask }: ...)
   ```

6. **TaskRow sub-component** (inline):
   - Status icon: `u2714` Done / `u25cf` InProgress / `u25cb` Todo
   - Title truncated
   - Assignee name
   - Click u2192 `onViewTask(task)` u2192 TaskDetailsModal

7. **Orphan tasks section** u2014 direct children cu1ee7a Epic cu00f3 type khu00f4ng phu1ea3i UserStory

8. **TaskModal integration** u2014 `useState` cho `createModal: { open, parentId, defaultType }`

## Todo

- [ ] Tu1ea1o `src/components/board/epic-detail-panel.tsx`
- [ ] Panel slide-over animation u0111u00fang
- [ ] Stories collapsible vu1edbi task list
- [ ] `[+ New Story]` tu1ea1o u0111u01b0u1ee3c Story linked Epic
- [ ] `[+ New Task]` trong Story tu1ea1o u0111u01b0u1ee3c Task linked Story
- [ ] Test: tu1ea1o Story/Task tu1eeb panel, refresh hiu1ec3n thu1ecb u0111u00fang

## Success Criteria

- Panel slide-in mu01b0u1ee3t, overlay click u0111u00f3ng
- Stories expand/collapse u0111u01b0u1ee3c
- Tu1ea1o Story mu1edbi u2192 xuu1ea5t hiu1ec7n ngay trong panel
- Tu1ea1o Task trong Story u2192 xuu1ea5t hiu1ec7n trong story row
- Progress cu1eadp nhu1eadt sau khi thu00eam task
