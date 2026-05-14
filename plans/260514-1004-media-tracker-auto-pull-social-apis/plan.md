---
title: "Media Tracker auto-pull from FB Fanpage Graph API"
description: "Rewrite v5 MediaTracker to auto-sync FB Fanpage posts via Graph API + cron + filter/group-by table"
status: pending
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
| `src/components/media-tracker/*` (delete legacy) | 07 |
| `docs/codebase-summary.md` (update) | 07 |

## Phases

| # | Title | Group | Effort | Status | Link |
|---|---|---|---|---|---|
| 01 | DB schema migration | A | 0.5d | pending | [phase-01](./phase-01-database-schema-migration.md) |
| 02 | FB Graph client library | A | 1d | pending | [phase-02](./phase-02-fb-graph-client.md) |
| 03 | Sync service + cron 6h | B | 1d | pending | [phase-03](./phase-03-sync-service-cron.md) |
| 04 | Backend API routes | B | 0.5d | pending | [phase-04](./phase-04-backend-api-routes.md) |
| 05 | MediaTracker page rewrite | C | 1.5d | pending | [phase-05](./phase-05-frontend-media-tracker.md) |
| 06 | Admin SocialChannel UI | C | 0.5d | pending | [phase-06](./phase-06-admin-social-channel-ui.md) |
| 07 | Integration + cleanup | Final | 0.25d | pending | [phase-07](./phase-07-integration-cleanup.md) |

## Validation gate (after each phase)

`npm run typecheck && npm run lint` — phase fails if either fails.
Final: `npm run test && npm run build`.

## Rollback strategy

Per phase: revert phase commit (each phase = 1 commit). Schema rollback via `prisma migrate resolve --rolled-back` + downgrade migration. Existing data already wiped, so no user data risk.
