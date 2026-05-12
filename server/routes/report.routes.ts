import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createOKRService } from '../services/okr.service';
import { createNotificationService } from '../services/notification.service';
import { RBAC } from '../middleware/rbac.middleware';
import { handleAsync } from '../utils/async-handler';
import { validate } from '../middleware/validate.middleware';
import { createWeeklyReportSchema, updateWeeklyReportSchema, approveReportSchema } from '../schemas/report.schema';
import { createOwnershipMiddleware } from '../middleware/ownership.middleware';
import { requireAuth } from '../middleware/require-auth';

export function createReportRoutes(prisma: PrismaClient) {
  const router = Router();
  const okrService = createOKRService(prisma);
  const notificationService = createNotificationService(prisma);
  const checkOwnership = createOwnershipMiddleware(prisma);

  router.get('/', requireAuth(['read:reports']), handleAsync(async (_req: any, res: any) => {
    const reports = await prisma.weeklyReport.findMany({
      include: {
        user: true,
        approver: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  }));

  router.get('/:id', requireAuth(['read:reports']), handleAsync(async (req: any, res: any) => {
    const report = await prisma.weeklyReport.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        approver: { select: { id: true, fullName: true } },
      },
    });
    if (!report) return res.status(404).json({ error: 'Not found' });
    res.json(report);
  }));

  router.post('/', RBAC.authenticated, validate(createWeeklyReportSchema), handleAsync(async (req: any, res: any) => {
    // Force userId from authenticated user - prevent impersonation
    const userId = req.user!.userId;
    const { userId: _ignoredUserId, weekEnding, krProgress, progress, plans, blockers, rawData } = req.body;

    const report = await prisma.weeklyReport.create({
      data: {
        userId,
        weekEnding: new Date(weekEnding),
        krProgress: krProgress ?? '[]',
        progress: progress ?? '{"priorities":[]}',
        plans: plans ?? '{"topThree":[]}',
        blockers: blockers ?? '{"risks":"","helpNeeded":""}',
        rawData: rawData ?? null,
        status: 'Review',
      },
      include: { user: true },
    });
    res.json(report);
  }));

  router.put('/:id', validate(updateWeeklyReportSchema), handleAsync(async (req: any, res: any) => {
    const { id } = req.params;
    const user = req.user;
    const { currentUserId, currentUserRole, ...updateData } = req.body;

    const report = await prisma.weeklyReport.findUnique({
      where: { id },
      include: { user: { select: { role: true } } }
    });
    if (!report) return res.status(404).json({ error: 'Not found' });

    if (report.status === 'Approved') {
      return res.status(400).json({ error: 'Cannot edit approved report' });
    }

    // Authorization: own-only or admin (read-shared, write-own pattern).
    const isOwner = report.userId === user.userId;
    if (!isOwner && !user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const data: any = { ...updateData };
    if (data.weekEnding) data.weekEnding = new Date(data.weekEnding);

    const updated = await prisma.weeklyReport.update({
      where: { id },
      data,
      include: { user: true },
    });
    res.json(updated);
  }));

  router.post('/:id/approve', RBAC.adminOnly, validate(approveReportSchema), handleAsync(async (req: any, res: any) => {
    const { id } = req.params;
    const user = req.user!;
    const comment: string = req.body.comment.trim();

    const report = await prisma.weeklyReport.findUnique({
      where: { id },
      include: { user: { select: { departments: true, role: true } } },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const updated = await prisma.weeklyReport.update({
      where: { id },
      data: {
        status: 'Approved',
        approvedBy: user.userId,
        approvedAt: new Date(),
        approvalComment: comment,
      },
      include: { user: true },
    });

    if (updated.krProgress) {
      await okrService.syncOKRProgress(updated);
    }

    await notificationService.notifyReportApproved(updated, user.fullName);

    res.json(updated);
  }));

  router.delete('/:id', checkOwnership('weeklyReport'), handleAsync(async (req: any, res: any) => {
    await prisma.weeklyReport.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }));

  return router;
}
