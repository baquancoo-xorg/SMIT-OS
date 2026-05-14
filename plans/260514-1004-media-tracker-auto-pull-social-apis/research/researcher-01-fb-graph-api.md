---
name: facebook-graph-api-research
description: FB Graph API v22+, page posts, insights metrics, tokens, rate limits, groups API status
metadata:
  date: 2026-05-14
  sources: 5 independent Meta + third-party sources
  coverage: endpoints, insights, auth, rate limits, deprecation status
---

# Facebook Graph API Research — Media Tracker Auto-Pull

## 1. FB Graph API v22+ Page Posts Endpoint

**Current version state:**
- v22.0 released 2025-01-21; v23.0 released 2025-05-29
- Latest available is v25.0 (per search results)
- Meta enforcing stricter permission rules + tighter rate limits (Jan 2025 announcement)

**Page posts fetch pattern:**
- Endpoint: `GET /{page-id}/feed` or `/{page-id}/published_posts`
- Supports batch requests for efficiency
- Required fields for Media Tracker: `id,message,created_time,attachments,permalink_url,full_picture`

**Attachments & Media Format detection (INCOMPLETE):**
- Attachments available via `attachments` edge with `media_type` + `subattachments` fields
- Ability to detect: status/photo/video/reel/album/link/event from `attachments.media_type` — **UNCONFIRMED** exact enum values (Meta docs reference exists but content not fetched)
- Video-specific metrics available via separate `/video-id/video_insights` endpoint for Reels + Videos

**⚠️ Red flag:** Official API reference for attachment type enums requires direct Meta docs access (developers.facebook.com/docs/graph-api/reference/post/attachments/)

**Sources:**
- [Graph API v22.0 Changelog](https://developers.facebook.com/docs/graph-api/changelog/version22.0/)
- [Graph API v25.0: Post Reference](https://developers.facebook.com/docs/graph-api/reference/post/)

---

## 2. Page Insights Metrics

**Endpoint:** `GET /{post-id}/insights?metric={metric-1},{metric-2}`

**Available post-level metrics:**
- Impressions: `post_impressions`, `post_impressions_unique` — **DEPRECATED as of 2025-11-15**, replace with `views`
- Reactions: `post_reactions_by_type_total`, `post_reactions_like_total`, `post_reactions_love_total`, `post_reactions_wow_total`, `post_reactions_haha_total`, `post_reactions_sorry_total`, `post_reactions_anger_total` (added 2025-02-11)
- Engagement: `post_engaged_users`, `post_clicks` (approval required for some)
- Video metrics: `post_video_views`, `post_video_avg_time_viewed`, `post_video_complete_views` — available at post level
- Reels metrics: `reel_total_reels_plays`, `reels_replays` (added 2025-01-17)

**Batch pattern:** Single request can query multiple metrics; use comma-separated list in `metric` param

**Permissions required:** `pages_read_engagement`, `read_insights`

**Sources:**
- [Page Insights API Reference](https://developers.facebook.com/docs/graph-api/reference/insights/)
- [Metric Deprecation (Nov 2025)](https://support.agorapulse.com/en/articles/12460799-facebook-metric-deprecation-november-2025)
- [Reels & Video Insights](https://developers.facebook.com/docs/graph-api/reference/video/video_insights/)

---

## 3. Rate Limits & BUC (Business Use Case)

**BUC enforcement:**
- All Pages API requests + Marketing API calls subject to BUC rate limits
- Rate limit applies per app + per business use case
- Response includes `X-Business-Use-Case-Usage` HTTP header (JSON-formatted)

**Rate limit thresholds:**
- Based on CPU time + wall-clock time, capped at 100 each
- When total_cputime or total_time reaches 100 → calls throttled
- Different tiers: Standard Access (300 calls/hr + 40 per active ad), Advanced Access (100K calls/hr + 40 per active ad)

**Retry strategy:**
- Monitor `X-Business-Use-Case-Usage` header for remaining quota
- Implement exponential backoff for 429 (throttling) + 400 (CPU/time exceeded)
- Header returns up to 32 objects describing usage per request

**Sources:**
- [Rate Limits - Graph API Docs](https://developers.facebook.com/docs/graph-api/overview/rate-limiting/)
- [Marketing API Rate Limiting](https://developers.facebook.com/docs/marketing-api/overview/rate-limiting/)

---

## 4. Page Access Token Lifecycle

**Token expiry:**
- Long-lived page tokens: 60 days (standard)
- System/Page-generated tokens: may not expire if user token never invalidated
- Short-lived user tokens: 1-2 hours
- Refresh trigger: token auto-refreshes once per day on user request

**Error 190 (token invalid/expired):**
- Indicates expired, revoked, or insufficient-permission token
- Do NOT retry 190 without token refresh
- Requires re-authorization flow

**Refresh strategy:**
- Proactive refresh before 60-day boundary (check `expires_at` field)
- Or: catch error 190 → trigger refresh → retry
- System User tokens (for admin use case) may have extended lifespans; verify on app setup

**Sources:**
- [Access Token Guide](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/)
- [Handle Expired Tokens Blog](https://developers.facebook.com/blog/post/2011/05/13/how-to--handle-expired-access-tokens/)

---

## 5. Facebook Groups API Status (2025–2026)

**Deprecation complete:**
- Groups API deprecated in v19 (January 2024)
- **Fully removed as of April 22, 2024** from all API versions
- Permissions `groups_access_member_info`, `publish_to_groups` no longer functional

**Impact for SMIT-OS:**
- **Cannot fetch group posts via Graph API** — no official alternative endpoint
- Admin-group scraping not viable via API; would require web scraping (off-limits for compliance)
- Alternative: User manual export or third-party group data providers (requires separate agreement)

**Sources:**
- [Meta Deprecates Facebook Groups API - Sprinklr](https://www.sprinklr.com/help/articles/getting-started/meta-deprecates-facebook-groups-api/66229eb25f9dd9599d632712)
- [Facebook Groups API Changes - Castr Docs](https://docs.castr.com/en/articles/9112180-facebook-groups-api-changes)

---

## 6. Instagram Business Account via FB Graph (Phase 2 Preview)

**IG Business reuses Page token:**
- Endpoint: `GET /{ig-user-id}/media`
- Requires `instagram_basic` + `instagram_insights` permissions
- Returns IG post id, caption, media_type, timestamp, permalink
- Insights batch available: `GET /{ig-media-id}/insights?metric=...`

**Common IG metrics:** impressions, engagement, reach, saved, profile_visits, website_clicks

**Observation:** IG API more mature + stable than Groups; no announced deprecation. Ready for Phase 2 integration.

---

## Open Questions / Red Flags

1. **Attachment type enums:** `media_type` exact values (reel vs video vs video_reel?) — needs Meta reference docs or empirical API testing
2. **Subattachments nesting:** how deep can `attachments.subattachments` go for albums/carousels? Undocumented.
3. **Video detection:** how to distinguish Reels (short-form) from standard Videos in attachments? May require `is_hidden` + `type` inspection.
4. **Batch insights limits:** can single batch request cover 100 posts × 7 metrics? Needs load testing.
5. **System User tokens:** do they truly never expire? Confirm with Meta Support or test empirically on setup.
6. **Event posts:** are events detectable as attachment type or separate endpoint?
7. **Impressions sunset:** timeline for updating to `views` metric on existing integrations — breaking change risk.
8. **Groups alternative:** confirm no undocumented Groups API endpoint for admins (e.g., CMS API or separate product).

