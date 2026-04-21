import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { RBAC } from '../middleware/rbac.middleware';
import { handleAsync } from '../utils/async-handler';
import { validate } from '../middleware/validate.middleware';
import { createDailyReportSchema } from '../schemas/report.schema';
import { createOwnershipMiddleware } from '../middleware/ownership.middleware';

export function createDailyReportRoutes(prisma: PrismaClient) {
  const router = Router();
  const checkOwnership = createOwnershipMiddleware(prisma);

  router.get('/', handleAsync(async (req: any, res: any) => {
    const user = req.user;
    let where: any = {};

    if (user.role === 'Member') {
      where.userId = user.userId;
    } else if (user.role?.includes('Leader')) {
      // Get user's departments from req.user (populated by auth middleware)
      const userDepts = user.departments || [];
      where.OR = [
        { userId: user.userId },
        { user: { departments: { hasSome: userDepts } } }
      ];
    }
    // Admin sees all (no where filter)

    const reports = await prisma.dailyReport.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, departments: true, role: true, avatar: true } },
        approver: { select: { id: true, fullName: true } },
      },
      orderBy: { reportDate: 'desc' },
    });
    res.json(reports);
  }));

  router.get('/:id', handleAsync(async (req: any, res: any) => {
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

  router.post('/', validate(createDailyReportSchema), handleAsync(async (req: any, res: any) => {
    const { userId, reportDate, tasksData, blockers, impactLevel, teamType, teamMetrics, adHocTasks } = req.body;

    const existing = await prisma.dailyReport.findFirst({
      where: { userId, reportDate: new Date(reportDate) },
    });

    if (existing) {
      return res.status(400).json({ error: 'Report for this date already exists' });
    }

    const report = await prisma.dailyReport.create({
      data: {
        userId,
        reportDate: new Date(reportDate),
        tasksData: typeof tasksData === 'string' ? tasksData : JSON.stringify(tasksData),
        blockers,
        impactLevel,
        teamType: teamType || null,
        teamMetrics: teamMetrics || null,
        adHocTasks: adHocTasks && typeof adHocTasks === 'string' ? adHocTasks : null,
        status: 'Review',
      },
      include: { user: true },
    });
    res.json(report);
  }));

  router.put('/:id', handleAsync(async (req: any, res: any) => {
    const { id } = req.params;
    const { currentUserId, tasksData, adHocTasks, ...updateData } = req.body;
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
    const isLeaderOfUser = currentUser.role?.includes('Leader') && report.user.role === 'Member';
    const isAdmin = currentUser.isAdmin;

    if (!isOwner && !isLeaderOfUser && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.dailyReport.update({
      where: { id },
      data: {
        ...updateData,
        tasksData: tasksData
          ? typeof tasksData === 'string'
            ? tasksData
            : JSON.stringify(tasksData)
          : undefined,
        adHocTasks: adHocTasks !== undefined
          ? (adHocTasks && typeof adHocTasks === 'string' ? adHocTasks : null)
          : undefined,
        updatedAt: new Date(),
      },
      include: { user: true },
    });
    res.json(updated);
  }));

  router.post('/:id/approve', RBAC.leaderOrAdmin, handleAsync(async (req: any, res: any) => {
    const { id } = req.params;
    const user = req.user!;

    const report = await prisma.dailyReport.findUnique({
      where: { id },
      include: { user: { select: { departments: true, role: true } } },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (!user.isAdmin && user.role?.includes('Leader')) {
      // Check if leader shares at least one department with the report user
      const sharedDepts = report.user.departments.filter(d => user.departments?.includes(d));
      if (sharedDepts.length === 0 || report.user.role !== 'Member') {
        return res.status(403).json({ error: "Can only approve your team members' reports" });
      }
    }

    const updated = await prisma.dailyReport.update({
      where: { id },
      data: {
        status: 'Approved',
        approvedBy: user.userId,
        approvedAt: new Date(),
      },
      include: { user: true },
    });
    res.json(updated);
  }));

  // PM Dashboard: Aggregate stats by team
  router.get('/stats/team-summary', RBAC.leaderOrAdmin, handleAsync(async (req: any, res: any) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const reports = await prisma.dailyReport.findMany({
      where: {
        reportDate: { gte: start, lte: end },
        teamType: { not: null },
      },
      include: { user: { select: { id: true, fullName: true, departments: true } } },
    });

    const teamStats: Record<string, any> = { tech: { count: 0, blockers: 0, metrics: {} }, marketing: { count: 0, blockers: 0, metrics: {} }, media: { count: 0, blockers: 0, metrics: {} }, sale: { count: 0, blockers: 0, metrics: {} } };

    for (const report of reports) {
      const team = report.teamType as string;
      if (!teamStats[team]) continue;

      teamStats[team].count++;
      if (report.impactLevel === 'high') teamStats[team].blockers++;

      const metrics = report.teamMetrics as any;
      if (!metrics?.yesterdayTasks) continue;

      for (const task of metrics.yesterdayTasks) {
        if (!task.metrics) continue;
        for (const [key, value] of Object.entries(task.metrics)) {
          if (typeof value === 'number') {
            teamStats[team].metrics[key] = (teamStats[team].metrics[key] || 0) + value;
          }
        }
      }
    }

    res.json({ period: { start, end }, stats: teamStats, totalReports: reports.length });
  }));

  router.delete('/:id', checkOwnership('dailyReport'), handleAsync(async (req: any, res: any) => {
    await prisma.dailyReport.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }));

  return router;
}
