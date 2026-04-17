import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api-client';
import type { SummaryMetrics, KpiMetricsResponse, OverviewData, DateRange } from '../types/dashboard-overview';

interface DateRangeWithPrev extends DateRange {
  previousFrom?: string;
  previousTo?: string;
}

export function useSummaryData(range: DateRangeWithPrev) {
  return useQuery({
    queryKey: ['overview', 'summary', range],
    queryFn: () =>
      apiGet<SummaryMetrics>('/api/dashboard/overview/summary', {
        from: range.from,
        to: range.to,
        previousFrom: range.previousFrom,
        previousTo: range.previousTo,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useKpiData(range: DateRange) {
  return useQuery({
    queryKey: ['overview', 'kpi', range],
    queryFn: () => apiGet<KpiMetricsResponse>('/api/dashboard/overview/kpi-metrics', range),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useOverviewAll(range: DateRangeWithPrev) {
  return useQuery({
    queryKey: ['overview', 'all', range],
    queryFn: () =>
      apiGet<OverviewData>('/api/dashboard/overview', {
        from: range.from,
        to: range.to,
        previousFrom: range.previousFrom,
        previousTo: range.previousTo,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
