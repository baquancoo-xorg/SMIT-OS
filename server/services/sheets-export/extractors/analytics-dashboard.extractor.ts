import { ExtractorContext, Extractor } from './types';
import { SheetData } from '../../../types/sheets-export.types';

export const analyticsDashboard: Extractor = async (ctx): Promise<SheetData> => {
  const now = new Date();

  // Get active sprint
  const activeSprint = await ctx.prisma.sprint.findFirst({
    where: { startDate: { lte: now }, endDate: { gte: now } },
    include: { workItems: true },
  });

  // Calculate metrics
  const sprintItems = activeSprint?.workItems || [];
  const done = sprintItems.filter(i => i.status === 'Done').length;
  const total = sprintItems.length;
  const overdue = sprintItems.filter(i => i.dueDate && i.dueDate < now && i.status !== 'Done').length;
  const review = sprintItems.filter(i => i.status === 'Review').length;

  // WIP per person
  const assignees = await ctx.prisma.workItem.groupBy({
    by: ['assigneeId'],
    where: { status: { in: ['Active', 'In Progress'] } },
    _count: true,
  });
  const activeAssignees = assignees.filter(a => a.assigneeId).length;
  const wipPerPerson = activeAssignees > 0
    ? (assignees.reduce((sum, a) => sum + a._count, 0) / activeAssignees).toFixed(1)
    : '0';

  // Daily reports submitted today
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const dailySubmitted = await ctx.prisma.dailyReport.count({
    where: { reportDate: { gte: todayStart } },
  });
  const totalUsers = await ctx.prisma.user.count();

  // Status breakdown
  const statusCounts = await ctx.prisma.workItem.groupBy({
    by: ['status'],
    _count: true,
  });

  const headers = ['Metric', 'Value', 'Status/Trend'];
  const rows: (string | number | boolean | null)[][] = [
    ['Sprint Burndown', `${done}/${total}`, total > 0 ? `${((done / total) * 100).toFixed(0)}%` : 'N/A'],
    ['Overdue Tasks', overdue, overdue > 5 ? 'Warning' : 'OK'],
    ['Review Queue', review, review > 10 ? 'High' : 'Normal'],
    ['WIP/Person', wipPerPerson, parseFloat(wipPerPerson) > 5 ? 'High' : 'Normal'],
    ['Daily Reports', `${dailySubmitted}/${totalUsers}`, dailySubmitted === totalUsers ? 'Complete' : 'Pending'],
  ];

  // Add status breakdown
  for (const s of statusCounts) {
    rows.push([`Status: ${s.status}`, s._count, '']);
  }

  return { sheetName: 'Analytics-Dashboard', headers, rows };
};
