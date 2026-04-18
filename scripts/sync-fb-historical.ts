import { syncFbAdAccount } from '../server/services/facebook/fb-sync.service';

const ACCOUNTS = [
  'act_2827606334249624',
  'act_1267093148568199',
  'act_664178162083880',
];

const DATE_START = '2025-10-01';
const DATE_END = '2026-04-18';

async function main() {
  console.log(`Syncing FB Ads from ${DATE_START} to ${DATE_END}...\n`);

  for (const accountId of ACCOUNTS) {
    console.log(`[${accountId}] Starting sync...`);
    const result = await syncFbAdAccount(accountId, DATE_START, DATE_END);
    console.log(`[${accountId}] Result:`, result);
    console.log('');
  }

  console.log('Done!');
  process.exit(0);
}

main().catch(console.error);
