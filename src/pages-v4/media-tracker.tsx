import { useMemo, useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { Plus } from 'lucide-react';
import {
  Badge,
  Button,
  DataTable,
  DateRangePicker,
  EmptyState,
  KpiCard,
  PageHeader,
  Spinner,
  SurfaceCard,
  TableRowActions,
  type DataTableColumn,
  type DateRange,
  type TaskStatus,
} from '../design/v4/index.js';
import { useMediaPostsQuery } from '../hooks/use-media-tracker';

interface MediaRow {
  id: string;
  title: string;
  platform?: string;
  status: TaskStatus;
  views?: number;
  engagement?: number;
}

function toStatus(s: string | undefined): TaskStatus {
  const n = (s ?? '').toLowerCase();
  if (n.includes('publish')) return 'done';
  if (n.includes('schedul')) return 'on-hold';
  if (n.includes('draft')) return 'to-do';
  if (n.includes('review')) return 'in-review';
  if (n.includes('arch')) return 'archived';
  return 'to-do';
}

export default function MediaTrackerV4() {
  const defaultFrom = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const defaultTo = format(new Date(), 'yyyy-MM-dd');
  const [range, setRange] = useState<DateRange>({ from: defaultFrom, to: defaultTo });

  const media = useMediaPostsQuery();

  const rows: MediaRow[] = useMemo(() => {
    const data = ((media.data as any)?.entries ?? media.data ?? []) as any[];
    return data.map((m: any) => ({
      id: m.id ?? `${m.title}-${m.createdAt}`,
      title: m.title ?? m.name ?? 'Untitled',
      platform: m.platform ?? m.channel,
      status: toStatus(m.status),
      views: m.views ?? m.totalViews,
      engagement: m.engagement ?? m.engagementRate,
    }));
  }, [media.data]);

  const totalViews = rows.reduce((a, r) => a + (r.views ?? 0), 0);
  const totalPublished = rows.filter((r) => r.status === 'done').length;
  const totalDraft = rows.filter((r) => r.status === 'to-do').length;

  const cols: DataTableColumn<MediaRow>[] = [
    { key: 'title', header: 'Title', cell: (r) => r.title, sortable: true, sortValue: (r) => r.title },
    { key: 'platform', header: 'Platform', cell: (r) => r.platform ?? '—', sortable: true, sortValue: (r) => r.platform ?? '' },
    { key: 'status', header: 'Status', cell: (r) => <Badge intent={r.status}>{r.status}</Badge> },
    { key: 'views', header: 'Views', cell: (r) => r.views?.toLocaleString() ?? '—', sortable: true, sortValue: (r) => r.views ?? 0, align: 'right' },
    { key: 'engagement', header: 'Engagement', cell: (r) => r.engagement != null ? `${r.engagement.toFixed(1)}%` : '—', align: 'right' },
    {
      key: 'actions',
      header: '',
      cell: () => (
        <TableRowActions
          items={[
            { key: 'view', label: 'View', onSelect: () => {} },
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
                subtitle={`${rows.length} media items in range`}
        actions={
          <>
            <DateRangePicker value={range} onChange={setRange} />
            <Button variant="primary" leftIcon={<Plus size={16} />}>New Media</Button>
          </>
        }
      />

      {media.isLoading ? (
        <div className="flex items-center justify-center py-vast"><Spinner size="lg" accent /></div>
      ) : media.error ? (
        <SurfaceCard padding="md"><Badge intent="error">Failed to load media</Badge></SurfaceCard>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-comfy">
            <KpiCard label="Total Views" value={totalViews.toLocaleString()} />
            <KpiCard label="Published" value={totalPublished.toLocaleString()} trend="up" />
            <KpiCard label="Drafts" value={totalDraft.toLocaleString()} />
          </div>

          {rows.length === 0 ? (
            <SurfaceCard padding="md">
              <EmptyState
                title="No media yet"
                description="Schedule or publish your first content piece to populate the tracker."
                action={<Button variant="primary" leftIcon={<Plus size={16} />}>Create Media</Button>}
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
