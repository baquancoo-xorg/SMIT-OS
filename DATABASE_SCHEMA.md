# Database Schema Documentation - SMIT-OS

> **Database Type:** PostgreSQL  
> **ORM:** Prisma  
> **Last Updated:** April 13, 2026

---

## Overview

The database consists of **7 tables** that manage an agency/organization's operations including:
- User management and authentication
- Sprint-based project management
- Objectives and Key Results (OKR) tracking
- Work item/task management
- Weekly reporting with approval workflow
- Daily sync reporting

---

## Table Details

### 1. `User`

Stores user account information for all system users.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | String (UUID) | Primary Key, Default: `uuid()` | Unique identifier for the user |
| `fullName` | String | NOT NULL | Full name of the user |
| `username` | String | UNIQUE, NOT NULL | Unique username for login |
| `password` | String | NOT NULL | Hashed password for authentication |
| `department` | String | NOT NULL | Department the user belongs to |
| `role` | String | NOT NULL | User role: `Admin`, `Leader`, or `Member` |
| `scope` | String | NULLABLE | Job position/title (e.g., "Backend Developer") |
| `avatar` | String | NOT NULL | URL/path to user's avatar image |
| `isAdmin` | Boolean | NOT NULL, Default: `false` | Flag indicating if user has admin privileges |

**Relationships:**
- One-to-Many with `Objective` (user can own multiple objectives)
- One-to-Many with `WorkItem` (user can be assigned to multiple work items)
- One-to-Many with `WeeklyReport` (user can submit multiple weekly reports)
- One-to-Many with `WeeklyReport` (user can approve multiple weekly reports, via `approvedReports`)
- One-to-Many with `DailyReport` (user can submit multiple daily reports)
- One-to-Many with `DailyReport` (user can approve multiple daily reports, via `approvedDailyReports`)

---

### 2. `Sprint`

Manages sprint cycles for agile/scrum project management.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | String (UUID) | Primary Key, Default: `uuid()` | Unique identifier for the sprint |
| `name` | String | NOT NULL | Name of the sprint (e.g., "Sprint 1 - Q2 2026") |
| `startDate` | DateTime | NOT NULL | Start date of the sprint |
| `endDate` | DateTime | NOT NULL | End date of the sprint |

**Relationships:**
- One-to-Many with `WorkItem` (sprint contains multiple work items)

---

### 3. `Objective`

Stores organizational objectives as part of the OKR (Objectives and Key Results) framework. Supports hierarchical L1 (Company) → L2 (Team) structure.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | String (UUID) | Primary Key, Default: `uuid()` | Unique identifier for the objective |
| `title` | String | NOT NULL | Title/name of the objective |
| `department` | String | NOT NULL | Department responsible for this objective |
| `progressPercentage` | Float | NOT NULL, Default: `0` | Current progress percentage (0-100) |
| `ownerId` | String (UUID) | NULLABLE, Foreign Key → User.id | ID of the user who owns this objective |
| `parentId` | String (UUID) | NULLABLE, Foreign Key → Objective.id | ID of the parent L1 objective (for L2 objectives) |

**Relationships:**
- Many-to-One with `User` (objective owner)
- Many-to-One with `Objective` (parent L1 objective, self-referencing)
- One-to-Many with `Objective` (child L2 objectives, self-referencing)
- One-to-Many with `KeyResult` (objective has multiple key results)

---

### 4. `KeyResult`

Stores key results associated with objectives for tracking OKR progress. Supports hierarchical alignment between L1 and L2 Key Results.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | String (UUID) | Primary Key, Default: `uuid()` | Unique identifier for the key result |
| `title` | String | NOT NULL | Title/description of the key result |
| `progressPercentage` | Float | NOT NULL, Default: `0` | Current progress percentage (0-100) |
| `currentValue` | Float | NOT NULL, Default: `0` | Current measured value |
| `targetValue` | Float | NOT NULL, Default: `100` | Target value to achieve |
| `unit` | String | NOT NULL, Default: `"%"` | Unit of measurement (e.g., "%", "users", "tasks") |
| `objectiveId` | String (UUID) | NOT NULL, Foreign Key → Objective.id | ID of the parent objective |
| `parentKrId` | String (UUID) | NULLABLE, Foreign Key → KeyResult.id | ID of the parent L1 Key Result (for L2 KRs alignment) |

**Relationships:**
- Many-to-One with `Objective` (cascade on delete)
- Many-to-One with `KeyResult` (parent L1 KR alignment, self-referencing via `parentKrId`)
- One-to-Many with `KeyResult` (child L2 KRs, self-referencing)

---

### 5. `WorkItem`

Manages work items/tasks across different departments (Sales, Marketing, Tech, etc.).

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | String (UUID) | Primary Key, Default: `uuid()` | Unique identifier for the work item |
| `title` | String | NOT NULL | Title/summary of the work item |
| `description` | String | NULLABLE | Detailed description of the work item |
| `status` | String | NOT NULL, Default: `"Todo"` | Current status. Allowed values: `"Todo"`, `"In Progress"`, `"Review"`, `"Done"` |
| `priority` | String | NOT NULL, Default: `"Medium"` | Priority level (e.g., "Low", "Medium", "High") |
| `type` | String | NOT NULL, Default: `"Task"` | Type of work item (e.g., "Task", "Bug", "Feature", "Epic", "UserStory") |
| `assigneeId` | String (UUID) | NULLABLE, Foreign Key → User.id | ID of the user assigned to this work item |
| `sprintId` | String (UUID) | NULLABLE, Foreign Key → Sprint.id | ID of the sprint this work item belongs to |
| `linkedKrId` | String (UUID) | NULLABLE | ID of the Key Result this work item is linked to |
| `startDate` | DateTime | NULLABLE | Planned or actual start date of the work item |
| `dueDate` | DateTime | NULLABLE | Deadline/due date for completing the work item |
| `createdAt` | DateTime | NOT NULL, Default: `now()` | Timestamp when the work item was created |
| `updatedAt` | DateTime | NOT NULL, Auto-updated on update | Timestamp of the last modification |
| `storyPoints` | Int | NULLABLE | Story points for effort estimation (used in Tech view) |

**Relationships:**
- Many-to-One with `User` (assignee)
- Many-to-One with `Sprint`

---

### 6. `WeeklyReport`

Stores weekly progress reports submitted by users with approval workflow.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | String (UUID) | Primary Key, Default: `uuid()` | Unique identifier for the report |
| `userId` | String (UUID) | NOT NULL, Foreign Key → User.id | ID of the user who submitted the report |
| `weekEnding` | DateTime | NOT NULL | End date of the reporting week |
| `progress` | String | NOT NULL | JSON string containing progress details |
| `plans` | String | NOT NULL | JSON string containing future plans |
| `blockers` | String | NOT NULL | JSON string containing blockers/obstacles |
| `score` | Int | NOT NULL, Default: `0` | Performance score for the week |
| `status` | String | NOT NULL, Default: `"Review"` | Report status: `"Review"` or `"Approved"` |
| `approvedBy` | String (UUID) | NULLABLE, Foreign Key → User.id | ID of the user who approved the report |
| `approvedAt` | DateTime | NULLABLE | Timestamp when the report was approved |
| `krProgress` | String | NULLABLE | JSON string: `[{krId, currentValue, progressPct}]` for KR updates |
| `createdAt` | DateTime | NOT NULL, Default: `now()` | Timestamp when the report was created |

**Relationships:**
- Many-to-One with `User` (report author)
- Many-to-One with `User` (approver, via `approvedBy`)

---

### 7. `DailyReport`

Stores daily sync reports for tracking daily task progress and blockers.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | String (UUID) | Primary Key, Default: `uuid()` | Unique identifier for the daily report |
| `userId` | String (UUID) | NOT NULL, Foreign Key → User.id | ID of the user who submitted the report |
| `reportDate` | DateTime | NOT NULL | Date of the daily report |
| `status` | String | NOT NULL, Default: `"Review"` | Report status: `"Review"` or `"Approved"` |
| `tasksData` | String | NOT NULL | JSON: `{completedYesterday: string[], doingYesterday: string[], doingToday: string[]}` |
| `blockers` | String | NULLABLE | Description of blockers/obstacles |
| `impactLevel` | String | NULLABLE | Impact level: `"none"`, `"low"`, or `"high"` |
| `approvedBy` | String (UUID) | NULLABLE, Foreign Key → User.id | ID of the user who approved the report |
| `approvedAt` | DateTime | NULLABLE | Timestamp when the report was approved |
| `createdAt` | DateTime | NOT NULL, Default: `now()` | Timestamp when the report was created |
| `updatedAt` | DateTime | NOT NULL, Auto-updated on update | Timestamp of the last modification |

**Relationships:**
- Many-to-One with `User` (report author)
- Many-to-One with `User` (approver, via `approvedBy`)

---

## Entity Relationship Summary

```
User (1) ────< Objective (L1) (1) ────< Objective (L2) (1) ────< KeyResult
  │                     │
  ├───< WorkItem >──── Sprint
  │       │
  │       └───> KeyResult (linked via linkedKrId)
  │
  ├───< WeeklyReport >──── User (approver)
  │
  └───< DailyReport >──── User (approver)
```

### Relationship Types:
- **User → Objective**: One user can own multiple objectives
- **Objective (L1) → Objective (L2)**: One L1 objective can have multiple child L2 objectives (self-referencing)
- **Objective → KeyResult**: One objective has multiple key results (cascade delete)
- **User → WorkItem**: One user can be assigned to multiple work items
- **Sprint → WorkItem**: One sprint contains multiple work items
- **KeyResult → WorkItem**: One key result can have multiple linked work items (via `linkedKrId`)
- **User → WeeklyReport**: One user can submit multiple weekly reports
- **User → WeeklyReport (approver)**: One user can approve multiple weekly reports
- **User → DailyReport**: One user can submit multiple daily reports
- **User → DailyReport (approver)**: One user can approve multiple daily reports

---

## Data Type Reference

| Prisma Type | PostgreSQL Type | Description |
|-------------|-----------------|-------------|
| `String` | TEXT / VARCHAR | Text data |
| `Boolean` | BOOLEAN | True/False value |
| `Int` | INTEGER | 32-bit integer |
| `Float` | DOUBLE PRECISION | Floating-point number |
| `DateTime` | TIMESTAMP | Date and time value |
| `UUID` | UUID | Universally Unique Identifier |

---

## Notes

1. **All primary keys** use UUID format generated automatically
2. **Cascading deletes** are only defined for `Objective → KeyResult` relationship
3. **JSON fields** (`progress`, `plans`, `blockers` in `WeeklyReport`; `tasksData` in `DailyReport`; `krProgress` in `WeeklyReport`) are stored as stringified JSON
4. **Nullable foreign keys** (`assigneeId`, `sprintId`, `ownerId`, `parentId`, `linkedKrId`, `approvedBy`) allow optional relationships
5. **Department-specific fields** in `WorkItem` (`storyPoints`) are used conditionally based on the team/view
6. **Objective hierarchy**: L1 objectives have no `parentId`; L2 objectives reference their parent L1 via `parentId`
7. **WorkItem status**: Allowed values are `"Todo"`, `"In Progress"`, `"Review"`, `"Done"`
8. **Report status workflow**: Both `WeeklyReport` and `DailyReport` use status values `"Review"` (pending) and `"Approved"`
9. **KR Progress tracking**: `WeeklyReport.krProgress` stores JSON array of Key Result progress updates submitted with the report
