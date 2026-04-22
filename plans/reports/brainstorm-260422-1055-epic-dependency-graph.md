---
title: Epic Dependency Graph — Brainstorm Report
date: 2026-04-22
author: brainstorm agent
---

# Epic Dependency Graph

## Problem Statement

WorkItem model supports Epic→Story→Task hierarchy via `parentId`, nhưng:
- Không có cross-epic dependency
- Team của epic phải suy ra gián tiếp qua assignee.departments
- Không có view tổng quan multi-team
- Hierarchy linh hoạt (Epic-only hoặc Story-only) khó hình dung

## Requirements

- Xem tổng quan tất cả Epic trên 4 teams: Tech, Marketing, Media, Sale
- Thấy task thuộc team nào
- Thấy liên kết chéo giữa các Epic (type: "related")
- UI: Graph/Dependency map với node-based visualization

## Evaluated Approaches

| Option | Schema change | Complexity | Visual quality |
|--------|--------------|------------|----------------|
| A — Graph View (ReactFlow) | +1 bảng nhỏ | Medium | High |
| B — Tree Table | Không | Low | Medium |
| C — Team Matrix + SVG | +1 bảng nhỏ | Medium | Medium |

## Final Solution: Option A — Epic Dependency Graph

### Schema

Thêm `WorkItemDependency` junction table:
```prisma
model WorkItemDependency {
  id        String   @id @default(uuid())
  fromId    String
  from      WorkItem @relation("DepFrom", fields: [fromId], references: [id], onDelete: Cascade)
  toId      String
  to        WorkItem @relation("DepTo", fields: [toId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@unique([fromId, toId])
}
```

### Team Inference (không thêm field)

`epic.primaryTeam = most_common(allDescendantTasks.map(t => t.assignee.departments[0]))`

Epic spanning nhiều team → "Cross-team" badge màu slate.

Color map:
- Tech → Blue/Indigo
- Marketing → Amber
- Media → Purple
- Sale → Emerald
- Cross-team → Slate

### API

```
GET  /api/work-items/epics/graph
     → { epics: [{id, title, status, progress, primaryTeam, teams[], storyCount, taskCount}],
         links: [{id, fromId, toId}] }

POST   /api/work-items/dependencies  { fromId, toId }
DELETE /api/work-items/dependencies/:id
```

### UI: EpicGraph.tsx

- Thư viện: `@xyflow/react` (ReactFlow v12, React 19 compatible)
- Node = Epic card: title, progress bar, team badge, S/T counts, team-color border
- Edge = dashed line "related" label
- Filter bar: team, status
- Click node → existing `EpicDetailPanel`
- Ctrl+Click → select source → click target → create link

### Route

`/epic-graph` thêm vào App.tsx và sidebar nav

## Risks

- `@xyflow/react` ~120KB gzip — acceptable trade-off cho tính năng này
- Team inference logic phụ thuộc data nhất quán (assignee đúng department)
- Auto-layout graph (dagre/elk) cần thêm layout library nhỏ

## Success Criteria

- [ ] Tất cả Epic của 4 teams hiển thị trên graph
- [ ] Node màu đúng theo team
- [ ] "Related" edge kết nối được 2 epic bất kỳ
- [ ] Filter theo team/status hoạt động
- [ ] Click node mở EpicDetailPanel hiện có
- [ ] Cross-team epic có badge riêng

## Next Steps

1. Phase 1: Schema migration + API endpoint
2. Phase 2: Graph UI (EpicGraph.tsx) với ReactFlow
3. Phase 3: Dependency management (add/remove links)
4. Phase 4: Nav integration + polish
