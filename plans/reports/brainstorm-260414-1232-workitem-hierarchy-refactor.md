# Brainstorm: WorkItem Hierarchy Refactor

**Date:** 2024-04-14
**Status:** Approved for Planning

## Problem Statement

Hiện tại:
- Task link với Key Result (KR) - không hợp lý về logic nghiệp vụ
- Team Backlog cho phép tạo tất cả types (Epic, Story, Task)
- Không có hierarchy giữa Epic → Story → Task

Yêu cầu:
1. Task link với Epic/Story (optional), không link KR
2. Epic/Story có thể link KR (optional)
3. Team Backlog chỉ tạo Epic, Story
4. Workspace chỉ tạo Task

## Chosen Approach: Clean Architecture

### Schema Changes

```prisma
model WorkItem {
  // ... existing fields
  parentId    String?    // NEW: self-reference
  parent      WorkItem?  @relation("WorkItemHierarchy", fields: [parentId], references: [id])
  children    WorkItem[] @relation("WorkItemHierarchy")
  
  // linkedKrId: REMOVE
}

model WorkItemKrLink {  // NEW
  id           String    @id @default(uuid())
  workItemId   String
  workItem     WorkItem  @relation(fields: [workItemId], references: [id])
  keyResultId  String
  keyResult    KeyResult @relation(fields: [keyResultId], references: [id])
  
  @@unique([workItemId, keyResultId])
}
```

### UI Changes

| Location | Change |
|----------|--------|
| TaskModal | Remove "Link to Key Result", add "Link to Parent" (edit mode only) |
| Team Backlog | Filter type: Epic, UserStory only |
| Workspace boards | Filter type: Task types only (TechTask, MktTask, etc.) |

### Migration Steps

1. Create `WorkItemKrLink` table
2. Migrate data: `linkedKrId` → `WorkItemKrLink`
3. Add `parentId` column to WorkItem
4. Drop `linkedKrId` column
5. Update UI components

### Affected Files

- `prisma/schema.prisma`
- `server/services/work-item.service.ts`
- `src/components/board/TaskModal.tsx`
- `src/pages/ProductBacklog.tsx`
- `src/pages/TechBoard.tsx` (và các board khác)
- `src/types/index.ts`

## Constraints

- Backward compatible: existing data must be migrated
- No dropdown for parent selection when creating Task (link parent later if needed)
- Task types: TechTask, MktTask, MediaTask, SaleTask
- Epic/Story types: Epic, UserStory
