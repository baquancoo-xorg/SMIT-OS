/**
 * Normalize Meta Ads raw data → AdCampaign + AdSpendRecord rows.
 *
 * - UTM extraction: tries campaign name suffix (e.g. "Summer Sale [utm:summer_sale_2026]")
 *   then falls back to looking up first matching `RawAdsFacebook.utmCampaign` for the campaign.
 * - Currency normalization: spend value coming from Meta is in account currency; we keep
 *   raw value + store account currency on `AdSpendRecord.currency`. UI/dashboard converts to VND
 *   via `ExchangeRateSetting` (pattern reused from `overview-ad-spend.ts`).
 */
import { AdPlatform, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import {
  type FbCampaign,
  type FbCampaignInsightDay,
  extractConversionCount,
} from '../../lib/facebook-api';

const UTM_REGEX = /\[utm:([^\]]+)\]/i;

export function extractUtmCampaign(campaignName: string | null | undefined): string | null {
  if (!campaignName) return null;
  const m = campaignName.match(UTM_REGEX);
  return m?.[1]?.trim() ?? null;
}

/**
 * Fallback: look up most-frequent `utm_campaign` from raw_ads_facebook for this campaign.
 * Returns null if no rows have utm.
 */
export async function lookupUtmFromRawAds(campaignExternalId: string): Promise<string | null> {
  const rows = await prisma.rawAdsFacebook.findMany({
    where: { campaignId: campaignExternalId, utmCampaign: { not: null } },
    select: { utmCampaign: true },
    take: 50,
  });
  if (rows.length === 0) return null;
  // Pick the most common non-null value.
  const counter = new Map<string, number>();
  rows.forEach((r) => {
    if (!r.utmCampaign) return;
    counter.set(r.utmCampaign, (counter.get(r.utmCampaign) ?? 0) + 1);
  });
  let best: { value: string; count: number } | null = null;
  counter.forEach((count, value) => {
    if (!best || count > best.count) best = { value, count };
  });
  return best ? (best as { value: string; count: number }).value : null;
}

export async function upsertAdCampaign(input: {
  platform: AdPlatform;
  externalId: string;
  name: string;
  status: string;
  startedAt: Date | null;
  endedAt: Date | null;
  utmCampaign: string | null;
  meta?: Prisma.InputJsonValue;
}) {
  return prisma.adCampaign.upsert({
    where: {
      platform_externalId: {
        platform: input.platform,
        externalId: input.externalId,
      },
    },
    create: {
      platform: input.platform,
      externalId: input.externalId,
      name: input.name,
      utmCampaign: input.utmCampaign,
      status: input.status,
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      meta: input.meta,
    },
    update: {
      name: input.name,
      utmCampaign: input.utmCampaign,
      status: input.status,
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      meta: input.meta,
    },
  });
}

export async function upsertSpendRecord(input: {
  campaignId: string;
  date: Date;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  currency: string;
}) {
  return prisma.adSpendRecord.upsert({
    where: { campaignId_date: { campaignId: input.campaignId, date: input.date } },
    create: input,
    update: {
      spend: input.spend,
      impressions: input.impressions,
      clicks: input.clicks,
      conversions: input.conversions,
      currency: input.currency,
    },
  });
}

export interface NormalizeResult {
  campaignsUpserted: number;
  spendRowsUpserted: number;
  warnings: string[];
}

/**
 * Normalize a single Meta campaign + its insight days into our normalized models.
 */
export async function normalizeMetaCampaign(args: {
  campaign: FbCampaign;
  insightDays: FbCampaignInsightDay[];
  currency: string;
}): Promise<NormalizeResult> {
  const warnings: string[] = [];
  const utmFromName = extractUtmCampaign(args.campaign.name);
  const utmFallback = utmFromName ?? (await lookupUtmFromRawAds(args.campaign.id));

  if (!utmFallback) {
    warnings.push(`No utm_campaign for "${args.campaign.name}" (${args.campaign.id})`);
  }

  const adCampaign = await upsertAdCampaign({
    platform: AdPlatform.META,
    externalId: args.campaign.id,
    name: args.campaign.name,
    status: (args.campaign.effective_status ?? args.campaign.status ?? 'UNKNOWN').toUpperCase(),
    startedAt: args.campaign.start_time ? new Date(args.campaign.start_time) : null,
    endedAt: args.campaign.stop_time ? new Date(args.campaign.stop_time) : null,
    utmCampaign: utmFallback,
    meta: { objective: args.campaign.objective ?? null },
  });

  let spendRowsUpserted = 0;
  for (const day of args.insightDays) {
    const date = new Date(day.date_start);
    date.setUTCHours(0, 0, 0, 0);
    await upsertSpendRecord({
      campaignId: adCampaign.id,
      date,
      spend: day.spend ? Number(day.spend) : 0,
      impressions: day.impressions ? Number(day.impressions) : 0,
      clicks: day.clicks ? Number(day.clicks) : 0,
      conversions: extractConversionCount(day.actions),
      currency: args.currency,
    });
    spendRowsUpserted++;
  }

  return { campaignsUpserted: 1, spendRowsUpserted, warnings };
}
