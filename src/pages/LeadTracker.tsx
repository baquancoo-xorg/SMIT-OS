import { useState, useCallback } from 'react';
import { format, startOfMonth } from 'date-fns';
import { ClipboardPaste, Plus, List, BarChart2, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LeadLogsTab from '../components/lead-tracker/lead-logs-tab';
import DailyStatsTab from '../components/lead-tracker/daily-stats-tab';
import DatePicker from '../components/ui/date-picker';
import PrimaryActionButton from '../components/ui/PrimaryActionButton';
import { exportAllLeadsToCsv } from '../components/lead-tracker/csv-export';

const PASTE_HINT = 'Paste from Excel — column order: Customer | AE | Received Date | Resolved Date | Status | Lead Type | UQ Reason | Notes';

type ActiveTab = 'logs' | 'stats';

export default function LeadTracker() {
  const { currentUser } = useAuth();
  const isSale = currentUser?.departments?.includes('Sale');
  const canManageLeads = currentUser?.isAdmin || currentUser?.role?.includes('Leader');
  const [actions, setActions] = useState<{ paste: () => void; addRow: () => void } | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('logs');
  const [statsDateFrom, setStatsDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [statsDateTo, setStatsDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [exporting, setExporting] = useState(false);

  const handleReady = useCallback(
    (a: { paste: () => void; addRow: () => void }) => setActions(a),
    []
  );

  const handleExportCsv = async () => {
    setExporting(true);
    try { await exportAllLeadsToCsv(); } finally { setExporting(false); }
  };

  const tabToggle = (
    <div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-0.5">
      <button
        onClick={() => setActiveTab('logs')}
        className={`flex items-center gap-1.5 h-7 px-3.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
          activeTab === 'logs' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <List size={10} />
        Lead Logs
      </button>
      <button
        onClick={() => setActiveTab('stats')}
        className={`flex items-center gap-1.5 h-7 px-3.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
          activeTab === 'stats' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <BarChart2 size={10} />
        CRM Stats
      </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)] shrink-0">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer transition-colors">CRM</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Lead Tracker</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Lead <span className="text-primary italic">Tracker</span>
          </h2>
        </div>

        {isSale && activeTab === 'logs' && (
          <div className="flex items-center gap-3">
            {canManageLeads && (
              <>
                <button
                  onClick={() => actions?.paste()}
                  title={PASTE_HINT}
                  className="flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-surface-container-high text-slate-600 hover:bg-slate-200 font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  <ClipboardPaste size={13} />
                  Paste from Excel
                </button>
                <button
                  onClick={handleExportCsv}
                  disabled={exporting}
                  className="flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-surface-container-high text-slate-600 hover:bg-slate-200 font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  <Download size={13} />
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </button>
              </>
            )}
            <PrimaryActionButton onClick={() => actions?.addRow()} icon={<Plus size={14} />}>
              Add Row
            </PrimaryActionButton>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4">
        {activeTab === 'logs' ? (
          <LeadLogsTab onReady={handleReady} extraControls={tabToggle} />
        ) : (
          <>
            {/* CRM Stats filter bar */}
            <div className="shrink-0 flex flex-wrap gap-3 items-center p-4 bg-white/50 backdrop-blur-md rounded-3xl shadow-sm">
              <div className="flex items-center gap-1.5">
                <DatePicker value={statsDateFrom} onChange={setStatsDateFrom} placeholder="Từ ngày" />
                <span className="text-slate-300 text-xs">&#8212;</span>
                <DatePicker value={statsDateTo} onChange={setStatsDateTo} placeholder="Đến ngày" />
              </div>
              <div className="ml-auto">{tabToggle}</div>
            </div>
            <div className="flex-1 overflow-y-auto pb-8">
              <DailyStatsTab dateFrom={statsDateFrom} dateTo={statsDateTo} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
