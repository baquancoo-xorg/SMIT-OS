/**
 * Backfill leadType for existing CRM-synced leads based on phone number.
 * Run: npx tsx scripts/backfill-lead-type.ts
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
import { deriveLeadType } from '../server/services/lead-sync/derive-lead-type';

const prisma = new PrismaClient();

async function backfillLeadType() {
  console.log('Starting leadType backfill...');

  // Get all CRM-synced leads
  const leads = await prisma.lead.findMany({
    where: { syncedFromCrm: true },
    select: { id: true, crmSubscriberId: true, leadType: true },
  });

  console.log(`Found ${leads.length} CRM-synced leads`);

  // Get unique subscriber IDs
  const subIds = [...new Set(leads.map((l) => l.crmSubscriberId).filter((id): id is bigint => id !== null))];
  console.log(`Unique subscriber IDs: ${subIds.length}`);

  // Load phone numbers from CRM
  const crm = getCrmClient();
  if (!crm) {
    console.error('CRM client not available');
    process.exit(1);
  }

  const phoneMap = new Map<bigint, string | null>();
  const BATCH_SIZE = 100;

  for (let i = 0; i < subIds.length; i += BATCH_SIZE) {
    const batch = subIds.slice(i, i + BATCH_SIZE);
    const rows = await safeCrmQuery(
      () =>
        crm.crmSubscriber.findMany({
          where: { id: { in: batch } },
          select: { id: true, phone: true },
        }),
      [],
    );

    for (const row of rows ?? []) {
      phoneMap.set(row.id, row.phone);
    }

    if ((i + BATCH_SIZE) % 500 === 0) {
      console.log(`  Loaded phones: ${Math.min(i + BATCH_SIZE, subIds.length)}/${subIds.length}`);
    }
  }

  console.log(`Phone numbers loaded: ${phoneMap.size}`);

  // Update leads
  let updated = 0;
  let unchanged = 0;
  const countryCounts: Record<string, number> = {};

  for (const lead of leads) {
    if (!lead.crmSubscriberId) continue;

    const phone = phoneMap.get(lead.crmSubscriberId);
    const newLeadType = deriveLeadType(phone);

    countryCounts[newLeadType] = (countryCounts[newLeadType] ?? 0) + 1;

    if (lead.leadType !== newLeadType) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { leadType: newLeadType },
      });
      updated++;
      if (updated <= 10) {
        console.log(`  Updated: SubId ${lead.crmSubscriberId} | ${lead.leadType ?? 'null'} -> ${newLeadType}`);
      }
    } else {
      unchanged++;
    }
  }

  console.log(`\nBackfill complete!`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Unchanged: ${unchanged}`);
  console.log(`\nCountry distribution:`);

  const sorted = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
  for (const [country, count] of sorted) {
    console.log(`  ${country}: ${count}`);
  }

  await prisma.$disconnect();
  process.exit(0);
}

backfillLeadType().catch((e) => {
  console.error('Backfill failed:', e);
  process.exit(1);
});
