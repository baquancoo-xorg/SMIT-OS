/**
 * Seed dev data cho Acquisition tracking.
 * - Cleans up the old mock Meta campaign so Ads relies on real data only.
 *
 * Media seed dropped — Media schema now pulls from FB Graph API (cron + Refresh).
 * To seed Media data dev, create a SocialChannel via /integrations admin UI.
 *
 * Idempotent qua cleanup + optional upsert key. Run: `npx tsx prisma/seeds/acquisition.seed.ts`
 */
import { PrismaClient, AdPlatform } from '@prisma/client';

const prisma = new PrismaClient();

const META_CAMPAIGN_EXTERNAL_ID = 'seed_meta_summer_2026';

async function cleanupMockAdCampaign() {
  const campaign = await prisma.adCampaign.findUnique({
    where: {
      platform_externalId: {
        platform: AdPlatform.META,
        externalId: META_CAMPAIGN_EXTERNAL_ID,
      },
    },
  });

  if (!campaign) {
    return null;
  }

  await prisma.adSpendRecord.deleteMany({ where: { campaignId: campaign.id } });
  await prisma.adCampaign.delete({ where: { id: campaign.id } });
  return campaign;
}

async function main() {
  const deleted = await cleanupMockAdCampaign();

  console.log('[acquisition.seed] done.');
  if (deleted) {
    console.log(`  Removed mock AdCampaign: ${deleted.name} (utm=${deleted.utmCampaign ?? '—'})`);
  } else {
    console.log('  No mock AdCampaign found.');
  }
}

main()
  .catch((error) => {
    console.error('[acquisition.seed] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
