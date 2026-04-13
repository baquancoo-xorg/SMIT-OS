---
name: smit-os-features
status: completed
priority: high
created: 2026-04-13
completed: 2026-04-13
estimated_effort: 14-20h
brainstorm: ../reports/brainstorm-260413-2251-smit-os-features.md
---

# SMIT OS Features Implementation Plan

## Overview

Implement 4 features cho SMIT OS:
1. Backlog rename + UI fix (1-2h)
2. Weekly Report status workflow (4-6h)
3. OKR sync logic (3-4h)
4. Daily Report full feature (6-8h)

## Phases

| Phase | Description | Effort | Status |
|-------|-------------|--------|--------|
| [Phase 1](phase-01-backlog-rename-ui-fix.md) | Backlog rename + UI fix | 1-2h | completed |
| [Phase 2](phase-02-weekly-report-status.md) | Weekly Report status workflow | 4-6h | completed |
| [Phase 3](phase-03-okr-sync-logic.md) | OKR sync logic | 3-4h | completed |
| [Phase 4](phase-04-daily-report-feature.md) | Daily Report full feature | 6-8h | completed |

## Tech Stack

- **Frontend:** React + TypeScript + TailwindCSS + Motion
- **Backend:** Express.js + Prisma ORM
- **Database:** PostgreSQL

## Key Dependencies

- Phase 3 depends on Phase 2 (OKR sync cần status workflow)
- Phase 4 independent, có thể làm song song với Phase 2-3

## Success Criteria

1. ✅ Tất cả UI hiển thị "Backlog" thay vì "Product Backlog"
2. ✅ Action buttons luôn visible trong Grouped view, có Description column
3. ✅ Weekly Report có status Review → Approved
4. ✅ Admin có thể edit + approve Weekly Report
5. ✅ OKR progress tự động cập nhật sau approve
6. ✅ Daily Report CRUD hoạt động với permission đúng

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database migration | High | Test migration locally first |
| Permission bugs | Medium | Write comprehensive permission tests |
| OKR edge cases | Medium | Handle null/zero values |

## Related Files

- [Brainstorm Report](../reports/brainstorm-260413-2251-smit-os-features.md)
- [Scout Report](../reports/scout-260413-2251-smit-os-structure.md)
