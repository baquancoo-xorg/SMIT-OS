---
title: "Merge Epic Tabs into Team Backlog"
description: "Embed EpicBoard and EpicGraph as tabs inside ProductBacklog; remove standalone sidebar entries."
status: pending
priority: P2
effort: 1.5h
branch: main
tags: [ui, refactor, epic, backlog]
created: 2026-04-22
blockedBy: []
blocks: []
---

# Merge Epic Tabs into Team Backlog

Pure UI refactor. Adds two tabs (Epic Board, Epic Graph) to ProductBacklog ViewToggle, embeds the existing page components via a `hideHeader` prop, and removes the now-redundant sidebar entries and top-level view routes.

## Phases

| # | Phase | Files | Status |
|---|-------|-------|--------|
| 01 | [Merge Epic Tabs](./phase-01-merge-epic-tabs.md) | EpicBoard, EpicGraph, ProductBacklog, App, Sidebar | pending |

## Dependency Graph

```
[No cross-phase dependencies — single phase]
```

## Success Criteria

- Team Backlog shows 4 tabs: Grouped / Table / Board / Graph
- Epic Board and Epic Graph no longer appear in Sidebar
- Navigating to `epics` or `epic-graph` view is impossible (type removed)
- Stats & Filters row hidden when Board or Graph tab active
- New Item button hidden when Board or Graph tab active
- No regressions on Grouped / Table tabs
