import { useMemo, useState } from 'react';
import { useInvalidateProductDashboard } from '../../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../../types/dashboard-product';
import { SectionCard } from '../../../ui';
import { ProductExecutiveOverview } from './product-executive-overview';
import { ProductConversionFunnel } from './product-conversion-funnel';
import { ProductCohortRetentionSection } from './product-cohort-retention-section';
import { ProductChannelAttribution } from './product-channel-attribution';
import { ProductOperational } from './product-operational';

interface ProductSectionProps {
  from: string;
  to: string;
}

function buildIsoRange(from: string, to: string): DateRange {
  const fromIso = new Date(`${from}T00:00:00Z`).toISOString();
  const toIso = new Date(`${to}T23:59:59Z`).toISOString();
  return { from: fromIso, to: toIso };
}

function RefreshButton({ onRefresh, refreshing }: { onRefresh: () => void; refreshing: boolean }) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={refreshing}
      title="Refresh data"
      className="inline-flex shrink-0 items-center gap-1 rounded-chip border border-outline-variant/40 bg-surface px-3 py-1 text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant transition-colors hover:bg-surface-variant/40 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
    >
      <svg className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Refresh
    </button>
  );
}

export function ProductSection({ from, to }: ProductSectionProps) {
  const invalidate = useInvalidateProductDashboard();
  const [refreshing, setRefreshing] = useState(false);
  const range = useMemo(() => buildIsoRange(from, to), [from, to]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidate();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SectionCard eyebrow="Product" title="Activation & Retention">
      <div className="space-y-8">
        <ProductExecutiveOverview
          range={range}
          action={<RefreshButton onRefresh={handleRefresh} refreshing={refreshing} />}
        />
        <ProductConversionFunnel range={range} />
        <ProductCohortRetentionSection range={range} />
        <ProductChannelAttribution range={range} />
        <ProductOperational range={range} />
      </div>
    </SectionCard>
  );
}
