# Scout Report: Team Backlog, Epic/Story, Daily Sync, Kanban Cards, Workspace/Team Display

Date: 2026-04-20

## 1. Team Backlog Page/Component

- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/ProductBacklog.tsx`  
  The "Team Backlog" page. Fetches all work items via `/api/work-items`, filters to only `Epic` and `UserStory` types (using `BACKLOG_TYPES` constant). Supports board/table view, search, filter by type/priority, sort, create/edit/delete.

- `/Users/dominium/Documents/Project/SMIT-OS/src/types/index.ts`  
  Defines `BACKLOG_TYPES = ['Epic', 'UserStory']` and `TASK_TYPES` constants; `WorkItem` interface with `parentId`, `parent`, `children` hierarchy fields. Type guards `isBacklogType` / `isTaskType`.

## 2. Epic/Story Assignment to Teams

No explicit "teamId" field on `WorkItem` or `Epic`/`UserStory` in Prisma schema. Team assignment is implicit:
- Items are filtered per team board by `assignee.departments` or `item.type` (e.g., TechBoard filters `['Epic', 'UserStory', 'TechTask']` or assignee in Tech dept).
- Hierarchy: `WorkItem.parentId -> parent -> children` (Epic -> UserStory -> Task).

**Key files:**
- `/Users/dominium/Documents/Project/SMIT-OS/prisma/schema.prisma` — `WorkItem` model (lines 87–114): no `teamId`, uses `parentId` for hierarchy.
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/TechBoard.tsx` — filters items by `assignee.departments.includes('Tech')` or type.
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/SaleBoard.tsx` — similar pattern (sale dept filter).
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/MarketingBoard.tsx` — similar.
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/MediaBoard.tsx` — similar.
- `/Users/dominium/Documents/Project/SMIT-OS/server/routes/work-item.routes.ts` — CRUD + parentId circular-reference validation; returns `parent`, `children`, `krLinks` in all queries.
- `/Users/dominium/Documents/Project/SMIT-OS/server/schemas/work-item.schema.ts` — Zod schema for work items.

**Parent/Epic linking in modal:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/board/TaskModal.tsx` — In edit mode, fetches all `Epic`/`UserStory` items and lets user link a parent via `parentId`.

## 3. Daily Sync Logic

- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/DailySync.tsx`  
  Main Daily Sync page. Has two tabs: "reports" and "dashboard". Fetches `DailyReport`s filtered by user/role/dept. Calls `/api/daily-reports`. Renders `TeamFormSelector` (modal) and `PMDashboard` (admin/leader view).

- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/TeamFormSelector.tsx`  
  Detects user team via `detectTeam()` and renders correct form component.

- `/Users/dominium/Documents/Project/SMIT-OS/src/utils/team-detection.ts`  
  Maps dept names to TeamType (`tech`/`marketing`/`media`/`sale`). Also provides `getTeamDisplayName()` and `getTeamColors()`.

- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/TechDailyForm.tsx`  
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/SaleDailyForm.tsx`  
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/MarketingDailyForm.tsx`  
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/MediaDailyForm.tsx`  
  Team-specific daily report forms.

- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/DailyReportBase.tsx`  
  Shared base form logic.

- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/PMDashboard.tsx`  
  Admin/PM dashboard for daily report aggregates.

- `/Users/dominium/Documents/Project/SMIT-OS/server/routes/daily-report.routes.ts`  
  Server-side API routes for daily reports.

- `/Users/dominium/Documents/Project/SMIT-OS/src/hooks/use-daily-report-form.ts`  
  Hook encapsulating daily report form state/submit logic.

**Saturday Sync** (weekly check-in — separate):
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/SaturdaySync.tsx`  
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/modals/WeeklyCheckinModal.tsx`  

## 4. Kanban Task Cards with Epic/Story Links

- `/Users/dominium/Documents/Project/SMIT-OS/src/components/board/TaskCard.tsx`  
  Main task card component. Displays `linkedKr` (Key Result link) with progress bar. Shows `parent` info indirectly via `item.parent`. Expand for description/subtasks. No direct Epic/Story label rendered currently — parent link shown via KR icon only.

- `/Users/dominium/Documents/Project/SMIT-OS/src/components/board/DraggableTaskCard.tsx`  
  Wraps `TaskCard` with DnD.

- `/Users/dominium/Documents/Project/SMIT-OS/src/components/board/TaskDetailsModal.tsx`  
  Detail view for a task (likely shows parent/epic info).

- `/Users/dominium/Documents/Project/SMIT-OS/src/components/board/droppable-column.tsx`  
  Droppable kanban column.

- `/Users/dominium/Documents/Project/SMIT-OS/src/components/board/TaskTableView.tsx`  
  Table view of tasks (likely shows parent column).

## 5. Workspace/Team Group Display Logic

No dedicated "WorkspaceGroup" component exists. Team grouping is done via separate board pages per dept:
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/TechBoard.tsx` — filters by Tech dept/type
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/SaleBoard.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/MarketingBoard.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/MediaBoard.tsx`

Team detection/display utilities:
- `/Users/dominium/Documents/Project/SMIT-OS/src/utils/team-detection.ts` — `detectTeam()`, `getTeamDisplayName()`, `getTeamColors()`
- `/Users/dominium/Documents/Project/SMIT-OS/src/utils/color-mappings.ts` — `TYPE_COLORS`, `PRIORITY_COLORS`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/Sidebar.tsx` — Navigation sidebar with board/sync links
- `/Users/dominium/Documents/Project/SMIT-OS/src/contexts/AuthContext.tsx` — Provides `currentUser.departments[]` used to derive team scope

## Unresolved Questions

1. `TaskCard` currently only renders KR links on the card face — no visible Epic/Story parent label. Is displaying the parent Epic/Story on task cards a requirement?
2. There is no `teamId` on `WorkItem` — Epic/Story are scoped to teams only by assignee dept. Should Epics be explicitly team-scoped in schema?
3. `SaleBoard`, `MarketingBoard`, `MediaBoard` filtering logic not confirmed — assumed similar to `TechBoard` pattern.
