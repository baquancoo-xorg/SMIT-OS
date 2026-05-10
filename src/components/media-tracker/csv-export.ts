import { api } from '../../lib/api';
import { buildCsv, downloadCsv } from '../../lib/csv-export';
import type { MediaPostType } from '../../types';

export async function exportMediaPostsToCsv(filters?: { type?: MediaPostType; from?: string; to?: string }) {
  const qp = filters
    ? Object.fromEntries(Object.entries(filters).filter(([, v]) => !!v) as [string, string][])
    : undefined;
  const res = await api.getMediaPosts(qp);
  const headers = [
    'Platform',
    'Type',
    'Title',
    'URL',
    'Published',
    'Reach',
    'Engagement',
    'UTM',
    'Cost (VND)',
    'Outlet/KOL',
    'Sentiment',
  ];
  const rows = res.data.posts.map((p) => {
    const meta = (p.meta ?? {}) as Record<string, any>;
    const name = meta.kolName ?? meta.kocName ?? meta.outlet ?? '';
    return [
      p.platform,
      p.type,
      p.title ?? '',
      p.url ?? '',
      p.publishedAt.slice(0, 10),
      p.reach,
      p.engagement,
      p.utmCampaign ?? '',
      p.cost ?? '',
      name,
      meta.sentiment ?? '',
    ];
  });

  const date = new Date().toISOString().slice(0, 10);
  const typePart = filters?.type ? `-${filters.type.toLowerCase()}` : '';
  downloadCsv(buildCsv(headers, rows), `media-posts${typePart}-${date}.csv`);
}
