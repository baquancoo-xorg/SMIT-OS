/**
 * v4 Playground — Batch 2 (22 components).
 * Lazy-rendered section of playground.tsx.
 */
import { useState, type ReactNode } from 'react';
import {
  Button,
  Badge,
  Spinner,
  Skeleton,
  StatusDot,
  EmptyState,
  TabPill,
  FilterChip,
  KpiCard,
  TableRowActions,
  Select,
  CustomSelect,
  DatePicker,
  DateRangePicker,
  FormDialog,
  ConfirmDialog,
  NotificationProvider,
  useNotifications,
  ErrorBoundary,
  OkrCycleCountdown,
  Header,
  Sidebar,
  AppShell,
} from './index.js';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-2xl">
      <h2 className="text-caption font-semibold uppercase tracking-widest text-fg-subtle mb-md">{title}</h2>
      {children}
    </section>
  );
}

function ToastDemo() {
  const { push } = useNotifications();
  return (
    <div className="flex gap-sm">
      <Button variant="secondary" onClick={() => push({ intent: 'success', title: 'Saved', description: '1 row updated' })}>Success</Button>
      <Button variant="secondary" onClick={() => push({ intent: 'error', title: 'Failed', description: 'Network error' })}>Error</Button>
      <Button variant="ghost" onClick={() => push({ title: 'Heads up', durationMs: 0 })}>Manual (no auto)</Button>
    </div>
  );
}

function BombComponent(): never {
  throw new Error('Demo render error for ErrorBoundary');
}

export default function PlaygroundBatch2() {
  const [tab, setTab] = useState<string>('income');
  const [chips, setChips] = useState<Set<string>>(new Set(['done']));
  const [select, setSelect] = useState('warm');
  const [city, setCity] = useState<string | null>('hcm');
  const [dateA, setDateA] = useState('');
  const [range, setRange] = useState({ from: '2026-05-01', to: '2026-05-12' });
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [crashed, setCrashed] = useState(false);

  const toggleChip = (k: string) => {
    setChips((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  return (
    <NotificationProvider>
      <div className="border-t border-outline-subtle pt-2xl mt-2xl">
        <h2 className="text-h4 font-semibold tracking-tight text-fg mb-lg">Batch 2 — 22 primitives</h2>

        <Section title="08 · Spinner">
          <div className="flex items-center gap-md">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner accent size="lg" />
          </div>
        </Section>

        <Section title="09 · Skeleton">
          <div className="flex items-start gap-md max-w-md">
            <Skeleton shape="circle" width="size-10" height="" />
            <div className="flex-1">
              <Skeleton shape="text" lines={3} height="h-3" />
            </div>
          </div>
        </Section>

        <Section title="10 · StatusDot inline">
          <ul className="flex flex-col gap-xs text-body-sm text-fg-muted max-w-xs">
            <li className="flex items-center gap-sm"><StatusDot intent="done" /> Server healthy</li>
            <li className="flex items-center gap-sm"><StatusDot intent="warning" /> Queue backing up</li>
            <li className="flex items-center gap-sm"><StatusDot intent="error" /> Sync failed</li>
            <li className="flex items-center gap-sm"><StatusDot intent="archived" /> Archived job</li>
          </ul>
        </Section>

        <Section title="11 · EmptyState">
          <div className="rounded-card border border-outline-subtle">
            <EmptyState
              icon={<span className="text-h4">📭</span>}
              title="No leads yet"
              description="Create your first lead to begin tracking pipeline."
              action={<Button variant="primary" leftIcon={<span>＋</span>}>Create Lead</Button>}
            />
          </div>
        </Section>

        <Section title="12 · TabPill">
          <TabPill
            value={tab}
            onChange={setTab}
            items={[
              { value: 'income', label: 'Income', count: 12 },
              { value: 'expense', label: 'Expense', count: 5 },
              { value: 'saving', label: 'Saving' },
            ]}
          />
          <p className="text-caption text-fg-subtle mt-sm">Active: {tab}</p>
        </Section>

        <Section title="13 · FilterChip">
          <div className="flex flex-wrap gap-xs">
            {['done', 'in-progress', 'blocked', 'archived'].map((k) => (
              <FilterChip key={k} active={chips.has(k)} onClick={() => toggleChip(k)} count={Math.floor(Math.random() * 50)}>
                {k}
              </FilterChip>
            ))}
            <FilterChip active onRemove={() => toggleChip('done')}>Status: Done</FilterChip>
          </div>
        </Section>

        <Section title="14 · KpiCard">
          <div className="grid grid-cols-3 gap-lg">
            <KpiCard label="Total Revenue" value="$19,270.56" delta="+8%" trend="up" meta="vs last month" />
            <KpiCard label="Active Leads" value="2,431" delta="+12%" trend="up" meta="vs last week" />
            <KpiCard label="Churn Rate" value="3.2%" delta="-2%" trend="down" meta="vs last quarter" />
          </div>
        </Section>

        <Section title="15 · TableRowActions">
          <div className="flex items-center gap-md">
            <span className="text-body-sm text-fg-muted">Row action menu →</span>
            <TableRowActions
              items={[
                { key: 'edit', label: 'Edit', onSelect: () => alert('Edit') },
                { key: 'dup', label: 'Duplicate', onSelect: () => alert('Dup') },
                { key: 'del', label: 'Delete', danger: true, onSelect: () => alert('Del') },
              ]}
            />
          </div>
        </Section>

        <Section title="16 · Select (native)  ·  17 · CustomSelect (rich)">
          <div className="grid grid-cols-2 gap-lg max-w-2xl">
            <Select
              label="Surface variant"
              value={select}
              onChange={(e) => setSelect(e.target.value)}
              options={[
                { value: 'flat', label: 'Flat' },
                { value: 'warm', label: 'Warm' },
                { value: 'elevated', label: 'Elevated' },
              ]}
            />
            <CustomSelect
              label="City"
              value={city}
              onChange={setCity}
              options={[
                { value: 'hcm', label: 'TP. Hồ Chí Minh', meta: '8M' },
                { value: 'hn', label: 'Hà Nội', meta: '5M' },
                { value: 'dn', label: 'Đà Nẵng', meta: '1M' },
              ]}
            />
          </div>
        </Section>

        <Section title="18 · DatePicker  ·  19 · DateRangePicker">
          <div className="flex flex-col gap-lg max-w-2xl">
            <DatePicker label="Single date" value={dateA} onChange={(e) => setDateA(e.target.value)} />
            <DateRangePicker
              label="Date range"
              value={range}
              onChange={setRange}
              presets={[
                { label: 'Last 7d', range: () => ({ from: '2026-05-05', to: '2026-05-12' }) },
                { label: 'MTD', range: () => ({ from: '2026-05-01', to: '2026-05-12' }) },
              ]}
            />
          </div>
        </Section>

        <Section title="20 · FormDialog  ·  21 · ConfirmDialog">
          <div className="flex gap-sm">
            <Button variant="primary" onClick={() => setFormOpen(true)}>Open Form</Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>Delete (Confirm)</Button>
          </div>
          <FormDialog
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSubmit={() => setFormOpen(false)}
            title="New Lead"
            description="Add a new sales lead to the pipeline."
          >
            <p className="text-body-sm text-fg-muted">(Form fields would go here.)</p>
          </FormDialog>
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => setConfirmOpen(false)}
            destructive
            title="Delete this lead?"
            message="This action cannot be undone."
            confirmLabel="Delete"
          />
        </Section>

        <Section title="22 · Notifications (toast)">
          <ToastDemo />
        </Section>

        <Section title="23 · ErrorBoundary">
          <ErrorBoundary>
            {crashed ? <BombComponent /> : (
              <Button variant="ghost" onClick={() => setCrashed(true)}>Trigger error</Button>
            )}
          </ErrorBoundary>
        </Section>

        <Section title="24 · OkrCycleCountdown">
          <div className="flex flex-col gap-sm">
            <OkrCycleCountdown endDate="2026-05-20" />
            <OkrCycleCountdown endDate="2026-05-13" />
            <OkrCycleCountdown endDate="2026-04-01" label="Q1" />
          </div>
        </Section>

        <Section title="25 · Header  ·  26 · Sidebar  ·  27 · AppShell (mini mockup)">
          <div className="rounded-card border border-outline-subtle overflow-hidden h-80">
            <AppShell
              header={
                <Header
                  brand={<span className="font-semibold text-fg">⌬ SMIT</span>}
                  actions={
                    <>
                      <Button variant="ghost" size="sm">Help</Button>
                      <Button variant="primary" size="sm" leftIcon={<span>＋</span>}>New</Button>
                    </>
                  }
                />
              }
              sidebar={
                <Sidebar
                  sections={[
                    {
                      key: 'main',
                      label: 'Main',
                      items: [
                        { key: 'dash', label: 'Dashboard', icon: '⌂', active: true },
                        { key: 'leads', label: 'Leads', icon: '👥', badge: '12' },
                        { key: 'reports', label: 'Reports', icon: '📊' },
                      ],
                    },
                    {
                      key: 'tools',
                      label: 'Tools',
                      items: [
                        { key: 'settings', label: 'Settings', icon: '⚙' },
                        { key: 'help', label: 'Help', icon: '?' },
                      ],
                    },
                  ]}
                />
              }
            >
              <p className="text-body-sm text-fg-muted">Main content area · scrolls independently.</p>
              <div className="mt-md grid grid-cols-2 gap-md">
                <KpiCard label="Revenue" value="$19,270" delta="+8%" trend="up" />
                <KpiCard label="Leads" value="2,431" delta="+12%" trend="up" />
              </div>
            </AppShell>
          </div>
        </Section>

        <Section title="28 · NotFoundPage (preview)">
          <div className="rounded-card border border-outline-subtle h-72 overflow-hidden">
            <div className="bg-surface h-full">
              {/* inline preview, not a real route */}
              <div className="h-full flex flex-col items-center justify-center">
                <span className="text-h1 font-semibold text-fg" style={{ textShadow: '0 0 60px color-mix(in srgb, var(--brand-500) 50%, transparent)' }}>404</span>
                <p className="text-fg-muted mt-sm">Page not found · preview inline</p>
              </div>
            </div>
          </div>
        </Section>

        <footer className="text-caption text-fg-subtle mt-lg">
          Total Phase 2 + 3 components: <span className="text-fg-muted font-semibold">30</span>.
        </footer>
      </div>
    </NotificationProvider>
  );
}

export const PlaygroundBatch2Sections = PlaygroundBatch2;
