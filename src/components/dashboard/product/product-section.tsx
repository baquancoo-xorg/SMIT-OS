import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInvalidateProductDashboard } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardSectionTitle from '../ui/dashboard-section-title';
import { ProductKpiCards } from './product-kpi-cards';
import { ProductFunnelChart } from './product-funnel-chart';
import { ProductTopFeaturesTable } from './product-top-features-table';
import { ProductRetentionEmbed } from './product-retention-embed';

export function ProductSection() {
  const [searchParams] = useSearchParams();
  const invalidate = useInvalidateProductDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const range: DateRange = useMemo(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from && to) {
      return { from: new Date(from).toISOString(), to: new Date(to).toISOString() };
    }
    const now = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    return { from: monthAgo.toISOString(), to: now.toISOString() };
  }, [searchParams]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidate();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <DashboardSectionTitle>Product Analytics</DashboardSectionTitle>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          title="Refresh data"
        >
          <svg
            className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`}
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
        </button>
      </header>
      <ProductKpiCards range={range} />
      <ProductFunnelChart range={range} />
      <ProductTopFeaturesTable range={range} />
      <ProductRetentionEmbed />
    </section>
  );
}
