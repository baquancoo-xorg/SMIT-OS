import { ExtractorContext, Extractor } from './types';
import { SheetData } from '../../../types/sheets-export.types';

const DEPARTMENTS = ['Tech', 'Marketing', 'Media', 'Sale'] as const;

const HEADERS = [
  'ID', 'Title', 'Description', 'Status', 'Priority', 'Type',
  'Assignee', 'Sprint', 'Due Date', 'Story Points', 'Parent',
  'KR Links', 'Created At', 'Updated At'
];

export function createWorkspaceExtractor(department: string): Extractor {
  return async (ctx: ExtractorContext): Promise<SheetData> => {
    const items = await ctx.prisma.workItem.findMany({
      where: {
        assignee: { departments: { has: department } }
      },
      include: {
        assignee: { select: { fullName: true } },
        sprint: { select: { name: true } },
        parent: { select: { title: true } },
        krLinks: { include: { keyResult: { select: { title: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    });

    const rows = items.map(item => [
      item.id,
      item.title,
      item.description || '',
      item.status,
      item.priority,
      item.type,
      item.assignee?.fullName || '',
      item.sprint?.name || '',
      item.dueDate?.toISOString().split('T')[0] || '',
      item.storyPoints ?? '',
      item.parent?.title || '',
      item.krLinks.map(l => l.keyResult.title).join(', '),
      item.createdAt.toISOString(),
      item.updatedAt.toISOString(),
    ]);

    return { sheetName: `Workspace-${department}`, headers: HEADERS, rows };
  };
}

export const workspaceTech = createWorkspaceExtractor('Tech');
export const workspaceMarketing = createWorkspaceExtractor('Marketing');
export const workspaceMedia = createWorkspaceExtractor('Media');
export const workspaceSales = createWorkspaceExtractor('Sale');
