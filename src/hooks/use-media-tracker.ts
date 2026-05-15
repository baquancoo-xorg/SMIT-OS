import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/ui/notification-toast';

// ── DTO shapes (Phase 04 API contract) ──────────────────────────────────────

export type MediaFormat = 'STATUS' | 'PHOTO' | 'VIDEO' | 'REEL' | 'ALBUM' | 'LINK' | 'EVENT';
export type MediaPlatform = 'FACEBOOK_PAGE' | 'FACEBOOK_GROUP' | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'THREADS';

export interface MediaPostDTO {
  id: string;
  channelId: string;
  externalId: string | null;
  url: string | null;
  title: string | null;
  content: string | null;
  format: MediaFormat;
  publishedAt: string;
  reach: number | null;
  views: number | null;
  engagement: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  metricsExtra: Record<string, unknown> | null;
  thumbnailUrl: string | null;
  lastSyncedAt: string | null;
  channel: { id: string; name: string; platform: MediaPlatform };
}

export interface MediaKpiDTO {
  totalPosts: number;
  totalReach: number;
  totalViews: number;
  totalEngagement: number;
  avgEngagementRate: number;
}

export interface MediaPostGroup {
  key: string;
  count: number;
  summary: Record<string, unknown>;
  posts: MediaPostDTO[];
}

// ── Filter type ──────────────────────────────────────────────────────────────

export interface MediaFilter {
  channelId?: string;
  platform?: string;
  format?: string;
  dateFrom?: string;
  dateTo?: string;
  /** @deprecated use dateFrom */
  from?: string;
  /** @deprecated use dateTo */
  to?: string;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  groupBy?: 'channel' | 'format' | 'month';
  limit?: number;
}

type KpiFilter = Omit<MediaFilter, 'groupBy' | 'sortBy' | 'sortDir' | 'limit'>;

// ── Helpers ──────────────────────────────────────────────────────────────────

function toQs(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as [string, string][];
  return entries.length ? `?${new URLSearchParams(entries)}` : '';
}

async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`/api${endpoint}`, { credentials: 'include' });
  if (res.status === 401) {
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Query hooks ──────────────────────────────────────────────────────────────

export function useMediaPostsQuery(filter: MediaFilter = {}) {
  // Normalise legacy from/to aliases
  const { from, to, ...rest } = filter;
  const params: Record<string, string | number | undefined> = {
    ...rest,
    dateFrom: rest.dateFrom ?? from,
    dateTo: rest.dateTo ?? to,
    limit: rest.limit ?? 200,
  };
  return useQuery({
    queryKey: ['media-posts', params],
    queryFn: () =>
      apiFetch<{ success: boolean; data: { posts?: MediaPostDTO[]; groups?: MediaPostGroup[] } }>(
        `/media-tracker/posts${toQs(params)}`,
      ).then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useMediaKpiQuery(filter: KpiFilter = {}) {
  const params: Record<string, string | undefined> = {
    channelId: filter.channelId,
    platform: filter.platform,
    format: filter.format,
    dateFrom: filter.dateFrom,
    dateTo: filter.dateTo,
    search: filter.search,
  };
  return useQuery({
    queryKey: ['media-kpi', params],
    queryFn: () =>
      apiFetch<{ success: boolean; data: MediaKpiDTO }>(
        `/media-tracker/kpi${toQs(params)}`,
      ).then((r) => r.data),
    staleTime: 30_000,
  });
}

// ── Sync mutation ────────────────────────────────────────────────────────────

export function useMediaSyncMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () =>
      apiPost<{ success: boolean; data: { channelsProcessed: number; totalFetched: number; errors: string[] } }>(
        '/media-tracker/sync',
      ).then((r) => r.data),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['media-posts'] });
      void qc.invalidateQueries({ queryKey: ['media-kpi'] });
      const hasErrors = data.errors?.length > 0;
      toast({
        tone: hasErrors ? 'warning' : 'success',
        title: hasErrors ? 'Sync completed with warnings' : 'Sync complete',
        description: `${data.channelsProcessed} channel(s), ${data.totalFetched} post(s) fetched.${hasErrors ? ` Errors: ${data.errors.join(', ')}` : ''}`,
      });
    },
    onError: (err: Error) => {
      toast({ tone: 'error', title: 'Sync failed', description: err.message });
    },
  });
}
