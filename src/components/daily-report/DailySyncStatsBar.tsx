import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar } from 'lucide-react';
import { TeamType, TEAM_THEMES } from '../../types/daily-report-metrics';
import { getTeamDisplayName } from '../../utils/team-detection';
import CustomFilter from '../ui/CustomFilter';

interface TeamStats {
  count: number;
  blockers: number;
}

interface StatsData {
  totalReports: number;
  stats: Record<TeamType, TeamStats>;
}

interface DailySyncStatsBarProps {
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
}

const TEAMS: TeamType[] = ['tech', 'marketing', 'media', 'sale'];

const TEAM_BG_LIGHT: Record<TeamType, string> = {
  tech: 'bg-indigo-50',
  marketing: 'bg-orange-50',
  media: 'bg-pink-50',
  sale: 'bg-emerald-50',
};

function getWeekRange(offset = 0) {
  const today = new Date();
  const d = new Date(today);
  d.setDate(d.getDate() + offset * 7);
  const dayOfWeek = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday.toISOString().split('T')[0], end: sunday.toISOString().split('T')[0] };
}

function getMonthRange() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
}

const DATE_OPTIONS = [
  { value: 'this-week', label: 'Tuần này', range: getWeekRange(0) },
  { value: 'last-week', label: 'Tuần trước', range: getWeekRange(-1) },
  { value: 'this-month', label: 'Tháng này', range: getMonthRange() },
];

export default function DailySyncStatsBar({ dateRange, onDateRangeChange }: DailySyncStatsBarProps) {
  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ startDate: dateRange.start, endDate: dateRange.end });
    fetch(`/api/daily-reports/stats/team-summary?${params}`)
      .then(r => r.ok ? r.json() : null)
      .then(json => setData(json))
      .catch(() => null);
  }, [dateRange.start, dateRange.end]);

  const currentOption = DATE_OPTIONS.find(
    opt => opt.range.start === dateRange.start && opt.range.end === dateRange.end
  )?.value || 'custom';

  const handleOptionChange = (value: string) => {
    const option = DATE_OPTIONS.find(o => o.value === value);
    if (option) onDateRangeChange(option.range);
  };

  return (
    <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-4 rounded-xl shadow-sm shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
          <Calendar size={14} />
          <span>Khoảng thời gian:</span>
        </div>
        <CustomFilter
          value={currentOption}
          onChange={handleOptionChange}
          options={DATE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
        />
      </div>

      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
            Total: {data?.totalReports || 0}
          </span>
        </div>
        {TEAMS.map((team) => {
          const stats = data?.stats[team];
          const theme = TEAM_THEMES[team];
          const hasBlockers = (stats?.blockers || 0) > 0;
          return (
            <div key={team} className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${TEAM_BG_LIGHT[team]}`}>
              <div className={`w-2 h-2 rounded-full ${theme.bg}`} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {getTeamDisplayName(team)}: {stats?.count || 0}
              </span>
              {hasBlockers && (
                <span className="text-red-500 text-[10px] font-bold flex items-center gap-0.5 ml-1">
                  <AlertTriangle size={10} />{stats?.blockers}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
