---
title: Backend Logic Fixes
status: pending
priority: critical
created: 2026-04-19
estimated: 8 hours
blockedBy: []
blocks: []
---

# Backend Logic Fixes

## Overview

Fix critical backend bugs and implement notification system.

**Reference:** [Brainstorm Report](../reports/brainstorm-260419-1428-backend-logic-audit.md)

**Problems:**
1. Sprint không hiển thị ngày cuối (date comparison bug)
2. Notification system chưa implement
3. Không có automated alerts cho deadlines, OKR risks

## Phases

| Phase | Name | Est | Priority | Status |
|-------|------|-----|----------|--------|
| 1 | [Fix Sprint Date Bug](phase-01-sprint-date-fix.md) | 30m | Critical | pending |
| 2 | [Notification Model](phase-02-notification-model.md) | 1h | High | pending |
| 3 | [Notification Service](phase-03-notification-service.md) | 2h | High | pending |
| 4 | [Notification API](phase-04-notification-api.md) | 1h | High | pending |
| 5 | [Frontend Notification](phase-05-frontend-notification.md) | 2h | Medium | pending |
| 6 | [Automated Alerts](phase-06-automated-alerts.md) | 1.5h | Medium | pending |

## Key Files

```
server/routes/sprint.routes.ts      # Phase 1: Date fix
prisma/schema.prisma                # Phase 2: Notification model
server/services/notification.service.ts  # Phase 3: New service
server/routes/notification.routes.ts     # Phase 4: New routes
src/components/layout/NotificationCenter.tsx  # Phase 5: UI
server/jobs/                        # Phase 6: Scheduled jobs
```

## Success Criteria

- [ ] Sprint hiển thị đúng vào ngày cuối của sprint
- [ ] Notification model với CRUD operations
- [ ] Realtime notifications via polling (MVP)
- [ ] UI notification center trong Header
- [ ] Automated alerts cho deadlines & OKR risks

## Dependencies

- No blockers from existing plans (UI-focused)
- Requires database migration for Notification model
