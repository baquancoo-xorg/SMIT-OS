---
status: completed
created: 2026-04-19
completed: 2026-04-19
scope: UI layout consistency - spacing, alignment, button sizing
blockedBy: []
blocks: []
---

# UI Consistency Fix

## Overview

Chuẩn hóa layout consistency toàn dự án:
- **Spacing:** `space-y-8` (32px) cho tất cả pages
- **Alignment:** Actions section align với Sprint widget trên header
- **Button sizing:** Đồng nhất `py-2.5 min-w-[130px]` cho primary action buttons

**Reference:** [Brainstorm Report](../reports/brainstorm-260419-0048-ui-consistency-fix.md)

## Phases

| # | Phase | Status | Effort | Files |
|---|-------|--------|--------|-------|
| 1 | [Create Shared Components](phase-01-create-shared-components.md) | completed | 30m | 3 |
| 2 | [Refactor Board Pages](phase-02-refactor-board-pages.md) | completed | 45m | 4 |
| 3 | [Refactor Other Pages](phase-03-refactor-other-pages.md) | completed | 30m | 4 |

**Total Effort:** ~1.75h

## New Components

| Component | Path | Purpose |
|-----------|------|---------|
| `PrimaryActionButton` | `src/components/ui/PrimaryActionButton.tsx` | "+ New X" buttons |
| `ViewToggle` | `src/components/ui/ViewToggle.tsx` | Board/Table toggles |
| `PageLayout` | `src/components/layout/PageLayout.tsx` | Wrapper cho page header |

## Success Criteria

- [x] All pages use `space-y-8`
- [x] All primary action buttons: same height, min-width
- [x] Actions align với Sprint widget
- [x] Breadcrumb + Title styling consistent
- [x] No visual regression

## Implementation Notes

- **ProductBacklog / OKRsManagement:** Keep inline buttons (different toggle labels - acceptable deviation)
- **PageLayout component:** Created for future adoption; board pages use ViewToggle + PrimaryActionButton directly
- **All board pages (Tech, Marketing, Media, Sale):** Share ViewToggle + PrimaryActionButton pattern

## Cook Command
```bash
/ck:cook /Users/dominium/Documents/Project/SMIT-OS/plans/260419-0048-ui-consistency-fix
```
