import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api-client';
import type { SummaryMetrics, KpiMetricsResponse, OverviewData, DateRange } from '../types/dashboard-overview';

type ViewMode = 'realtime' | 'cohort';

interface DateRangeWithPrev extends DateRange {
  previousFrom?: string;
  previousTo?: string;
}

interface OverviewParams extends DateRangeWithPrev {
  viewMode?: ViewMode;
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

export function useKpiData(range: DateRange & { viewMode?: ViewMode }) {
  return useQuery({
    queryKey: ['overview', 'kpi', range],
    queryFn: () => apiGet<KpiMetricsResponse>('/api/dashboard/overview/kpi-metrics', {
      from: range.from,
      to: range.to,
      viewMode: range.viewMode,
    }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useOverviewAll(params: OverviewParams) {
  return useQuery({
    queryKey: ['overview', 'all', params],
    queryFn: () =>
      apiGet<OverviewData>('/api/dashboard/overview', {
        from: params.from,
        to: params.to,
        previousFrom: params.previousFrom,
        previousTo: params.previousTo,
        viewMode: params.viewMode,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
