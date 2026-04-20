---
status: done
blockedBy: []
blocks: []
---

# Epic Board & Backlog Tree View Redesign

## Overview

Redesign cách hiển thị Epic/Story trong SMIT-OS. Hiện tại Epic và UserStory đang nằm flat trong Backlog ngang hàng với nhau. Mục tiêu: tách Epic/Story ra khỏi workspace task-flow, tạo Epic Board riêng cross-team, refactor Backlog thành tree view, và thêm Epic/Story context badge vào team boards.

**Nguyên tắc thiết kế:**
- Epic = container chiến lược, không phải work item → không nằm trong team workspace
- Story = narrative có đầu/cuối, sống trong Epic Detail
- Task = daily work item duy nhất trong team workspace

**Backend:** Không cần thay đổi schema hay API. API hiện tại đã trả về `parent` và `children` trong WorkItem.

**Loại type:** Giữ nguyên `UserStory` làm type value, đổi display label thành `"Story"` để generalize.

## Phases

| Phase | File | Status |
|-------|------|--------|
| [Phase 01 - Epic Board Page](phase-01-epic-board-page.md) | `src/pages/EpicBoard.tsx`, `src/App.tsx`, `src/components/layout/Sidebar.tsx` | ✅ done |
| [Phase 02 - Epic Detail Panel](phase-02-epic-detail-panel.md) | `src/components/board/epic-detail-panel.tsx` | ✅ done |
| [Phase 03 - Backlog Tree View](phase-03-backlog-tree-view.md) | `src/pages/ProductBacklog.tsx` | ✅ done |
| [Phase 04 - Epic Badge on Team Boards](phase-04-epic-badge-team-boards.md) | `src/components/board/TaskCard.tsx` (đã có sẵn) | ✅ done |

## Key Dependencies

- API: `GET /api/work-items` → trả về `parent` + `children` (đã có)
- Types: `WorkItemType`, `BACKLOG_TYPES` tại `src/types/index.ts`
- ViewType: định nghĩa tại `src/App.tsx`
- Sidebar nav: `src/components/layout/Sidebar.tsx`

## Success Criteria

- [ ] Epic Board page hiển thị tất cả Epics với progress % tính từ child tasks
- [ ] Epic Detail panel hiển thị Stories + Tasks theo hierarchy collapsible
- [ ] ProductBacklog hiển thị tree: Epic → Story (task count badge)
- [ ] Team boards (Tech/Sale/Mkt/Media) task cards có Epic/Story badge
- [ ] Epic/Story không còn xuất hiện như flat items trong team workspace
