# Phase 4 — React Components (SummaryCards + KpiTable)

**Priority:** P1  •  **Status:** pending  •  **Effort:** 3 days  •  **Days:** 10–12

## Context

- Plan: [../plan.md](./plan.md)
- Depends on: Phase 3 (API endpoints stable)
- Research: [research/researcher-02-react-dashboard.md](./research/researcher-02-react-dashboard.md) — TanStack Query + shadcn/ui.
- Source qdashboard:
  - `src/components/dashboard/overview/SummaryCards.tsx`
  - `src/components/dashboard/overview/KpiTable.tsx`
  - `src/components/dashboard/overview/kpi-table-row.tsx` (282 lines)
  - `src/components/dashboard/overview/kpi-table-utils.ts`
  - `src/components/dashboard/overview/kpi-table-sortable-header.tsx` (116 lines)
  - `src/lib/formatters.ts`, `src/lib/ui-text-constants.ts`

## Overview

**Note (Validated):** SMIT OS chưa có component library/design system → tạo mới từ đầu với Tailwind CSS + shadcn/ui.

Port 2 components giữ nguyên UX/markup. Thay context-based data (`useOverviewData` from Next.js context provider) bằng **TanStack Query** hooks fetch từ Express API. Strip dependency lib không cần (`useOverviewState`, `useOverviewData`, custom contexts) — thay bằng simple state lift + URL query params.

## Key insights

- Component hiện tại đang dùng nhiều custom contexts (`overview-context`, `overview-data-context`) → SMIT OS đơn giản hoá: 1 page-level state + `useQuery`.
- Mode `cohort` trong KpiTable depends `allData?.cohort` → vì OUT OF SCOPE, hardcode `viewMode='realtime'`, ẩn toggle Realtime/Cohort.
- `Step/Top` toggle giữ — pure client-side calculation từ KpiMetricsRow.
- `MetricCard`, `ComponentHeader`, `InfoPopover`, `DataTooltip`, `Skeleton` → cần port từ qdashboard hoặc dùng shadcn/ui sẵn có trong SMIT OS.

## Requirements

**Functional**
- Page `/dashboard/overview` render: DateRangePicker + SummaryCards + KpiTable.
- Date range default: last 7 days. URL sync (`?from=...&to=...`).
- Compare period toggle → request `previousFrom/previousTo`.
- KpiTable sort tất cả columns asc/desc, default `date desc`.
- Step/Top toggle reload rates calc client-side.
- Loading skeleton + error fallback.

**Non-functional**
- TanStack Query cache: staleTime 5min, gcTime 10min.
- File <200 lines (split row, header, utils).
- Memoize sort + rate calc.

## Architecture

```
src/
├── pages/
│   └── DashboardOverview.tsx              # Page entry — composes all
├── components/
│   ├── dashboard/
│   │   └── overview/
│   │       ├── SummaryCards.tsx
│   │       ├── KpiTable.tsx
│   │       ├── kpi-table-row.tsx
│   │       ├── kpi-table-sortable-header.tsx
│   │       ├── kpi-table-utils.ts
│   │       └── DateRangePicker.tsx
│   └── ui/                                  # shadcn/ui components
│       ├── card.tsx
│       ├── table.tsx
│       ├── skeleton.tsx
│       ├── tooltip.tsx
│       ├── metric-card.tsx
│       └── info-popover.tsx
├── hooks/
│   └── use-overview-data.ts
├── lib/
│   ├── api-client.ts                        # fetch wrapper
│   ├── formatters.ts                        # formatCurrency, formatNumber, ...
│   └── query-client.ts                      # TanStack singleton
├── types/
│   └── dashboard/
│       └── overview.types.ts                # Mirror backend types
└── App.tsx
```

## Files

**Create**
- `src/lib/query-client.ts`
- `src/lib/api-client.ts`
- `src/lib/formatters.ts`
- `src/types/dashboard/overview.types.ts` (frontend mirror, no Date — string only)
- `src/hooks/use-overview-data.ts`
- `src/pages/DashboardOverview.tsx`
- `src/components/dashboard/overview/SummaryCards.tsx`
- `src/components/dashboard/overview/KpiTable.tsx`
- `src/components/dashboard/overview/kpi-table-row.tsx`
- `src/components/dashboard/overview/kpi-table-sortable-header.tsx`
- `src/components/dashboard/overview/kpi-table-utils.ts`
- `src/components/dashboard/overview/DateRangePicker.tsx`
- `src/components/ui/metric-card.tsx`
- `src/components/ui/info-popover.tsx`

## Implementation steps

### 1. Install deps

```bash
pnpm add react react-dom @tanstack/react-query lucide-react clsx tailwind-merge
pnpm add -D @types/react @types/react-dom @vitejs/plugin-react vite typescript
pnpm add date-fns react-day-picker
# shadcn/ui base
npx shadcn@latest init
npx shadcn@latest add card table skeleton tooltip popover button calendar
```

### 2. `src/lib/query-client.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### 3. `src/lib/api-client.ts`

```typescript
const BASE = import.meta.env.VITE_API_BASE ?? '';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}

export async function apiGet<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString());
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) throw new Error(json.error ?? 'API error');
  return json.data;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) throw new Error(json.error ?? 'API error');
  return json.data;
}
```

### 4. `src/types/dashboard/overview.types.ts`

Mirror backend types — port từ `src/types/dashboard/overview.types.ts` của backend.

### 5. `src/hooks/use-overview-data.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import type { SummaryMetrics, KpiMetricsResponse } from '@/types/dashboard/overview.types';

interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;
  previousFrom?: string;
  previousTo?: string;
}

export function useSummaryData(range: DateRange) {
  return useQuery({
    queryKey: ['overview', 'summary', range],
    queryFn: () =>
      apiGet<SummaryMetrics>('/api/dashboard/overview/summary', {
        from: range.from, to: range.to,
        previousFrom: range.previousFrom, previousTo: range.previousTo,
      }),
  });
}

export function useKpiData(range: { from: string; to: string }) {
  return useQuery({
    queryKey: ['overview', 'kpi', range],
    queryFn: () => apiGet<KpiMetricsResponse>('/api/dashboard/overview/kpi-metrics', range),
  });
}

export function useOverviewAll(range: DateRange) {
  return useQuery({
    queryKey: ['overview', 'all', range],
    queryFn: () =>
      apiGet<{ summary: SummaryMetrics; kpiMetrics: KpiMetricsResponse }>(
        '/api/dashboard/overview',
        { from: range.from, to: range.to,
          previousFrom: range.previousFrom, previousTo: range.previousTo },
      ),
  });
}
```

### 6. `src/lib/formatters.ts`

Port nguyên từ qdashboard `src/lib/formatters.ts`:

```typescript
export function formatCurrency(v: number): string {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v);
}

export function formatNumber(v: number): string {
  return new Intl.NumberFormat('vi-VN').format(v);
}

export function formatPercent(v: number): string {
  return `${v.toFixed(1)}%`;
}

export function formatRoas(v: number): string {
  return `${v.toFixed(2)}x`;
}
```

### 7. `src/components/dashboard/overview/DateRangePicker.tsx`

Dùng `react-day-picker` + shadcn `Popover` + `Button`. Default last 7 days, presets: Today, Yesterday, Last 7d, Last 30d, This Month, Last Month.

```typescript
'use client';
import { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalIcon } from 'lucide-react';
import type { DateRange as DR } from 'react-day-picker';

export interface DateRangeValue { from: string; to: string }

const PRESETS = [
  { label: 'Hôm nay', getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: '7 ngày qua', getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: '30 ngày qua', getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: 'Tháng này', getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
];

export function DateRangePicker({
  value, onChange,
}: {
  value: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
}) {
  const [range, setRange] = useState<DR | undefined>({
    from: new Date(value.from), to: new Date(value.to),
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <CalIcon className="mr-2 h-4 w-4" />
          {value.from} → {value.to}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          <div className="flex flex-col gap-1 p-3 border-r">
            {PRESETS.map((p) => (
              <Button key={p.label} variant="ghost" size="sm"
                onClick={() => {
                  const v = p.getValue();
                  setRange(v);
                  onChange({ from: format(v.from, 'yyyy-MM-dd'), to: format(v.to, 'yyyy-MM-dd') });
                }}>
                {p.label}
              </Button>
            ))}
          </div>
          <Calendar mode="range" selected={range}
            onSelect={(r) => {
              setRange(r);
              if (r?.from && r?.to) {
                onChange({ from: format(r.from, 'yyyy-MM-dd'), to: format(r.to, 'yyyy-MM-dd') });
              }
            }}
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### 8. `src/components/ui/metric-card.tsx`

Simplified version (port from qdashboard's `metric-card.tsx`):

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MetricCard({
  label, value, icon: Icon, trend, trendDirection, infoPopover,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  infoPopover?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Icon className="h-3.5 w-3.5" /> {label}
          </div>
          {infoPopover}
        </div>
        <div className="mt-3 text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <div className={cn(
            'mt-1 text-xs flex items-center gap-1',
            trendDirection === 'up' && 'text-green-600',
            trendDirection === 'down' && 'text-red-600',
            trendDirection === 'neutral' && 'text-muted-foreground',
          )}>
            {trendDirection === 'up' && <ArrowUp className="h-3 w-3" />}
            {trendDirection === 'down' && <ArrowDown className="h-3 w-3" />}
            {trend.toFixed(1)}% vs prev
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 9. `src/components/dashboard/overview/SummaryCards.tsx`

Adapt từ source — bỏ context, nhận data prop:

```typescript
import { memo } from 'react';
import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/formatters';
import type { SummaryMetrics } from '@/types/dashboard/overview.types';

export const SummaryCards = memo(function SummaryCards({
  data, isLoading, error, compareEnabled,
}: {
  data?: SummaryMetrics;
  isLoading: boolean;
  error?: Error | null;
  compareEnabled: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}><CardContent className="p-6">
            <Skeleton className="h-4 w-[100px] mb-4" />
            <Skeleton className="h-8 w-[80px] mb-2" />
            <Skeleton className="h-4 w-[120px]" />
          </CardContent></Card>
        ))}
      </div>
    );
  }
  if (error) {
    return <Card><CardContent className="pt-6">
      <p className="text-center text-muted-foreground">Failed to load: {error.message}</p>
    </CardContent></Card>;
  }
  if (!data) return null;

  const cards = [
    { label: 'Doanh thu', value: formatCurrency(data.revenue.value),
      trend: compareEnabled ? data.revenue.trend : undefined,
      trendDirection: compareEnabled ? data.revenue.trendDirection : undefined,
      icon: DollarSign },
    { label: 'Ad Spend', value: formatCurrency(data.adSpend.value),
      trend: compareEnabled ? data.adSpend.trend : undefined,
      trendDirection: compareEnabled ? data.adSpend.trendDirection : undefined,
      icon: CreditCard },
    { label: 'Signups', value: data.signups.value.toLocaleString(),
      trend: compareEnabled ? data.signups.trend : undefined,
      trendDirection: compareEnabled ? data.signups.trendDirection : undefined,
      icon: Users },
    { label: 'ROAS', value: `${data.roas.value.toFixed(2)}x`,
      trend: compareEnabled ? data.roas.trend : undefined,
      trendDirection: compareEnabled ? data.roas.trendDirection : undefined,
      icon: Activity },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => <MetricCard key={c.label} {...c} />)}
    </div>
  );
});
```

### 10. `src/components/dashboard/overview/kpi-table-utils.ts`

Port nguyên từ qdashboard (sort + rate calc, bỏ `mapCohortToKpiRow`):

```typescript
import type { KpiMetricsRow } from '@/types/dashboard/overview.types';

export type SortField =
  | 'date' | 'adSpend' | 'sessions' | 'cpse' | 'signups' | 'cpsi'
  | 'trials' | 'cptr' | 'opportunities' | 'cpopp' | 'orders' | 'cpor'
  | 'mql' | 'prePql' | 'pql' | 'sql' | 'revenue' | 'roas' | 'mere';

export interface SortConfig { field: SortField; direction: 'asc' | 'desc' }
export type RateMode = 'top' | 'step';

export function sortData(rows: KpiMetricsRow[], cfg: SortConfig): KpiMetricsRow[] {
  const dir = cfg.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = (a as any)[cfg.field] ?? 0;
    const bv = (b as any)[cfg.field] ?? 0;
    if (typeof av === 'string') return av.localeCompare(bv) * dir;
    return (av - bv) * dir;
  });
}

/** Top mode: rate calculated against signups (for trial/opp/order) or trials (for mql/pql/sql)
    Step mode: rate against immediate previous step */
export function calculateRates(mode: RateMode, row: KpiMetricsRow) {
  const { signups, trials, opportunities, orders, mql, mqlBronze, mqlSilver, mqlGold,
    prePql, pql, sql } = row;

  if (mode === 'top') {
    return {
      signupRate: 0,
      trialRate: signups ? (trials / signups) * 100 : 0,
      oppsRate: signups ? (opportunities / signups) * 100 : 0,
      orderRate: signups ? (orders / signups) * 100 : 0,
      mqlRate: trials ? (mql / trials) * 100 : 0,
      mqlBronzeRate: trials ? (mqlBronze / trials) * 100 : 0,
      mqlSilverRate: trials ? (mqlSilver / trials) * 100 : 0,
      mqlGoldRate: trials ? (mqlGold / trials) * 100 : 0,
      prePqlRate: trials ? (prePql / trials) * 100 : 0,
      pqlRate: trials ? (pql / trials) * 100 : 0,
      sqlRate: trials ? (sql / trials) * 100 : 0,
    };
  }
  // step
  return {
    signupRate: 0,
    trialRate: signups ? (trials / signups) * 100 : 0,
    oppsRate: trials ? (opportunities / trials) * 100 : 0,
    orderRate: opportunities ? (orders / opportunities) * 100 : 0,
    mqlRate: trials ? (mql / trials) * 100 : 0,
    mqlBronzeRate: trials ? (mqlBronze / trials) * 100 : 0,
    mqlSilverRate: trials ? (mqlSilver / trials) * 100 : 0,
    mqlGoldRate: trials ? (mqlGold / trials) * 100 : 0,
    prePqlRate: trials ? (prePql / trials) * 100 : 0,
    pqlRate: prePql ? (pql / prePql) * 100 : 0,
    sqlRate: pql ? (sql / pql) * 100 : 0,
  };
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
```

### 11. `src/components/dashboard/overview/kpi-table-sortable-header.tsx`

```typescript
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { SortConfig, SortField } from './kpi-table-utils';

export function SortableHeader({
  field, title, tooltip, sortConfig, onSort,
}: {
  field: SortField; title: string; tooltip?: string;
  sortConfig: SortConfig; onSort: (f: SortField) => void;
}) {
  const active = sortConfig.field === field;
  const Icon = active
    ? sortConfig.direction === 'asc' ? ArrowUp : ArrowDown
    : ArrowUpDown;

  return (
    <button
      type="button"
      title={tooltip}
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-foreground"
    >
      <span>{title}</span>
      <Icon className="h-3 w-3" />
    </button>
  );
}

export function handleSortClick(field: SortField, prev: SortConfig): SortConfig {
  if (prev.field !== field) return { field, direction: 'desc' };
  return { field, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
}
```

### 12. `src/components/dashboard/overview/kpi-table-row.tsx`

Port nguyên 282 dòng từ qdashboard, bỏ `MqlTooltipCell` complex tooltip nếu lib chưa có (fallback simple cell), giữ logic `calc + rates`. **Bắt buộc `<200 lines`** → split `MetricCell` thành file riêng nếu cần.

> Implementation: copy qdashboard `kpi-table-row.tsx` y nguyên, đổi import path. Strip `DataTooltip` nếu chưa có lib → dùng native `title` attribute.

### 13. `src/components/dashboard/overview/KpiTable.tsx`

Port từ qdashboard, simplify:
- Bỏ `viewMode` state (chỉ realtime)
- Bỏ Realtime/Cohort toggle
- Giữ Top/Step toggle
- Nhận `data, isLoading, error` qua props (không dùng context)

```typescript
import { memo, useMemo, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart2 } from 'lucide-react';
import type { KpiMetricsResponse } from '@/types/dashboard/overview.types';
import { type SortConfig, type RateMode, sortData } from './kpi-table-utils';
import { SortableHeader, handleSortClick } from './kpi-table-sortable-header';
import { KpiTableRow } from './kpi-table-row';
import { cn } from '@/lib/utils';

export const KpiTable = memo(function KpiTable({
  data, isLoading, error,
}: {
  data?: KpiMetricsResponse;
  isLoading: boolean;
  error?: Error | null;
}) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'date', direction: 'desc' });
  const [rateMode, setRateMode] = useState<RateMode>('top');
  const handleSort = useCallback((f: any) => setSortConfig((p) => handleSortClick(f, p)), []);

  const sortedData = useMemo(
    () => data ? sortData(data.data, sortConfig) : [],
    [data, sortConfig],
  );

  if (isLoading) return <Card><CardContent className="p-6"><Skeleton className="h-[400px] w-full" /></CardContent></Card>;
  if (error) return <Card><CardContent className="pt-6">Failed: {error.message}</CardContent></Card>;
  if (!data) return null;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          <h3 className="font-semibold">KPI Metrics</h3>
        </div>
        <div className="flex h-7 rounded overflow-hidden text-xs border">
          <button onClick={() => setRateMode('top')}
            className={cn('px-3', rateMode === 'top' ? 'bg-primary text-primary-foreground' : '')}>Top</button>
          <button onClick={() => setRateMode('step')}
            className={cn('px-3', rateMode === 'step' ? 'bg-primary text-primary-foreground' : '')}>Step</button>
        </div>
      </div>
      <div className="h-[500px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead><SortableHeader field="date" title="Date" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader field="adSpend" title="Ad Spend" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader field="sessions" title="Sessions" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader field="signups" title="Signups" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader field="trials" title="Trial" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader field="opportunities" title="Opps" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader field="orders" title="Order" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader field="mql" title="MQL" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader field="prePql" title="Pre-PQL" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader field="pql" title="PQL" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader field="sql" title="SQL" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader field="revenue" title="Revenue" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader field="roas" title="ROAS" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, i) => (
              <KpiTableRow key={row.date} row={row} rateMode={rateMode} rowIndex={i} />
            ))}
          </TableBody>
          <tfoot className="sticky bottom-0">
            <KpiTableRow row={data.totals} rateMode={rateMode} isTotalRow />
          </tfoot>
        </Table>
      </div>
    </Card>
  );
});
```

### 14. `src/pages/DashboardOverview.tsx`

Compose page:

```typescript
import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { DateRangePicker } from '@/components/dashboard/overview/DateRangePicker';
import { SummaryCards } from '@/components/dashboard/overview/SummaryCards';
import { KpiTable } from '@/components/dashboard/overview/KpiTable';
import { useOverviewAll } from '@/hooks/use-overview-data';
import { Button } from '@/components/ui/button';

export default function DashboardOverview() {
  const [range, setRange] = useState({
    from: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });
  const [compareEnabled, setCompareEnabled] = useState(false);

  const { data, isLoading, error } = useOverviewAll({
    from: range.from, to: range.to,
    // Backend tự compute previousPeriod nếu không truyền
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Overview</h1>
        <div className="flex gap-2">
          <Button variant={compareEnabled ? 'default' : 'outline'} size="sm"
            onClick={() => setCompareEnabled((v) => !v)}>
            Compare
          </Button>
          <DateRangePicker value={range} onChange={setRange} />
        </div>
      </div>

      <SummaryCards
        data={data?.summary}
        isLoading={isLoading}
        error={error as Error | null}
        compareEnabled={compareEnabled}
      />

      <KpiTable
        data={data?.kpiMetrics}
        isLoading={isLoading}
        error={error as Error | null}
      />
    </div>
  );
}
```

### 15. `src/App.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import DashboardOverview from '@/pages/DashboardOverview';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardOverview />
    </QueryClientProvider>
  );
}
```

### 16. Vite config — proxy /api → :3000 trong dev

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
});
```

> Production: serve React static files từ Express (`app.use(express.static('dist'))`) → cùng port 3000.

## Todo

- [ ] Init Vite + React + Tailwind + shadcn
- [ ] Implement query-client, api-client, formatters
- [ ] Implement hooks + types mirror
- [ ] Build MetricCard + Skeleton primitives
- [ ] Implement DateRangePicker
- [ ] Implement SummaryCards
- [ ] Implement kpi-table-utils, sortable-header, row, KpiTable
- [ ] Compose DashboardOverview page
- [ ] Setup Vite proxy + production static serve
- [ ] Smoke: open `/`, change date range, see data load

## Success criteria

- Page render < 1s after API responds.
- Sort tất cả 13+ columns asc/desc.
- Step/Top toggle changes rates correctly.
- Date range change → query refetch + URL params update (optional).
- Skeleton hiện while loading.
- Mobile responsive (table horizontal scroll).
- File size <200 lines mỗi component.

## Risks

| Risk | Mitigation |
|---|---|
| TanStack Query SSR mismatch | Pure CSR — no SSR, mount sau hydration |
| Table BigInt từ API → JSON serialize fail | Backend convert BigInt → Number trước khi return |
| Date TZ shift khi parse `YYYY-MM-DD` | Always `format(date, 'yyyy-MM-dd')`, never `toISOString` |
| Bundle size lớn nếu copy hết shadcn | Chỉ add components dùng tới |
| `KpiTableRow` >200 dòng | Split `MetricCell` ra file riêng |

## Security

- API base URL via env, không hardcode.
- No auth client-side (Phase 5 evaluate).
- React 19 strict mode, no `dangerouslySetInnerHTML`.

## Next steps

- → Phase 5: testing + deploy.
