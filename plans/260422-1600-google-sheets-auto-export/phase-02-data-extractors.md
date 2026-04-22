# Phase 2: Data Extractors

## Priority: High | Effort: Large

## Overview

Create data extractor functions for each of the 13 sheets.

## Files to Create

### `server/services/sheets-export/extractors/`

Create modular extractors:

```
server/services/sheets-export/
├── extractors/
│   ├── index.ts
│   ├── analytics-overview.extractor.ts
│   ├── analytics-dashboard.extractor.ts
│   ├── workspace.extractor.ts
│   ├── planning.extractor.ts
│   ├── rituals.extractor.ts
│   └── crm.extractor.ts
```

## Tasks

- [ ] Create `analytics-overview.extractor.ts` (Realtime + Cohort)
- [ ] Create `analytics-dashboard.extractor.ts` (PM Dashboard metrics)
- [ ] Create `workspace.extractor.ts` (Tech/Marketing/Media/Sales boards)
- [ ] Create `planning.extractor.ts` (OKRs, Backlog, Sprint)
- [ ] Create `rituals.extractor.ts` (DailySync, WeeklyReport with full detail)
- [ ] Create `crm.extractor.ts` (Lead Tracker)
- [ ] Create `index.ts` barrel export

## Extractor Interface

```typescript
// server/services/sheets-export/extractors/types.ts
import { PrismaClient } from '@prisma/client';
import { SheetData } from '../../../types/sheets-export.types';

export interface ExtractorContext {
  prisma: PrismaClient;
  dateFrom?: string;
  dateTo?: string;
}

export type Extractor = (ctx: ExtractorContext) => Promise<SheetData>;
```

## Sheet Extractors

### 1. Analytics Overview (Realtime + Cohort)

Headers: Date, Ad Spend, Sessions, CPSe, Signups, Signups Rate, CPSi, Opps, Opps Rate, CPOpp, Order, Order Rate, CPOr, MQL, MQL Gold, MQL Silver, MQL Bronze, MQL Rate, Pre-PQL, Pre-PQL Rate, PQL, PQL Rate, Pre-SQL, Pre-SQL Rate, SQL, SQL Rate, Revenue, ROAS, ME/RE

### 2. Analytics Dashboard

Headers: Metric, Value, Status/Trend

Rows:
- Sprint Burndown: {done}/{total}, {status}
- Overdue Tasks: {count}
- Review Queue: {count}
- WIP/Person: {value}, {status}
- Daily Reports: {submitted}/{total}
- Team Confidence: {avg}, {approved}/{total}
- Dept Progress Tech/Mkt/Media/Sale: {%}
- Status Breakdown: Todo/Active/Review/Done counts

### 3. Workspace Boards (Tech/Marketing/Media/Sales)

Headers: ID, Title, Description, Status, Priority, Type, Assignee, Sprint, Due Date, Story Points, Parent, KR Links, Created At, Updated At

### 4. Planning - OKRs

Headers: ID, Title, Department, Owner, Progress %, Level, Parent ID, Key Results (JSON)

### 5. Planning - Backlog

Same as Workspace, filter: sprintId = null

### 6. Planning - Sprint

Headers: Sprint Name, Start Date, End Date, then WorkItem columns

### 7. Rituals - Daily Sync (Full Detail)

Headers: Created Date, Submission Status, Reporter, Team, Status, Report Date, Completed Tasks, Completed Metrics, Doing Tasks, Doing Metrics, Today Plans, Priority Items, Blockers, Blocker Impact, Ad-hoc Tasks

### 8. Rituals - Weekly Report (Full Detail)

Headers: Reporter, Week Ending, Status, Score, Confidence, Progress, Plans, Blockers, KR Progress, Ad-hoc Tasks, Approved By, Approved At

### 9. CRM - Lead Tracker

Headers: ID, Customer Name, AE, Received Date, Resolved Date, Status, Lead Type, Unqualified Type, Notes, Created At

## Example Extractor

```typescript
// server/services/sheets-export/extractors/workspace.extractor.ts
import { ExtractorContext, Extractor } from './types';
import { SheetData } from '../../../types/sheets-export.types';

const DEPARTMENTS = ['Tech', 'Marketing', 'Media', 'Sale'] as const;

export const createWorkspaceExtractor = (department: string): Extractor => {
  return async (ctx: ExtractorContext): Promise<SheetData> => {
    const items = await ctx.prisma.workItem.findMany({
      where: {
        // Filter by department based on assignee or type
      },
      include: {
        assignee: { select: { fullName: true } },
        sprint: { select: { name: true } },
        parent: { select: { title: true } },
        krLinks: { include: { keyResult: { select: { title: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const headers = [
      'ID', 'Title', 'Description', 'Status', 'Priority', 'Type',
      'Assignee', 'Sprint', 'Due Date', 'Story Points', 'Parent', 
      'KR Links', 'Created At', 'Updated At'
    ];

    const rows = items.map(item => [
      item.id,
      item.title,
      item.description || '',
      item.status,
      item.priority,
      item.type,
      item.assignee?.fullName || '',
      item.sprint?.name || '',
      item.dueDate?.toISOString().split('T')[0] || '',
      item.storyPoints || '',
      item.parent?.title || '',
      item.krLinks.map(l => l.keyResult.title).join(', '),
      item.createdAt.toISOString(),
      item.updatedAt.toISOString(),
    ]);

    return {
      sheetName: `Workspace-${department}`,
      headers,
      rows,
    };
  };
};
```

## Validation

- [ ] Each extractor returns valid SheetData
- [ ] Rituals extractors include full detail (not just metadata)
- [ ] Analytics Overview includes both Realtime and Cohort data
