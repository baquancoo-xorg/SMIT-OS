import cron from 'node-cron';
import { syncLeadsFromCrm } from '../services/lead-sync/crm-lead-sync.service';

export function startLeadSyncCron() {
  cron.schedule('*/10 * * * *', async () => {
    const start = Date.now();
    console.log('[lead-sync-cron] started');

    try {
      const result = await syncLeadsFromCrm({ mode: 'cron' });
      if (result === null) {
        console.log('[lead-sync-cron] skipped: lock not acquired');
      } else {
        console.log(`[lead-sync-cron] done: status=${result.status} scanned=${result.subscribersScanned} created=${result.leadsCreated} updated=${result.leadsUpdated} durationMs=${Date.now() - start}`);
      }
    } catch (error) {
      console.error('[lead-sync-cron] failed:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });

  console.log('[lead-sync-cron] scheduled every 10 minutes');
}
