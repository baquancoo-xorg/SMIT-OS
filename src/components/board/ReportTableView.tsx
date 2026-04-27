import React from 'react';
import { WeeklyReport, Sprint } from '../../types';
import { TableRowActions } from '../ui/table-row-actions';
import { TableShell } from '../ui/table-shell';
import { getTableContract } from '../ui/table-contract';
import { formatTableDate } from '../ui/table-date-format';

interface ReportTableViewProps {
  reports: WeeklyReport[];
  onViewDetail: (report: WeeklyReport) => void;
  sprints?: Sprint[];
  // Quick action props
  exportMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: (ids: string[]) => void;
}

// Helper to get week number from date
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Helper to get sprint name for a given date
function getSprintForDate(date: Date, sprints: Sprint[]): Sprint | null {
  const reportDate = new Date(date);
  for (const sprint of sprints) {
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    if (reportDate >= startDate && reportDate <= endDate) {
      return sprint;
    }
  }
  return null;
}

export default function ReportTableView({
  reports,
  onViewDetail,
  sprints = [],
  exportMode = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: ReportTableViewProps) {
  // Sort reports by week (most recent first)
  const sortedReports = [...reports].sort((a, b) => {
    const dateA = new Date(a.weekEnding).getTime();
    const dateB = new Date(b.weekEnding).getTime();
    return dateB - dateA;
  });
  const standardTable = getTableContract('standard');

  const displayedIds = sortedReports.map(r => r.id);
  const allDisplayedSelected = displayedIds.length > 0 && selectedIds && displayedIds.every(id => selectedIds.has(id));

  return (
    <TableShell variant="standard" className="border border-white/20">
      <thead>
        {/* Column order: [Checkbox] → Created at → Reporter → Status → Department → Week → Sprint */}
        <tr className={standardTable.headerRow}>
          {exportMode && (
            <th className="pl-6 pr-2 py-6 w-10">
              <input
                type="checkbox"
                checked={allDisplayedSelected}
                onChange={() => onToggleSelectAll?.(displayedIds)}
                className="rounded accent-primary cursor-pointer"
              />
            </th>
          )}
          <th className={standardTable.headerCell}>Created at</th>
          <th className={standardTable.headerCell}>Reporter</th>
          <th className={standardTable.headerCell}>Status</th>
          <th className={standardTable.headerCell}>Department</th>
          <th className={standardTable.headerCell}>Week</th>
          <th className={standardTable.headerCell}>Sprint</th>
          <th className={standardTable.actionHeaderCell}>Actions</th>
        </tr>
      </thead>
      <tbody className={standardTable.body}>
        {sortedReports.map(report => {
          const user = report.user;
          const weekEnding = new Date(report.weekEnding);
          const weekNumber = getWeekNumber(weekEnding);
          const weekStart = new Date(weekEnding);
          weekStart.setDate(weekStart.getDate() - 6);
          const sprint = getSprintForDate(weekEnding, sprints);

          return (
            <tr
              key={report.id}
              onClick={() => !exportMode && onViewDetail(report)}
              className={`${standardTable.row} ${exportMode ? '' : 'cursor-pointer'}`}
            >
              {exportMode && (
                <td className="pl-6 pr-2 py-5">
                  <input
                    type="checkbox"
                    checked={selectedIds?.has(report.id) || false}
                    onChange={() => onToggleSelect?.(report.id)}
                    className="rounded accent-primary cursor-pointer"
                  />
                </td>
              )}
              <td className={standardTable.cell}>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-base text-slate-400">calendar_today</span>
                  {formatTableDate(report.createdAt)}
                </div>
              </td>

              <td className={standardTable.cell}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-on-surface text-xs shadow-sm group-hover:scale-110 transition-transform">
                    {user?.fullName.split(' ').map(n => n[0]).join('') || '?'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-on-surface group-hover:text-primary transition-colors">
                      {user?.fullName || 'Unknown'}
                    </span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {user?.role || 'N/A'}
                    </span>
                  </div>
                </div>
              </td>

              <td className={standardTable.cell}>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                  report.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {report.status || 'Review'}
                </span>
              </td>

              <td className={standardTable.cell}>
                <div className="flex flex-wrap gap-1">
                  {user?.departments?.map(dept => (
                    <span key={dept} className={`px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                      dept === 'Tech' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      dept === 'Marketing' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      dept === 'Media' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                      dept === 'Sale' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-indigo-50 text-indigo-600 border-indigo-100'
                    }`}>
                      {dept}
                    </span>
                  )) || <span className="text-slate-400 text-xs">N/A</span>}
                </div>
              </td>

              <td className={standardTable.cell}>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-base text-slate-400">date_range</span>
                  <span>
                    {formatTableDate(weekStart)} - {formatTableDate(weekEnding)}
                  </span>
                  <span className="text-xs font-bold text-slate-400 ml-1">
                    (W{weekNumber})
                  </span>
                </div>
              </td>

              <td className={standardTable.cell}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">track_changes</span>
                  <span className="text-sm font-bold text-on-surface">
                    {sprint ? sprint.name : 'N/A'}
                  </span>
                </div>
              </td>

              <td className={standardTable.actionCell} onClick={(e) => e.stopPropagation()}>
                <TableRowActions onView={() => onViewDetail(report)} variant="standard" />
              </td>
            </tr>
          );
        })}
      </tbody>
    </TableShell>
  );
}
