/**
 * Seed dev data cho Acquisition tracking.
 * - 1 AdCampaign Meta + 7 AdSpendRecord (last 7 days)
 *
 * Media seed dropped — Media schema now pulls from FB Graph API (cron + Refresh).
 * To seed Media data dev, create a SocialChannel via /integrations admin UI.
 *
 * Idempotent qua upsert key. Run: `npx tsx prisma/seeds/acquisition.seed.ts`
 */
import { PrismaClient, AdPlatform } from '@prisma/client';

const prisma = new PrismaClient();

const META_CAMPAIGN_EXTERNAL_ID = 'seed_meta_summer_2026';
const UTM_CAMPAIGN = 'summer_sale_2026';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

async function seedAdCampaign() {
  const campaign = await prisma.adCampaign.upsert({
    where: {
      platform_externalId: {
        platform: AdPlatform.META,
        externalId: META_CAMPAIGN_EXTERNAL_ID,
      },
    },
    update: {
      name: 'Summer Sale 2026 (seed)',
      utmCampaign: UTM_CAMPAIGN,
      status: 'ACTIVE',
    },
    create: {
      platform: AdPlatform.META,
      externalId: META_CAMPAIGN_EXTERNAL_ID,
      name: 'Summer Sale 2026 (seed)',
      utmCampaign: UTM_CAMPAIGN,
      status: 'ACTIVE',
      startedAt: daysAgo(7),
      meta: { objective: 'CONVERSIONS', source: 'seed' },
    },
  });

  // 7 spend records (1 per day, last 7 days)
  for (let i = 0; i < 7; i++) {
    const date = daysAgo(i);
    const spend = 500_000 + Math.floor(Math.random() * 1_000_000); // 0.5–1.5M VND
    const impressions = 8_000 + Math.floor(Math.random() * 12_000);
    const clicks = Math.floor(impressions * (0.015 + Math.random() * 0.025));
    const conversions = Math.floor(clicks * (0.04 + Math.random() * 0.06));

    await prisma.adSpendRecord.upsert({
      where: {
        campaignId_date: { campaignId: campaign.id, date },
      },
      update: { spend, impressions, clicks, conversions },
      create: {
        campaignId: campaign.id,
        date,
        spend,
        impressions,
        clicks,
        conversions,
        currency: 'VND',
      },
    });
  }

  return campaign;
}

async function main() {
  const campaign = await seedAdCampaign();

  const totalSpend = await prisma.adSpendRecord.aggregate({
    where: { campaignId: campaign.id },
    _sum: { spend: true },
  });

  console.log('[acquisition.seed] done.');
  console.log(`  AdCampaign: ${campaign.name} (utm=${campaign.utmCampaign})`);
  console.log(`  AdSpendRecord total spend (7d): ${totalSpend._sum.spend?.toString() ?? 0}`);
}

main()
  .catch((error) => {
    console.error('[acquisition.seed] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
