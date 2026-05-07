import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../lib/api-client';
import type {
  DateRange,
  ProductSummary,
  ProductFunnel,
  TopFeatures,
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

export function useInvalidateProductDashboard() {
  const queryClient = useQueryClient();

  return async () => {
    await apiPost('/api/dashboard/product/refresh', {});
    await queryClient.invalidateQueries({ queryKey: ['dashboard', 'product'] });
  };
}
