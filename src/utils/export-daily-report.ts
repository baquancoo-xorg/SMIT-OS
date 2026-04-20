import { DailyReport, DailyReportTasksData, WorkItem } from '../types';

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

/** Determine which sprint week (1 or 2) a date falls into based on sprint start */
export function getSprintWeek(reportDate: string, sprint: Sprint): 1 | 2 | null {
  const date = new Date(reportDate);
  const start = new Date(sprint.startDate);
  const diffDays = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0 || diffDays >= 14) return null;
  return diffDays < 7 ? 1 : 2;
}

/** Find which sprint a report date belongs to */
export function findSprintForReport(reportDate: string, sprints: Sprint[]): Sprint | null {
  const date = new Date(reportDate);
  return sprints.find(s => {
    const start = new Date(s.startDate);
    const end = new Date(s.endDate);
    return date >= start && date <= end;
  }) || null;
}

function formatTaskList(taskIds: string[], tasks: WorkItem[]): string {
  if (!taskIds.length) return '_Kh\u00f4ng c\u00f3_';
  return taskIds
    .map(id => {
      const task = tasks.find(t => t.id === id);
      return `- ${task?.title || `Task ${id.slice(0, 8)}...`}`;
    })
    .join('\n');
}

function reportToMarkdown(report: DailyReport, tasks: WorkItem[]): string {
  const date = new Date(report.reportDate).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });
  const tasksData: DailyReportTasksData = report.tasksData
    ? JSON.parse(report.tasksData)
    : { completedYesterday: [], doingYesterday: [], doingToday: [] };

  const teamLabel = report.teamType
    ? report.teamType.charAt(0).toUpperCase() + report.teamType.slice(1)
    : 'N/A';

  const lines = [
    `## ${report.user?.fullName || 'Unknown'} \u2014 ${date}`,
    `**Team:** ${teamLabel} | **Status:** ${report.status}`,
    '',
    '### \u2705 Ho\u00e0n th\u00e0nh h\u00f4m qua',
    formatTaskList(tasksData.completedYesterday, tasks),
    '',
    '### \ud83d\udd04 \u0110ang l\u00e0m d\u1edf',
    formatTaskList(tasksData.doingYesterday, tasks),
    '',
    '### \ud83d\udccb K\u1ebf ho\u1ea1ch h\u00f4m nay',
    formatTaskList(tasksData.doingToday, tasks),
  ];

  if (report.blockers) {
    lines.push('', `**Blockers:** ${report.blockers}`);
  }
  if (report.impactLevel && report.impactLevel !== 'none') {
    const impactLabel = report.impactLevel === 'high' ? 'High \ud83d\udd34' : 'Low \ud83d\udfe1';
    lines.push(`**Impact:** ${impactLabel}`);
  }

  return lines.join('\n');
}

export interface ExportFilters {
  assignUserId: string;
  sprintId: string;
  week: '1' | '2' | '';
}

/** Generate and download a markdown file from selected reports */
export function exportReportsAsMarkdown(
  selectedIds: Set<string>,
  reports: DailyReport[],
  tasks: WorkItem[],
  sprints: Sprint[],
  filters: ExportFilters,
): void {
  const selected = reports.filter(r => selectedIds.has(r.id));
  if (!selected.length) return;

  const now = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const sprint = sprints.find(s => s.id === filters.sprintId);
  const headerMeta = [
    sprint ? `Sprint: ${sprint.name}` : null,
    filters.week ? `Week: ${filters.week}` : null,
  ].filter(Boolean).join(' | ');

  const lines = [
    '# Daily Sync Export',
    headerMeta || null,
    `Generated: ${now}`,
    '',
    '---',
    '',
    ...selected.map(r => reportToMarkdown(r, tasks) + '\n\n---\n'),
  ].filter(l => l !== null) as string[];

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `daily-sync-export-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
