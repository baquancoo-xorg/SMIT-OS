# Brainstorm: Merge Epic Board & Epic Graph into Team Backlog Tabs

**Date:** 2026-04-22  
**Status:** Approved

## Problem

Epic Board và Epic Graph tồn tại như 2 trang độc lập trong sidebar, gây phân mảnh navigation. User muốn gộp vào Team Backlog dưới dạng tabs.

## Solution Approved

**Approach B — `hideHeader` prop**

### Changes

| File | Change |
|------|--------|
| `src/pages/EpicBoard.tsx` | Add `hideHeader?: boolean` prop, wrap header section in `{!hideHeader && ...}` |
| `src/pages/EpicGraph.tsx` | Add `hideHeader?: boolean` prop, wrap header section in `{!hideHeader && ...}` |
| `src/pages/ProductBacklog.tsx` | Extend view type → `'board' \| 'table' \| 'epic-board' \| 'epic-graph'`, add 2 ViewToggle options, render `<EpicBoard hideHeader />` and `<EpicGraph hideHeader />` as tab content |
| `src/App.tsx` | Remove `'epics'` and `'epic-graph'` from ViewType, remove imports, remove conditional renders |
| `src/components/layout/Sidebar.tsx` | Remove NavItem "Epic Board" and "Epic Graph" |

### ViewToggle Result

```
[ Grouped: account_tree ]  [ Table: table_rows ]  [ Board: flag ]  [ Graph: share ]
```

### Notes
- Stats section (Total Epics, In Progress, Completed) trong EpicBoard **vẫn giữ** trong tab Board
- EpicGraph header (count + link instructions) **ẩn** trong tab Graph
- EpicBoard.tsx và EpicGraph.tsx files **kept** (used as tab components)
- No new files needed
