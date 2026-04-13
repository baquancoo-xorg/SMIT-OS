---
name: task-detail-dragdrop-fix
status: completed
priority: high
created: 2026-04-14
completed: 2026-04-14
estimated_effort: 20-30m
actual_effort: 15m
brainstorm: ../reports/brainstorm-260414-0234-task-detail-dragdrop-fix.md
review: ../reports/code-reviewer-260414-0248-dnd-hooks-fixes.md
---

# Fix Task Details Modal & Kanban Drag-Drop

## Overview

Fix 2 critical bugs affecting workspace usability:
1. **TaskDetailsModal crash** - React hooks violation causing white screen
2. **Kanban drag-drop** - Cannot drop cards into different columns

**Complexity:** Low | **Risk:** Low | **Breaking Changes:** None

## Problem Summary

| Bug | Root Cause | Impact |
|-----|-----------|--------|
| View Details crash | `useEffect` after early return | Page unusable |
| Drag-drop broken | Missing `useDroppable` on columns | Cannot change task status |

## Phases

| Phase | Description | Status | Est. |
|-------|-------------|--------|------|
| [Phase 1](phase-01-fix-modal-hooks.md) | Fix TaskDetailsModal hooks order | pending | 5m |
| [Phase 2](phase-02-add-droppable-columns.md) | Add DroppableColumn + update boards | pending | 15m |

## Files to Modify

```
src/components/board/TaskDetailsModal.tsx   # Phase 1
src/components/board/droppable-column.tsx   # Phase 2 (new)
src/pages/TechBoard.tsx                     # Phase 2
src/pages/MarketingBoard.tsx                # Phase 2
src/pages/SaleBoard.tsx                     # Phase 2
src/pages/MediaBoard.tsx                    # Phase 2
```

## Success Criteria

- [x] View Details modal opens without crash
- [x] Cards can be dragged between columns
- [x] Status changes persist after refresh
- [x] No console errors
- [x] All boards work consistently

## Implementation Notes

- Maintain existing UI/UX design
- No breaking changes to props/APIs
- Test all 4 workspace boards after changes
