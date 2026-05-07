/**
 * Backfill source field for existing CRM-synced leads.
 * Run: npx tsx scripts/backfill-lead-source.ts
 */
import { readFileSync } from 'fs';

// Load env
const envContent = readFileSync('.env', 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2].replace(/^"|"$/g, '');
}

import { PrismaClient } from '@prisma/client';
import { getCrmClient, safeCrmQuery } from '../server/lib/crm-db';

const prisma = new PrismaClient();
const BATCH_SIZE = 200;

async function backfillLeadSource() {
  console.log('[backfill-source] Starting source backfill...\n');

  const crm = getCrmClient();
  if (!crm) {
    console.error('[backfill-source] CRM client not available');
    process.exit(1);
  }

  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  let cursor: string | undefined;

  while (true) {
    // Get batch of leads with NULL source that are synced from CRM
    const leads = await prisma.lead.findMany({
      where: {
        syncedFromCrm: true,
        source: null,
        crmSubscriberId: { not: null },
      },
      select: { id: true, crmSubscriberId: true },
      take: BATCH_SIZE,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
    });

    if (leads.length === 0) break;

    // Get CRM subscriber IDs
    const subIds = leads.map((l) => l.crmSubscriberId!);

    // Query CRM for source values
    const crmRows = await safeCrmQuery(
      () =>
        crm.crmSubscriber.findMany({
          where: { id: { in: subIds } },
          select: { id: true, source: true },
        }),
      [],
    );

    // Build source map
    const sourceMap = new Map<bigint, string | null>();
    for (const row of crmRows ?? []) {
      sourceMap.set(row.id, row.source);
    }

    // Update each lead
    for (const lead of leads) {
      try {
        const crmSource = sourceMap.get(lead.crmSubscriberId!);

        if (crmSource === undefined || crmSource === null) {
          skipped++;
          continue;
        }

        await prisma.lead.update({
          where: { id: lead.id },
          data: { source: crmSource },
        });
        updated++;
      } catch (err) {
        errors++;
        console.error(`[backfill-source] Error updating lead ${lead.id}:`, err);
      }
    }

    processed += leads.length;
    cursor = leads[leads.length - 1].id;

    console.log(`[backfill-source] processed=${processed} updated=${updated} skipped=${skipped} errors=${errors}`);

    // Small delay to avoid overwhelming the DB
    await new Promise((r) => setTimeout(r, 100));
  }

  // Verify final coverage
  const totalSynced = await prisma.lead.count({ where: { syncedFromCrm: true } });
  const nullSource = await prisma.lead.count({ where: { syncedFromCrm: true, source: null } });
  const coverage = (((totalSynced - nullSource) / totalSynced) * 100).toFixed(1);

  console.log(`\n[backfill-source] Backfill complete!`);
  console.log(`  Total synced leads: ${totalSynced}`);
  console.log(`  NULL source remaining: ${nullSource}`);
  console.log(`  Coverage: ${coverage}%`);
  console.log(`\nSummary: processed=${processed} updated=${updated} skipped=${skipped} errors=${errors}`);

  // Show source distribution
  const distribution = await prisma.lead.groupBy({
    by: ['source'],
    where: { syncedFromCrm: true },
    _count: true,
    orderBy: { _count: { source: 'desc' } },
  });

  console.log('\nSource distribution:');
  for (const row of distribution.slice(0, 15)) {
    console.log(`  ${row.source ?? '(null)'}: ${row._count}`);
  }

  await prisma.$disconnect();
  process.exit(0);
}

backfillLeadSource().catch((e) => {
  console.error('[backfill-source] Backfill failed:', e);
  process.exit(1);
});
