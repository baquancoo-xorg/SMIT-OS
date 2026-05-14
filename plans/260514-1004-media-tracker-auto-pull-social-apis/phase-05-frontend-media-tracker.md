# Phase 05 — MediaTracker page rewrite

## Context links

- Research: `research/researcher-02-react-table-cron.md` § 1, 2, 5, 6 (TanStack table, group-by, refresh UX, icons)
- UI contract: `docs/ui-design-contract.md` — Card radius 1.5rem, NO solid orange CTA, accent via `var(--brand-500)`
- Existing page: `src/pages/v5/MediaTracker.tsx` (131 lines)
- Existing hook: `src/hooks/use-media-tracker.ts` (56 lines)
- Existing components: `src/components/v5/growth/media/media-kpi-summary.tsx`

## Parallelization Info

- parallel-with: [phase-06]
- must-wait-for: [phase-04] (API contract)
- blocks: [phase-07]

## Overview

- Date: 2026-05-14
- Description: Rewrite v5/MediaTracker.tsx: drop tabs + dialog, add filter bar + group-by table + Refresh button. Wire to new GET + sync endpoints.
- Priority: P2
- Status: pending

## Key Insights

- TanStack Table v8 not strictly required for 50–500 rows. KISS: keep `useMemo` grouping + sortable columns via existing `useSortableData` pattern. Upgrade deferred until >1000 rows.
- Group-by client-side: `useMemo(() => Object.groupBy(posts, p => p[groupKey]))`. Collapse state in `useState<Set<string>>`.
- Refresh button: TanStack Query `useMutation` calling `POST /api/media-tracker/sync` → toast result via existing toast util.
- Format icons via lucide: STATUS→`MessageSquare`, PHOTO→`Image`, VIDEO→`Video`, REEL→`Clapperboard`, ALBUM→`Layers`, LINK→`Link2`, EVENT→`CalendarDays`.
- KPI cards reuse existing `media-kpi-summary.tsx` (update to consume server-provided KPI block; remove client recompute).

## Requirements

Functional:
- Render filter bar: channel select (multi), format select (multi), date range, search input, group-by select (none/channel/format/month).
- KPI cards: Total posts, Total reach, Total engagement, Avg engagement rate.
- Table columns: Thumbnail+Title, Channel badge, Format (icon+label), Published date, Reach, Views, Engagement, Likes, Comments, Shares, Saves, External link.
- Group-by mode: collapsible group rows with aggregate sums.
- Refresh button (top-right): spinner during sync, toast on completion.
- Empty state: "No posts synced yet. Add a SocialChannel in Integrations" with link.
- No add/edit/delete UI anywhere.

Non-functional:
- All files < 200 lines.
- Use only `src/components/v5/ui/*` primitives.
- No solid orange CTA — Refresh button = ghost/outline with orange icon accent.
- Suspense fallback for posts list (per UI contract).

## Architecture

```
MediaTracker.tsx
 ├── <Suspense>
 │    ├── <MediaKpiSummary kpi={data.kpi} />
 │    ├── <MediaFilterBar value=... onChange=... onRefresh=... />
 │    └── <MediaGroupTable posts groupBy collapseState />
 │           ├── format-icon.tsx
 │           └── channel-badge (inline)
 │
 └── useMediaTracker(filters) — TanStack Query
       └── GET /api/media-tracker?...
```

State management:
- Filter state lifted to `MediaTracker.tsx` via `useState`.
- Sync filter to URL search params for shareability (optional, KISS skip if friction).
- `useMediaTracker(filters)` debounces search 300ms.

## Related code files

Rewrite:
- `src/pages/v5/MediaTracker.tsx`
- `src/hooks/use-media-tracker.ts`
- `src/components/v5/growth/media/media-kpi-summary.tsx` (props update only)

Create:
- `src/components/v5/growth/media/media-filter-bar.tsx`
- `src/components/v5/growth/media/media-group-table.tsx`
- `src/components/v5/growth/media/format-icon.tsx`

Do NOT touch:
- `src/components/media-tracker/*` (legacy — Phase 07 deletes)
- Settings page (Phase 06 owns Integrations route)

## File Ownership

Exclusive owner:
- `src/pages/v5/MediaTracker.tsx`
- `src/hooks/use-media-tracker.ts`
- `src/components/v5/growth/media/media-filter-bar.tsx`
- `src/components/v5/growth/media/media-group-table.tsx`
- `src/components/v5/growth/media/format-icon.tsx`
- `src/components/v5/growth/media/media-kpi-summary.tsx`

## Implementation Steps

1. Rewrite `use-media-tracker.ts`:
   - Single hook `useMediaTracker(filters)` returning `{ posts, kpi, total, isLoading, isError }`.
   - Drop mutations (no create/update/delete).
   - Add separate `useMediaSyncMutation()` for Refresh button.
   - Use `useChannelList()` (consumed in filter bar) — small helper hook.
2. Create `format-icon.tsx`: map MediaFormat → lucide icon + color class. <30 lines.
3. Create `media-filter-bar.tsx`:
   - Channel multi-select (from `useChannelList`).
   - Format multi-select.
   - Date range picker (reuse v5 primitive if exists; else native input).
   - Search input (debounced).
   - Group-by select.
   - Refresh button (right edge): ghost variant + orange `RefreshCw` icon. Calls `useMediaSyncMutation`.
4. Create `media-group-table.tsx`:
   - When `groupBy === 'none'`: flat sortable table.
   - When grouped: render `<GroupHeader>` (sticky `top-16`) with aggregate row, expandable.
   - Use existing v5 table primitive if available (`src/components/v5/ui/table.tsx`).
5. Update `media-kpi-summary.tsx`: accept `{ totalPosts, totalReach, totalEngagement, avgEngagementRate }` props directly.
6. Rewrite `MediaTracker.tsx`:
   - Layout: page header + KPI grid + filter bar + table.
   - Wrap table in `<Suspense fallback={<Skeleton />}>`.
   - Drop tabs/dialog imports entirely.
7. `npm run typecheck && npm run lint`.
8. Manual smoke: open `/v5/media`, verify empty state → run mock sync via DevTools → expect rows.

## Todo list

- [ ] Rewrite `use-media-tracker.ts` (read-only + sync mutation)
- [ ] Build `format-icon.tsx`
- [ ] Build `media-filter-bar.tsx`
- [ ] Build `media-group-table.tsx` (flat + grouped modes)
- [ ] Update `media-kpi-summary.tsx` props
- [ ] Rewrite `MediaTracker.tsx`
- [ ] Verify Suspense fallback renders
- [ ] Verify no solid orange + radius 1.5rem on cards

## Success Criteria

- `/v5/media` page renders without errors.
- Filter Channel + Format + Date works concurrently (server query inspector shows correct WHERE).
- Group-by Channel collapses groups; aggregate row shows correct sum.
- Refresh button spinner → toast on completion.
- No `MediaPostDialog` import remaining.
- UI contract compliance: card 1.5rem radius, no solid-orange button.
- Files all < 200 lines.

## Conflict Prevention

Phase 05 touches `src/pages/v5/MediaTracker.tsx`, `src/hooks/use-media-tracker.ts`, and `src/components/v5/growth/media/*` — all owned exclusively. Phase 06 owns `src/pages/v5/IntegrationsManagement.tsx` + `src/components/v5/integrations/*` + `src/App.tsx` (route registration) — zero file overlap. Phase 07 deletes `src/components/media-tracker/*` — distinct directory.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Empty state for first launch confuses user | Medium | Clear CTA "Add SocialChannel" link to Integrations (Phase 06 route) |
| Date range picker primitive missing | Low | Use native `<input type="date">` for KISS |
| Group-by perf at 5k rows | Low | Phase 1 expects <500; if breach, add virtualization later |
| Search input firing too often | Low | Debounce 300ms |
| Sync toast lost when navigating away | Low | Sonner persists toast across nav |

## Security Considerations

- No token exposure (DTO already scrubbed in Phase 04).
- Refresh trigger gated on backend (admin). Frontend hides button for non-admin via `useCurrentUser().role === 'ADMIN'`.
- All API calls go through existing fetch wrapper (`src/lib/api-client.ts`) for CSRF + auth header.

## Next steps

→ Phase 06 builds admin UI consumed via "Add SocialChannel" link. Phase 07 deletes legacy `src/components/media-tracker/*`.
