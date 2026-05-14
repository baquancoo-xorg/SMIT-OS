import { Router } from 'express';
import { PrismaClient, DailyReport } from '@prisma/client';
import { handleAsync } from '../utils/async-handler';
import { validate } from '../middleware/validate.middleware';
import { createCommentSchema, updateCommentSchema } from '../schemas/comment.schema';
import { requireAuth } from '../middleware/require-auth';
import { createNotificationService } from '../services/notification.service';
import { childLogger } from '../lib/logger';

const log = childLogger('daily-report-comment');

type AuthRequest = Express.Request & { user: { userId: string; isAdmin: boolean; fullName: string } };

export function createDailyReportCommentRoutes(prisma: PrismaClient) {
  const router = Router();
  const notificationService = createNotificationService(prisma);

  async function loadReportOrFail(id: string): Promise<DailyReport> {
    const report = await prisma.dailyReport.findUnique({ where: { id } });
    if (!report) throw Object.assign(new Error('Report not found'), { status: 404 });
    return report;
  }

  function assertAccess(user: AuthRequest['user'], report: DailyReport): void {
    if (report.userId !== user.userId && !user.isAdmin) {
      throw Object.assign(new Error('Access denied'), { status: 403 });
    }
  }

  // GET /api/daily-reports/:id/comments
  router.get('/:id/comments', requireAuth(['read:reports']), handleAsync(async (req: any, res: any) => {
    const report = await loadReportOrFail(req.params.id);
    assertAccess(req.user, report);

    const comments = await prisma.dailyReportComment.findMany({
      where: { reportId: req.params.id },
      include: { author: { select: { id: true, fullName: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.json(comments.map(c => ({
      id: c.id,
      reportId: c.reportId,
      authorId: c.authorId,
      authorName: c.author.fullName,
      authorAvatarUrl: c.author.avatar,
      body: c.deletedAt ? '' : c.body, // Hide body for soft-deleted
      editedAt: c.editedAt?.toISOString() ?? null,
      deletedAt: c.deletedAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
    })));
  }));

  // POST /api/daily-reports/:id/comments
  router.post('/:id/comments', requireAuth(['read:reports']), validate(createCommentSchema), handleAsync(async (req: any, res: any) => {
    const report = await loadReportOrFail(req.params.id);
    assertAccess(req.user, report);

    const comment = await prisma.dailyReportComment.create({
      data: { reportId: report.id, authorId: req.user.userId, body: req.body.body },
      include: { author: { select: { id: true, fullName: true, avatar: true } } },
    });

    // Notify: if admin comments on employee's report → notify owner
    if (req.user.isAdmin && report.userId !== req.user.userId) {
      try {
        await notificationService.notifyDailyReportComment(report.userId, req.user.userId, report.id);
      } catch (e) { log.error({ err: e }, 'notifyDailyReportComment failed'); }
    }

    // Notify: reply notification to other participants (exclude commenter + owner)
    try {
      await notificationService.notifyDailyReportCommentReply({
        reportId: report.id,
        replierId: req.user.userId,
        reportOwnerId: report.userId,
      });
    } catch (e) { log.error({ err: e }, 'notifyDailyReportCommentReply failed'); }

    res.status(201).json({
      id: comment.id,
      reportId: comment.reportId,
      authorId: comment.authorId,
      authorName: comment.author.fullName,
      authorAvatarUrl: comment.author.avatar,
      body: comment.body,
      editedAt: null,
      deletedAt: null,
      createdAt: comment.createdAt.toISOString(),
    });
  }));

  // PATCH /api/daily-reports/:id/comments/:commentId
  router.patch('/:id/comments/:commentId', requireAuth(['read:reports']), validate(updateCommentSchema), handleAsync(async (req: any, res: any) => {
    const report = await loadReportOrFail(req.params.id);
    assertAccess(req.user, report);
    const comment = await prisma.dailyReportComment.findUnique({ where: { id: req.params.commentId } });
    if (!comment || comment.reportId !== req.params.id) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (comment.authorId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.dailyReportComment.update({
      where: { id: req.params.commentId },
      data: { body: req.body.body, editedAt: new Date() },
      include: { author: { select: { id: true, fullName: true, avatar: true } } },
    });

    res.json({
      id: updated.id,
      reportId: updated.reportId,
      authorId: updated.authorId,
      authorName: updated.author.fullName,
      authorAvatarUrl: updated.author.avatar,
      body: updated.body,
      editedAt: updated.editedAt?.toISOString() ?? null,
      deletedAt: updated.deletedAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
    });
  }));

  // DELETE /api/daily-reports/:id/comments/:commentId (soft delete)
  router.delete('/:id/comments/:commentId', requireAuth(['read:reports']), handleAsync(async (req: any, res: any) => {
    const report = await loadReportOrFail(req.params.id);
    assertAccess(req.user, report);
    const comment = await prisma.dailyReportComment.findUnique({ where: { id: req.params.commentId } });
    if (!comment || comment.reportId !== req.params.id) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (comment.authorId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.dailyReportComment.update({
      where: { id: req.params.commentId },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  }));

  return router;
}
