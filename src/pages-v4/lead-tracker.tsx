import { useMemo, useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { Plus } from 'lucide-react';
import {
  Badge,
  Button,
  DataTable,
  DateRangePicker,
  EmptyState,
  FilterChip,
  KpiCard,
  PageHeader,
  Spinner,
  SurfaceCard,
  TableRowActions,
  type DataTableColumn,
  type DateRange,
  type TaskStatus,
} from '../design/v4/index.js';
import { useLeadFlow } from '../hooks/use-lead-flow';

interface LeadRow {
  id: string;
  name: string;
  source: string;
  status: TaskStatus;
  createdAt: string;
}

const FILTERS = ['new', 'qualified', 'converted', 'lost'] as const;

export default function LeadTrackerV4() {
  const defaultFrom = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const defaultTo = format(new Date(), 'yyyy-MM-dd');
  const [range, setRange] = useState<DateRange>({ from: defaultFrom, to: defaultTo });
  const [filters, setFilters] = useState<Set<string>>(new Set());

  const flow = useLeadFlow(range);

  const kpis = useMemo(() => {
    const data: any = flow.data;
    if (!data) return null;
    return {
      total: data.totalLeads ?? 0,
      new: data.newLeads ?? 0,
      qualified: data.qualifiedLeads ?? 0,
      converted: data.convertedLeads ?? 0,
    };
  }, [flow.data]);

  const toggleFilter = (f: string) => {
    setFilters((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  };

  const rows: LeadRow[] = useMemo(() => {
    const recent = (flow.data as any)?.recentLeads ?? [];
    return recent.slice(0, 20);
  }, [flow.data]);

  const cols: DataTableColumn<LeadRow>[] = [
    { key: 'id', header: 'ID', cell: (r) => r.id, sortable: true, sortValue: (r) => r.id, width: 'w-32' },
    { key: 'name', header: 'Name', cell: (r) => r.name, sortable: true, sortValue: (r) => r.name },
    { key: 'source', header: 'Source', cell: (r) => r.source ?? '—', sortable: true, sortValue: (r) => r.source ?? '' },
    { key: 'status', header: 'Status', cell: (r) => <Badge intent={r.status ?? 'to-do'}>{r.status ?? 'to-do'}</Badge> },
    {
      key: 'actions',
      header: '',
      cell: () => (
        <TableRowActions
          items={[
            { key: 'view', label: 'View details', onSelect: () => {} },
            { key: 'edit', label: 'Edit', onSelect: () => {} },
            { key: 'archive', label: 'Archive', danger: true, onSelect: () => {} },
          ]}
        />
      ),
      align: 'right',
      width: 'w-16',
    },
  ];

  return (
    <div className="flex flex-col gap-comfy">
      <PageHeader
                subtitle="Pipeline overview and recent activity"
        actions={
          <>
            <DateRangePicker value={range} onChange={setRange} />
            <Button variant="primary" leftIcon={<Plus size={16} />}>New Lead</Button>
          </>
        }
      />

      {flow.isLoading ? (
        <div className="flex items-center justify-center py-vast"><Spinner size="lg" accent /></div>
      ) : flow.error ? (
        <SurfaceCard padding="md">
          <Badge intent="error">Failed to load lead flow</Badge>
        </SurfaceCard>
      ) : (
        <>
          {kpis && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-comfy">
              <KpiCard label="Total Leads" value={kpis.total.toLocaleString()} />
              <KpiCard label="New" value={kpis.new.toLocaleString()} trend="up" />
              <KpiCard label="Qualified" value={kpis.qualified.toLocaleString()} trend="up" />
              <KpiCard label="Converted" value={kpis.converted.toLocaleString()} trend="up" />
            </div>
          )}

          <SurfaceCard padding="sm" className="flex flex-wrap items-center gap-snug">
            <span className="text-body-sm text-fg-muted">Quick filters:</span>
            {FILTERS.map((f) => (
              <FilterChip key={f} active={filters.has(f)} onClick={() => toggleFilter(f)}>
                {f}
              </FilterChip>
            ))}
          </SurfaceCard>

          {rows.length === 0 ? (
            <SurfaceCard padding="md">
              <EmptyState
                title="No recent leads"
                description="When new leads arrive in this date range they will appear here."
                action={<Button variant="primary" leftIcon={<Plus size={16} />}>Add lead manually</Button>}
              />
            </SurfaceCard>
          ) : (
            <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} stickyHeader />
          )}
        </>
      )}
    </div>
  );
}
