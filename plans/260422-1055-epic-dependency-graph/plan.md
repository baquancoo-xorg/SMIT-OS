---
title: "Epic Dependency Graph"
status: completed
createdAt: 2026-04-22
blockedBy: []
blocks: []
---

# Epic Dependency Graph

> Thu00eam trang graph view cho Epic: hiu1ec3n thu1ecb tou00e0n bu1ed9 Epic cu1ee7a mu1ecdi team, liu00ean ku1ebft "related" giu1eefa cu00e1c Epic, filter theo team/status, click node mu1edf EpicDetailPanel.

## Context

- Brainstorm report: [plans/reports/brainstorm-260422-1055-epic-dependency-graph.md](../reports/brainstorm-260422-1055-epic-dependency-graph.md)
- Stack: Express 5 + Prisma + React 19 + TailwindCSS v4
- Graph library: `@xyflow/react` (chu01b0a cu00e0i, cu1ea7n install)
- Entry: `server.ts` u2192 `server/routes/work-item.routes.ts`
- Types: `src/types.ts`
- Nav: `src/App.tsx` + `src/components/layout/Sidebar.tsx`

## Phases

| # | Phase | Status | Files |
|---|-------|--------|-------|
| 1 | [Schema & Migration](phase-01-schema-migration.md) | completed | `prisma/schema.prisma` |
| 2 | [Backend API](phase-02-backend-api.md) | completed | `server/routes/work-item.routes.ts` |
| 3 | [Frontend Graph](phase-03-frontend-graph.md) | completed | `src/pages/EpicGraph.tsx`, `src/components/board/epic-graph-node.tsx`, `src/types.ts` |
| 4 | [Navigation Integration](phase-04-navigation.md) | completed | `src/App.tsx`, `src/components/layout/Sidebar.tsx` |

## Key Decisions

- Team inference: `most_common(descendantTasks.assignee.departments[0])` u2014 khu00f4ng thu00eam field mu1edbi
- Dependency type: chu1ec9 "related" (bidirectional, `@@unique([fromId, toId])`)
- Layout: `@xyflow/react` built-in free layout, khu00f4ng cu1ea7n dagre (KISS)
- File size: giu1eef du01b0u1edbi 200 lines mu1ed7i file, tu00e1ch component nu1ebfu cu1ea7n
