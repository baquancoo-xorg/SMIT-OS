# Epic Dependency Graph — Implementation Complete

**Date**: 2026-04-22
**Severity**: Medium
**Component**: Work Items / EpicBoard / Navigation
**Status**: Resolved

## What Happened

Shipped the Epic Dependency Graph feature end-to-end: Prisma schema, 3 API endpoints, ReactFlow-based
graph page, and sidebar navigation. Epics now display as nodes with team-colored borders, progress bars,
and dependency edges users can draw or delete interactively.

## The Brutal Truth

The original EpicBoard was a flat card list with zero cross-team visibility. You had no idea which epic
depended on what, and inferring team ownership required chasing assignees manually. The feature brainstorm
doc sat in `plans/` for a while because there was no clean model for bidirectional links without a new
DB field for team. Team inference from leaf-task departments solved it without schema bloat.

The Express route ordering bug was predictable and we still had to learn it the hard way:
`GET /epics/graph` must be registered before `GET /:id` or Express consumes "graph" as an ID param.
That burned time.

## Technical Details

**Schema** — added `WorkItemDependency` with `@@unique([fromId, toId])` and relations
`dependenciesFrom` / `dependenciesTo` on `WorkItem`. Ran `db:push`.

**API** (`server/routes/work-item.routes.ts`):
- `GET /api/work-items/epics/graph` — epics + team inference + progress stats + dependency links
- `POST /api/work-items/dependencies` — bidirectional link (rejects self-links and duplicates)
- `DELETE /api/work-items/dependencies/:depId` — remove link

Helper: `inferEpicTeam` uses `getDescendants` + `getLeafTasks` then picks most-common department.

**Frontend**:
- Installed `@xyflow/react`
- Types: `EpicGraphNode`, `EpicDependencyLink`, `EpicGraphData` in `src/types/index.ts`
- Custom node: `src/components/board/epic-graph-node.tsx` (team-color border, progress bar, stats footer)
- Graph page: `src/pages/EpicGraph.tsx` — filter by team/status, Ctrl+Click for linking mode,
  drag-to-connect via handles, click edge to delete, click node opens EpicDetailPanel
- Layout: column-per-team auto-positioning (no dagre — KISS)

**Navigation**: `'epic-graph'` added to `ViewType` in `App.tsx`; `account_tree` icon in `Sidebar.tsx`.

## Root Cause Analysis

The flat EpicBoard had no dependency model because work-item relations were always implied through
hierarchy (epic → story → task), not lateral links. Adding `WorkItemDependency` as a separate join
table was the correct call — it keeps the tree structure intact while allowing many-to-many links.

Route conflict with Express param ordering is a classic mistake. The fix (register specific routes before
parameterized ones) is well-documented but still bit us mid-implementation.

## Lessons Learned

1. Always register specific Express routes (`/epics/graph`) before parameterized ones (`/:id`). No exceptions.
2. Team inference from leaf-task data is a viable YAGNI win — avoid adding a `teamId` column until it
   proves insufficient under real usage.
3. Skip dagre for initial layout. Column-per-team is readable and ships in minutes, not hours.
4. Bidirectional uniqueness belongs in both the DB (`@@unique`) and the API layer — defense in depth.

## Next Steps

- Monitor whether team inference is accurate enough under real data; if drift appears, add explicit `teamId`
  to `WorkItem` at that point
- Consider persisting node positions (ReactFlow layout state) to localStorage or DB so graph isn't
  re-laid-out on every load
- Add cycle detection before allowing dependency creation (A→B→A is currently possible)
- Owner: self | Timeline: next sprint cleanup
