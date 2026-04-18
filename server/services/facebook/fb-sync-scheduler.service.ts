import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { syncFbAdAccount } from './fb-sync.service';

const prisma = new PrismaClient();

function getTodayRange() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  return { start: dateStr, end: dateStr };
}

async function syncAllActiveAccounts() {
  const accounts = await prisma.fbAdAccountConfig.findMany({
    where: { isActive: true },
    select: { accountId: true, accountName: true },
  });

  if (accounts.length === 0) {
    console.log('[fb-sync-scheduler] No active accounts to sync');
    return;
  }

  console.log(`[fb-sync-scheduler] Starting sync for ${accounts.length} account(s)`);
  const { start, end } = getTodayRange();

  for (const account of accounts) {
    try {
      const result = await syncFbAdAccount(account.accountId, start, end);
      console.log(`[fb-sync-scheduler] ${account.accountName}: ${result.success ? 'OK' : 'FAILED'} (${result.rowsInserted} rows, ${result.duration}ms)`);
    } catch (err) {
      console.error(`[fb-sync-scheduler] ${account.accountName} error:`, (err as Error).message);
    }
  }

  console.log('[fb-sync-scheduler] Sync cycle completed');
}

export function startFbSyncScheduler() {
  // Run every 30 minutes: "*/30 * * * *"
  cron.schedule('*/30 * * * *', () => {
    console.log(`[fb-sync-scheduler] Triggered at ${new Date().toISOString()}`);
    syncAllActiveAccounts().catch((err) => {
      console.error('[fb-sync-scheduler] Unexpected error:', err);
    });
  });

  console.log('[fb-sync-scheduler] Scheduled to run every 30 minutes');

  // Run initial sync after 5 seconds (let server fully start)
  setTimeout(() => {
    console.log('[fb-sync-scheduler] Running initial sync...');
    syncAllActiveAccounts().catch((err) => {
      console.error('[fb-sync-scheduler] Initial sync error:', err);
    });
  }, 5000);
}
