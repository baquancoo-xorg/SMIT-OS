# SMIT OS Scout Report

## Project Overview

**Tech Stack:**
- Frontend: React + TypeScript + Vite
- Backend: Express.js + Prisma ORM
- Database: PostgreSQL
- Styling: TailwindCSS
- Animation: Motion (framer-motion)

## Key File Paths

### Database Schema
- `/Users/dominium/Documents/Project/SMIT-OS/prisma/schema.prisma` - Main schema with:
  - `User` model (id, fullName, username, password, department, role, scope, avatar, isAdmin)
  - `Sprint` model (id, name, startDate, endDate)
  - `Objective` model (id, title, department, progressPercentage, ownerId, parentId) - Supports L1/L2 hierarchy
  - `KeyResult` model (id, title, progressPercentage, currentValue, targetValue, unit, objectiveId)
  - `WorkItem` model (id, title, description, status, priority, type, assigneeId, sprintId, linkedKrId, storyPoints)
  - `WeeklyReport` model (id, userId, weekEnding, progress, plans, blockers, score)

### Server/API
- `/Users/dominium/Documents/Project/SMIT-OS/server.ts` - Express server with REST APIs:
  - `/api/login` - Authentication
  - `/api/users` - User CRUD
  - `/api/sprints` - Sprint CRUD
  - `/api/objectives` - OKR Objectives CRUD (includes keyResults, parent/children relations)
  - `/api/key-results` - Key Results CRUD
  - `/api/work-items` - Work Items CRUD
  - `/api/reports` - Weekly Reports CRUD

### Navigation/Routing
- `/Users/dominium/Documents/Project/SMIT-OS/src/App.tsx` - Main app with ViewType routing
  - ViewTypes: 'dashboard', 'okrs', 'tech', 'backlog', 'mkt', 'media', 'sale', 'sync', 'settings', 'profile'

### Sidebar/Navigation
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/Sidebar.tsx` - Main navigation component
  - Strategic section: Overview, OKRs
  - Operations section: Tech&Product, Marketing, Media, Sales
  - System section: Product Backlog, Reports (sync view)

### Report Components & Pages
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/SaturdaySync.tsx` - Weekly Report page ("Saturday Sync")
  - Displays team confidence metrics, reports submitted count, active blockers
  - Uses WeeklyCheckinModal for creating reports
  - Uses ReportDetailDialog for viewing report details
  - Uses ReportTableView for report listing

- `/Users/dominium/Documents/Project/SMIT-OS/src/components/board/ReportTableView.tsx` - Table view for reports
  - Displays: Department, Reporter, Created at, Sprint, Week
  - Sorted by weekEnding date (most recent first)

- `/Users/dominium/Documents/Project/SMIT-OS/src/components/modals/WeeklyCheckinModal.tsx` - Weekly report creation modal
  - Fields: Confidence Score (1-10), KR Reviews (per key result), Next Week Plans, Blockers
  - Submits to `/api/reports` POST endpoint

- `/Users/dominium/Documents/Project/SMIT-OS/src/components/modals/ReportDetailDialog.tsx` - Report detail view
  - Displays: Progress (per KR), Plans (table format), Blockers, Confidence Score

### OKR Components & Pages
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/OKRsManagement.tsx` - OKR management page
  - L1 (Company) objectives: department === 'BOD'
  - L2 (Team) objectives: department !== 'BOD'
  - Supports parentId-based hierarchy
  - Progress calculation: `(currentValue / targetValue) * 100`
  - Components: ObjectiveAccordionCard, ObjectiveAccordionCardL2, KeyResultRow, AddKRButton
  - Modals: AddObjectiveModal, EditKRModal, UpdateProgressModal, LinkWorkItemModal, DeleteConfirmModal

### Backlog Components & Pages
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/ProductBacklog.tsx` - Product Backlog page
  - Views: 'board' (grouped by type) or 'table'
  - Filters: Type (Epic, UserStory, TechTask, Task), Priority, Sort by
  - Work items without sprintId and Tech department
  - Components: BacklogGroupCard, BacklogItemRow, BacklogTableView
  - Uses TaskModal and TaskDetailsModal for CRUD

### Types
- `/Users/dominium/Documents/Project/SMIT-OS/src/types/index.ts` - TypeScript interfaces:
  - `User`, `Sprint`, `KeyResult`, `Objective`, `WorkItem`, `WeeklyReport`
  - `WorkItemType`: Epic, UserStory, TechTask, Campaign, MediaTask, MktTask, Deal, SaleTask, Task
  - `Priority`: Low, Medium, High, Urgent

### Documentation (Sample Reports)
- `/Users/dominium/Documents/Project/SMIT-OS/docs/Daily Report Template.md` - Daily report template
- `/Users/dominium/Documents/Project/SMIT-OS/docs/Weekly_Reports_Tuần_1_Sprint_1.md` - Sample weekly report
- `/Users/dominium/Documents/Project/SMIT-OS/docs/Weekly_Reports_Tuần_1_Sprint_2.md` - Sample weekly report
- `/Users/dominium/Documents/Project/SMIT-OS/docs/Weekly_Reports_Tuần_2_Sprint_1.md` - Sample weekly report

## Key Patterns Discovered

### OKR Calculation Logic
```typescript
// L1 (Company) = objectives with department === 'BOD'
// L2 (Team) = objectives with department !== 'BOD'
// Parent-child relationship via parentId field

// Key Result progress: (currentValue / targetValue) * 100
const progress = Math.min(100, Math.round((krData.currentValue / krData.targetValue) * 100)) || 0;

// Objective progress: average of all key results
const avgProgress = objectives.reduce((sum, obj) => sum + obj.progressPercentage, 0) / objectives.length;
```

### Weekly Report Data Structure
```typescript
interface WeeklyReport {
  id: string;
  userId: string;
  user?: User;
  weekEnding: string;
  progress: string; // JSON: { keyResults: [{ krId, title, previousProgress, currentProgress, progressChange, activities, impact }] }
  plans: string;    // JSON: { items: [{ stt, item, output, deadline }] }
  blockers: string; // JSON: { items: [{ difficulty, supportRequest }] }
  score: number;
  confidenceScore?: number;
  createdAt: string;
}
```

### Navigation Structure
```
Strategic:
- Overview (dashboard) -> PMDashboard
- OKRs (okrs) -> OKRsManagement

Operations:
- Tech&Product (tech) -> TechScrumBoard
- Marketing (mkt) -> MarketingKanban
- Media (media) -> MediaKanban
- Sales (sale) -> SaleKanban

System:
- Product Backlog (backlog) -> ProductBacklog
- Reports (sync) -> SaturdaySync
```

## Additional Files Found

### Scripts
- `/Users/dominium/Documents/Project/SMIT-OS/scripts/seed-weekly-reports.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/scripts/seed-okrs.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/scripts/seed-members-sprints.ts`

### Other Kanban Pages
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/TechScrumBoard.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/MarketingKanban.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/MediaKanban.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/SaleKanban.tsx`

## Unresolved Questions
- No Daily Report page/component exists yet (only template in docs)
- No dedicated "Product Backlog" concept for non-Tech departments (each department has its own Kanban)
- The `score` field in WeeklyReport schema exists but no UI for scoring reports
