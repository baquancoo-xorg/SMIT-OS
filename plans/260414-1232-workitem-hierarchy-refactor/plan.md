---
name: workitem-hierarchy-refactor
status: pending
priority: high
created: 2026-04-14
estimated_effort: 3-4h
brainstorm: ../reports/brainstorm-260414-1232-workitem-hierarchy-refactor.md
---

# WorkItem Hierarchy Refactor

## Overview

Refactor WorkItem để hỗ trợ hierarchy Epic → Story → Task và phân tách logic tạo item theo context.

**Complexity:** Medium | **Risk:** Medium | **Breaking Changes:** Yes (schema)

## Problem

| Issue | Current | Target |
|-------|---------|--------|
| Task linking | Link to KR | Link to Epic/Story (optional) |
| Epic/Story linking | Link to KR | Link to KR (optional) |
| Team Backlog | Tạo mọi type | Chỉ Epic, UserStory |
| Workspace | Tạo mọi type | Chỉ Task types |

## Solution

1. Add `parentId` self-reference to WorkItem
2. Create `WorkItemKrLink` junction table (Epic/Story → KR)
3. Remove `linkedKrId` from WorkItem
4. Update UI components theo context

## Phases

| Phase | Description | Effort | Risk |
|-------|-------------|--------|------|
| [Phase 1](phase-01-schema-migration.md) | Schema + Migration | 45m | Medium |
| [Phase 2](phase-02-backend-api.md) | Backend API updates | 30m | Low |
| [Phase 3](phase-03-frontend-types.md) | Frontend types | 15m | Low |
| [Phase 4](phase-04-taskmodal-update.md) | TaskModal component | 45m | Medium |
| [Phase 5](phase-05-backlog-page.md) | Team Backlog page | 30m | Low |
| [Phase 6](phase-06-workspace-boards.md) | Workspace boards | 45m | Low |

## Tech Stack

- Prisma ORM + PostgreSQL
- React + TypeScript
- Express API

## Files Changed

```
prisma/schema.prisma
server/routes/work-item.routes.ts
server/schemas/work-item.schema.ts
src/types/index.ts
src/components/board/TaskModal.tsx
src/pages/ProductBacklog.tsx
src/pages/TechBoard.tsx
src/pages/MarketingBoard.tsx
src/pages/MediaBoard.tsx
src/pages/SaleBoard.tsx
```

## Migration Strategy

1. Add new columns/tables first (non-breaking)
2. Migrate existing `linkedKrId` data → `WorkItemKrLink`
3. Remove old column after validation

## Rollback Plan

If issues arise:
1. Restore `linkedKrId` column
2. Drop `WorkItemKrLink` and `parentId`
3. Revert UI changes

## Success Criteria

- [ ] Task can link to Epic/Story (optional)
- [ ] Epic/Story can link to KR via junction table
- [ ] Team Backlog only shows Epic, UserStory types
- [ ] Workspace boards only show Task types
- [ ] Existing data migrated correctly
- [ ] All tests pass
