import { useState, useEffect, useMemo } from 'react';
import { Objective, WorkItem, User, Sprint, WeeklyReport } from '../types';
import {
  Zap,
  Users,
  Calendar,
  TrendingUp,
  FileText,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function PMDashboard() {
  const { currentUser } = useAuth();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [itemsRes, objsRes, usersRes, sprintsRes, reportsRes] = await Promise.all([
        fetch('/api/work-items'),
        fetch('/api/objectives'),
        fetch('/api/users'),
        fetch('/api/sprints'),
        fetch('/api/reports')
      ]);

      if (!itemsRes.ok || !objsRes.ok || !usersRes.ok || !sprintsRes.ok || !reportsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [itemsData, objsData, usersData, sprintsData, reportsData] = await Promise.all([
        itemsRes.json(),
        objsRes.json(),
        usersRes.json(),
        sprintsRes.json(),
        reportsRes.json()
      ]);

      setWorkItems(itemsData);
      setObjectives(objsData);
      setUsers(usersData);
      setSprints(sprintsData);
      setWeeklyReports(reportsData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==================== Tier 1: Top Metrics ====================

  // 1. Company OKRs Progress (L1 objectives)
  const l1Objectives = objectives.filter(obj => obj.level === 'L1' || obj.department === 'BOD');
  const companyOKRProgress = l1Objectives.length > 0
    ? Math.round(l1Objectives.reduce((sum, obj) => sum + obj.progressPercentage, 0) / l1Objectives.length)
    : 0;

  // 2. Sprint Countdown
  const now = new Date();
  const currentSprint = sprints.find(s =>
    new Date(s.startDate) <= now && new Date(s.endDate) >= now
  );
  const daysLeft = currentSprint
    ? Math.ceil((new Date(currentSprint.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const sprintDuration = currentSprint
    ? (new Date(currentSprint.endDate).getTime() - new Date(currentSprint.startDate).getTime())
    : 0;
  const sprintElapsed = currentSprint
    ? (now.getTime() - new Date(currentSprint.startDate).getTime())
    : 0;
  const sprintProgress = sprintDuration > 0 ? Math.min(100, Math.round((sprintElapsed / sprintDuration) * 100)) : 0;

  // 3. Flow Efficiency
  const doneItems = workItems.filter(item => item.status === 'Done').length;
  const flowEfficiency = workItems.length > 0
    ? Math.round((doneItems / workItems.length) * 100)
    : 0;

  // 4. Active Blockers
  const activeBlockers = workItems.filter(
    item => item.priority === 'Urgent' &&
      (item.status === 'Todo' || item.status === 'In Progress')
  ).length;

  // 5. This Week Activity
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const createdThisWeek = workItems.filter(item =>
    new Date(item.createdAt) >= weekAgo
  ).length;
  const completedThisWeek = workItems.filter(item =>
    item.status === 'Done' && new Date(item.updatedAt) >= weekAgo
  ).length;

  // 6. Report Status
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  };
  const weekStart = getWeekStart(new Date());
  const currentWeekReports = weeklyReports.filter(r =>
    new Date(r.weekEnding) >= weekStart
  );
  const submittedReports = currentWeekReports.length;
  const totalMembers = users.filter(u => u.role !== 'Admin').length;

  // ==================== Tier 2: Charts Data ====================

  // Department Progress (L2 objectives)
  // Colors: Tech #0059B6, Marketing #F54A00, Media #E60076, Sale #009966
  const deptColors: Record<string, string> = {
    'Tech': 'bg-[#0059B6]',
    'Marketing': 'bg-[#F54A00]',
    'Media': 'bg-[#E60076]',
    'Sale': 'bg-[#009966]'
  };
  const l2Objectives = objectives.filter(obj => obj.level === 'L2' || (obj.department !== 'BOD' && !obj.parentId));
  const departmentMap: Record<string, number[]> = {
    'Tech': [],
    'Marketing': [],
    'Media': [],
    'Sale': []
  };
  l2Objectives.forEach(obj => {
    const dept = obj.department;
    if (departmentMap[dept]) {
      departmentMap[dept].push(obj.progressPercentage);
    }
  });
  const departmentData = Object.entries(departmentMap).map(([dept, progresses]) => ({
    name: dept,
    progress: progresses.length > 0
      ? Math.round(progresses.reduce((sum, p) => sum + p, 0) / progresses.length)
      : 0,
    color: deptColors[dept] || 'bg-primary'
  }));

  // Status Breakdown - colors synced with Board pages
  const statusData = [
    { name: 'Todo', count: workItems.filter(i => i.status === 'Todo').length, color: 'bg-slate-400' },
    { name: 'In Progress', count: workItems.filter(i => i.status === 'In Progress').length, color: 'bg-primary' },
    { name: 'Review', count: workItems.filter(i => i.status === 'Review').length, color: 'bg-secondary' },
    { name: 'Done', count: doneItems, color: 'bg-tertiary' },
  ];
  const totalItems = statusData.reduce((sum, s) => sum + s.count, 0);

  // Weekly Velocity
  const velocityData = useMemo(() => {
    const getWeekKey = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - d.getDay());
      return d.toISOString().split('T')[0];
    };

    const weekMap: Record<string, number> = {};
    for (let i = 3; i >= 0; i--) {
      const weekDate = new Date();
      weekDate.setDate(weekDate.getDate() - (i * 7));
      const key = getWeekKey(weekDate);
      weekMap[key] = 0;
    }

    workItems
      .filter(item => item.status === 'Done')
      .forEach(item => {
        const key = getWeekKey(new Date(item.updatedAt));
        if (weekMap[key] !== undefined) {
          weekMap[key]++;
        }
      });

    return Object.entries(weekMap).map(([, count], i) => ({
      week: `W${i + 1}`,
      completed: count
    }));
  }, [workItems]);


  if (loading || !currentUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-error font-bold mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:scale-95 transition-transform"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)] shrink-0">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">Analytics</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Overview</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Project Management <span className="text-primary italic">Control Panel</span>
          </h2>
        </div>
        <div className="flex items-center gap-3 text-sm text-on-surface-variant">
          <Zap size={16} className="text-primary" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </section>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto pb-8 space-y-[var(--space-lg)]">
      {/* ==================== Tier 1: Top Metrics (6 Cards) - Tablet optimized */}
      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Company OKRs Progress */}
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-5 md:p-6 rounded-2xl md:rounded-3xl lg:rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company OKRs</p>
          <div className="flex items-center justify-between">
            <h4 className="text-lg md:text-xl font-black font-headline text-on-surface">
              {l1Objectives.length} Active
            </h4>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">{companyOKRProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${companyOKRProgress}%` }} />
          </div>
        </div>

        {/* 2. Sprint Countdown */}
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-5 md:p-6 rounded-2xl md:rounded-3xl lg:rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sprint</p>
          {currentSprint ? (
            <>
              <div className="flex items-center justify-between">
                <h4 className="text-lg md:text-xl font-black font-headline text-on-surface">
                  {daysLeft}d left
                </h4>
                <Calendar size={18} className="text-primary" />
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${sprintProgress}%` }} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-400">No Active Sprint</h4>
            </div>
          )}
        </div>

        {/* 3. Flow Efficiency */}
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-5 md:p-6 rounded-2xl md:rounded-3xl lg:rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flow Efficiency</p>
          <div className="flex items-center justify-between">
            <h4 className="text-lg md:text-xl font-black font-headline text-on-surface">
              {doneItems}/{workItems.length}
            </h4>
            <span className="px-2 py-1 bg-tertiary/10 text-tertiary text-xs font-bold rounded-lg">{flowEfficiency}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-tertiary transition-all duration-1000" style={{ width: `${flowEfficiency}%` }} />
          </div>
        </div>

        {/* 4. Active Blockers */}
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-5 md:p-6 rounded-2xl md:rounded-3xl lg:rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blockers</p>
          <div className="flex items-center justify-between">
            <h4 className={`text-lg md:text-xl font-black font-headline ${activeBlockers > 0 ? 'text-error' : 'text-on-surface'}`}>
              {activeBlockers === 0 ? 'Clear' : `${activeBlockers} Blocked`}
            </h4>
            <span className={`px-2 py-1 text-xs font-bold rounded-lg ${activeBlockers > 0 ? 'bg-error/10 text-error' : 'bg-slate-100 text-slate-400'}`}>
              {activeBlockers}
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Urgent in Todo/Progress</p>
        </div>

        {/* 5. This Week Activity */}
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-5 md:p-6 rounded-2xl md:rounded-3xl lg:rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">This Week</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg md:text-xl font-black font-headline text-on-surface">+{createdThisWeek}</span>
              <span className="text-slate-300">/</span>
              <span className="text-lg md:text-xl font-black font-headline text-tertiary">{completedThisWeek}</span>
            </div>
            <Activity size={18} className="text-primary" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Created / Completed</p>
        </div>

        {/* 6. Report Status */}
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-5 md:p-6 rounded-2xl md:rounded-3xl lg:rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reports</p>
          <div className="flex items-center justify-between">
            <h4 className="text-lg md:text-xl font-black font-headline text-on-surface">
              {submittedReports}/{totalMembers}
            </h4>
            <FileText size={18} className="text-primary" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Submitted this week</p>
        </div>
      </section>

      {/* ==================== Tier 2: Charts (50/50) ==================== */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Left: Department Progress + Status Breakdown */}
        <div className="bg-white rounded-2xl md:rounded-3xl lg:rounded-3xl shadow-sm p-5 md:p-6 lg:p-8">
          <h3 className="text-base md:text-lg font-black font-headline text-on-surface mb-6">
            Department Progress
          </h3>
          <div className="space-y-4">
            {departmentData.map(dept => (
              <div key={dept.name} className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-on-surface-variant">{dept.name}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${dept.color} transition-all duration-1000`}
                    style={{ width: `${dept.progress}%` }}
                  />
                </div>
                <span className="w-12 text-sm font-bold text-right">{dept.progress}%</span>
              </div>
            ))}
          </div>

          <h3 className="text-base md:text-lg font-black font-headline text-on-surface mt-8 mb-4">
            Status Breakdown
          </h3>
          <div className="space-y-3">
            {statusData.map(status => (
              <div key={status.name} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium text-on-surface-variant">{status.name}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${status.color} transition-all duration-1000`}
                    style={{ width: `${totalItems > 0 ? (status.count / totalItems) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-12 text-sm font-bold text-right">{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Weekly Velocity */}
        <div className="bg-white rounded-2xl md:rounded-3xl lg:rounded-3xl shadow-sm p-5 md:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-base md:text-lg font-black font-headline text-on-surface">
              Weekly Velocity
            </h3>
            <TrendingUp size={18} className="text-primary" />
          </div>
          {velocityData.some(v => v.completed > 0) ? (
            <div className="h-[200px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={velocityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12 }}
                  className="fill-slate-500"
                  axisLine={{ className: 'stroke-slate-200' }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="fill-slate-500"
                  axisLine={{ className: 'stroke-slate-200' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface-container)',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                    color: 'var(--color-on-surface)'
                  }}
                  formatter={(value: number) => [`${value} tasks`, 'Completed']}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] md:h-[280px] flex items-center justify-center text-slate-400">
              <p>Insufficient data for velocity chart</p>
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}
