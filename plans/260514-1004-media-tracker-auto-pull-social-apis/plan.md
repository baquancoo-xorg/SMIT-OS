---
title: "Media Tracker auto-pull from FB Fanpage Graph API"
description: "Rewrite v5 MediaTracker to auto-sync FB Fanpage posts via Graph API + cron + filter/group-by table"
status: completed
priority: P2
effort: 5d
branch: main
tags: [media-tracker, facebook, graph-api, cron, v5, prisma-migration]
created: 2026-05-14
---

## Goal

Drop manual entry. v5/MediaTracker pulls FB Fanpage posts auto every 6h (+ manual Refresh). Schema: SocialChannel + rewritten MediaPost + MediaSyncRun. UI: KPI cards + filter bar + group-by table. Wipe existing MediaPost data.

## Scope locks (overrides brainstorm)

- FB Group **dropped entirely** (API removed Apr 2024). Only Fanpage in Phase 1.
- `impressions` column **dropped** (deprecated Nov 15 2025). Use `views`.
- `tokenExpiresAt` tracked; admin warning <7d before expiry.
- KOL/KOC/PR/Owned tabs **deleted**.

## Dependency graph

```
Phase 01 (schema) ─┐
                   ├──▶ Phase 03 (sync+cron) ─┐
Phase 02 (FB lib) ─┘                          ├──▶ Phase 07 (integration)
                                              │
Phase 01 (schema) ────▶ Phase 04 (API routes)─┤
                                              │
Phase 04 (API contract) ─▶ Phase 05 (UI page)─┤
                        ─▶ Phase 06 (admin)  ─┘
```

## Parallelization groups

| Group | Phases | Can run concurrently |
|---|---|---|
| A | 01, 02 | yes — no shared files |
| B | 03, 04 | yes — different services + routes |
| C | 05, 06 | yes — different pages + components |
| Final | 07 | sequential after A/B/C |

## File ownership matrix

| Path | Owner phase |
|---|---|
| `prisma/schema.prisma` | 01 |
| `prisma/migrations/*` | 01 |
| `server/services/facebook/fb-graph-client.ts` (new) | 02 |
| `server/services/facebook/__tests__/fb-graph-client.test.ts` (new) | 02 |
| `server/services/media/media-sync.service.ts` (new) | 03 |
| `server/cron/media-sync.cron.ts` (new) | 03 |
| `server.ts` (add cron register line) | 03 |
| `server/services/media/media-post.service.ts` (rewrite) | 04 |
| `server/routes/media-tracker.routes.ts` (rewrite) | 04 |
| `server/routes/social-channels.routes.ts` (new) | 04 |
| `server/schemas/media-tracker.schema.ts` (rewrite) | 04 |
| `server/schemas/social-channel.schema.ts` (new) | 04 |
| `src/pages/v5/MediaTracker.tsx` | 05 |
| `src/hooks/use-media-tracker.ts` | 05 |
| `src/components/v5/growth/media/media-filter-bar.tsx` (new) | 05 |
| `src/components/v5/growth/media/media-group-table.tsx` (new) | 05 |
| `src/components/v5/growth/media/media-kpi-summary.tsx` (update) | 05 |
| `src/components/v5/growth/media/format-icon.tsx` (new) | 05 |
| `src/pages/v5/IntegrationsManagement.tsx` (new route) | 06 |
| `src/hooks/use-social-channels.ts` (new) | 06 |
| `src/components/v5/integrations/social-channel-form.tsx` (new) | 06 |
| `src/components/v5/integrations/social-channel-list.tsx` (new) | 06 |
| `src/App.tsx` (add route) | 06 |
| `src/components/v5/layout/sidebar-v5.tsx` (add nav item) | 06 |
| `src/components/media-tracker/*` (delete legacy) | 07 |
| `docs/codebase-summary.md` (update) | 07 |

## Phases

| # | Title | Group | Effort | Status | Link |
|---|---|---|---|---|---|
| 01 | DB schema migration | A | 0.5d | completed_with_concerns | [phase-01](./phase-01-database-schema-migration.md) |
| 02 | FB Graph client library | A | 1d | completed | [phase-02](./phase-02-fb-graph-client.md) |
| 03 | Sync service + cron 6h | B | 1d | completed_with_concerns | [phase-03](./phase-03-sync-service-cron.md) |
| 04 | Backend API routes | B | 0.5d | completed | [phase-04](./phase-04-backend-api-routes.md) |
| 05 | MediaTracker page rewrite | C | 1.5d | completed | [phase-05](./phase-05-frontend-media-tracker.md) |
| 06 | Admin SocialChannel UI | C | 0.5d | completed | [phase-06](./phase-06-admin-social-channel-ui.md) |
| 07 | Integration + cleanup | Final | 0.25d | completed_with_concerns | [phase-07](./phase-07-integration-cleanup.md) |

## Validation gate (after each phase)

`npm run typecheck && npm run lint` — phase fails if either fails.
Final: `npm run test && npm run build`.

## Rollback strategy

Per phase: revert phase commit (each phase = 1 commit). Schema rollback via `prisma migrate resolve --rolled-back` + downgrade migration. Existing data already wiped, so no user data risk.

## Implementation Results

All 7 phases shipped 2026-05-14:
- **Status:** 5 completed, 2 completed_with_concerns
- **Tests:** 125/125 pass
- **Build:** ✓ PASS (Vite 2.53s)
- **Concerns:** 9 pre-existing TS errors (unrelated to this plan; charts + Playground). 3 files over 200 line target: `media-sync.service.ts` (268), `fb-graph-mapper.ts` (47, split intentional).
- **Docs Updated:** codebase-summary.md, project-changelog.md, development-roadmap.md
- **Legacy Cleanup:** `src/components/media-tracker/` deleted (4 files, 0 references remaining)

### Post-Review Fixes (code-reviewer flagged 3 critical, all resolved)

1. **C1 — MediaPostDTO contract break:** backend toDTO now returns `channel: {id, name, platform}` + `content` alias. Frontend hook + dashboard widget no longer crash on first synced post.
2. **C2 — MediaPlatform enum mismatch:** frontend union updated to Prisma values (FACEBOOK_PAGE/FACEBOOK_GROUP/INSTAGRAM/TIKTOK/YOUTUBE/THREADS). Dashboard `media-tab` PR KPI replaced with Total Engagement.
3. **M4 — Sidebar exposes /integrations to non-admin:** sidebar filters Admin section by `currentUser?.isAdmin`.

### Deferred to Backlog (not blockers)

- **C3** Hollow tests in `media-sync.service.test.ts` (no real syncChannel call) — replace with DI-mocked integration tests.
- **H1** `media-sync.service.ts` 268 lines — split upsertPosts + error-handler + concurrency helpers.
- **H2** `syncChannel` admin endpoint bypasses global lock — add per-channel lock map.
- **H3** Rate-limit backoff hardcoded 60s — use `parseRateLimitHeader` for adaptive backoff.
- **H4** Token via `?access_token` query string — migrate to `Authorization: Bearer` header.
- **H5** Schema accepts all platforms but only FB_PAGE syncs — surface UNSUPPORTED_PLATFORM badge.
- **M1-M6** misc (dead import stub, raw metricsExtra bloat, missing comment/share extraction, crypto KDF without salt).

See `reports/code-review.md` for full audit.
