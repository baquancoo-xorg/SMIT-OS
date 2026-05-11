import { useMemo, useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { List, BarChart2, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import LeadLogsTab, { type LeadFilters } from '../components/lead-tracker/lead-logs-tab';
import DailyStatsTab from '../components/lead-tracker/daily-stats-tab';
import LeadFiltersPopover from '../components/lead-tracker/lead-filters-popover';
import {
  TabPill,
  GlassCard,
  DateRangePicker,
  Input,
} from '../components/ui';
import type { TabPillItem, DateRange } from '../components/ui';

type ActiveTab = 'logs' | 'stats';

const TABS: TabPillItem<ActiveTab>[] = [
  { value: 'logs', label: 'Lead Logs', icon: <List /> },
  { value: 'stats', label: 'CRM Stats', icon: <BarChart2 /> },
];

/**
 * LeadTracker v2 — Round 3 (2026-05-11): all filter UI lifted to header row
 * so DateRangePicker + 3 FilterChips + DatePicker + Search render inline với
 * TabPill. Sync CRM button removed (CRM sync now auto). LeadLogsTab consumes
 * filters via props instead of owning state.
 */
export default function LeadTrackerV2() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('logs');
  const [searchParams, setSearchParams] = useSearchParams();

  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

  const urlDateFrom = searchParams.get('date_from');
  const urlDateTo = searchParams.get('date_to');

  const [filters, setFilters] = useState<LeadFilters>({
    ae: '',
    status: '',
    hasNote: '',
    noteDate: '',
    dateFrom: urlDateFrom ?? sevenDaysAgoStr,
    dateTo: urlDateTo ?? today,
    q: '',
  });

  const pickerValue: DateRange = useMemo(
    () => ({ from: new Date(filters.dateFrom), to: new Date(filters.dateTo) }),
    [filters.dateFrom, filters.dateTo],
  );

  const setDateRange = (next: DateRange) => {
    const from = format(next.from, 'yyyy-MM-dd');
    const to = format(next.to, 'yyyy-MM-dd');
    setFilters((f) => ({ ...f, dateFrom: from, dateTo: to }));
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('date_from', from);
    nextParams.set('date_to', to);
    setSearchParams(nextParams);
  };

  const sf = (k: keyof LeadFilters, v: string) => setFilters((f) => ({ ...f, [k]: v }));

  const aeQuery = useQuery<{ id: string; fullName: string }[]>({
    queryKey: ['lead-ae-list'],
    queryFn: () => api.getLeadAeList(),
    staleTime: 5 * 60_000,
  });
  const aeOptions = aeQuery.data ?? [];

  const [statsDateFrom, setStatsDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [statsDateTo, setStatsDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-headline text-[length:var(--text-h2)] font-bold leading-tight text-on-surface min-w-0">
          Lead <span className="font-semibold text-primary">Tracker</span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <TabPill<ActiveTab>
            label="Lead tracker tabs"
            value={activeTab}
            onChange={setActiveTab}
            items={TABS}
            size="sm"
          />
          {activeTab === 'logs' && (
            <>
              <DateRangePicker value={pickerValue} onChange={setDateRange} size="sm" />
              <LeadFiltersPopover filters={filters} setFilter={sf} aeOptions={aeOptions} />
              <Input
                size="sm"
                containerClassName="w-48"
                placeholder="Search leads..."
                value={filters.q}
                onChange={(e) => sf('q', e.target.value)}
                iconLeft={<Search />}
              />
            </>
          )}
          {activeTab === 'stats' && (
            <>
              <input
                type="date"
                value={statsDateFrom}
                onChange={(e) => setStatsDateFrom(e.target.value)}
                className="h-8 rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body-sm)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
              />
              <span className="text-on-surface-variant">—</span>
              <input
                type="date"
                value={statsDateTo}
                onChange={(e) => setStatsDateTo(e.target.value)}
                className="h-8 rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body-sm)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
              />
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0 flex-col">
        {activeTab === 'logs' ? (
          <LeadLogsTab filters={filters} />
        ) : (
          <GlassCard variant="surface" padding="md" className="flex-1 overflow-y-auto">
            <DailyStatsTab dateFrom={statsDateFrom} dateTo={statsDateTo} />
          </GlassCard>
        )}
      </div>
    </div>
  );
}
