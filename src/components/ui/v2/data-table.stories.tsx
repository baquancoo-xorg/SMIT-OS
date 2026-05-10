import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Inbox, MoreHorizontal } from 'lucide-react';
import { DataTable } from './data-table';
import type { DataTableColumn, PaginationState, SortState } from './data-table';
import { Badge } from './badge';
import { EmptyState } from './empty-state';
import { Button } from './button';
import { DropdownMenu } from './dropdown-menu';

const meta: Meta = {
  title: 'v2/Organisms/DataTable',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Generic typed table with sort + pagination + density. Sort can be controlled or uncontrolled. Pagination is always controlled. Loading state renders skeleton rows.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

interface Lead {
  id: string;
  name: string;
  email: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  source: string;
  value: number;
}

const SAMPLE_LEADS: Lead[] = [
  { id: '1', name: 'Anh Nguyen', email: 'anh@example.com', status: 'qualified', source: 'Facebook', value: 12_500_000 },
  { id: '2', name: 'Binh Tran', email: 'binh@example.com', status: 'contacted', source: 'Google', value: 4_800_000 },
  { id: '3', name: 'Cuong Le', email: 'cuong@example.com', status: 'new', source: 'TikTok', value: 0 },
  { id: '4', name: 'Dung Pham', email: 'dung@example.com', status: 'lost', source: 'Email', value: 0 },
  { id: '5', name: 'Em Vu', email: 'em@example.com', status: 'qualified', source: 'Referral', value: 18_200_000 },
  { id: '6', name: 'Phong Hoang', email: 'phong@example.com', status: 'new', source: 'Facebook', value: 0 },
  { id: '7', name: 'Giang Do', email: 'giang@example.com', status: 'contacted', source: 'Google', value: 6_400_000 },
  { id: '8', name: 'Hoa Mai', email: 'hoa@example.com', status: 'qualified', source: 'Referral', value: 22_900_000 },
];

const statusBadge: Record<Lead['status'], { variant: 'success' | 'info' | 'warning' | 'neutral'; label: string }> = {
  new: { variant: 'info', label: 'New' },
  contacted: { variant: 'warning', label: 'Contacted' },
  qualified: { variant: 'success', label: 'Qualified' },
  lost: { variant: 'neutral', label: 'Lost' },
};

const COLUMNS: DataTableColumn<Lead>[] = [
  { key: 'name', label: 'Name', sortable: true, sort: (a, b) => a.name.localeCompare(b.name) },
  { key: 'email', label: 'Email', hideBelow: 'md' },
  {
    key: 'status',
    label: 'Status',
    render: (r) => <Badge variant={statusBadge[r.status].variant}>{statusBadge[r.status].label}</Badge>,
    sortable: true,
    sort: (a, b) => a.status.localeCompare(b.status),
  },
  { key: 'source', label: 'Source', hideBelow: 'sm' },
  {
    key: 'value',
    label: 'Value (đ)',
    align: 'right',
    sortable: true,
    sort: (a, b) => a.value - b.value,
    render: (r) => (r.value > 0 ? r.value.toLocaleString('vi-VN') : '—'),
  },
];

export const Basic: Story = {
  render: () => (
    <DataTable
      label="Leads table"
      data={SAMPLE_LEADS}
      rowKey={(r) => r.id}
      columns={COLUMNS}
    />
  ),
};

export const WithRowClick: Story = {
  render: () => (
    <DataTable
      label="Clickable rows"
      data={SAMPLE_LEADS}
      rowKey={(r) => r.id}
      columns={COLUMNS}
      onRowClick={(row) => alert(`Clicked: ${row.name}`)}
    />
  ),
};

export const WithRowActions: Story = {
  render: () => (
    <DataTable
      label="With row actions"
      data={SAMPLE_LEADS}
      rowKey={(r) => r.id}
      columns={[
        ...COLUMNS,
        {
          key: 'actions',
          label: '',
          align: 'right',
          width: 'w-12',
          render: (row) => (
            <DropdownMenu
              trigger={
                <button
                  type="button"
                  aria-label={`Actions for ${row.name}`}
                  className="inline-flex size-8 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container focus-visible:outline-none"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              }
              items={[
                { key: 'view', label: 'View detail' },
                { key: 'contact', label: 'Mark contacted' },
                { key: 'delete', label: 'Delete', destructive: true },
              ]}
            />
          ),
        },
      ]}
    />
  ),
};

export const Compact: Story = {
  render: () => (
    <DataTable
      label="Compact density"
      data={SAMPLE_LEADS}
      rowKey={(r) => r.id}
      columns={COLUMNS}
      density="compact"
    />
  ),
};

export const Comfortable: Story = {
  render: () => (
    <DataTable
      label="Comfortable density"
      data={SAMPLE_LEADS}
      rowKey={(r) => r.id}
      columns={COLUMNS}
      density="comfortable"
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <DataTable
      label="Loading state"
      data={[]}
      rowKey={(_, i) => i}
      columns={COLUMNS}
      loading
      loadingRows={5}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <DataTable
      label="Empty state"
      data={[]}
      rowKey={(_, i) => i}
      columns={COLUMNS}
      empty={
        <EmptyState
          icon={<Inbox />}
          title="No leads yet"
          description="Connect your CRM to start tracking leads."
          variant="inline"
          actions={<Button variant="primary" size="sm">Connect CRM</Button>}
        />
      }
    />
  ),
};

export const WithControlledSort: Story = {
  render: () => {
    const [sort, setSort] = useState<SortState | null>({ key: 'value', direction: 'desc' });
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-on-surface-variant">
          Current sort: <code>{sort ? `${sort.key} ${sort.direction}` : 'none'}</code>
        </p>
        <DataTable
          label="Controlled sort"
          data={SAMPLE_LEADS}
          rowKey={(r) => r.id}
          columns={COLUMNS}
          sort={sort ?? undefined}
          onSortChange={setSort}
        />
      </div>
    );
  },
};

export const WithPagination: Story = {
  render: () => {
    const [page, setPage] = useState(0);
    const pageSize = 3;
    const total = SAMPLE_LEADS.length;
    const slice = SAMPLE_LEADS.slice(page * pageSize, (page + 1) * pageSize);
    const pagination: PaginationState = { page, pageSize, total };
    return (
      <DataTable
        label="Paginated"
        data={slice}
        rowKey={(r) => r.id}
        columns={COLUMNS}
        pagination={pagination}
        onPaginationChange={setPage}
      />
    );
  },
};
