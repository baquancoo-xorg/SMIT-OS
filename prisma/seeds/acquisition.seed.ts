/**
 * Seed dev data cho Phase 2 Acquisition tracking.
 * - 1 AdCampaign Meta + 7 AdSpendRecord (last 7 days)
 * - 5 MediaPost: 2 ORGANIC (FB+IG), 1 KOL, 1 KOC, 1 PR
 *
 * Idempotent qua upsert key. Run: `npx tsx prisma/seeds/acquisition.seed.ts`
 */
import { PrismaClient, AdPlatform, MediaPlatform, MediaPostType } from '@prisma/client';

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

async function seedMediaPosts() {
  const posts = [
    {
      platform: MediaPlatform.FACEBOOK,
      type: MediaPostType.ORGANIC,
      externalId: 'seed_fb_post_1',
      url: 'https://facebook.com/smitx/posts/seed1',
      title: 'Ra mắt module mới - team feedback',
      reach: 12_300,
      engagement: 412,
      utmCampaign: UTM_CAMPAIGN,
      cost: null,
      meta: { source: 'seed' },
    },
    {
      platform: MediaPlatform.INSTAGRAM,
      type: MediaPostType.ORGANIC,
      externalId: 'seed_ig_post_1',
      url: 'https://instagram.com/p/seed1',
      title: 'Behind the scenes office',
      reach: 5_400,
      engagement: 232,
      utmCampaign: null,
      cost: null,
      meta: { source: 'seed' },
    },
    {
      platform: MediaPlatform.FACEBOOK,
      type: MediaPostType.KOL,
      externalId: null,
      url: 'https://facebook.com/kol-handle/posts/seed-kol',
      title: 'KOL review SMIT OS',
      reach: 28_000,
      engagement: 1_240,
      utmCampaign: UTM_CAMPAIGN,
      cost: 5_000_000, // 5M VND
      meta: { kolName: 'KOL Demo', deliverable: '1 post + 3 stories', source: 'seed' },
    },
    {
      platform: MediaPlatform.INSTAGRAM,
      type: MediaPostType.KOC,
      externalId: null,
      url: 'https://instagram.com/koc-handle/p/seed-koc',
      title: 'KOC trải nghiệm SMIT OS',
      reach: 8_500,
      engagement: 480,
      utmCampaign: null,
      cost: 1_500_000,
      meta: { kocName: 'KOC Demo', source: 'seed' },
    },
    {
      platform: MediaPlatform.PR,
      type: MediaPostType.PR,
      externalId: null,
      url: 'https://example-news.vn/seed-pr',
      title: 'SMIT OS được giới thiệu trên báo công nghệ',
      reach: 45_000,
      engagement: 0,
      utmCampaign: null,
      cost: 8_000_000,
      meta: { outlet: 'Example News', sentiment: 'positive', source: 'seed' },
    },
  ] as const;

  for (const post of posts) {
    // Idempotent on (platform, url) via deleteMany + create (no unique on these fields).
    await prisma.mediaPost.deleteMany({
      where: {
        platform: post.platform,
        url: post.url,
      },
    });
    await prisma.mediaPost.create({
      data: {
        platform: post.platform,
        type: post.type,
        externalId: post.externalId,
        url: post.url,
        title: post.title,
        publishedAt: daysAgo(Math.floor(Math.random() * 14)),
        reach: post.reach,
        engagement: post.engagement,
        utmCampaign: post.utmCampaign,
        cost: post.cost ?? null,
        meta: post.meta,
      },
    });
  }
}

async function main() {
  const campaign = await seedAdCampaign();
  await seedMediaPosts();

  const totalSpend = await prisma.adSpendRecord.aggregate({
    where: { campaignId: campaign.id },
    _sum: { spend: true },
  });
  const mediaCount = await prisma.mediaPost.count();

  console.log('[acquisition.seed] done.');
  console.log(`  AdCampaign: ${campaign.name} (utm=${campaign.utmCampaign})`);
  console.log(`  AdSpendRecord total spend (7d): ${totalSpend._sum.spend?.toString() ?? 0}`);
  console.log(`  MediaPost count: ${mediaCount}`);
}

main()
  .catch((error) => {
    console.error('[acquisition.seed] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
