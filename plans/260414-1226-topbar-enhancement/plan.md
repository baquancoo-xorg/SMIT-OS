---
name: topbar-enhancement
status: completed
priority: medium
created: 2026-04-14
completed: 2026-04-14
estimated_effort: 2h
brainstorm: ../reports/brainstorm-260414-1226-topbar-enhancement.md
---

# Topbar Enhancement

## Overview

Thêm 2 widgets vào góc phải topbar: Date/Calendar + Sprint Context.

**Layout:**
```
[Search...                    ] [📅 Mon, Apr 14] [📊 Sprint 5 ████░░ 68%]
```

## Scope

| Layer | Changes |
|-------|---------|
| Backend | New `/api/sprints/active` endpoint với stats |
| Frontend | 2 widget components trong Header.tsx |

## Phases

| Phase | Description | Effort | Status |
|-------|-------------|--------|--------|
| [Phase 1](phase-01-backend-active-sprint.md) | API endpoint `/api/sprints/active` | 30m | completed |
| [Phase 2](phase-02-date-calendar-widget.md) | Date/Calendar widget với dropdown | 45m | completed |
| [Phase 3](phase-03-sprint-context-widget.md) | Sprint context widget với progress | 45m | completed |

## Data Flow

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Sprint DB   │────▶│ /sprints/active  │────▶│ Sprint Widget   │
│ WorkItem DB │     │ (with stats)     │     │                 │
└─────────────┘     └──────────────────┘     └─────────────────┘

┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ WorkItem DB │────▶│ /work-items      │────▶│ Calendar Widget │
│ (dueDate)   │     │ (existing)       │     │ (deadlines)     │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

## Files

| File | Action |
|------|--------|
| `server/routes/sprint.routes.ts` | Add `/active` endpoint |
| `src/components/layout/Header.tsx` | Add 2 widgets |
| `src/components/layout/DateCalendarWidget.tsx` | New component |
| `src/components/layout/SprintContextWidget.tsx` | New component |

## Success Criteria

- [x] `/api/sprints/active` returns current sprint with stats
- [x] Date widget shows today, dropdown shows calendar + deadlines
- [x] Sprint widget shows progress, dropdown shows stats
- [x] Responsive on mobile (widgets collapse/hide)
- [x] No TypeScript errors

## Dependencies

- date-fns (already installed)
- Existing `/api/work-items` endpoint for deadlines
