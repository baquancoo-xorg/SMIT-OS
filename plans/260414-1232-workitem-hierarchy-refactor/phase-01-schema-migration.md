# Phase 1: Schema Migration

## Overview

Add hierarchy support và junction table cho KR linking.

**Priority:** Critical | **Effort:** 45m | **Risk:** Medium

## Context

- [Prisma Schema](../../prisma/schema.prisma)
- [Brainstorm Report](../reports/brainstorm-260414-1232-workitem-hierarchy-refactor.md)

## Requirements

### Functional
- WorkItem self-reference cho hierarchy (parentId)
- WorkItemKrLink junction table
- Migrate existing linkedKrId data

### Non-functional
- Zero downtime migration
- Data integrity preserved

## Schema Changes

### WorkItem Model Update

```prisma
model WorkItem {
  id          String   @id @default(uuid())
  title       String
  description String?
  status      String   @default("Todo")
  priority    String   @default("Medium")
  type        String   @default("Task")
  assigneeId  String?
  assignee    User?    @relation(fields: [assigneeId], references: [id])
  sprintId    String?
  sprint      Sprint?  @relation(fields: [sprintId], references: [id])
  
  // NEW: Parent hierarchy
  parentId    String?
  parent      WorkItem?  @relation("WorkItemHierarchy", fields: [parentId], references: [id])
  children    WorkItem[] @relation("WorkItemHierarchy")
  
  // REMOVE: linkedKrId (after migration)
  
  startDate   DateTime?
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  storyPoints Int?
  
  // NEW: Relation to junction table
  krLinks     WorkItemKrLink[]
}
```

### New Junction Table

```prisma
model WorkItemKrLink {
  id           String    @id @default(uuid())
  workItemId   String
  workItem     WorkItem  @relation(fields: [workItemId], references: [id], onDelete: Cascade)
  keyResultId  String
  keyResult    KeyResult @relation(fields: [keyResultId], references: [id], onDelete: Cascade)
  createdAt    DateTime  @default(now())

  @@unique([workItemId, keyResultId])
}
```

### KeyResult Model Update

```prisma
model KeyResult {
  // ... existing fields
  workItemLinks WorkItemKrLink[]
}
```

## Implementation Steps

### Step 1: Add new fields (non-breaking)

Edit `prisma/schema.prisma`:
1. Add `parentId`, `parent`, `children` to WorkItem
2. Add `WorkItemKrLink` model
3. Add `krLinks` to WorkItem
4. Add `workItemLinks` to KeyResult

### Step 2: Generate migration

```bash
npm run db:push
# Or for production:
# npx prisma migrate dev --name add_workitem_hierarchy
```

### Step 3: Create migration script

Create `scripts/migrate-linked-kr.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateLinkedKr() {
  // Get all WorkItems with linkedKrId
  const items = await prisma.$queryRaw`
    SELECT id, "linkedKrId" FROM "WorkItem" 
    WHERE "linkedKrId" IS NOT NULL
  `;
  
  console.log(`Found ${items.length} items to migrate`);
  
  for (const item of items) {
    // Create WorkItemKrLink
    await prisma.workItemKrLink.create({
      data: {
        workItemId: item.id,
        keyResultId: item.linkedKrId
      }
    });
  }
  
  console.log('Migration complete');
}

migrateLinkedKr()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Step 4: Run migration script

```bash
npx tsx scripts/migrate-linked-kr.ts
```

### Step 5: Remove old column

After verifying migration success:
1. Remove `linkedKrId` from schema
2. Run `npm run db:push`

## Todo

- [x] Add parentId, parent, children to WorkItem
- [x] Create WorkItemKrLink model
- [x] Update KeyResult model
- [x] Generate Prisma migration
- [x] Create migration script
- [x] Run migration script
- [x] Verify data integrity
- [x] Remove linkedKrId column

## Success Criteria

- [x] parentId column exists in WorkItem
- [x] WorkItemKrLink table created
- [x] Existing linkedKrId data migrated
- [x] No data loss

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data loss | Low | High | Backup before migration |
| Migration failure | Low | Medium | Script with transaction |

## Rollback

```bash
# If migration fails:
git checkout prisma/schema.prisma
npm run db:push
```
