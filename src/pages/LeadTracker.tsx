import { useState } from 'react';
import LeadLogsTab from '../components/lead-tracker/lead-logs-tab';
import DailyStatsTab from '../components/lead-tracker/daily-stats-tab';
import DashboardTab from '../components/lead-tracker/dashboard-tab';

type TabType = 'logs' | 'daily' | 'dashboard';

const TABS: { key: TabType; label: string }[] = [
  { key: 'logs', label: 'Lead Logs' },
  { key: 'daily', label: 'Hiệu suất ngày' },
  { key: 'dashboard', label: 'Dashboard' },
];

export default function LeadTracker() {
  const [tab, setTab] = useState<TabType>('logs');
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Lead Performance Tracker</h1>
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'logs' && <LeadLogsTab />}
      {tab === 'daily' && <DailyStatsTab />}
      {tab === 'dashboard' && <DashboardTab />}
    </div>
  );
}
