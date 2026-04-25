import { WeeklyReport } from '../types';

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface WeeklyExportFilters {
  assignUserId: string;
  sprintId: string;
  week: '1' | '2' | '';
}

interface KeyResultProgress {
  krId: string;
  title: string;
  previousProgress?: number;
  currentProgress?: number;
  progressChange?: number;
  activities?: string[];
  impact?: string;
}

interface PlanItem {
  stt?: number;
  item: string;
  output: string;
  deadline: string;
}

interface BlockerItem {
  difficulty: string;
  supportRequest?: string;
}

function parseJSON<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function weeklyReportToMarkdown(report: WeeklyReport): string {
  const weekEnding = new Date(report.weekEnding);
  const weekStart = new Date(weekEnding);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekNum = getWeekNumber(weekEnding);

  const dateRange = `${weekStart.toLocaleDateString('vi-VN')} - ${weekEnding.toLocaleDateString('vi-VN')}`;

  const progress = parseJSON<{ keyResults?: KeyResultProgress[] }>(report.progress, { keyResults: [] });
  const plans = parseJSON<{ items?: PlanItem[] }>(report.plans, { items: [] });
  const blockers = parseJSON<{ items?: BlockerItem[] }>(report.blockers, { items: [] });

  const lines = [
    `## ${report.user?.fullName || 'Unknown'} — Week ${weekNum}`,
    `**Period:** ${dateRange}`,
    `**Confidence Score:** ${report.score || 0}/10`,
    `**Status:** ${report.status || 'Review'}`,
    '',
  ];

  // Progress section
  if (progress.keyResults && progress.keyResults.length > 0) {
    lines.push('### 📈 Progress (Key Results)');
    for (const kr of progress.keyResults) {
      const change = kr.progressChange ? `+${kr.progressChange}%` : '';
      const fromTo = kr.previousProgress != null && kr.currentProgress != null
        ? ` (${kr.previousProgress}% → ${kr.currentProgress}%)`
        : '';
      lines.push(`- **${kr.title}**: ${change}${fromTo}`);
      if (kr.activities && kr.activities.length > 0) {
        lines.push(`  - Activities: ${kr.activities.join(', ')}`);
      }
      if (kr.impact) {
        lines.push(`  - Impact: ${kr.impact}`);
      }
    }
    lines.push('');
  }

  // Plans section
  if (plans.items && plans.items.length > 0) {
    lines.push('### 📋 Plans for Next Week');
    lines.push('| # | Item | Output | Deadline |');
    lines.push('|---|------|--------|----------|');
    plans.items.forEach((p, i) => {
      lines.push(`| ${p.stt || i + 1} | ${p.item} | ${p.output} | ${p.deadline || '-'} |`);
    });
    lines.push('');
  }

  // Blockers section
  if (blockers.items && blockers.items.length > 0) {
    lines.push('### ⚠️ Blockers');
    for (const b of blockers.items) {
      const support = b.supportRequest ? ` — Support needed: ${b.supportRequest}` : '';
      lines.push(`- ${b.difficulty}${support}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function exportWeeklyReportsAsMarkdown(
  selectedIds: Set<string>,
  reports: WeeklyReport[],
  sprints: Sprint[],
  filters: WeeklyExportFilters,
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
    '# Weekly Report Export',
    headerMeta || null,
    `Generated: ${now}`,
    '',
    '---',
    '',
    ...selected.map(r => weeklyReportToMarkdown(r) + '\n---\n'),
  ].filter(l => l !== null) as string[];

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `weekly-report-export-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getSprintWeek(reportDate: string, sprint: Sprint): 1 | 2 | null {
  const date = new Date(reportDate);
  const start = new Date(sprint.startDate);
  const diffDays = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0 || diffDays >= 14) return null;
  return diffDays < 7 ? 1 : 2;
}
