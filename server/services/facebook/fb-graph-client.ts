/**
 * FB Graph API v22.0 client — fanpage feed + post insights.
 * Pure HTTP module: no Prisma, no Express. Uses Node 20 global fetch.
 */

export { mapAttachmentToFormat, parseInsightNode } from './fb-graph-mapper.js';
import { mapAttachmentToFormat, parseInsightNode } from './fb-graph-mapper.js';

const FB_GRAPH_VERSION = 'v22.0';
const FB_BASE = `https://graph.facebook.com/${FB_GRAPH_VERSION}`;
const MAX_BATCH_SIZE = 50;

// ── Types ────────────────────────────────────────────────────────────────────

export type MediaFormat = 'STATUS' | 'PHOTO' | 'VIDEO' | 'REEL' | 'ALBUM' | 'LINK' | 'EVENT';

export interface RawPost {
  externalId: string;
  message?: string;
  createdTime: string;       // ISO 8601
  permalinkUrl?: string;
  fullPicture?: string;
  format: MediaFormat;
  raw: unknown;              // original API response node
}

export interface InsightMap {
  views?: number;
  engagement?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  raw: unknown;
}

// ── Typed Errors ─────────────────────────────────────────────────────────────

export class FBTokenError extends Error {
  readonly code = 190;
  constructor(message: string) {
    super(message);
    this.name = 'FBTokenError';
  }
}

export class FBRateLimitError extends Error {
  readonly code: 4 | 17;
  constructor(message: string, code: 4 | 17 = 4) {
    super(message);
    this.name = 'FBRateLimitError';
    this.code = code;
  }
}

export class FBGenericError extends Error {
  readonly fbCode: number;
  constructor(message: string, fbCode: number) {
    super(message);
    this.name = 'FBGenericError';
    this.fbCode = fbCode;
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function throwFBError(error: { code: number; message: string }): never {
  if (error.code === 190) throw new FBTokenError(error.message);
  if (error.code === 4 || error.code === 17) throw new FBRateLimitError(error.message, error.code as 4 | 17);
  throw new FBGenericError(error.message, error.code);
}

async function getJson(url: string): Promise<any> {
  const res = await fetch(url);
  const json = await res.json();
  if (json?.error) throwFBError(json.error);
  if (!res.ok) throw new FBGenericError(`HTTP ${res.status}`, res.status);
  return json;
}

const POST_FIELDS = [
  'id',
  'message',
  'created_time',
  'permalink_url',
  'full_picture',
  'attachments{media_type,subattachments{media_type}}',
].join(',');

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Parse the x-business-use-case-usage header for backoff decisions.
 * Returns null when header is absent or malformed.
 */
export function parseRateLimitHeader(header: string | null): { callCount: number; totalTime: number } | null {
  if (!header) return null;
  try {
    const parsed = JSON.parse(header) as Record<string, Array<{ call_count?: number; total_time?: number }>>;
    const entries = Object.values(parsed).flat();
    if (!entries.length) return null;
    const callCount = entries[0]?.call_count ?? 0;
    const totalTime = entries[0]?.total_time ?? 0;
    return { callCount, totalTime };
  } catch {
    return null;
  }
}

/**
 * Fetch all published posts for a FB page since an optional date.
 * Follows pagination cursor until no next page or post is older than `since`.
 */
export async function fetchPagePosts(pageId: string, token: string, since?: Date): Promise<RawPost[]> {
  const url = new URL(`${FB_BASE}/${pageId}/published_posts`);
  url.searchParams.set('access_token', token);
  url.searchParams.set('fields', POST_FIELDS);
  url.searchParams.set('limit', '100');

  const results: RawPost[] = [];
  let next: string | null = url.toString();

  while (next) {
    const json = await getJson(next);
    const posts: any[] = json.data ?? [];
    if (!posts.length) break;

    for (const p of posts) {
      const createdAt = new Date(p.created_time);
      if (since && createdAt < since) {
        // Posts are in reverse chronological order — stop entirely
        return results;
      }
      const att = p.attachments?.data?.[0] ?? null;
      results.push({
        externalId: p.id,
        message: p.message ?? undefined,
        createdTime: p.created_time,
        permalinkUrl: p.permalink_url ?? undefined,
        fullPicture: p.full_picture ?? undefined,
        format: mapAttachmentToFormat(att),
        raw: p,
      });
    }

    next = json.paging?.next ?? null;
  }

  return results;
}

/**
 * Fetch lifetime insights for a list of post IDs.
 * Batches up to 50 IDs per request (Meta limit).
 */
export async function fetchPostInsights(
  postIds: string[],
  token: string
): Promise<Record<string, InsightMap>> {
  const result: Record<string, InsightMap> = {};
  const INSIGHT_FIELDS =
    'insights.metric(post_impressions,post_engaged_users,post_reactions_by_type_total,post_clicks)';

  for (let i = 0; i < postIds.length; i += MAX_BATCH_SIZE) {
    const batch = postIds.slice(i, i + MAX_BATCH_SIZE);
    const url = new URL(`${FB_BASE}/`);
    url.searchParams.set('ids', batch.join(','));
    url.searchParams.set('fields', INSIGHT_FIELDS);
    url.searchParams.set('access_token', token);

    const json = await getJson(url.toString());

    for (const postId of batch) {
      const node = json[postId];
      if (!node) continue;
      result[postId] = parseInsightNode(node);
    }
  }

  return result;
}

