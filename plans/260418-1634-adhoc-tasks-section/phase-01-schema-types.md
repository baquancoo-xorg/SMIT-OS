# Phase 1: Schema + Types

**Status:** pending | **Effort:** 30m | **Priority:** high

## Overview

Thêm `adHocTasks` field vào DailyReport và WeeklyReport models, định nghĩa TypeScript interfaces.

## Requirements

- Field optional để không break existing data
- JSON structure rõ ràng, type-safe

## Implementation Steps

### 1.1 Update Prisma Schema

**File:** `prisma/schema.prisma`

```prisma
model DailyReport {
  // ... existing fields
  adHocTasks  String?   // JSON: [{id, name, requester, impact, status, hoursSpent}]
}

model WeeklyReport {
  // ... existing fields  
  adHocTasks  String?   // JSON: same structure
}
```

### 1.2 Run Migration

```bash
npm run db:push
```

### 1.3 Add TypeScript Interface

**File:** `src/types/daily-report-metrics.ts`

```typescript
export interface AdHocTask {
  id: number;
  name: string;
  requester: string;
  impact: 'low' | 'medium' | 'high';
  status: 'done' | 'in-progress';
  hoursSpent: number;
}

export type AdHocTaskImpact = AdHocTask['impact'];
export type AdHocTaskStatus = AdHocTask['status'];
```

## Todo

- [ ] Add adHocTasks to DailyReport model
- [ ] Add adHocTasks to WeeklyReport model
- [ ] Run db:push migration
- [ ] Add AdHocTask interface to types

## Success Criteria

- [ ] Migration runs without error
- [ ] Types exported correctly
- [ ] Existing reports unaffected
