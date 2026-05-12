import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { RBAC } from '../middleware/rbac.middleware';
import { handleAsync } from '../utils/async-handler';
import { validate } from '../middleware/validate.middleware';
import { createDailyReportSchema, approveReportSchema } from '../schemas/report.schema';
import { createOwnershipMiddleware } from '../middleware/ownership.middleware';
import { createNotificationService } from '../services/notification.service';
import { childLogger } from '../lib/logger';
import { requireAuth } from '../middleware/require-auth';

const log = childLogger('daily-report');

export function createDailyReportRoutes(prisma: PrismaClient) {
  const router = Router();
  const checkOwnership = createOwnershipMiddleware(prisma);
  const notificationService = createNotificationService(prisma);

  router.get('/', requireAuth(['read:reports']), handleAsync(async (_req: any, res: any) => {
    // Read-shared: every authenticated user sees all daily reports.
    // Mutation/approve are still gated below (own-only / admin-only).
    const reports = await prisma.dailyReport.findMany({
      include: {
        user: { select: { id: true, fullName: true, departments: true, role: true, avatar: true } },
        approver: { select: { id: true, fullName: true } },
      },
      orderBy: { reportDate: 'desc' },
    });
    res.json(reports);
  }));

  router.get('/:id', requireAuth(['read:reports']), handleAsync(async (req: any, res: any) => {
    const report = await prisma.dailyReport.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, fullName: true, departments: true, role: true, avatar: true } },
        approver: { select: { id: true, fullName: true } },
      },
    });
    if (!report) return res.status(404).json({ error: 'Not found' });
    res.json(report);
  }));

  router.post('/', RBAC.authenticated, validate(createDailyReportSchema), handleAsync(async (req: any, res: any) => {
    const userId = req.user!.userId;
    const { reportDate, completedYesterday, doingYesterday, blockers, planToday, rawData } = req.body;

    try {
      const report = await prisma.dailyReport.create({
        data: {
          userId,
          reportDate: new Date(reportDate),
          completedYesterday: completedYesterday ?? '',
          doingYesterday: doingYesterday ?? '',
          blockers: blockers ?? '',
          planToday: planToday ?? '',
          rawData: rawData ?? null,
          status: 'Review',
        },
        include: { user: true },
      });

      // Fanout notification to admins (excluding submitter).
      // Skip silently if no recipients (e.g. solo admin org).
      try {
        const recipientIds = await notificationService.findAdminRecipientsFor(
          { id: userId, departments: report.user.departments ?? [] },
          { excludeSelf: true }
        );
        if (recipientIds.length > 0) {
          await notificationService.notifyDailyNew(report, report.user.fullName, recipientIds);
        }
      } catch (notifyErr) {
        // Notification failure must not block the create response.
        log.error({ err: notifyErr, userId, reportId: report.id }, 'notifyDailyNew failed');
      }

      res.json(report);
    } catch (err: any) {
      if (err.code === 'P2002') {
        return res.status(409).json({ error: 'Report for this date already exists' });
      }
      throw err;
    }
  }));

  router.put('/:id', handleAsync(async (req: any, res: any) => {
    const { id } = req.params;
    const { completedYesterday, doingYesterday, blockers, planToday, rawData } = req.body;
    const currentUser = req.user;

    const report = await prisma.dailyReport.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!report) return res.status(404).json({ error: 'Not found' });

    if (report.status === 'Approved') {
      return res.status(400).json({ error: 'Cannot edit approved report' });
    }

    const isOwner = report.userId === currentUser.userId;
    const isAdmin = currentUser.isAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.dailyReport.update({
      where: { id },
      data: {
        ...(completedYesterday !== undefined ? { completedYesterday } : {}),
        ...(doingYesterday !== undefined ? { doingYesterday } : {}),
        ...(blockers !== undefined ? { blockers } : {}),
        ...(planToday !== undefined ? { planToday } : {}),
        ...(rawData !== undefined ? { rawData } : {}),
        updatedAt: new Date(),
      },
      include: { user: true },
    });
    res.json(updated);
  }));

  router.post('/:id/approve', RBAC.adminOnly, validate(approveReportSchema), handleAsync(async (req: any, res: any) => {
    const { id } = req.params;
    const user = req.user!;
    const comment: string = req.body.comment.trim();

    const report = await prisma.dailyReport.findUnique({
      where: { id },
      include: { user: { select: { departments: true, role: true } } },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const updated = await prisma.dailyReport.update({
      where: { id },
      data: {
        status: 'Approved',
        approvedBy: user.userId,
        approvedAt: new Date(),
        approvalComment: comment,
      },
      include: { user: true },
    });

    await notificationService.notifyDailyReportApproved(updated, user.fullName);

    res.json(updated);
  }));

  router.delete('/:id', checkOwnership('dailyReport'), handleAsync(async (req: any, res: any) => {
    await prisma.dailyReport.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }));

  return router;
}
