/**
 * Daily Meta Ads sync — populates AdCampaign + AdSpendRecord (normalized layer).
 * Cron at 02:00 UTC (offset from FB scheduler + lead-sync).
 */
import cron from 'node-cron';
import { syncAllMetaAccounts } from '../services/ads/ads-sync.service';
import { childLogger } from '../lib/logger';

const log = childLogger('ads-sync-cron');

export function startAdsSyncCron() {
  // 02:00 UTC daily
  cron.schedule(
    '0 2 * * *',
    async () => {
      const start = Date.now();
      log.info('started');
      try {
        const results = await syncAllMetaAccounts();
        const failed = results.filter((r) => !r.success).length;
        log.info(
          {
            accounts: results.length,
            failed,
            totalCampaigns: results.reduce((s, r) => s + r.campaignsProcessed, 0),
            totalSpendRows: results.reduce((s, r) => s + r.spendRowsUpserted, 0),
            durationMs: Date.now() - start,
          },
          'done'
        );
      } catch (error) {
        log.error({ err: error }, 'failed');
      }
    },
    { timezone: 'UTC' }
  );

  log.info('scheduled daily at 02:00 UTC');
}
