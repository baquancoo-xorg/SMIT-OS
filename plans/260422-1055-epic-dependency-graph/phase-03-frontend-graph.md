# Phase 03 — Frontend Graph

**Status:** completed  
**Priority:** High  
**Depends on:** Phase 02

## Overview

Cài `@xyflow/react`, thêm types, tạo custom node component và trang `EpicGraph.tsx`.

## Related Files

- Modify: `src/types.ts`
- Create: `src/components/board/epic-graph-node.tsx`
- Create: `src/pages/EpicGraph.tsx`

## File Size Budget

| File | Budget |
|------|--------|
| `epic-graph-node.tsx` | ≤ 80 lines |
| `EpicGraph.tsx` | ≤ 200 lines |

## Implementation Steps

### 1. Cài thư viện

```bash
npm install @xyflow/react
```

### 2. Thêm types vào `src/types.ts`

```ts
export interface EpicGraphNode {
  id: string;
  title: string;
  status: string;
  priority: string;
  primaryTeam: string;
  teams: string[];
  progress: number;
  taskCount: number;
  storyCount: number;
}

export interface EpicDependencyLink {
  id: string;
  fromId: string;
  toId: string;
}

export interface EpicGraphData {
  epics: EpicGraphNode[];
  links: EpicDependencyLink[];
}
```

### 3. `epic-graph-node.tsx` — Custom ReactFlow node

Team color map:
```ts
const TEAM_COLORS: Record<string, { border: string; badge: string; text: string }> = {
  Tech:        { border: 'border-indigo-400', badge: 'bg-indigo-100 text-indigo-700', text: 'text-indigo-600' },
  Marketing:   { border: 'border-amber-400',  badge: 'bg-amber-100  text-amber-700',  text: 'text-amber-600'  },
  Media:       { border: 'border-purple-400', badge: 'bg-purple-100 text-purple-700', text: 'text-purple-600' },
  Sale:        { border: 'border-emerald-400',badge: 'bg-emerald-100 text-emerald-700',text: 'text-emerald-600'},
  'Cross-team':{ border: 'border-slate-400', badge: 'bg-slate-100  text-slate-600',   text: 'text-slate-500'  },
  Unassigned:  { border: 'border-slate-300', badge: 'bg-slate-50   text-slate-400',   text: 'text-slate-400'  },
};
```

Node hiển thị:
- Header: team badge + title
- Progress bar màu theo team
- Footer: story count + task count + status chip
- Handle top + bottom cho edges

### 4. `EpicGraph.tsx` — Main page

Structure:
```tsx
export default function EpicGraph() {
  // State: graphData, loading, teamFilter, statusFilter
  // State: linkingFrom (epic node đang được chọn để link)
  // State: selectedEpic (mở EpicDetailPanel)

  // fetchGraph() → GET /api/work-items/epics/graph

  // Build ReactFlow nodes từ graphData.epics:
  //   - Position: sắp xếp theo primaryTeam (cột) + index (hàng)
  //   - Filter theo teamFilter/statusFilter

  // Build ReactFlow edges từ graphData.links:
  //   - style: dashed, animated: false
  //   - label: 'related'

  // handleNodeClick(node):
  //   - Nếu linkingFrom !== null → POST dependency → reset linkingFrom
  //   - Nếu không → setSelectedEpic (mở EpicDetailPanel)

  // handleConnect(params) → POST /api/work-items/dependencies

  // handleEdgeClick(edge) → confirm → DELETE /api/work-items/dependencies/:id

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      {/* Filter bar: team + status */}
      {/* ReactFlow canvas */}
      {/* EpicDetailPanel (reuse existing) */}
    </div>
  );
}
```

**Node auto-positioning** (không cần dagre):
```ts
const TEAM_ORDER = ['Tech', 'Marketing', 'Media', 'Sale', 'Cross-team', 'Unassigned'];
const COL_WIDTH = 260, ROW_HEIGHT = 160;

function buildNodes(epics: EpicGraphNode[], filters): Node[] {
  const filtered = epics.filter(e =>
    (filters.team === 'All' || e.primaryTeam === filters.team) &&
    (filters.status === 'All' || e.status === filters.status)
  );
  const byTeam = groupBy(filtered, e => e.primaryTeam);
  const nodes: Node[] = [];
  TEAM_ORDER.forEach((team, colIdx) => {
    (byTeam[team] ?? []).forEach((epic, rowIdx) => {
      nodes.push({
        id: epic.id,
        type: 'epicNode',
        position: { x: colIdx * COL_WIDTH, y: rowIdx * ROW_HEIGHT },
        data: epic,
      });
    });
  });
  return nodes;
}
```

**Dependency creation UX** (Ctrl+Click flow):
- Ctrl+Click node → highlight border orange, set `linkingFrom`
- Click another node → POST → refresh → clear `linkingFrom`
- Press Escape → cancel
- Hoặc dùng ReactFlow `onConnect` callback (connect handle kéo thả)

## ReactFlow CSS

Thêm import vào `EpicGraph.tsx`:
```ts
import '@xyflow/react/dist/style.css';
```

## Todo

- [x] `npm install @xyflow/react`
- [x] Thêm types (`EpicGraphNode`, `EpicDependencyLink`, `EpicGraphData`) vào `src/types.ts`
- [x] Tạo `src/components/board/epic-graph-node.tsx`
- [x] Tạo `src/pages/EpicGraph.tsx`
- [x] Verify compile: `npx tsc --noEmit`
- [x] Test: graph load đúng, filter hoạt động, click node mở panel

## Success Criteria

- Graph hiển thị tất cả Epic, màu đúng theo team
- Edge "related" kết nối được giữa 2 node
- Filter team/status lọc đúng
- Click node mở `EpicDetailPanel` hiện có
- Cross-team epic có badge riêng
- Kéo thả node để reposition hoạt động (ReactFlow built-in)
