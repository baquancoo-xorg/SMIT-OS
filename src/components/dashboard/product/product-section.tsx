import { useMemo, useState } from 'react';
import { useInvalidateProductDashboard } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardSectionTitle from '../ui/dashboard-section-title';
import { ProductKpiCards } from './product-kpi-cards';
import { ProductPrePqlTrend } from './product-pre-pql-trend';
import { ProductActivationHeatmap } from './product-activation-heatmap';
import { ProductFunnelWithTime } from './product-funnel-with-time';
import { ProductTtvHistogram } from './product-ttv-histogram';
import { ProductCohortRetention } from './product-cohort-retention';
import { ProductCohortActivationCurve } from './product-cohort-activation-curve';
import { ProductChannelBreakdown } from './product-channel-breakdown';
import { ProductPrePqlBySource } from './product-prepql-by-source';
import { ProductChannelPostHogSecondary } from './product-channel-posthog-secondary';
import { ProductOnlineTimeTable } from './product-online-time-table';
import { ProductTouchpointTable } from './product-touchpoint-table';
import { ProductStuckList } from './product-stuck-list';
import { ProductTopFeaturesTable } from './product-top-features-table';

interface ProductSectionProps {
  from: string; // 'yyyy-MM-dd'
  to: string; // 'yyyy-MM-dd'
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
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50"
    >
      <svg
        className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
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
    <section className="space-y-8">
      {/* §1 Executive Overview */}
      <div className="space-y-4">
        <DashboardSectionTitle action={<RefreshButton onRefresh={handleRefresh} refreshing={refreshing} />}>
          §1 Executive Overview
        </DashboardSectionTitle>
        <ProductKpiCards range={range} />
        <ProductPrePqlTrend range={range} />
        <ProductActivationHeatmap range={range} />
      </div>

      {/* §2 Conversion Funnel */}
      <div className="space-y-4">
        <DashboardSectionTitle>§2 Conversion Funnel</DashboardSectionTitle>
        <ProductFunnelWithTime range={range} />
        <ProductTtvHistogram range={range} />
      </div>

      {/* §3 Cohort Retention */}
      <div className="space-y-4">
        <DashboardSectionTitle>§3 Cohort Retention</DashboardSectionTitle>
        <ProductCohortRetention range={range} />
        <ProductCohortActivationCurve range={range} />
      </div>

      {/* §4 Channel Attribution */}
      <div className="space-y-4">
        <DashboardSectionTitle>§4 Channel Attribution</DashboardSectionTitle>
        <ProductChannelBreakdown range={range} />
        <ProductPrePqlBySource range={range} />
        <ProductChannelPostHogSecondary range={range} />
      </div>

      {/* §5 Operational */}
      <div className="space-y-4">
        <DashboardSectionTitle>§5 Operational</DashboardSectionTitle>
        <ProductOnlineTimeTable range={range} />
        <ProductTouchpointTable range={range} />
        <ProductTopFeaturesTable range={range} />
        <ProductStuckList range={range} />
      </div>
    </section>
  );
}
