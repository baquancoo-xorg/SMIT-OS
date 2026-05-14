import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import {
  fetchPagePosts,
  fetchPostInsights,
  mapAttachmentToFormat,
  parseRateLimitHeader,
  FBTokenError,
  FBRateLimitError,
  FBGenericError,
} from '../fb-graph-client.js';

const require = createRequire(import.meta.url);
const postsFixture = require('./fixtures/fb-page-posts.json');
const insightsFixture = require('./fixtures/fb-post-insights.json');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeFetchMock(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return async () =>
    ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      headers: new Headers(headers),
    }) as unknown as Response;
}

// ── mapAttachmentToFormat ─────────────────────────────────────────────────────

describe('mapAttachmentToFormat', () => {
  it('maps photo to PHOTO', () => {
    assert.equal(mapAttachmentToFormat({ media_type: 'photo' }), 'PHOTO');
  });

  it('maps video to VIDEO', () => {
    assert.equal(mapAttachmentToFormat({ media_type: 'video' }), 'VIDEO');
  });

  it('maps video_inline to VIDEO', () => {
    assert.equal(mapAttachmentToFormat({ media_type: 'video_inline' }), 'VIDEO');
  });

  it('maps animated_image_video to VIDEO', () => {
    assert.equal(mapAttachmentToFormat({ media_type: 'animated_image_video' }), 'VIDEO');
  });

  it('maps album to ALBUM', () => {
    assert.equal(mapAttachmentToFormat({ media_type: 'album' }), 'ALBUM');
  });

  it('maps link to LINK', () => {
    assert.equal(mapAttachmentToFormat({ media_type: 'link' }), 'LINK');
  });

  it('maps share to LINK', () => {
    assert.equal(mapAttachmentToFormat({ media_type: 'share' }), 'LINK');
  });

  it('maps event to EVENT', () => {
    assert.equal(mapAttachmentToFormat({ media_type: 'event' }), 'EVENT');
  });

  it('maps null attachment to STATUS', () => {
    assert.equal(mapAttachmentToFormat(null), 'STATUS');
  });

  it('maps undefined attachment to STATUS', () => {
    assert.equal(mapAttachmentToFormat(undefined), 'STATUS');
  });

  it('maps unknown media_type to STATUS', () => {
    assert.equal(mapAttachmentToFormat({ media_type: 'sticker' }), 'STATUS');
  });
});

// ── parseRateLimitHeader ──────────────────────────────────────────────────────

describe('parseRateLimitHeader', () => {
  it('returns null for null input', () => {
    assert.equal(parseRateLimitHeader(null), null);
  });

  it('returns null for malformed JSON', () => {
    assert.equal(parseRateLimitHeader('not-json'), null);
  });

  it('parses valid BUC header', () => {
    const header = JSON.stringify({
      '12345': [{ call_count: 42, total_time: 80, type: 'MESSENGER' }],
    });
    const result = parseRateLimitHeader(header);
    assert.ok(result);
    assert.equal(result.callCount, 42);
    assert.equal(result.totalTime, 80);
  });

  it('returns null for empty object', () => {
    assert.equal(parseRateLimitHeader('{}'), null);
  });
});

// ── fetchPagePosts ────────────────────────────────────────────────────────────

describe('fetchPagePosts', () => {
  let fetchMock: ReturnType<typeof mock.method>;

  afterEach(() => {
    fetchMock?.mock?.restore();
  });

  it('returns RawPost array from fixture', async () => {
    fetchMock = mock.method(globalThis, 'fetch', makeFetchMock(postsFixture));
    const posts = await fetchPagePosts('123456789', 'fake-token');
    assert.equal(posts.length, 5);
    assert.equal(posts[0].externalId, '123456789_987654321');
    assert.equal(posts[0].format, 'PHOTO');
    assert.equal(posts[1].format, 'VIDEO');
    assert.equal(posts[2].format, 'LINK');
    assert.equal(posts[3].format, 'STATUS');
    assert.equal(posts[4].format, 'ALBUM');
  });

  it('stops pagination when next is null', async () => {
    fetchMock = mock.method(globalThis, 'fetch', makeFetchMock(postsFixture));
    const posts = await fetchPagePosts('123456789', 'fake-token');
    // fixture has paging.next = null → only 1 fetch call
    assert.equal(fetchMock.mock.calls.length, 1);
    assert.equal(posts.length, 5);
  });

  it('stops pagination when data is empty', async () => {
    const emptyPage = { data: [], paging: { next: 'http://next-page' } };
    fetchMock = mock.method(globalThis, 'fetch', makeFetchMock(emptyPage));
    const posts = await fetchPagePosts('123456789', 'fake-token');
    assert.equal(posts.length, 0);
    assert.equal(fetchMock.mock.calls.length, 1);
  });

  it('stops when post created_time is older than since', async () => {
    // All fixture posts are from 2026-05-09 to 2026-05-13
    // Setting since = 2026-05-12 means only the first 2 posts qualify
    const since = new Date('2026-05-12T00:00:00.000Z');
    fetchMock = mock.method(globalThis, 'fetch', makeFetchMock(postsFixture));
    const posts = await fetchPagePosts('123456789', 'fake-token', since);
    // post[0] = 2026-05-13 ✓, post[1] = 2026-05-12 ✓, post[2] = 2026-05-11 < since → stop
    assert.equal(posts.length, 2);
  });

  it('throws FBTokenError on error code 190', async () => {
    const errBody = { error: { code: 190, message: 'Invalid OAuth access token' } };
    fetchMock = mock.method(globalThis, 'fetch', makeFetchMock(errBody));
    await assert.rejects(
      () => fetchPagePosts('123456789', 'fake-token'),
      (err: unknown) => {
        assert.ok(err instanceof FBTokenError);
        assert.equal(err.code, 190);
        return true;
      }
    );
  });

  it('throws FBRateLimitError on error code 4', async () => {
    const errBody = { error: { code: 4, message: 'Application request limit reached' } };
    fetchMock = mock.method(globalThis, 'fetch', makeFetchMock(errBody));
    await assert.rejects(
      () => fetchPagePosts('123456789', 'fake-token'),
      (err: unknown) => {
        assert.ok(err instanceof FBRateLimitError);
        assert.equal(err.code, 4);
        return true;
      }
    );
  });

  it('throws FBRateLimitError on error code 17', async () => {
    const errBody = { error: { code: 17, message: 'User request limit reached' } };
    fetchMock = mock.method(globalThis, 'fetch', makeFetchMock(errBody));
    await assert.rejects(
      () => fetchPagePosts('123456789', 'fake-token'),
      (err: unknown) => {
        assert.ok(err instanceof FBRateLimitError);
        assert.equal(err.code, 17);
        return true;
      }
    );
  });

  it('throws FBGenericError on other error codes', async () => {
    const errBody = { error: { code: 200, message: 'Permission error' } };
    fetchMock = mock.method(globalThis, 'fetch', makeFetchMock(errBody));
    await assert.rejects(
      () => fetchPagePosts('123456789', 'fake-token'),
      (err: unknown) => {
        assert.ok(err instanceof FBGenericError);
        return true;
      }
    );
  });

  it('follows pagination to next page', async () => {
    const page1 = {
      data: [
        {
          id: 'p_page2_post',
          message: 'page 2 post',
          created_time: '2026-05-14T10:00:00+0000',
          attachments: { data: [{ media_type: 'photo' }] },
        },
      ],
      paging: { next: null },
    };
    const page0 = {
      data: [
        {
          id: 'p_page1_post',
          message: 'page 1 post',
          created_time: '2026-05-15T10:00:00+0000',
          attachments: { data: [{ media_type: 'video' }] },
        },
      ],
      paging: { next: 'https://graph.facebook.com/v22.0/next-cursor' },
    };

    let callCount = 0;
    fetchMock = mock.method(globalThis, 'fetch', async () => {
      const body = callCount === 0 ? page0 : page1;
      callCount++;
      return { ok: true, status: 200, json: async () => body, headers: new Headers() } as unknown as Response;
    });

    const posts = await fetchPagePosts('123456789', 'fake-token');
    assert.equal(posts.length, 2);
    assert.equal(fetchMock.mock.calls.length, 2);
    assert.equal(posts[0].format, 'VIDEO');
    assert.equal(posts[1].format, 'PHOTO');
  });
});

// ── fetchPostInsights ─────────────────────────────────────────────────────────

describe('fetchPostInsights', () => {
  let fetchMock: ReturnType<typeof mock.method>;

  afterEach(() => {
    fetchMock?.mock?.restore();
  });

  it('parses insight fixture into InsightMap', async () => {
    fetchMock = mock.method(globalThis, 'fetch', makeFetchMock(insightsFixture));
    const result = await fetchPostInsights(
      ['123456789_987654321', '123456789_111222333'],
      'fake-token'
    );

    assert.ok(result['123456789_987654321']);
    assert.equal(result['123456789_987654321'].views, 4500);
    assert.equal(result['123456789_987654321'].engagement, 320);
    assert.ok(typeof result['123456789_987654321'].likes === 'number');

    assert.ok(result['123456789_111222333']);
    assert.equal(result['123456789_111222333'].views, 8900);
  });

  it('batches requests when postIds exceeds 50', async () => {
    const ids = Array.from({ length: 55 }, (_, i) => `post_${i}`);
    const emptyBatch: Record<string, unknown> = {};
    ids.forEach(id => { emptyBatch[id] = { insights: { data: [] }, id }; });

    fetchMock = mock.method(globalThis, 'fetch', makeFetchMock(emptyBatch));
    await fetchPostInsights(ids, 'fake-token');
    // 55 IDs → 2 batches (50 + 5)
    assert.equal(fetchMock.mock.calls.length, 2);
  });

  it('returns empty map for empty postIds array', async () => {
    fetchMock = mock.method(globalThis, 'fetch', makeFetchMock({}));
    const result = await fetchPostInsights([], 'fake-token');
    assert.deepEqual(result, {});
    assert.equal(fetchMock.mock.calls.length, 0);
  });
});
