import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { handleAsync } from '../utils/async-handler';
import { createNotificationService } from '../services/notification.service';

export function createNotificationRoutes(prisma: PrismaClient) {
  const router = Router();
  const service = createNotificationService(prisma);

  router.get('/', handleAsync(async (req: any, res: any) => {
    const userId = req.user.userId;
    const unreadOnly = req.query.unreadOnly === 'true';
    const limit = parseInt(req.query.limit) || 50;

    const notifications = await service.getByUser(userId, { unreadOnly, limit });
    res.json(notifications);
  }));

  router.get('/unread-count', handleAsync(async (req: any, res: any) => {
    const count = await service.getUnreadCount(req.user.userId);
    res.json({ count });
  }));

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

  router.post('/mark-all-read', handleAsync(async (req: any, res: any) => {
    await service.markAllAsRead(req.user.userId);
    res.json({ success: true });
  }));

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
