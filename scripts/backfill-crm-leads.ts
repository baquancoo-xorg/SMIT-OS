import { PrismaClient } from '@prisma/client';
import { getCrmClient, safeCrmQuery } from '../server/lib/crm-db';
import { syncLeadsFromCrm } from '../server/services/lead-sync/crm-lead-sync.service';
import { initLeadSyncPrisma } from '../server/services/lead-sync/state';
import { CUTOFF_2026_04_01 } from '../server/services/lead-sync/constants';

type Args = {
  dryRun: boolean;
  from: Date;
  to: Date;
};

function parseDate(value: string, name: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
  return date;
}

function parseArgs(argv: string[]): Args {
  let dryRun = false;
  let from = CUTOFF_2026_04_01;
  let to = new Date();

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }

    if (arg.startsWith('--from=')) {
      from = parseDate(arg.slice('--from='.length), 'from');
      continue;
    }

    if (arg === '--from' && argv[i + 1]) {
      from = parseDate(argv[i + 1], 'from');
      i += 1;
      continue;
    }

    if (arg.startsWith('--to=')) {
      to = parseDate(arg.slice('--to='.length), 'to');
      continue;
    }

    if (arg === '--to' && argv[i + 1]) {
      to = parseDate(argv[i + 1], 'to');
      i += 1;
      continue;
    }
  }

  if (from > to) {
    throw new Error('`from` must be earlier than or equal to `to`');
  }

  return { dryRun, from, to };
}

async function runDryMode(from: Date, to: Date) {
  const crm = getCrmClient();
  if (!crm) {
    console.log('[backfill-crm-leads] CRM unavailable, count=0');
    return;
  }

  const count = await safeCrmQuery(
    () =>
      crm.crmSubscriber.count({
        where: {
          createdAt: { gte: from, lte: to },
          PEERDB_IS_DELETED: false,
        },
      }),
    0
  );

  console.log(`[backfill-crm-leads] DRY-RUN: would sync ${count ?? 0} subscribers from ${from.toISOString()} to ${to.toISOString()}`);
}

async function main() {
  const prisma = new PrismaClient();
  initLeadSyncPrisma(prisma);

  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.dryRun) {
      await runDryMode(args.from, args.to);
      return;
    }

    const result = await syncLeadsFromCrm({
      mode: 'backfill',
      from: args.from,
      to: args.to,
    });

    if (result === null) {
      console.log('[backfill-crm-leads] skipped: lock not acquired');
      return;
    }

    console.log(
      `[backfill-crm-leads] completed: runId=${result.runId} status=${result.status} scanned=${result.subscribersScanned} created=${result.leadsCreated} updated=${result.leadsUpdated} errors=${result.errors.length}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('[backfill-crm-leads] failed:', error);
  process.exitCode = 1;
});
