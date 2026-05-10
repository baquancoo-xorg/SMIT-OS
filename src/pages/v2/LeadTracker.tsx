import { useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { List, BarChart2, Download, RefreshCw, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LeadLogsTab from '../../components/lead-tracker/lead-logs-tab';
import DailyStatsTab from '../../components/lead-tracker/daily-stats-tab';
import { exportAllLeadsToCsv } from '../../components/lead-tracker/csv-export';
import LastSyncIndicator from '../../components/lead-tracker/last-sync-indicator';
import { useSyncNowMutation, useSyncStatusQuery } from '../../hooks/use-lead-sync';
import {
  PageHeader,
  Button,
  TabPill,
  GlassCard,
} from '../../components/ui/v2';
import type { TabPillItem } from '../../components/ui/v2';

type ActiveTab = 'logs' | 'stats';

const TABS: TabPillItem<ActiveTab>[] = [
  { value: 'logs', label: 'Lead Logs', icon: <List /> },
  { value: 'stats', label: 'CRM Stats', icon: <BarChart2 /> },
];

/**
 * LeadTracker v2 — Phase 6 medium pages migration.
 *
 * Token-driven shell wrapping v1 sub-components (LeadLogsTab, DailyStatsTab):
 *  - PageHeader (italic accent + breadcrumb)
 *  - TabPill (Logs / Stats)
 *  - v2 Button for CRM sync (Admin only) + CSV export
 *  - Date range filters preserved for stats tab
 *
 * Sub-components (lead-log-dialog, lead-detail-modal, source-badge, csv-export, etc.) reused
 * from v1 — internal UI migration is follow-up work after Phase 6 sign-off.
 *
 * RBAC: CRM sync = admin only (matches backend). CSV export = isSale.
 */
export default function LeadTrackerV2() {
  const { currentUser } = useAuth();
  const isSale = currentUser?.departments?.includes('Sale');
  const canManageLeads = !!currentUser?.isAdmin;
  const [activeTab, setActiveTab] = useState<ActiveTab>('logs');
  const [statsDateFrom, setStatsDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [statsDateTo, setStatsDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [exporting, setExporting] = useState(false);
  const syncNow = useSyncNowMutation();
  const syncStatus = useSyncStatusQuery(!!currentUser?.isAdmin);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await exportAllLeadsToCsv();
    } finally {
      setExporting(false);
    }
  };

  const triggerSyncNow = async () => {
    try {
      await syncNow.mutateAsync();
      alert('Đã trigger sync từ CRM. Dữ liệu sẽ cập nhật trong ít phút.');
      await syncStatus.refetch();
    } catch (err: any) {
      alert(err?.message ?? 'Không thể trigger sync CRM');
    }
  };

  const isSyncing = syncNow.isPending || syncStatus.data?.status === 'running';

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {canManageLeads && (
        <>
          <LastSyncIndicator status={syncStatus.data} />
          <Button
            variant="secondary"
            iconLeft={<RefreshCw className={isSyncing ? 'animate-spin' : ''} />}
            onClick={triggerSyncNow}
            disabled={isSyncing}
          >
            {isSyncing ? 'Syncing...' : 'Sync CRM'}
          </Button>
        </>
      )}
      {isSale && activeTab === 'logs' && (
        <Button variant="ghost" iconLeft={<Download />} onClick={handleExportCsv} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Acquisition' }, { label: 'Lead Tracker' }]}
        title="Lead "
        accent="Tracker"
        description="CRM leads & SLA tracking. Edit gated per assignee — admin sync controls."
        actions={headerActions}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <TabPill<ActiveTab> label="Lead tracker tabs" value={activeTab} onChange={setActiveTab} items={TABS} />
        {activeTab === 'stats' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={statsDateFrom}
              onChange={(e) => setStatsDateFrom(e.target.value)}
              className="h-9 rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body-sm)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
            />
            <span className="text-on-surface-variant">—</span>
            <input
              type="date"
              value={statsDateTo}
              onChange={(e) => setStatsDateTo(e.target.value)}
              className="h-9 rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body-sm)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0 flex-col">
        {activeTab === 'logs' ? (
          <LeadLogsTab />
        ) : (
          <GlassCard variant="surface" padding="md" className="flex-1 overflow-y-auto">
            <DailyStatsTab dateFrom={statsDateFrom} dateTo={statsDateTo} />
          </GlassCard>
        )}
      </div>

      {/* Hidden Users icon to keep import balance for future per-row owner display */}
      <span className="sr-only" aria-hidden="true">
        <Users />
      </span>
    </div>
  );
}
