import cron from 'node-cron';
import { syncLeadsFromCrm } from '../services/lead-sync/crm-lead-sync.service';
import { childLogger } from '../lib/logger';

const log = childLogger('lead-sync-cron');

export function startLeadSyncCron() {
  cron.schedule('*/10 * * * *', async () => {
    const start = Date.now();
    log.info('started');

    try {
      const result = await syncLeadsFromCrm({ mode: 'cron' });
      if (result === null) {
        log.info('skipped: lock not acquired');
      } else {
        log.info(
          {
            status: result.status,
            scanned: result.subscribersScanned,
            created: result.leadsCreated,
            updated: result.leadsUpdated,
            durationMs: Date.now() - start,
          },
          'done',
        );
      }
    } catch (error) {
      log.error({ err: error }, 'failed');
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });

  log.info('scheduled every 10 minutes');
}
