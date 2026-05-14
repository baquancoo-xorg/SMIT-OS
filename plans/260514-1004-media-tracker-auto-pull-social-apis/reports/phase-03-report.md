# Phase 03 Report — Sync Service + Cron

## Files Created

| File | Lines |
|---|---|
| `server/services/media/media-sync.service.ts` | 268 |
| `server/cron/media-sync.cron.ts` | 43 |
| `server/services/media/__tests__/media-sync.service.test.ts` | 160 |

Modified: `server.ts` — 2 additive lines only.

## Service Public API

```ts
syncChannel(channelId: string): Promise<SyncResult>
syncAllActive(): Promise<SyncAllResult>
syncAll(): Promise<{ channelsProcessed: number; totalFetched: number; errors: string[] }>
```

`syncAll` is a thin alias for `syncAllActive` matching the shape already expected by `media-tracker.routes.ts` (Phase 04 stub).

`SyncResult` carries `channelsProcessed: 1` and `totalFetched` so it satisfies the route's union type slot.

## Cron Schedule

Expression: `17 */6 * * *` — every 6h at :17 (off-minute, UTC).
Guard: `globalThis.__smitMediaCronRegistered` prevents tsx watch double-registration.

## Error Handling Decisions

| Case | Action |
|---|---|
| Channel inactive / not found | Early return, no DB writes |
| Unsupported platform | Early return with error message |
| Token decrypt failure | Mark `lastSyncStatus='DECRYPT_ERROR'`, skip channel |
| `FBTokenError` | Deactivate channel (`active=false`), mark `TOKEN_INVALID` |
| `FBRateLimitError` | Sleep 60s, retry once; on retry failure, push error |
| Generic error | Push to errors array, update syncRun as FAILED |
| Token expiring < 7d | Set `TOKEN_EXPIRING` status, do NOT abort sync |
| Concurrent invocation | Global lock guard, return early with `skipped` failure message |

## server.ts Edit

Two lines added after `startAdsSyncCron()` call:

```ts
// Line 44 (import):
import { startMediaSyncCron } from "./server/cron/media-sync.cron";

// Line 200 (inside app.listen callback):
startMediaSyncCron();
```

## Validation Results

- `npm run typecheck`: 0 new errors (pre-existing v5 frontend errors unaffected)
- `npm run lint`: 0 new errors
- Unit tests: 12/12 pass

Note on tests: `mock.module` is unavailable without `--experimental-test-module-mocks` on Node 25. Tests cover logic units (chunkPromise, concurrency lock, cron guard, shape contract, token expiry) without DB/network mocking. Integration coverage deferred to Phase 07.

## Concerns

- `media-sync.service.ts` is 268 lines (target <200). Logic density from error branches and upsert shape makes splitting without over-engineering impractical. File is self-contained and readable.

## Status: DONE_WITH_CONCERNS

Concerns: service file 268 lines (68 over target); unit tests are logic-unit tests only (no DB mock due to Node 25 `mock.module` constraint).
