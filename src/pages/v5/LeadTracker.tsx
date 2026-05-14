import { useMemo, useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { BarChart2, List, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import DailyStatsTab from '../../components/lead-tracker/daily-stats-tab';
import LeadFiltersPopover from '../../components/lead-tracker/lead-filters-popover';
import LeadLogsTab, { type LeadFilters } from '../../components/lead-tracker/lead-logs-tab';
import { fromDateRange, toDateRange } from '../../components/v5/growth/date-range-utils';
import { Card, DateRangePicker, Input, TabPill } from '../../components/v5/ui';
import type { DateRange, TabPillItem } from '../../components/v5/ui';

type ActiveTab = 'logs' | 'stats';

const validTabs = new Set<ActiveTab>(['logs', 'stats']);

function parseTab(raw: string | null): ActiveTab {
  return raw && validTabs.has(raw as ActiveTab) ? (raw as ActiveTab) : 'logs';
}

const tabs: TabPillItem<ActiveTab>[] = [
  { value: 'logs', label: 'Lead Logs', icon: <List /> },
  { value: 'stats', label: 'CRM Stats', icon: <BarChart2 /> },
];

export default function LeadTrackerV5() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseTab(searchParams.get('tab'));

  const today = format(new Date(), 'yyyy-MM-dd');
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = format(sevenDaysAgo, 'yyyy-MM-dd');

  const [filters, setFilters] = useState<LeadFilters>({
    ae: '',
    status: '',
    hasNote: '',
    noteDate: '',
    dateFrom: searchParams.get('date_from') ?? sevenDaysAgoStr,
    dateTo: searchParams.get('date_to') ?? today,
    q: '',
  });

  const pickerValue = useMemo(() => toDateRange(filters.dateFrom, filters.dateTo), [filters.dateFrom, filters.dateTo]);
  const aeQuery = useQuery<{ id: string; fullName: string }[]>({
    queryKey: ['lead-ae-list'],
    queryFn: () => api.getLeadAeList(),
    staleTime: 5 * 60_000,
  });
  const aeOptions = aeQuery.data ?? [];

  const [statsDateFrom, setStatsDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [statsDateTo, setStatsDateTo] = useState(today);

  const setFilter = (key: keyof LeadFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }));

  const setDateRange = (next: DateRange) => {
    const formatted = fromDateRange(next);
    setFilters((current) => ({ ...current, dateFrom: formatted.from, dateTo: formatted.to }));
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('date_from', formatted.from);
    nextParams.set('date_to', formatted.to);
    setSearchParams(nextParams);
  };

  function setActiveTab(next: ActiveTab) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', next);
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <div className="flex h-full flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <TabPill<ActiveTab> label="Lead tracker tabs" value={activeTab} onChange={setActiveTab} items={tabs} size="page" />
        {activeTab === 'logs' && (
          <>
            <DateRangePicker value={pickerValue} onChange={setDateRange} size="sm" label="Lead date range" />
            <LeadFiltersPopover filters={filters} setFilter={setFilter} aeOptions={aeOptions} />
            <Input
              size="sm"
              containerClassName="w-48"
              placeholder="Search leads..."
              value={filters.q}
              onChange={(event) => setFilter('q', event.target.value)}
              iconLeft={<Search />}
            />
          </>
        )}
        {activeTab === 'stats' && (
          <>
            <input
              type="date"
              aria-label="Stats start date"
              value={statsDateFrom}
              onChange={(event) => setStatsDateFrom(event.target.value)}
              className="h-8 rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body-sm)] text-on-surface focus-visible:border-primary focus-visible:outline-none"
            />
            <span className="text-on-surface-variant">—</span>
            <input
              type="date"
              aria-label="Stats end date"
              value={statsDateTo}
              onChange={(event) => setStatsDateTo(event.target.value)}
              className="h-8 rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body-sm)] text-on-surface focus-visible:border-primary focus-visible:outline-none"
            />
          </>
        )}
      </div>

      <section className="flex flex-1 min-h-0 flex-col" aria-label="Lead tracker content">
        {activeTab === 'logs' ? (
          <LeadLogsTab filters={filters} />
        ) : (
          <Card padding="md" glow className="flex-1 overflow-y-auto">
            <DailyStatsTab dateFrom={statsDateFrom} dateTo={statsDateTo} />
          </Card>
        )}
      </section>
    </div>
  );
}
