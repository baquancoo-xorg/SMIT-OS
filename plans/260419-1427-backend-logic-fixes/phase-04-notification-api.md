# Phase 4: Notification API

**Priority:** High
**Estimated:** 1 hour
**Status:** completed
**Depends on:** Phase 3

## Overview

Create REST API endpoints for notification management.

## API Design

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | User | List user's notifications |
| GET | `/api/notifications/unread-count` | User | Get unread count (for badge) |
| PATCH | `/api/notifications/:id/read` | Owner | Mark single as read |
| POST | `/api/notifications/mark-all-read` | User | Mark all as read |
| DELETE | `/api/notifications/:id` | Owner | Delete notification |

## Implementation

```typescript
// server/routes/notification.routes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { handleAsync } from '../utils/async-handler';
import { createNotificationService } from '../services/notification.service';

export function createNotificationRoutes(prisma: PrismaClient) {
  const router = Router();
  const service = createNotificationService(prisma);

  // Get user notifications
  router.get('/', handleAsync(async (req: any, res: any) => {
    const userId = req.user.userId;
    const unreadOnly = req.query.unreadOnly === 'true';
    const limit = parseInt(req.query.limit) || 50;

    const notifications = await service.getByUser(userId, { unreadOnly, limit });
    res.json(notifications);
  }));

  // Get unread count
  router.get('/unread-count', handleAsync(async (req: any, res: any) => {
    const count = await service.getUnreadCount(req.user.userId);
    res.json({ count });
  }));

  // Mark single as read
  router.patch('/:id/read', handleAsync(async (req: any, res: any) => {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });

    if (!notification || notification.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Not found' });
    }

    const updated = await service.markAsRead(req.params.id);
    res.json(updated);
  }));

  // Mark all as read
  router.post('/mark-all-read', handleAsync(async (req: any, res: any) => {
    await service.markAllAsRead(req.user.userId);
    res.json({ success: true });
  }));

  // Delete notification
  router.delete('/:id', handleAsync(async (req: any, res: any) => {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });

    if (!notification || notification.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Not found' });
    }

    await service.delete(req.params.id);
    res.status(204).send();
  }));

  return router;
}
```

## Register Routes

```typescript
// server.ts
import { createNotificationRoutes } from './routes/notification.routes';

app.use('/api/notifications', authMiddleware, createNotificationRoutes(prisma));
```

## Files to Create

- `server/routes/notification.routes.ts`

## Files to Modify

- `server.ts` - Register routes

## Testing

```bash
# Get notifications
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/notifications

# Get unread count
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/notifications/unread-count

# Mark as read
curl -X PATCH -H "Authorization: Bearer TOKEN" http://localhost:3000/api/notifications/{id}/read
```

## Checklist

- [x] Create notification.routes.ts
- [x] Add GET / endpoint
- [x] Add GET /unread-count endpoint
- [x] Add PATCH /:id/read endpoint
- [x] Add POST /mark-all-read endpoint
- [x] Add DELETE /:id endpoint
- [x] Register in server.ts
- [x] Test all endpoints
