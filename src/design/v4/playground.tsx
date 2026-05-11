/**
 * v4 Component Playground — DEV-ONLY visual review.
 * Deleted at Phase 3 per plan-02.
 *
 * Mount at /v4/playground via App.tsx lazy route.
 */
import { useEffect, useState } from 'react';
import './tokens.css';
import {
  Button,
  Badge,
  SurfaceCard,
  Input,
  PageHeader,
  Modal,
  DropdownMenu,
  DataTable,
  type DataTableColumn,
  type TaskStatus,
} from './index.js';
import PlaygroundBatch2 from './playground-batch-2.js';

const TASK_STATES: TaskStatus[] = [
  'in-progress',
  'to-do',
  'in-review',
  'design-review',
  'rework',
  'done',
  'not-started',
  'blocked',
  'on-hold',
  'archived',
];

interface DemoRow {
  id: string;
  user: string;
  amount: number;
  status: TaskStatus;
}

const DEMO_ROWS: DemoRow[] = [
  { id: 'PAY-001', user: 'Savannah Nguyen', amount: 1450.0, status: 'done' },
  { id: 'PAY-002', user: 'Jordan Lee', amount: 2890.5, status: 'in-progress' },
  { id: 'PAY-003', user: 'Quan Ba', amount: 940.2, status: 'on-hold' },
  { id: 'PAY-004', user: 'Alex Cao', amount: 3210.0, status: 'blocked' },
];

const COLUMNS: DataTableColumn<DemoRow>[] = [
  { key: 'id', header: 'Payment ID', cell: (r) => r.id, sortable: true, sortValue: (r) => r.id },
  { key: 'user', header: 'User', cell: (r) => r.user, sortable: true, sortValue: (r) => r.user },
  { key: 'amount', header: 'Amount', cell: (r) => `$${r.amount.toFixed(2)}`, sortable: true, sortValue: (r) => r.amount, align: 'right' },
  { key: 'status', header: 'Status', cell: (r) => <Badge intent={r.status}>{r.status}</Badge> },
];

export default function DesignV4Playground() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.documentElement.dataset.ui = 'v4';
    return () => {
      delete document.documentElement.dataset.ui;
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface text-fg p-xl">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="v4 Component Playground"
          subtitle="Dark-first warm cinematic · 8 primitives · Phase 2 review"
          breadcrumbs={[{ label: 'Design', href: '/' }, { label: 'v4 Playground' }]}
          actions={
            <>
              <Button variant="secondary">Export</Button>
              <Button variant="primary" leftIcon={<span>＋</span>}>New Payment</Button>
            </>
          }
        />

        <section className="mb-2xl">
          <h2 className="text-caption font-semibold uppercase tracking-widest text-fg-subtle mb-md">
            01 · Button
          </h2>
          <div className="flex flex-wrap gap-sm items-center">
            <Button variant="primary" leftIcon={<span>＋</span>}>New Payment</Button>
            <Button variant="primary" splitLabel="Lead Tracker" leftIcon={<span>＋</span>}>Create</Button>
            <Button variant="primary" size="sm">Save</Button>
            <Button variant="primary" size="lg">Submit</Button>
            <Button variant="secondary">Manage</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </section>

        <section className="mb-2xl">
          <h2 className="text-caption font-semibold uppercase tracking-widest text-fg-subtle mb-md">
            02 · Badge — 10 task states + 4 feedback
          </h2>
          <div className="flex flex-wrap gap-sm mb-md">
            {TASK_STATES.map((s) => (
              <Badge key={s} intent={s}>{s.replace('-', ' ')}</Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-sm">
            <Badge intent="success">Success</Badge>
            <Badge intent="warning">Warning</Badge>
            <Badge intent="error">Error</Badge>
            <Badge intent="info">Info</Badge>
            <Badge intent="neutral">Neutral</Badge>
          </div>
        </section>

        <section className="mb-2xl">
          <h2 className="text-caption font-semibold uppercase tracking-widest text-fg-subtle mb-md">
            03 · SurfaceCard — KPI pattern
          </h2>
          <div className="grid grid-cols-3 gap-lg">
            <SurfaceCard interactive>
              <p className="text-body-sm text-fg-muted mb-xs">Total Revenue</p>
              <div className="flex items-baseline gap-sm">
                <span className="text-h4 font-semibold tracking-tight">$19,270.56</span>
                <Badge intent="done" glow={false}>+8%</Badge>
              </div>
            </SurfaceCard>
            <SurfaceCard interactive>
              <p className="text-body-sm text-fg-muted mb-xs">Total Leads</p>
              <div className="flex items-baseline gap-sm">
                <span className="text-h4 font-semibold tracking-tight">2,431</span>
                <Badge intent="done" glow={false}>+12%</Badge>
              </div>
            </SurfaceCard>
            <SurfaceCard warm radius="callout" elevation="elevated">
              <p className="text-body-sm font-medium text-fg mb-xs">Upgrade to Pro!</p>
              <p className="text-caption text-fg-muted">Unlock unlimited dashboards.</p>
            </SurfaceCard>
          </div>
        </section>

        <section className="mb-2xl">
          <h2 className="text-caption font-semibold uppercase tracking-widest text-fg-subtle mb-md">
            04 · Input
          </h2>
          <div className="grid grid-cols-2 gap-lg max-w-2xl">
            <Input label="Email" type="email" placeholder="you@example.com" helper="We will never share." />
            <Input label="Token" error="Invalid format" defaultValue="abc-123" />
            <Input pill leftIcon={<span>🔍</span>} placeholder="Search anything..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Input label="Disabled" disabled defaultValue="cannot edit" />
          </div>
        </section>

        <section className="mb-2xl">
          <h2 className="text-caption font-semibold uppercase tracking-widest text-fg-subtle mb-md">
            05 · Modal + 06 · DropdownMenu
          </h2>
          <div className="flex gap-sm">
            <Button variant="primary" onClick={() => setOpen(true)}>Open Modal</Button>
            <DropdownMenu
              trigger={<Button variant="secondary">Actions ▾</Button>}
              label="Row actions"
              items={[
                { key: 'edit', label: 'Edit', onSelect: () => alert('Edit') },
                { key: 'dup', label: 'Duplicate', onSelect: () => alert('Duplicate') },
                { key: 'arch', label: 'Archive', onSelect: () => alert('Archive') },
                { key: 'del', label: 'Delete', danger: true, onSelect: () => alert('Delete') },
              ]}
            />
          </div>
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            title="Confirm payment"
            description="This will deduct $1,450 from your wallet."
            footer={
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setOpen(false)}>Confirm</Button>
              </>
            }
          >
            <p className="text-body text-fg-muted">
              Modal supports focus trap, scroll lock, escape-to-close, overlay click, and portal mounting.
            </p>
          </Modal>
        </section>

        <section className="mb-2xl">
          <h2 className="text-caption font-semibold uppercase tracking-widest text-fg-subtle mb-md">
            07 · DataTable — sortable, with badge cells
          </h2>
          <DataTable columns={COLUMNS} rows={DEMO_ROWS} rowKey={(r) => r.id} onRowClick={(r) => alert(`Row: ${r.id}`)} />
        </section>

        <PlaygroundBatch2 />

        <footer className="mt-2xl pt-lg border-t border-outline-subtle text-caption text-fg-subtle">
          v4 Playground · DEV-only · 30 primitives total. Tokens from <code className="text-accent">src/design/v4/tokens.css</code>.
        </footer>
      </div>
    </div>
  );
}
