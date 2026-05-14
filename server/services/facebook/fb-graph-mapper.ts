/**
 * Pure mapping helpers for FB Graph API responses.
 * No HTTP, no DB. Imported by fb-graph-client.ts and tests.
 */

import type { MediaFormat, InsightMap } from './fb-graph-client.js';

/**
 * Map a Graph API attachment node to a MediaFormat value.
 * Exported for direct unit testing.
 */
export function mapAttachmentToFormat(att: { media_type?: string } | null | undefined): MediaFormat {
  const t = att?.media_type?.toLowerCase() ?? '';
  if (t === 'photo') return 'PHOTO';
  if (t === 'video' || t === 'video_inline' || t === 'animated_image_video') return 'VIDEO';
  if (t === 'album') return 'ALBUM';
  if (t === 'link' || t === 'share') return 'LINK';
  if (t === 'event') return 'EVENT';
  return 'STATUS';
}

/**
 * Parse a single post node's insights sub-object into an InsightMap.
 */
export function parseInsightNode(node: any): InsightMap {
  const metrics: any[] = node.insights?.data ?? [];
  const byName: Record<string, any> = {};
  for (const m of metrics) byName[m.name] = m.values?.[0]?.value;

  const reactions = byName['post_reactions_by_type_total'] ?? {};
  const likes =
    typeof reactions === 'object'
      ? Object.values(reactions as Record<string, number>).reduce<number>(
          (s, v) => s + (Number(v) || 0),
          0
        )
      : 0;

  return {
    views: byName['post_impressions'] != null ? Number(byName['post_impressions']) : undefined,
    engagement: byName['post_engaged_users'] != null ? Number(byName['post_engaged_users']) : undefined,
    likes: likes || undefined,
    raw: node,
  };
}
