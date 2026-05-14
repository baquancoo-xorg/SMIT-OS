# Phase 05 Report — MediaTracker Frontend Rewrite

## Files Created / Rewritten

| File | Lines | Action |
|---|---|---|
| `src/components/v5/growth/media/format-icon.tsx` | 32 | Created |
| `src/components/v5/growth/media/media-kpi-summary.tsx` | 32 | Rewritten |
| `src/components/v5/growth/media/media-filter-bar.tsx` | 156 | Created |
| `src/components/v5/growth/media/media-posts-table.tsx` | 116 | Created (new v5 path) |
| `src/components/v5/growth/media/media-group-table.tsx` | 104 | Created |
| `src/hooks/use-media-tracker.ts` | 170 | Rewritten |
| `src/pages/v5/MediaTracker.tsx` | 121 | Rewritten |
| `src/components/dashboard/media/media-tab.tsx` | ~110 | Fixed (broken by hook DTO change) |

All files < 200 lines. `media-tab.tsx` is outside exclusive ownership but required fix because hook return type changed.

## Hook API Exported

```ts
// use-media-tracker.ts
export interface MediaFilter { channelId?, platform?, format?, dateFrom?, dateTo?, from?(deprecated), to?(deprecated), search?, sortBy?, sortDir?, groupBy?, limit? }
export interface MediaPostDTO { id, channelId, externalId, url, title, content, format, publishedAt, reach, views, engagement, likes, comments, shares, saves, metricsExtra, thumbnailUrl, lastSyncedAt, channel: { id, name, platform } }
export interface MediaKpiDTO { totalPosts, totalReach, totalViews, totalEngagement, avgEngagementRate }
export interface MediaPostGroup { key, count, summary, posts: MediaPostDTO[] }

export function useMediaPostsQuery(filter)   // → { posts?: MediaPostDTO[]; groups?: MediaPostGroup[] }
export function useMediaKpiQuery(filter)     // → MediaKpiDTO
export function useMediaSyncMutation()       // POST /media-tracker/sync → toast + invalidate
```

Dropped: `useCreateMediaPostMutation`, `useUpdateMediaPostMutation`, `useDeleteMediaPostMutation`.

## Component Composition

```
MediaTracker.tsx
 ├── MediaKpiSummary kpi={kpiQuery.data}
 ├── MediaFilterBar filter onChange channels isSyncing onRefresh showRefresh
 └── <Card> → <Suspense> → TableSection(filter)
       ├── [grouped]   MediaGroupTable groups={data.groups}
       │     └── MediaPostsTable posts={group.posts}
       └── [flat]      MediaPostsTable posts={data.posts}
                         └── FormatIcon format={post.format}
```

`useSocialChannelsList()` from `use-social-channels.ts` (Phase 04) populates the channel dropdown.

## Empty State Handling

- No posts + no groupBy → `<EmptyState icon={<Rss />} title="No posts synced yet" description="Add a Social Channel in Integrations…">` (inline, inside Card)
- No groups (grouped mode) → same EmptyState
- `postsQuery.isError` → EmptyState with error message
- `postsQuery.isLoading` → 3× `<Skeleton variant="rect">` rows

## Validation Results

- `npm run typecheck`: 9 errors remain, ALL pre-existing (charts, Playground.tsx, date-range-utils.ts). Zero new errors from Phase 05 files.
- `npm run lint`: same 9 pre-existing errors only.
- All Phase 05 files compile cleanly.

## UI Contract Compliance

- Refresh button: `variant="ghost"` + `<RefreshCw className="text-accent">` — no solid orange.
- Card: `<Card padding="none" glow>` — uses primitive; radius from token.
- KPI cards via `<KpiCard>` primitive.
- `<Suspense fallback={<Skeleton>}>` wraps table section.
- No hardcoded hex colors — all CSS tokens.

## Status: DONE
