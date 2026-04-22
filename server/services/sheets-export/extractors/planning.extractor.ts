import { ExtractorContext, Extractor } from './types';
import { SheetData } from '../../../types/sheets-export.types';

export const planningOkrs: Extractor = async (ctx): Promise<SheetData> => {
  const objectives = await ctx.prisma.objective.findMany({
    include: {
      owner: { select: { fullName: true } },
      parent: { select: { title: true } },
      keyResults: { select: { id: true, title: true, progressPercentage: true } },
    },
    orderBy: [{ department: 'asc' }, { title: 'asc' }],
  });

  const headers = ['ID', 'Title', 'Department', 'Owner', 'Progress %', 'Level', 'Parent', 'Key Results'];
  const rows = objectives.map(obj => [
    obj.id,
    obj.title,
    obj.department,
    obj.owner?.fullName || '',
    obj.progressPercentage,
    obj.parentId ? 'L2' : 'L1',
    obj.parent?.title || '',
    JSON.stringify(obj.keyResults.map(kr => ({ title: kr.title, progress: kr.progressPercentage }))),
  ]);

  return { sheetName: 'Planning-OKRs', headers, rows };
};

export const planningBacklog: Extractor = async (ctx): Promise<SheetData> => {
  const items = await ctx.prisma.workItem.findMany({
    where: { sprintId: null },
    include: {
      assignee: { select: { fullName: true } },
      parent: { select: { title: true } },
      krLinks: { include: { keyResult: { select: { title: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  const headers = [
    'ID', 'Title', 'Description', 'Status', 'Priority', 'Type',
    'Assignee', 'Due Date', 'Story Points', 'Parent', 'KR Links', 'Created At'
  ];
  const rows = items.map(item => [
    item.id,
    item.title,
    item.description || '',
    item.status,
    item.priority,
    item.type,
    item.assignee?.fullName || '',
    item.dueDate?.toISOString().split('T')[0] || '',
    item.storyPoints ?? '',
    item.parent?.title || '',
    item.krLinks.map(l => l.keyResult.title).join(', '),
    item.createdAt.toISOString(),
  ]);

  return { sheetName: 'Planning-Backlog', headers, rows };
};

export const planningSprint: Extractor = async (ctx): Promise<SheetData> => {
  const sprints = await ctx.prisma.sprint.findMany({
    include: {
      workItems: {
        include: {
          assignee: { select: { fullName: true } },
        },
      },
    },
    orderBy: { startDate: 'desc' },
    take: 3, // Last 3 sprints
  });

  const headers = [
    'Sprint', 'Start Date', 'End Date', 'Item ID', 'Title', 'Status',
    'Priority', 'Type', 'Assignee', 'Story Points'
  ];

  const rows: (string | number | boolean | null)[][] = [];
  for (const sprint of sprints) {
    for (const item of sprint.workItems) {
      rows.push([
        sprint.name,
        sprint.startDate.toISOString().split('T')[0],
        sprint.endDate.toISOString().split('T')[0],
        item.id,
        item.title,
        item.status,
        item.priority,
        item.type,
        item.assignee?.fullName || '',
        item.storyPoints ?? '',
      ]);
    }
  }

  return { sheetName: 'Planning-Sprint', headers, rows };
};
