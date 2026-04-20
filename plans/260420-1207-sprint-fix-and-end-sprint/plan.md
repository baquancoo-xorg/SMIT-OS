---
status: pending
blockedBy: []
blocks: []
---

# Sprint Fix & End Sprint Feature

## Overview
Fix timezone bug khiến active sprint không hiển thị + implement End Sprint flow với dialog chuyển task chưa xong.

## Phases

| Phase | File | Status |
|-------|------|--------|
| [Phase 01 - Timezone Bug Fix](phase-01-timezone-bug-fix.md) | `server/routes/sprint.routes.ts` | ⏳ pending |
| [Phase 02 - Backend End Sprint API](phase-02-backend-end-sprint-api.md) | `server/routes/sprint.routes.ts` | ⏳ pending |
| [Phase 03 - Frontend End Sprint UI](phase-03-frontend-end-sprint-ui.md) | `src/components/layout/SprintContextWidget.tsx` | ⏳ pending |

## Key Dependencies
- Phase 02 phụ thuộc Phase 01 (cùng file)
- Phase 03 phụ thuộc Phase 02 (gọi API mới)
