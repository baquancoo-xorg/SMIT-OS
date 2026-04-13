# Task Filtering Fix - Summary

## Problem Identified

Tasks were appearing on all team boards (Tech&Product, Marketing, Media, Sales) instead of being filtered to their respective teams. This was caused by two main issues:

1. **Incorrect Type Filtering**: All boards were filtering by task type and included the generic `'Task'` type, causing tasks to appear on multiple boards
2. **Lost Type Information**: The seed script was normalizing all specific task types to generic types (e.g., `TechTask` → `Task`, `Campaign` → `Epic`), losing the department-specific information

## Solution Implemented

### 1. Updated Board Filtering Logic

Changed all Kanban boards to filter tasks primarily by **assignee's department** instead of just task type:

- **Tech&Product Board**: Shows tasks where `assignee.department === 'Tech'` OR type is `Epic/UserStory/TechTask`
- **Marketing Board**: Shows tasks where `assignee.department === 'Marketing'` OR type is `Campaign/MktTask`
- **Media Board**: Shows tasks where `assignee.department === 'Media'` OR type is `MediaTask`
- **Sales Board**: Shows tasks where `assignee.department === 'Sale'` OR type is `Deal/SaleTask`

### 2. Fixed Seed Script

Modified `scripts/seed-tasks.ts` to **preserve original task types** from the CSV:
- Removed type normalization logic
- Tasks now keep their original types: `TechTask`, `MktTask`, `MediaTask`, `SaleTask`, `Campaign`, `Deal`, `Epic`, `UserStory`
- Improved user mapping to handle all assignees including `user_Quan` (Nguyễn Quân)

### 3. Created Re-seeding Script

Created `scripts/clear-and-seed-tasks.ts` to:
- Clear all existing work items
- Re-seed database with corrected types and proper user assignments
- All 28 tasks from the CSV are now properly seeded with correct types and assignees

## Files Modified

1. **Frontend Filtering Logic**:
   - `src/pages/MarketingKanban.tsx`
   - `src/pages/MediaKanban.tsx`
   - `src/pages/SaleKanban.tsx`
   - `src/pages/TechScrumBoard.tsx`
   - `src/pages/ProductBacklog.tsx`

2. **Seed Scripts**:
   - `scripts/seed-tasks.ts`
   - `scripts/clear-and-seed-tasks.ts` (new)

3. **Package Configuration**:
   - `package.json` (added `db:clear-seed-tasks` script)

## Task Distribution (from CSV)

### Tech&Product Team (8 tasks)
- Assigned to: Đăng Khoa, Ngọc Phong, Huy Hoàng, Giang Trường
- Types: Epic, TechTask, UserStory
- Statuses: To Do, In Progress, Review, Done

### Marketing Team (7 tasks)
- Assigned to: Hà Canh
- Types: Campaign, MktTask
- Statuses: To Do, In Progress, Review, Done

### Media Team (5 tasks)
- Assigned to: Thành Long
- Types: MediaTask
- Statuses: To Do, In Progress, Review, Done

### Sales Team (8 tasks)
- Assigned to: Kim Huệ, Hồng Nhung, Nguyễn Quân
- Types: Deal, SaleTask, Epic
- Statuses: To Do, In Progress, Review, Done

## How to Apply Changes

1. **Re-seed the database** (if needed):
   ```bash
   npm run db:clear-seed-tasks
   ```

2. **Build and run**:
   ```bash
   npm run build
   npm run dev
   ```

3. **Verify**: Each team board should now only show tasks assigned to team members

## Verification

- ✅ Build completed successfully with no errors
- ✅ All 28 tasks seeded correctly with original types preserved
- ✅ All users properly mapped (including user_Quan)
- ✅ Filtering logic updated to use assignee department
- ✅ Each board will now show only relevant tasks for that team
