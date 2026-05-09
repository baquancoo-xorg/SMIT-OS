import { Extractor } from './types';
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
    'Created At', 'Reporter', 'Status', 'Report Date',
    'Completed Yesterday', 'Doing Yesterday', 'Blockers', 'Plan Today',
    'Approved By', 'Approved At',
  ];

  const rows = reports.map(r => [
    r.createdAt.toISOString(),
    r.user.fullName,
    r.status,
    r.reportDate.toISOString().split('T')[0],
    r.completedYesterday,
    r.doingYesterday,
    r.blockers,
    r.planToday,
    r.approver?.fullName || '',
    r.approvedAt?.toISOString() || '',
  ]);

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
    'Reporter', 'Week Ending', 'Status',
    'KR Progress (JSON)', 'Last Week Priorities (JSON)', 'Top 3 Next Week (JSON)', 'Risks/Help (JSON)',
    'Approved By', 'Approved At',
  ];

  const rows = reports.map(r => [
    r.user.fullName,
    r.weekEnding.toISOString().split('T')[0],
    r.status,
    r.krProgress,
    r.progress,
    r.plans,
    r.blockers,
    r.approver?.fullName || '',
    r.approvedAt?.toISOString() || '',
  ]);

  return { sheetName: 'Rituals-WeeklyCheckin', headers, rows };
};
