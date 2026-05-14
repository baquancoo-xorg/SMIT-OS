# Phase 03 — Sync service + cron 6h

## Context links

- Research cron: `research/researcher-02-react-table-cron.md` § 3 (node-cron + tsx watch duplicate issue)
- Existing cron pattern: `server/cron/ads-sync.cron.ts` (39 lines, reference)
- Server entry: `server.ts` line 43 registers `startAdsSyncCron()` — add `startMediaSyncCron()` next to it

## Parallelization Info

- parallel-with: [phase-04]
- must-wait-for: [phase-01, phase-02]
- blocks: [phase-07]

## Overview

- Date: 2026-05-14
- Description: Orchestrator that loops active SocialChannels, calls fb-graph-client, upserts MediaPost rows, writes MediaSyncRun audit. Cron `0 */6 * * *` with global registry guard.
- Priority: P2
- Status: pending

## Key Insights

- `tsx watch` re-imports module on file change → cron schedule registers twice → duplicate firing. Use `globalThis.__smitMediaCronRegistered` flag.
- Idempotent upsert via `prisma.mediaPost.upsert({ where: { channelId_externalId } })` — safe under duplicate triggers.
- Concurrency: cap 3 channels in parallel (`Promise.all` chunked) to respect FB BUC.
- Incremental sync: pass `since = channel.lastSyncedAt - 24h` to refetch recent posts (insights latency).
- Token expiry check: if `tokenExpiresAt < now() + 7d`, mark `channel.lastSyncStatus = 'TOKEN_EXPIRING'`. Don't fail sync, but surface in admin UI.

## Requirements

Functional:
- `syncChannel(channelId): Promise<SyncResult>` — fetch posts + insights → upsert → return `{ fetched, upserted, errors }`. Wrap in MediaSyncRun row (start/finish).
- `syncAllActive(): Promise<{ totalFetched, totalUpserted, failures }>` — query active channels, run with concurrency 3.
- Cron: `node-cron` schedule `0 */6 * * *` calling `syncAllActive`. Skip if previous run still flying (lock flag).
- Refresh button (Phase 04 route) calls `syncAllActive` directly.

Non-functional:
- File < 200 lines per file.
- Service does NOT import Express.
- Logger via existing `server/lib/logger.ts`.
- All DB calls via `server/lib/prisma.ts`.

## Architecture

```
cron tick / manual refresh
        │
        ▼
syncAllActive() ──▶ chunk(3) ──▶ syncChannel(id)
                                    │
                                    ├─ fb-graph-client.fetchPagePosts(channel, since)
                                    ├─ fb-graph-client.fetchPostInsights(ids)
                                    ├─ prisma.mediaPost.upsert (loop)
                                    └─ prisma.mediaSyncRun.create (audit)
                                    │
                                    ▼
                            update channel.lastSyncedAt + lastSyncStatus
```

Concurrency lock:
```ts
if (globalThis.__smitMediaSyncRunning) return { skipped: true };
globalThis.__smitMediaSyncRunning = true;
try { ... } finally { globalThis.__smitMediaSyncRunning = false; }
```

## Related code files

Create:
- `server/services/media/media-sync.service.ts`
- `server/services/media/__tests__/media-sync.service.test.ts`
- `server/cron/media-sync.cron.ts`

Modify (single-line registration):
- `server.ts` — add `import { startMediaSyncCron } from './server/cron/media-sync.cron'` + call after `startAdsSyncCron()`.

Do NOT touch:
- `server/services/media/media-post.service.ts` (Phase 04 owns rewrite)
- `server/routes/media-tracker.routes.ts` (Phase 04)

## File Ownership

Exclusive owner:
- `server/services/media/media-sync.service.ts`
- `server/services/media/__tests__/media-sync.service.test.ts`
- `server/cron/media-sync.cron.ts`

Shared edit (additive line only):
- `server.ts` — Phase 03 adds 2 lines. No other phase edits server.ts.

## Implementation Steps

1. Create `media-sync.service.ts`:
   - Export `syncChannel(channelId)`.
   - Export `syncAllActive()`.
   - Helper `chunkPromise<T>(items, size, fn)` for concurrency.
   - Decrypt token via `server/lib/crypto.ts` `decrypt()` before calling client.
   - Write MediaSyncRun row at start (status RUNNING) → update at end (SUCCESS/PARTIAL/FAILED).
   - On `FBTokenError` → set `channel.active = false` + `lastSyncStatus = 'TOKEN_INVALID'`.
2. Create `media-sync.cron.ts`:
   - `startMediaSyncCron()` exports init function.
   - Guard with `globalThis.__smitMediaCronRegistered`.
   - Use `node-cron` `schedule('0 */6 * * *', ...)`.
3. Register in `server.ts`:
   ```ts
   import { startMediaSyncCron } from './server/cron/media-sync.cron';
   startMediaSyncCron();
   ```
4. Tests:
   - Mock `fb-graph-client` via vitest module mock.
   - Mock prisma client (in-memory map).
   - Test: 2 channels, 3 posts each → 6 upserts.
   - Test: FBTokenError → channel deactivated.
   - Test: concurrency lock prevents overlap.
5. `npm run typecheck && npm run lint && npm run test -- media-sync`.

## Todo list

- [ ] Implement `syncChannel`
- [ ] Implement `syncAllActive` with chunked concurrency
- [ ] Write MediaSyncRun audit rows
- [ ] Handle FBTokenError → deactivate
- [ ] Implement cron module with tsx-watch guard
- [ ] Register cron in `server.ts`
- [ ] Unit tests pass

## Success Criteria

- Manual trigger logs `[media-sync] synced N posts across M channels`.
- After cron tick, `MediaSyncRun` row appears with `status = 'SUCCESS'`.
- Re-running sync immediately is no-op (idempotent upsert produces 0 new rows but 0 errors).
- `npm run dev` save→reload→save→reload does NOT trigger duplicate cron firing (verify with log timestamps).

## Conflict Prevention

Only Phase 03 edits `server.ts` (just 2 additive lines next to existing cron imports). Service file path `server/services/media/media-sync.service.ts` is new — Phase 04 rewrites `media-post.service.ts` (different file). Cron path is new dir entry alongside existing `ads-sync.cron.ts`.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Duplicate cron firing in dev | High | Global registry flag (researcher recommendation) |
| FB rate limit during sync | Medium | Concurrency cap 3 + BUC backoff helper from Phase 02 |
| Long sync blocks event loop | Low | Service is async; FB latency is I/O bound, not CPU |
| MediaSyncRun rows grow unbounded | Low | Out of scope; add retention job later (note for backlog) |
| Token decrypt failure mid-sync | Medium | Catch + log + mark channel `lastSyncStatus='DECRYPT_ERROR'`, continue others |

## Security Considerations

- Decrypted token lives only in function scope; never persisted to logs.
- Cron access does not require auth (server-side).
- Refresh endpoint (Phase 04) gates by admin role.

## Next steps

→ Phase 04 wires manual refresh endpoint to `syncAllActive`. Phase 07 verifies cron in long-running dev session.
