import { useState, useEffect } from 'react';
import { Objective, WorkItem, User } from '../types';
import {
  CheckCircle2,
  Zap,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function PMDashboard() {
  const { currentUser } = useAuth();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [itemsRes, objsRes, usersRes] = await Promise.all([
        fetch('/api/work-items'),
        fetch('/api/objectives'),
        fetch('/api/users')
      ]);
      const itemsData = await itemsRes.json();
      const objsData = await objsRes.json();
      const usersData = await usersRes.json();
      setWorkItems(itemsData);
      setObjectives(objsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !currentUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ==================== Khu vực 1: Top Metrics ====================

  // 1. Company OKRs Progress (L1 objectives)
  const l1Objectives = objectives.filter(obj => obj.level === 'L1');
  const companyOKRProgress = l1Objectives.length > 0
    ? Math.round(l1Objectives.reduce((sum, obj) => sum + obj.progressPercentage, 0) / l1Objectives.length)
    : 0;

  // 2. Active Blockers (Urgent priority + Todo/In Progress status)
  const activeBlockers = workItems.filter(
    item => item.priority === 'Urgent' &&
      (item.status === 'Todo' || item.status === 'In Progress')
  ).length;

  // 3. Flow Efficiency
  const doneItems = workItems.filter(item => item.status === 'Done').length;
  const flowEfficiency = workItems.length > 0
    ? Math.round((doneItems / workItems.length) * 100)
    : 0;

  // 4. Bottleneck Alert (Items stuck in Review)
  const bottleneckCount = workItems.filter(item => item.status === 'Review').length;

  // ==================== Khu vực 2: Charts Data ====================

  // Department OKRs Health (L2 objectives grouped by department)
  const l2Objectives = objectives.filter(obj => obj.level === 'L2');
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
      : 0
  }));

  // Workload Distribution (by status)
  const statusDistribution = [
    {
      name: 'To Do',
      value: workItems.filter(item => item.status === 'Todo').length,
      color: '#94a3b8' // gray-400
    },
    {
      name: 'In Progress',
      value: workItems.filter(item => item.status === 'In Progress').length,
      color: '#3b82f6' // blue-500
    },
    {
      name: 'Review',
      value: workItems.filter(item => item.status === 'Review').length,
      color: '#eab308' // yellow-500
    },
    {
      name: 'Done',
      value: doneItems,
      color: '#22c55e' // green-500
    }
  ];

  // ==================== Khu vực 3: Mission Control ====================

  // Needs PM Attention (Urgent priority + not Done, max 5 items)
  const urgentItems = workItems
    .filter(item => item.priority === 'Urgent' && item.status !== 'Done')
    .slice(0, 5)
    .map(item => {
      const assignee = users.find(u => u.id === item.assigneeId);
      return {
        ...item,
        assigneeName: assignee?.fullName || 'Unassigned'
      };
    });

  // Critical OKR Path (L1 + L2/KR with progress < 30%)
  const criticalL1Objectives = l1Objectives.filter(obj => obj.progressPercentage < 30);
  const criticalL2Objectives = l2Objectives.filter(obj => obj.progressPercentage < 30);

  const handlePingUser = async (workItemId: string) => {
    // Mock ping functionality - could be implemented with notification system
    alert(`🔔 Reminder sent for work item: ${workItemId}`);
  };

  return (
    <div className="h-full flex flex-col p-6 md:p-10 space-y-10 w-full">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">Overview</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Dashboard</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Project Management <span className="text-primary italic">Control Panel</span></h2>
        </div>
        <div className="flex items-center gap-3 text-sm text-on-surface-variant">
          <Zap size={16} className="text-primary" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </section>

      {/* ==================== Khu vực 1: Top Metrics ==================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {/* 1. Company OKRs Progress */}
        <div className="bg-white p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[40px] border border-outline-variant/10 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-primary/5 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Company OKRs Progress</p>
          <div className="flex items-center justify-between relative z-10">
            <h4 className="text-lg md:text-xl lg:text-2xl font-black font-headline text-on-surface relative z-10">
              {l1Objectives.length} Active Objective{l1Objectives.length !== 1 ? 's' : ''}
            </h4>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">{companyOKRProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2 relative z-10">
            <div
              className="h-full bg-primary transition-all duration-1000"
              style={{ width: `${companyOKRProgress}%` }}
            />
          </div>
        </div>

        {/* 2. Active Blockers */}
        <div className="bg-white p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[40px] border border-outline-variant/10 shadow-sm flex flex-col gap-2 group">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Blockers</p>
          <div className="flex items-center justify-between">
            <h4 className={`text-lg md:text-xl lg:text-2xl font-black font-headline ${activeBlockers > 0 ? 'text-red-500' : 'text-on-surface'}`}>
              {activeBlockers === 0 ? 'All Clear' : `${activeBlockers} Blocked`}
            </h4>
            <span className="px-2 py-1 bg-gray-100 text-slate-500 text-xs font-bold rounded-lg">{activeBlockers}</span>
          </div>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-1">Urgent items in Todo/In Progress</p>
        </div>

        {/* 3. Flow Efficiency */}
        <div className="bg-white p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[40px] border border-outline-variant/10 shadow-sm flex flex-col gap-2">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Flow Efficiency</p>
          <div className="flex items-center justify-between">
            <h4 className="text-lg md:text-xl lg:text-2xl font-black font-headline text-on-surface">
              {doneItems}/{workItems.length} Completed
            </h4>
            <span className="px-2 py-1 bg-tertiary/10 text-tertiary text-xs font-bold rounded-lg">{flowEfficiency}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-tertiary transition-all duration-1000"
              style={{ width: `${flowEfficiency}%` }}
            />
          </div>
        </div>

        {/* 4. Bottleneck Alert */}
        <div className={`p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[40px] border shadow-sm flex flex-col gap-2 ${bottleneckCount > 0
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-white border-outline-variant/10'
          }`}>
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Bottleneck Alert</p>
          <div className="flex items-center justify-between">
            <h4 className={`text-lg md:text-xl lg:text-2xl font-black font-headline ${bottleneckCount > 0 ? 'text-yellow-600' : 'text-on-surface'
              }`}>
              {bottleneckCount === 0 ? 'No Bottlenecks' : 'Items in Review'}
            </h4>
            <span className={`px-2 py-1 text-xs font-bold rounded-lg ${bottleneckCount > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-slate-400'
              }`}>
              {bottleneckCount}
            </span>
          </div>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-1">Stuck in review stage</p>
        </div>
      </section>

      {/* ==================== Khu vực 2: Charts ==================== */}
      <section className="grid grid-cols-1 xl:grid-cols-5 gap-4 md:gap-6">
        {/* Cột Trái: Department OKRs Health (60%) */}
        <div className="xl:col-span-3 bg-white rounded-2xl md:rounded-3xl lg:rounded-[40px] border border-outline-variant/10 shadow-sm p-5 md:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-black font-headline text-on-surface">
              Department OKRs Health
            </h3>
          </div>
          {departmentData.some(d => d.progress > 0) ? (
            <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
              <BarChart
                data={departmentData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [`${value}%`, 'Progress']}
                />
                <Bar
                  dataKey="progress"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] md:h-[300px] flex items-center justify-center text-gray-400">
              <p>No department data available</p>
            </div>
          )}
        </div>

        {/* Cột Phải: Workload Distribution (40%) */}
        <div className="xl:col-span-2 bg-white rounded-2xl md:rounded-3xl lg:rounded-[40px] border border-outline-variant/10 shadow-sm p-5 md:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-black font-headline text-on-surface">
              Workload Distribution
            </h3>
          </div>
          {workItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [`${value} items`]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] md:h-[300px] flex items-center justify-center text-gray-400">
              <p>No work items to display</p>
            </div>
          )}
        </div>
      </section>

      {/* ==================== Khu vực 3: Mission Control ==================== */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Cột Trái: Needs PM Attention */}
        <div className="bg-white rounded-2xl md:rounded-3xl lg:rounded-[40px] border border-outline-variant/10 shadow-sm p-5 md:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-black font-headline text-on-surface">
              Needs PM Attention
            </h3>
            {urgentItems.length > 0 && (
              <span className="ml-auto px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                {urgentItems.length}
              </span>
            )}
          </div>
          {urgentItems.length > 0 ? (
            <div className="space-y-3 max-h-[280px] md:max-h-[320px] overflow-y-auto pr-2">
              {urgentItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-slate-50/50 rounded-2xl md:rounded-[32px] hover:bg-slate-50 transition-colors border border-outline-variant/10"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-on-surface truncate text-sm">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{item.assigneeName}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePingUser(item.id)}
                    className="px-3 md:px-4 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-full hover:scale-95 transition-transform whitespace-nowrap"
                    title="Send reminder"
                  >
                    Ping
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[280px] md:h-[320px] flex items-center justify-center text-slate-400">
              <div className="text-center">
                <CheckCircle2 size={48} className="mx-auto mb-3 text-tertiary" />
                <p className="font-bold text-on-surface">All clear!</p>
                <p className="text-sm mt-1">No urgent items need attention</p>
              </div>
            </div>
          )}
        </div>

        {/* Cột Phải: Critical OKR Path */}
        <div className="bg-white rounded-2xl md:rounded-3xl lg:rounded-[40px] border border-outline-variant/10 shadow-sm p-5 md:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-black font-headline text-on-surface">
              Critical OKR Path
            </h3>
            {(criticalL1Objectives.length + criticalL2Objectives.length) > 0 && (
              <span className="ml-auto px-3 py-1 bg-yellow-100 text-yellow-600 text-xs font-bold rounded-full">
                {criticalL1Objectives.length + criticalL2Objectives.length} at risk
              </span>
            )}
          </div>
          <div className="space-y-4 max-h-[280px] md:max-h-[320px] overflow-y-auto pr-2">
            {/* L1 Objectives with low progress */}
            {criticalL1Objectives.length > 0 && (
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Company Objectives (L1)
                </h4>
                <div className="space-y-3">
                  {criticalL1Objectives.map(obj => (
                    <div
                      key={obj.id}
                      className="p-3 md:p-4 bg-red-50 border border-red-200 rounded-2xl md:rounded-[32px]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-bold text-on-surface text-sm flex-1">
                          {obj.title}
                        </h5>
                        <span className="ml-2 px-2 py-1 bg-red-200 text-red-700 text-xs font-black rounded-full whitespace-nowrap">
                          {obj.progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-red-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${obj.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* L2 Objectives with low progress */}
            {criticalL2Objectives.length > 0 && (
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Team Objectives (L2)
                </h4>
                <div className="space-y-3">
                  {criticalL2Objectives.map(obj => (
                    <div
                      key={obj.id}
                      className="p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-2xl md:rounded-[32px]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-on-surface text-sm">
                            {obj.title}
                          </h5>
                          <span className="text-xs text-slate-400 mt-1 block">
                            {obj.department}
                          </span>
                        </div>
                        <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-700 text-xs font-black rounded-full whitespace-nowrap">
                          {obj.progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-yellow-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${obj.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {(criticalL1Objectives.length === 0 && criticalL2Objectives.length === 0) && (
              <div className="h-[280px] md:h-[320px] flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <CheckCircle2 size={48} className="mx-auto mb-3 text-tertiary" />
                  <p className="font-bold text-on-surface">On Track!</p>
                  <p className="text-sm mt-1">All objectives progressing well</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
