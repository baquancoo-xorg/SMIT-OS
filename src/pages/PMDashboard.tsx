import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Objective, WorkItem, User, Sprint, WeeklyReport, DailyReport } from '../types';
import {
  AlertCircle,
  Eye,
  Users,
  ClipboardCheck,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardPageHeader, DashboardPanel } from '../components/dashboard/ui';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const fetchJson = (url: string) =>
  fetch(url, { credentials: 'include' }).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    return res.json();
  });

export default function PMDashboard() {
  const { currentUser } = useAuth();

  const { data: workItems = [], isLoading: loadingItems, isError: errItems } =
    useQuery<WorkItem[]>({
      queryKey: ['pm-dashboard', 'work-items'],
      queryFn: () => fetchJson('/api/work-items'),
      staleTime: 60_000,
    });

  const { data: objectives = [], isLoading: loadingObjs, isError: errObjs } =
    useQuery<Objective[]>({
      queryKey: ['pm-dashboard', 'objectives'],
      queryFn: () => fetchJson('/api/objectives'),
      staleTime: 60_000,
    });

  const { data: users = [], isLoading: loadingUsers, isError: errUsers } =
    useQuery<User[]>({
      queryKey: ['pm-dashboard', 'users'],
      queryFn: () => fetchJson('/api/users'),
      staleTime: 60_000,
    });

  const { data: sprints = [], isLoading: loadingSprints, isError: errSprints } =
    useQuery<Sprint[]>({
      queryKey: ['pm-dashboard', 'sprints'],
      queryFn: () => fetchJson('/api/sprints'),
      staleTime: 60_000,
    });

  const { data: weeklyReports = [], isLoading: loadingReports, isError: errReports } =
    useQuery<WeeklyReport[]>({
      queryKey: ['pm-dashboard', 'weekly-reports'],
      queryFn: () => fetchJson('/api/reports'),
      staleTime: 60_000,
    });

  const { data: dailyReportsRaw, isLoading: loadingDaily, isError: errDaily } =
    useQuery<DailyReport[] | { data: DailyReport[] }>({
      queryKey: ['pm-dashboard', 'daily-reports'],
      queryFn: () => fetchJson('/api/daily-reports'),
      staleTime: 60_000,
    });

  const dailyReports: DailyReport[] = Array.isArray(dailyReportsRaw)
    ? dailyReportsRaw
    : ((dailyReportsRaw as { data?: DailyReport[] })?.data ?? []);

  const loading =
    loadingItems || loadingObjs || loadingUsers || loadingSprints || loadingReports || loadingDaily;

  const hasError =
    errItems || errObjs || errUsers || errSprints || errReports || errDaily;

  // ==================== Shared ====================
  const now = new Date();

  const currentSprint = sprints.find(s =>
    new Date(s.startDate) <= now && new Date(s.endDate) >= now
  );

  const doneItems = workItems.filter(item => item.status === 'Done').length;

  // ==================== Tier 1: 6 New Summary Cards ====================

  // Card 1: Sprint Burndown
  const sprintItems = currentSprint
    ? workItems.filter(i => i.sprintId === currentSprint.id)
    : [];
  const sprintDoneCount = sprintItems.filter(i => i.status === 'Done').length;
  const sprintTotalCount = sprintItems.length;
  const sprintDuration = currentSprint
    ? new Date(currentSprint.endDate).getTime() - new Date(currentSprint.startDate).getTime()
    : 0;
  const sprintElapsed = currentSprint
    ? now.getTime() - new Date(currentSprint.startDate).getTime()
    : 0;
  const expectedDone = sprintTotalCount > 0 && sprintDuration > 0
    ? Math.round((Math.min(sprintElapsed, sprintDuration) / sprintDuration) * sprintTotalCount)
    : 0;
  const sprintBurnStatus: 'On Track' | 'Behind' | 'Ahead' =
    sprintDoneCount > expectedDone ? 'Ahead' :
    sprintDoneCount >= expectedDone ? 'On Track' : 'Behind';

  // Card 2: Overdue Tasks
  const overdueCount = workItems.filter(
    i => i.dueDate && new Date(i.dueDate) < now && i.status !== 'Done'
  ).length;

  // Card 3: Review Queue
  const reviewQueueCount = workItems.filter(i => i.status === 'Review').length;

  // Card 4: WIP per Person
  const inProgressItems = workItems.filter(i => i.status === 'Active');
  const activeAssigneeCount = new Set(
    inProgressItems.map(i => i.assigneeId).filter(Boolean)
  ).size;
  const wipPerPerson = activeAssigneeCount > 0
    ? Math.round((inProgressItems.length / activeAssigneeCount) * 10) / 10
    : 0;
  const wipStatus = wipPerPerson <= 2 ? 'healthy' : wipPerPerson <= 4 ? 'warning' : 'danger';

  // Card 5: Daily Report Today
  const todayStr = now.toDateString();
  const dailyTodayCount = dailyReports.filter(
    r => new Date(r.reportDate).toDateString() === todayStr
  ).length;
  const totalMembers = users.filter(u => u.role !== 'Admin').length;

  // Card 6: Team Confidence
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  };
  const weekStart = getWeekStart(now);
  const currentWeekReports = weeklyReports.filter(r => new Date(r.weekEnding) >= weekStart);
  const approvedCount = currentWeekReports.filter(r => r.status === 'Approved').length;
  const avgConfidence = currentWeekReports.length > 0
    ? Math.round(
        currentWeekReports.reduce((s, r) => s + (r.confidenceScore ?? 0), 0) /
        currentWeekReports.length
      )
    : 0;

  // ==================== Tier 2: Charts Data ====================

  // Department Progress
  const deptColors: Record<string, string> = {
    'Tech': 'bg-[#0059B6]',
    'Marketing': 'bg-[#F54A00]',
    'Media': 'bg-[#E60076]',
    'Sale': 'bg-[#009966]'
  };
  const deptHexColors: Record<string, string> = {
    'Tech': '#0059B6',
    'Marketing': '#F54A00',
    'Media': '#E60076',
    'Sale': '#009966'
  };
  const deptOrder = ['Tech', 'Marketing', 'Media', 'Sale'] as const;
  const departmentData = deptOrder.map(dept => {
    const deptObjs = objectives.filter(o => o.department === dept && !o.parentId);
    return {
      name: dept,
      progress: deptObjs.length > 0
        ? Math.round(deptObjs.reduce((sum, o) => sum + o.progressPercentage, 0) / deptObjs.length)
        : 0,
      color: deptColors[dept],
      hex: deptHexColors[dept],
    };
  });

  // Status Breakdown
  const statusData = [
    { name: 'Todo', count: workItems.filter(i => i.status === 'Todo').length, color: 'bg-slate-400' },
    { name: 'Active', count: inProgressItems.length, color: 'bg-primary' },
    { name: 'Review', count: reviewQueueCount, color: 'bg-secondary' },
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
      weekDate.setDate(weekDate.getDate() - i * 7);
      weekMap[getWeekKey(weekDate)] = 0;
    }
    workItems
      .filter(item => item.status === 'Done')
      .forEach(item => {
        const key = getWeekKey(new Date(item.updatedAt));
        if (weekMap[key] !== undefined) weekMap[key]++;
      });
    return Object.entries(weekMap).map(([, count], i) => ({ week: `W${i + 1}`, completed: count }));
  }, [workItems]);

  // Upcoming Deadlines Timeline (next 4 weeks)
  const upcomingDeadlinesData = useMemo(() => {
    return [1, 2, 3, 4].map(w => {
      const weekStart = new Date(now.getTime() + (w - 1) * 7 * 86400000);
      const weekEnd = new Date(now.getTime() + w * 7 * 86400000);
      const items = workItems.filter(i =>
        i.dueDate &&
        i.status !== 'Done' &&
        new Date(i.dueDate) >= weekStart &&
        new Date(i.dueDate) < weekEnd
      );
      return {
        week: `+${w}w`,
        Urgent: items.filter(i => i.priority === 'Urgent').length,
        High: items.filter(i => i.priority === 'High').length,
        Medium: items.filter(i => i.priority === 'Medium').length,
        Low: items.filter(i => i.priority === 'Low').length,
      };
    });
  }, [workItems]);

  if (loading || !currentUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-error font-bold mb-4">Failed to load dashboard data. Please try again.</p>
        </div>
      </div>
    );
  }

  const labelCls = 'text-[10px] font-black text-slate-400 uppercase tracking-widest';
  const valueCls = 'text-lg md:text-xl font-black font-headline text-on-surface';

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      <DashboardPageHeader
        breadcrumb={[
          { label: 'Analytics' },
          { label: 'Overview', active: true },
        ]}
        title="Project Management"
        accent="Control Panel"
        rightControls={
          <div className="flex items-center gap-3 text-sm text-on-surface-variant">
            <BarChart2 size={16} className="text-primary" />
            <span>Last updated: {now.toLocaleTimeString()}</span>
          </div>
        }
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-8 space-y-[var(--space-lg)]">

        {/* ==================== Tier 1: 6 Summary Cards ==================== */}
        <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

          {/* 1. Sprint Burndown */}
          <DashboardPanel className="p-5 md:p-6 flex flex-col gap-2">
            <p className={labelCls}>Sprint Burndown</p>
            <div className="flex items-center justify-between">
              <h4 className={valueCls}>
                {currentSprint ? `${sprintDoneCount}/${sprintTotalCount}` : 'No Sprint'}
              </h4>
              {currentSprint && (
                <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                  sprintBurnStatus === 'Ahead' ? 'bg-tertiary/10 text-tertiary' :
                  sprintBurnStatus === 'On Track' ? 'bg-primary/10 text-primary' :
                  'bg-error/10 text-error'
                }`}>{sprintBurnStatus}</span>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-1">
              {currentSprint?.name ?? 'No active sprint'}
            </p>
          </DashboardPanel>

          {/* 2. Overdue Tasks */}
          <DashboardPanel className="p-5 md:p-6 flex flex-col gap-2">
            <p className={labelCls}>Overdue Tasks</p>
            <div className="flex items-center justify-between">
              <h4 className={`${valueCls} ${overdueCount > 0 ? 'text-error' : ''}`}>
                {overdueCount === 0 ? 'Clear' : overdueCount}
              </h4>
              <AlertCircle size={18} className={overdueCount > 0 ? 'text-error' : 'text-slate-300'} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Past due date</p>
          </DashboardPanel>

          {/* 3. Review Queue */}
          <DashboardPanel className="p-5 md:p-6 flex flex-col gap-2">
            <p className={labelCls}>Review Queue</p>
            <div className="flex items-center justify-between">
              <h4 className={`${valueCls} ${reviewQueueCount > 3 ? 'text-amber-600' : ''}`}>
                {reviewQueueCount}
              </h4>
              <Eye size={18} className="text-primary" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Items waiting review</p>
          </DashboardPanel>

          {/* 4. WIP per Person */}
          <DashboardPanel className="p-5 md:p-6 flex flex-col gap-2">
            <p className={labelCls}>WIP / Person</p>
            <div className="flex items-center justify-between">
              <h4 className={`${valueCls} ${
                wipStatus === 'healthy' ? 'text-tertiary' :
                wipStatus === 'warning' ? 'text-amber-600' : 'text-error'
              }`}>{wipPerPerson}</h4>
              <Users size={18} className="text-primary" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-1">In progress / person</p>
          </DashboardPanel>

          {/* 5. Daily Report Today */}
          <DashboardPanel className="p-5 md:p-6 flex flex-col gap-2">
            <p className={labelCls}>Daily Reports</p>
            <div className="flex items-center justify-between">
              <h4 className={valueCls}>{dailyTodayCount}/{totalMembers}</h4>
              <ClipboardCheck size={18} className="text-primary" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Submitted today</p>
          </DashboardPanel>

          {/* 6. Team Confidence */}
          <DashboardPanel className="p-5 md:p-6 flex flex-col gap-2">
            <p className={labelCls}>Team Confidence</p>
            <div className="flex items-center justify-between">
              <h4 className={valueCls}>
                {avgConfidence > 0 ? `Avg ${avgConfidence}` : 'N/A'}
              </h4>
              <span className="text-xs font-bold text-slate-400">
                {approvedCount}/{currentWeekReports.length}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Weekly score · approved</p>
          </DashboardPanel>
        </section>

        {/* ==================== Tier 2: Row 1 — Department Progress | Weekly Velocity ==================== */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <DashboardPanel className="p-5 md:p-6 lg:p-8">
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
          </DashboardPanel>

          <DashboardPanel className="p-5 md:p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-base md:text-lg font-black font-headline text-on-surface">
                Weekly Velocity
              </h3>
              <TrendingUp size={18} className="text-primary" />
            </div>
            {velocityData.some(v => v.completed > 0) ? (
              <div className="h-[200px] md:h-[280px] min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={velocityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-surface-container)',
                        border: '1px solid var(--color-outline-variant)',
                        borderRadius: '12px',
                        color: 'var(--color-on-surface)',
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
          </DashboardPanel>
        </section>

        {/* ==================== Tier 2: Row 2 — Status Breakdown | Upcoming Deadlines ==================== */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <DashboardPanel className="p-5 md:p-6 lg:p-8">
            <h3 className="text-base md:text-lg font-black font-headline text-on-surface mb-6">
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
          </DashboardPanel>

          <DashboardPanel className="p-5 md:p-6 lg:p-8">
            <h3 className="text-base md:text-lg font-black font-headline text-on-surface mb-2">
              Upcoming Deadlines
            </h3>
            <div className="flex items-center gap-4 mb-6">
              {[
                { label: 'Urgent', color: '#EF4444' },
                { label: 'High', color: '#F97316' },
                { label: 'Medium', color: '#0059B6' },
                { label: 'Low', color: '#94A3B8' },
              ].map(p => (
                <div key={p.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-xs text-slate-500 font-medium">{p.label}</span>
                </div>
              ))}
            </div>
            {upcomingDeadlinesData.some(w => w.Urgent + w.High + w.Medium + w.Low > 0) ? (
              <div className="h-[200px] md:h-[240px] min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={upcomingDeadlinesData} margin={{ top: 0, right: 16, left: -16, bottom: 0 }} barCategoryGap="40%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc', radius: 8 }}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
                        color: '#1e293b',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="Urgent" stackId="a" fill="#EF4444" />
                    <Bar dataKey="High" stackId="a" fill="#F97316" />
                    <Bar dataKey="Medium" stackId="a" fill="#0059B6" />
                    <Bar dataKey="Low" stackId="a" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-400">
                <p>No upcoming deadlines in the next 4 weeks</p>
              </div>
            )}
          </DashboardPanel>
        </section>

      </div>
    </div>
  );
}
