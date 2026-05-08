import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../lib/api-client';
import type {
  DateRange,
  ProductSummary,
  ProductFunnel,
  TopFeatures,
  ProductTrends,
  ProductHeatmap,
  ProductTtv,
  ProductCohort,
  ProductChannel,
  ProductOperational,
  ProductStuck,
  TrendMetric,
  HeatmapView,
} from '../types/dashboard-product';

const STALE_TIME = 5 * 60 * 1000;

export function useProductSummary(range: DateRange) {
  return useQuery({
    queryKey: ['dashboard', 'product', 'summary', range],
    queryFn: () =>
      apiGet<ProductSummary>('/api/dashboard/product/summary', {
        from: range.from,
        to: range.to,
      }),
    enabled: Boolean(range.from && range.to),
    staleTime: STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });
}

export function useProductFunnel(range: DateRange) {
  return useQuery({
    queryKey: ['dashboard', 'product', 'funnel', range],
    queryFn: () =>
      apiGet<ProductFunnel>('/api/dashboard/product/funnel', {
        from: range.from,
        to: range.to,
      }),
    enabled: Boolean(range.from && range.to),
    staleTime: STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });
}

export function useProductTopFeatures(range: DateRange) {
  return useQuery({
    queryKey: ['dashboard', 'product', 'top-features', range],
    queryFn: () =>
      apiGet<TopFeatures>('/api/dashboard/product/top-features', {
        from: range.from,
        to: range.to,
      }),
    enabled: Boolean(range.from && range.to),
    staleTime: STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });
}

// Phase 2 — Trends (line chart Pre-PQL Rate / Signup / FirstSync / Activation)
export function useProductTrends(range: DateRange, metric: TrendMetric) {
  return useQuery({
    queryKey: ['dashboard', 'product', 'trends', range, metric],
    queryFn: () =>
      apiGet<ProductTrends>('/api/dashboard/product/trends', {
        from: range.from,
        to: range.to,
        metric,
      }),
    enabled: Boolean(range.from && range.to),
    staleTime: STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });
}

// Phase 2 — Activation Heatmap (3 view variant)
export function useProductHeatmap(range: DateRange, view: HeatmapView) {
  return useQuery({
    queryKey: ['dashboard', 'product', 'heatmap', range, view],
    queryFn: () =>
      apiGet<ProductHeatmap>('/api/dashboard/product/heatmap', {
        from: range.from,
        to: range.to,
        view,
      }),
    enabled: Boolean(range.from && range.to),
    staleTime: STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });
}

// Phase 2 — Time-to-Value histogram
export function useProductTtv(range: DateRange) {
  return useQuery({
    queryKey: ['dashboard', 'product', 'ttv', range],
    queryFn: () =>
      apiGet<ProductTtv>('/api/dashboard/product/ttv', {
        from: range.from,
        to: range.to,
      }),
    enabled: Boolean(range.from && range.to),
    staleTime: STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });
}

// Phase 2 Sprint 2 — Cohort Retention
export function useProductCohort(range: DateRange) {
  return useQuery({
    queryKey: ['dashboard', 'product', 'cohort', range],
    queryFn: () =>
      apiGet<ProductCohort>('/api/dashboard/product/cohort', {
        from: range.from,
        to: range.to,
      }),
    enabled: Boolean(range.from && range.to),
    staleTime: STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });
}

// Phase 2 Sprint 2 — Channel attribution
export function useProductChannel(range: DateRange) {
  return useQuery({
    queryKey: ['dashboard', 'product', 'channel', range],
    queryFn: () =>
      apiGet<ProductChannel>('/api/dashboard/product/channel', {
        from: range.from,
        to: range.to,
      }),
    enabled: Boolean(range.from && range.to),
    staleTime: STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });
}

// Phase 2 Sprint 3 — Operational (online time + touchpoints)
export function useProductOperational(range: DateRange) {
  return useQuery({
    queryKey: ['dashboard', 'product', 'operational', range],
    queryFn: () =>
      apiGet<ProductOperational>('/api/dashboard/product/operational', {
        from: range.from,
        to: range.to,
      }),
    enabled: Boolean(range.from && range.to),
    staleTime: STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });
}

// Phase 2 Sprint 3 — Stuck businesses (TRACKING-ONLY) — filter by date range
export function useProductStuck(range: DateRange) {
  return useQuery({
    queryKey: ['dashboard', 'product', 'stuck', range],
    queryFn: () =>
      apiGet<ProductStuck>('/api/dashboard/product/stuck', {
        from: range.from,
        to: range.to,
      }),
    enabled: Boolean(range.from && range.to),
    staleTime: STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });
}

export function useInvalidateProductDashboard() {
  const queryClient = useQueryClient();

  return async () => {
    await apiPost('/api/dashboard/product/refresh', {});
    await queryClient.invalidateQueries({ queryKey: ['dashboard', 'product'] });
  };
}
