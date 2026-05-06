/**
 * Backfill AE for existing CRM-synced leads using crm_employee_supervisor mapping.
 * Run: npx tsx scripts/backfill-ae.ts
 */
import { readFileSync } from 'fs';

// Load env
const envContent = readFileSync('.env', 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2].replace(/^"|"$/g, '');
}

import { PrismaClient } from '@prisma/client';
import { loadAeMapBySubscriber } from '../server/services/lead-sync/employee-mapper';

const prisma = new PrismaClient();

async function backfillAe() {
  console.log('Starting AE backfill...');

  // Get all CRM-synced leads
  const leads = await prisma.lead.findMany({
    where: { syncedFromCrm: true },
    select: { id: true, crmSubscriberId: true, ae: true },
  });

  console.log(`Found ${leads.length} CRM-synced leads`);

  // Get unique subscriber IDs
  const subIds = [...new Set(leads.map((l) => l.crmSubscriberId).filter((id): id is bigint => id !== null))];
  console.log(`Unique subscriber IDs: ${subIds.length}`);

  // Load AE mapping
  const aeMap = await loadAeMapBySubscriber(subIds);
  console.log(`AE mappings loaded: ${aeMap.size}`);

  // Update leads
  let updated = 0;
  let unchanged = 0;

  for (const lead of leads) {
    if (!lead.crmSubscriberId) continue;

    const mapping = aeMap.get(lead.crmSubscriberId);
    const newAe = mapping?.fullName ?? 'Unmapped';

    if (lead.ae !== newAe) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { ae: newAe },
      });
      updated++;
      if (updated <= 10) {
        console.log(`  Updated: SubId ${lead.crmSubscriberId} | ${lead.ae} -> ${newAe}`);
      }
    } else {
      unchanged++;
    }
  }

  console.log(`\nBackfill complete!`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Unchanged: ${unchanged}`);

  await prisma.$disconnect();
  process.exit(0);
}

backfillAe().catch((e) => {
  console.error('Backfill failed:', e);
  process.exit(1);
});
