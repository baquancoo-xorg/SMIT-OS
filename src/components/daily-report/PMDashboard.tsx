import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, RefreshCw, Calendar } from 'lucide-react';
import { TeamType, TEAM_THEMES } from '../../types/daily-report-metrics';
import { getTeamDisplayName } from '../../utils/team-detection';
import CustomFilter from '../ui/CustomFilter';

interface TeamStats {
  count: number;
  blockers: number;
  metrics: Record<string, number>;
}

interface DashboardData {
  period: { start: string; end: string };
  stats: Record<TeamType, TeamStats>;
  totalReports: number;
}

interface PMDashboardProps {
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onRefresh?: () => void;
}

export default function PMDashboard({ dateRange, onDateRangeChange, onRefresh }: PMDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate: dateRange.start, endDate: dateRange.end });
      const res = await fetch(`/api/daily-reports/stats/team-summary?${params}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateRange.start, dateRange.end]);

  const teams: TeamType[] = ['tech', 'marketing', 'media', 'sale'];

  const getMetricLabel = (key: string): string => {
    const labels: Record<string, string> = {
      // Tech
      prLink: 'PRs Created',
      // Marketing
      spend: 'Ad Spend (₫)',
      mqls: 'MQLs Generated',
      cpa: 'Avg CPA (₫)',
      adsTested: 'Ads Tested',
      // Media
      publicationsCount: 'Publications',
      followers: 'New Followers',
      // Sale
      leadsReceived: 'Leads Received',
      leadsQualified: 'SQLs',
      demosBooked: 'Demos Booked',
      revenue: 'Revenue (₫)',
      oppValue: 'Pipeline Value (₫)',
      ticketsResolved: 'Tickets Resolved',
    };
    return labels[key] || key;
  };

  const formatValue = (key: string, value: number): string => {
    if (['spend', 'cpa', 'revenue', 'oppValue'].includes(key)) {
      return new Intl.NumberFormat('vi-VN').format(value) + '₫';
    }
    return value.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Generate date range options
  const getDateRangeOptions = () => {
    const today = new Date();
    const getWeekRange = (offset = 0) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset * 7);
      const dayOfWeek = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { start: monday.toISOString().split('T')[0], end: sunday.toISOString().split('T')[0] };
    };
    const getMonthRange = () => {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    };
    return [
      { value: 'this-week', label: 'Tuần này', range: getWeekRange(0) },
      { value: 'last-week', label: 'Tuần trước', range: getWeekRange(-1) },
      { value: 'this-month', label: 'Tháng này', range: getMonthRange() },
    ];
  };

  const dateOptions = getDateRangeOptions();
  const currentDateOption = dateOptions.find(
    opt => opt.range.start === dateRange.start && opt.range.end === dateRange.end
  )?.value || 'custom';

  const handleDateOptionChange = (value: string) => {
    const option = dateOptions.find(opt => opt.value === value);
    if (option) {
      onDateRangeChange(option.range);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sprint Filter Bar Style */}
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-4 rounded-xl shadow-sm">
        {/* Left: Date Range Filter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
            <Calendar size={14} />
            <span>Khoảng thời gian:</span>
          </div>
          <CustomFilter
            value={currentDateOption}
            onChange={handleDateOptionChange}
            options={dateOptions.map(opt => ({ value: opt.value, label: opt.label }))}
          />
        </div>

        {/* Right: Stats */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Total: {data?.totalReports || 0}
            </span>
          </div>
          {teams.map((team) => {
            const stats = data?.stats[team];
            const theme = TEAM_THEMES[team];
            const hasBlockers = (stats?.blockers || 0) > 0;
            const bgLightClass = {
              tech: 'bg-indigo-50',
              marketing: 'bg-orange-50',
              media: 'bg-pink-50',
              sale: 'bg-emerald-50',
            }[team];
            return (
              <div key={team} className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bgLightClass}`}>
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

      {/* Team Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => {
          const stats = data?.stats[team];
          const theme = TEAM_THEMES[team];
          const metrics = stats?.metrics || {};
          const metricKeys = Object.keys(metrics).filter((k) => metrics[k] > 0);

          return (
            <div key={team} className="bg-white rounded-xl shadow-sm shadow-sm overflow-hidden">
              <div className={`${theme.bg} px-5 py-3 flex items-center justify-between`}>
                <h4 className="text-white font-bold">{getTeamDisplayName(team)}</h4>
                <span className="text-white/80 text-sm font-medium">{stats?.count || 0} reports</span>
              </div>
              <div className="p-5">
                {metricKeys.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {metricKeys.slice(0, 6).map((key) => (
                      <div key={key} className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{getMetricLabel(key)}</p>
                        <p className={`text-lg font-black ${theme.text}`}>{formatValue(key, metrics[key])}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <TrendingUp size={24} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">No metrics data yet</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
