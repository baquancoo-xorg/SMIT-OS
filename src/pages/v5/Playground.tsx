import { useState } from 'react';
import { Moon, Sun, Bell, Search, User, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../contexts/theme-context';
import {
  Button, Badge, Card, Input, Spinner, Skeleton, KpiCard, EmptyState,
  StatusDot, TabPill, FilterChip, Modal, DropdownMenu,
  ChartCard, LineChart, BarChart, AreaChart, PieChart, DonutChart, SparklineChart,
} from '../../components/v5/ui';

const sampleLineData = [
  { date: 'Mon', value: 100, value2: 80 },
  { date: 'Tue', value: 120, value2: 90 },
  { date: 'Wed', value: 90, value2: 100 },
  { date: 'Thu', value: 150, value2: 85 },
  { date: 'Fri', value: 180, value2: 120 },
];

const samplePieData = [
  { name: 'Direct', value: 400 },
  { name: 'Organic', value: 300 },
  { name: 'Referral', value: 200 },
  { name: 'Social', value: 100 },
];

export default function Playground() {
  const { resolvedTheme, setTheme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [filterValue, setFilterValue] = useState<string>('all');

  return (
    <div className="space-y-8 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold text-text-1">V5 Playground</h1>
          <p className="mt-1 text-sm text-text-muted">Component showcase for v5 design system</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          iconLeft={resolvedTheme === 'dark' ? <Sun /> : <Moon />}
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
        </Button>
      </header>

      {/* Buttons */}
      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="primary" isLoading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </Section>

      {/* Badges */}
      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="primary">Primary</Badge>
        </div>
      </Section>

      {/* Inputs */}
      <Section title="Inputs">
        <div className="grid max-w-md gap-4">
          <Input label="Default" placeholder="Enter text..." />
          <Input label="With icon" placeholder="Search..." iconLeft={<Search />} />
          <Input label="Error state" placeholder="Invalid" error="This field is required" />
          <Input label="Disabled" placeholder="Disabled" disabled />
        </div>
      </Section>

      {/* Status & Feedback */}
      <Section title="Status & Feedback">
        <div className="flex flex-wrap items-center gap-4">
          <StatusDot variant="success" label="Online" />
          <StatusDot variant="warning" label="Pending" />
          <StatusDot variant="error" label="Offline" />
          <Spinner size="sm" />
          <Spinner size="md" />
        </div>
        <div className="mt-4 flex gap-4">
          <Skeleton variant="text" className="w-32" />
          <Skeleton variant="circular" className="size-10" />
          <Skeleton variant="rectangular" className="h-20 w-32" />
        </div>
      </Section>

      {/* Cards & KPIs */}
      <Section title="Cards & KPIs">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Revenue" value="$45.2K" deltaPercent={12.5} icon={<TrendingUp />} />
          <KpiCard label="Users" value="1,234" deltaPercent={-3.2} accent="error" />
          <KpiCard label="Orders" value="89" deltaPercent={0} accent="info" />
          <Card padding="md" glow>
            <p className="text-sm font-bold text-text-1">Basic Card</p>
            <p className="mt-1 text-xs text-text-muted">With glow effect on hover</p>
          </Card>
        </div>
      </Section>

      {/* Controls */}
      <Section title="Controls">
        <div className="flex flex-wrap items-center gap-4">
          <TabPill
            label="View"
            value="all"
            onChange={() => {}}
            items={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
          <FilterChip
            value={filterValue}
            onChange={setFilterValue}
            options={[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'done', label: 'Done' },
            ]}
          />
          <DropdownMenu
            trigger={<Button variant="secondary" size="sm">Actions</Button>}
            items={[
              { key: 'edit', label: 'Edit', onClick: () => {} },
              { key: 'delete', label: 'Delete', destructive: true, onClick: () => {} },
            ]}
          />
        </div>
      </Section>

      {/* Modal */}
      <Section title="Modal">
        <Button variant="secondary" onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal" icon={<Bell />}>
          <p className="text-sm text-text-2">Modal content goes here.</p>
        </Modal>
      </Section>

      {/* Empty State */}
      <Section title="Empty State">
        <EmptyState
          icon={<User />}
          title="No users found"
          description="Try adjusting your search or filters"
          actions={<Button variant="secondary" size="sm">Clear filters</Button>}
          decorative
        />
      </Section>

      {/* Charts */}
      <Section title="Charts">
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Line Chart" subtitle="Weekly trend">
            <LineChart
              data={sampleLineData}
              xKey="date"
              series={[
                { dataKey: 'value', name: 'Series A' },
                { dataKey: 'value2', name: 'Series B', dashed: true },
              ]}
              height={200}
            />
          </ChartCard>
          <ChartCard title="Bar Chart" subtitle="Comparison">
            <BarChart
              data={sampleLineData}
              xKey="date"
              series={[{ dataKey: 'value', name: 'Value' }]}
              height={200}
            />
          </ChartCard>
          <ChartCard title="Area Chart" subtitle="Stacked">
            <AreaChart
              data={sampleLineData}
              xKey="date"
              series={[
                { dataKey: 'value', name: 'Primary', stackId: 'a' },
                { dataKey: 'value2', name: 'Secondary', stackId: 'a' },
              ]}
              height={200}
            />
          </ChartCard>
          <ChartCard title="Pie & Donut" subtitle="Distribution">
            <div className="flex items-center justify-around">
              <PieChart data={samplePieData} height={150} outerRadius={50} />
              <DonutChart data={samplePieData} height={150} centerValue="1K" centerLabel="Total" />
            </div>
          </ChartCard>
        </div>
      </Section>

      {/* Sparklines */}
      <Section title="Sparklines">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Trend A:</span>
            <SparklineChart data={sampleLineData} dataKey="value" width={80} colorIndex={0} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Trend B:</span>
            <SparklineChart data={sampleLineData} dataKey="value2" width={80} colorIndex={1} />
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-headline text-lg font-bold text-text-1">{title}</h2>
      {children}
    </section>
  );
}
