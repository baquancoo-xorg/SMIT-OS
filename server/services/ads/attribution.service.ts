/**
 * Attribution: join Lead.source ↔ AdCampaign.utmCampaign (case-insensitive trim).
 *
 * Used by Ads Tracker UI:
 *  - getCampaignAttribution(campaignId) → leads + CPL + ROAS
 *  - getAttributionSummary(dateRange)   → aggregate per campaign (single-fetch, Map lookup)
 *
 * All money is normalized to VND via `currency-helper.ts` so mixed-currency accounts don't
 * silently sum across currencies (USD ad accounts × VND ad accounts).
 */
import { prisma } from '../../lib/prisma';
import { spendInVnd, getCachedVndRate } from './currency-helper';

function normalizeKey(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

export interface CampaignAttribution {
  campaignId: string;
  campaignName: string;
  utmCampaign: string | null;
  spendTotal: number;
  currency: string; // most common currency among the spend rows
  leadCount: number;
  qualifiedCount: number;
  cpl: number | null; // null when no leads
  leadIds: string[];
}

/**
 * Aggregate spend + lead count for a single AdCampaign over a date range.
 */
function leadDateWhere(dateRange?: { from?: Date; to?: Date }) {
  if (!dateRange?.from && !dateRange?.to) return {};
  return {
    receivedDate: {
      ...(dateRange?.from ? { gte: dateRange.from } : {}),
      ...(dateRange?.to ? { lte: dateRange.to } : {}),
    },
  };
}

export async function getCampaignAttribution(
  campaignId: string,
  dateRange?: { from?: Date; to?: Date }
): Promise<CampaignAttribution | null> {
  const campaign = await prisma.adCampaign.findUnique({
    where: { id: campaignId },
    include: {
      spendRecords: {
        where:
          dateRange?.from || dateRange?.to
            ? {
                date: {
                  ...(dateRange?.from ? { gte: dateRange.from } : {}),
                  ...(dateRange?.to ? { lte: dateRange.to } : {}),
                },
              }
            : undefined,
      },
    },
  });
  if (!campaign) return null;

  const rate = await getCachedVndRate();
  const spendTotal = campaign.spendRecords.reduce(
    (sum, r) => sum + spendInVnd(Number(r.spend), r.currency, rate),
    0
  );
  // Spend is normalized to VND; report VND consistently.
  const currency = 'VND';

  let leadIds: string[] = [];
  let qualifiedCount = 0;
  if (campaign.utmCampaign) {
    const target = normalizeKey(campaign.utmCampaign);
    const leads = await prisma.lead.findMany({
      where: { source: { not: null }, ...leadDateWhere(dateRange) },
      select: { id: true, source: true, status: true },
    });
    const matched = leads.filter((l) => normalizeKey(l.source) === target);
    leadIds = matched.map((l) => l.id);
    qualifiedCount = matched.filter((l) => l.status === 'Qualified').length;
  }

  const cpl = leadIds.length > 0 ? spendTotal / leadIds.length : null;

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    utmCampaign: campaign.utmCampaign,
    spendTotal,
    currency,
    leadCount: leadIds.length,
    qualifiedCount,
    cpl,
    leadIds,
  };
}

/**
 * Single-fetch + Map lookup version (avoids N+1).
 *  1 campaign query (with spend records) + 1 lead query → bucket by utm in JS.
 */
export async function getAttributionSummary(
  dateRange?: { from?: Date; to?: Date }
): Promise<CampaignAttribution[]> {
  const campaigns = await prisma.adCampaign.findMany({
    include: {
      spendRecords: {
        where:
          dateRange?.from || dateRange?.to
            ? {
                date: {
                  ...(dateRange?.from ? { gte: dateRange.from } : {}),
                  ...(dateRange?.to ? { lte: dateRange.to } : {}),
                },
              }
            : undefined,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const leads = await prisma.lead.findMany({
    where: { source: { not: null }, ...leadDateWhere(dateRange) },
    select: { id: true, source: true, status: true },
  });

  // Bucket leads by normalized utm key — single pass.
  const leadsByUtm = new Map<string, { id: string; status: string | null }[]>();
  for (const lead of leads) {
    const key = normalizeKey(lead.source);
    if (!key) continue;
    const bucket = leadsByUtm.get(key) ?? [];
    bucket.push({ id: lead.id, status: lead.status });
    leadsByUtm.set(key, bucket);
  }

  const rate = await getCachedVndRate();

  return campaigns.map((c) => {
    const spendTotal = c.spendRecords.reduce(
      (sum, r) => sum + spendInVnd(Number(r.spend), r.currency, rate),
      0
    );
    const utmKey = c.utmCampaign ? normalizeKey(c.utmCampaign) : null;
    const matched = utmKey ? leadsByUtm.get(utmKey) ?? [] : [];
    const leadIds = matched.map((m) => m.id);
    const qualifiedCount = matched.filter((m) => m.status === 'Qualified').length;
    const cpl = leadIds.length > 0 ? spendTotal / leadIds.length : null;
    return {
      campaignId: c.id,
      campaignName: c.name,
      utmCampaign: c.utmCampaign,
      spendTotal,
      currency: 'VND',
      leadCount: leadIds.length,
      qualifiedCount,
      cpl,
      leadIds,
    };
  });
}

/**
 * Lead.source values that don't match any campaign utmCampaign — surfaced as warnings.
 */
export async function getUnmatchedLeadSources(
  dateRange?: { from?: Date; to?: Date }
): Promise<{ source: string; count: number }[]> {
  const leads = await prisma.lead.findMany({
    where: {
      source: { not: null },
      ...(dateRange?.from ? { receivedDate: { gte: dateRange.from } } : {}),
      ...(dateRange?.to
        ? { receivedDate: { ...(dateRange?.from ? { gte: dateRange.from } : {}), lte: dateRange.to } }
        : {}),
    },
    select: { source: true },
  });

  const campaignsUtm = await prisma.adCampaign.findMany({
    where: { utmCampaign: { not: null } },
    select: { utmCampaign: true },
  });
  const knownUtmSet = new Set(campaignsUtm.map((c) => normalizeKey(c.utmCampaign)));

  const counter = new Map<string, number>();
  leads.forEach((l) => {
    const key = normalizeKey(l.source);
    if (!key) return;
    if (!knownUtmSet.has(key) && l.source) {
      counter.set(l.source, (counter.get(l.source) ?? 0) + 1);
    }
  });

  return Array.from(counter.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}
