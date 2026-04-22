import { ExtractorContext, Extractor } from './types';
import { SheetData } from '../../../types/sheets-export.types';

export const ritualsDailySync: Extractor = async (ctx): Promise<SheetData> => {
  const reports = await ctx.prisma.dailyReport.findMany({
    include: {
      user: { select: { fullName: true } },
      approver: { select: { fullName: true } },
    },
    orderBy: { reportDate: 'desc' },
    take: 500,
  });

  const headers = [
    'Created Date', 'Submission Status', 'Reporter', 'Team', 'Status', 'Report Date',
    'Completed Tasks', 'Completed Metrics', 'Doing Tasks', 'Doing Metrics',
    'Today Plans', 'Priority Items', 'Blockers', 'Blocker Impact', 'Ad-hoc Tasks'
  ];

  const rows = reports.map(r => {
    const tasks = JSON.parse(r.tasksData || '{}');
    const metrics = r.teamMetrics as Record<string, unknown> || {};
    const adHoc = r.adHocTasks ? JSON.parse(r.adHocTasks) : [];

    return [
      r.createdAt.toISOString(),
      r.status,
      r.user.fullName,
      r.teamType || '',
      r.status,
      r.reportDate.toISOString().split('T')[0],
      Array.isArray(tasks.completedYesterday) ? tasks.completedYesterday.join('; ') : '',
      JSON.stringify(metrics.completed || {}),
      Array.isArray(tasks.doingYesterday) ? tasks.doingYesterday.join('; ') : '',
      JSON.stringify(metrics.doing || {}),
      Array.isArray(tasks.doingToday) ? tasks.doingToday.join('; ') : '',
      '', // Priority items not in schema
      r.blockers || '',
      r.impactLevel || '',
      Array.isArray(adHoc) ? adHoc.map((t: { name: string }) => t.name).join('; ') : '',
    ];
  });

  return { sheetName: 'Rituals-DailySync', headers, rows };
};

export const ritualsWeeklyReport: Extractor = async (ctx): Promise<SheetData> => {
  const reports = await ctx.prisma.weeklyReport.findMany({
    include: {
      user: { select: { fullName: true } },
      approver: { select: { fullName: true } },
    },
    orderBy: { weekEnding: 'desc' },
    take: 200,
  });

  const headers = [
    'Reporter', 'Week Ending', 'Status', 'Score', 'Confidence',
    'Progress', 'Plans', 'Blockers', 'KR Progress', 'Ad-hoc Tasks',
    'Approved By', 'Approved At'
  ];

  const rows = reports.map(r => {
    const adHoc = r.adHocTasks ? JSON.parse(r.adHocTasks) : [];
    return [
      r.user.fullName,
      r.weekEnding.toISOString().split('T')[0],
      r.status,
      r.score,
      r.confidenceScore,
      r.progress,
      r.plans,
      r.blockers,
      r.krProgress || '',
      Array.isArray(adHoc) ? adHoc.map((t: { name: string }) => t.name).join('; ') : '',
      r.approver?.fullName || '',
      r.approvedAt?.toISOString() || '',
    ];
  });

  return { sheetName: 'Rituals-WeeklyReport', headers, rows };
};
