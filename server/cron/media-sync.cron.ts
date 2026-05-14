/**
 * Media sync cron — fires syncAllActive() every 6 hours.
 * Global registry guard prevents duplicate scheduling under tsx watch hot-reload.
 */
import cron from 'node-cron';
import { syncAllActive } from '../services/media/media-sync.service';
import { childLogger } from '../lib/logger';

const log = childLogger('media-sync-cron');

declare const globalThis: { __smitMediaCronRegistered?: boolean };

export function startMediaSyncCron() {
  if (globalThis.__smitMediaCronRegistered) return;
  globalThis.__smitMediaCronRegistered = true;

  // Every 6 hours at :17 — off-minute to avoid :00 lottery with other crons
  cron.schedule(
    '17 */6 * * *',
    async () => {
      const start = Date.now();
      log.info('started');
      try {
        const result = await syncAllActive();
        log.info(
          {
            channelsProcessed: result.channelsProcessed,
            totalFetched: result.totalFetched,
            totalUpserted: result.totalUpserted,
            failures: result.failures.length,
            durationMs: Date.now() - start,
          },
          'done'
        );
      } catch (err) {
        log.error({ err }, 'unhandled error');
      }
    },
    { timezone: 'UTC' }
  );

  log.info('scheduled every 6h at :17');
}
