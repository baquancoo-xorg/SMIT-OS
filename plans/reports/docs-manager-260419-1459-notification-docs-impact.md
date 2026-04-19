# Documentation Impact Assessment: Notification System

**Date:** 2026-04-19
**Status:** DONE

## Summary

Docs impact level: **MINOR**

The notification system is a significant backend feature, but the existing documentation structure is minimal - focused on design system, tablet UI, and weekly reports (project-specific). No system-architecture.md, api-docs.md, or changelog.md files exist.

## Current Documentation State

| File | Exists | Update Needed |
|------|--------|---------------|
| `docs/system-architecture.md` | No | N/A (would need creation) |
| `docs/api-docs.md` | No | N/A (would need creation) |
| `docs/project-changelog.md` | No | N/A (would need creation) |
| `docs/design-system.md` | Yes | No (UI tokens only) |
| `docs/tablet-ui-standards.md` | Yes | No (responsive patterns only) |

## Implemented Notification Components

### Database Model
- `Notification` model in `prisma/schema.prisma`
- Fields: id, userId, type, title, message, entityType, entityId, isRead, readAt, priority, createdAt, expiresAt
- Indexed on [userId, isRead] and [userId, createdAt]

### API Endpoints (`/api/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List notifications (query: unreadOnly, limit) |
| GET | `/unread-count` | Get unread count |
| PATCH | `/:id/read` | Mark single as read |
| POST | `/mark-all-read` | Mark all as read |
| DELETE | `/:id` | Delete notification |

### Service Methods
- `create()`, `createMany()`, `getByUser()`, `getUnreadCount()`
- `markAsRead()`, `markAllAsRead()`, `delete()`
- Domain helpers: `notifyReportApproved()`, `notifyDeadlineWarning()`, `notifySprintEnding()`

### Alert Scheduler
- Runs daily at 8:00 AM (Asia/Ho_Chi_Minh timezone)
- Checks: deadline warnings (due tomorrow), sprint endings (2 days), OKR at-risk

### Frontend
- `NotificationCenter` component in Header
- `useNotifications` hook for state management

## Recommendation

**No immediate action required.** The project lacks foundational documentation (architecture, API reference, changelog). Creating isolated notification docs without the broader structure would be inconsistent.

**Future action (when comprehensive docs are requested):**
1. Create `docs/system-architecture.md` - include notification system as a subsection
2. Create `docs/api-reference.md` - document all endpoints including notifications
3. Create `docs/project-changelog.md` - record notification system as new feature

## Unresolved Questions
- Should comprehensive documentation be created now, or deferred?
- Is there a preferred API documentation format (OpenAPI/Swagger, Markdown tables)?
