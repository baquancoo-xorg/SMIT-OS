/**
 * Ads Tracker API — read-shared/write-admin pattern (matches role-simplification plan).
 *  GET  /api/ads-tracker/campaigns         → all campaigns + summary spend
 *  GET  /api/ads-tracker/campaigns/:id     → single campaign + daily spend trend
 *  GET  /api/ads-tracker/attribution       → attribution summary (campaigns + lead match)
 *  GET  /api/ads-tracker/attribution/unmatched → leads whose UTM doesn't match any campaign
 *  POST /api/ads-tracker/sync              → admin-only manual sync (Meta)
 */
import { Router } from 'express';
import { syncAllMetaAccounts, syncMetaAdAccount } from '../services/ads/ads-sync.service';
import {
  getAttributionSummary,
  getCampaignAttribution,
  getUnmatchedLeadSources,
} from '../services/ads/attribution.service';
import { spendInVnd, getCachedVndRate } from '../services/ads/currency-helper';
import { prisma } from '../lib/prisma';

// In-memory mutex for /sync (admin can double-click).
let syncInFlight: Promise<unknown> | null = null;
let syncStartedAt = 0;

function parseDateRange(req: any): { from?: Date; to?: Date } {
  const range: { from?: Date; to?: Date } = {};
  if (req.query?.from) range.from = new Date(String(req.query.from));
  if (req.query?.to) range.to = new Date(String(req.query.to));
  return range;
}

function ok(data: unknown) {
  return { success: true, data, timestamp: new Date().toISOString() };
}
function fail(error: string, status = 400) {
  return { status, body: { success: false, data: null, error, timestamp: new Date().toISOString() } };
}

export function createAdsTrackerRoutes() {
  const router = Router();

  // GET /api/ads-tracker/campaigns
  router.get('/campaigns', async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const campaigns = await prisma.adCampaign.findMany({
        include: {
          spendRecords: {
            where:
              from || to
                ? {
                    date: {
                      ...(from ? { gte: from } : {}),
                      ...(to ? { lte: to } : {}),
                    },
                  }
                : undefined,
            orderBy: { date: 'asc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      const rate = await getCachedVndRate();
      const summary = campaigns.map((c) => {
        const spend = c.spendRecords.reduce(
          (s, r) => s + spendInVnd(Number(r.spend), r.currency, rate),
          0
        );
        const impressions = c.spendRecords.reduce((s, r) => s + r.impressions, 0);
        const clicks = c.spendRecords.reduce((s, r) => s + r.clicks, 0);
        const conversions = c.spendRecords.reduce((s, r) => s + r.conversions, 0);
        return {
          id: c.id,
          platform: c.platform,
          externalId: c.externalId,
          name: c.name,
          status: c.status,
          utmCampaign: c.utmCampaign,
          startedAt: c.startedAt,
          endedAt: c.endedAt,
          spendTotal: spend,
          impressions,
          clicks,
          conversions,
          currency: 'VND', // normalized
          ctr: impressions > 0 ? clicks / impressions : 0,
        };
      });

      res.json(ok({ campaigns: summary }));
    } catch (err) {
      const e = fail((err as Error).message, 500);
      res.status(e.status).json(e.body);
    }
  });

  // GET /api/ads-tracker/campaigns/:id
  router.get('/campaigns/:id', async (req, res) => {
    try {
      const campaign = await prisma.adCampaign.findUnique({
        where: { id: req.params.id },
        include: { spendRecords: { orderBy: { date: 'asc' } } },
      });
      if (!campaign) {
        const e = fail('Campaign not found', 404);
        return res.status(e.status).json(e.body);
      }
      const dailySpend = campaign.spendRecords.map((r) => ({
        date: r.date.toISOString().slice(0, 10),
        spend: Number(r.spend),
        impressions: r.impressions,
        clicks: r.clicks,
        conversions: r.conversions,
        currency: r.currency,
      }));
      res.json(
        ok({
          campaign: {
            id: campaign.id,
            platform: campaign.platform,
            externalId: campaign.externalId,
            name: campaign.name,
            status: campaign.status,
            utmCampaign: campaign.utmCampaign,
            startedAt: campaign.startedAt,
            endedAt: campaign.endedAt,
            meta: campaign.meta,
          },
          dailySpend,
        })
      );
    } catch (err) {
      const e = fail((err as Error).message, 500);
      res.status(e.status).json(e.body);
    }
  });

  // GET /api/ads-tracker/attribution
  router.get('/attribution', async (req, res) => {
    try {
      const summary = await getAttributionSummary(parseDateRange(req));
      res.json(ok({ campaigns: summary }));
    } catch (err) {
      const e = fail((err as Error).message, 500);
      res.status(e.status).json(e.body);
    }
  });

  // GET /api/ads-tracker/attribution/unmatched
  router.get('/attribution/unmatched', async (req, res) => {
    try {
      const unmatched = await getUnmatchedLeadSources(parseDateRange(req));
      res.json(ok({ unmatched }));
    } catch (err) {
      const e = fail((err as Error).message, 500);
      res.status(e.status).json(e.body);
    }
  });

  // GET /api/ads-tracker/attribution/:campaignId  → single campaign
  router.get('/attribution/campaign/:campaignId', async (req, res) => {
    try {
      const result = await getCampaignAttribution(req.params.campaignId, parseDateRange(req));
      if (!result) {
        const e = fail('Campaign not found', 404);
        return res.status(e.status).json(e.body);
      }
      res.json(ok(result));
    } catch (err) {
      const e = fail((err as Error).message, 500);
      res.status(e.status).json(e.body);
    }
  });

  // POST /api/ads-tracker/sync — admin-only manual trigger.
  // Idempotency: returns 409 if a sync is already running (prevents Meta API hammer on double-click).
  router.post('/sync', async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        const e = fail('Admin access required', 403);
        return res.status(e.status).json(e.body);
      }
      if (syncInFlight) {
        const elapsedSec = Math.floor((Date.now() - syncStartedAt) / 1000);
        const e = fail(`Sync already running (${elapsedSec}s elapsed) — please wait`, 409);
        return res.status(e.status).json(e.body);
      }
      const accountId = req.body?.accountId as string | undefined;

      syncStartedAt = Date.now();
      syncInFlight = (accountId ? syncMetaAdAccount(accountId) : syncAllMetaAccounts()).finally(() => {
        syncInFlight = null;
      });

      res.status(202).json(ok({ accepted: true, accountId: accountId ?? 'all' }));
    } catch (err) {
      const e = fail((err as Error).message, 500);
      res.status(e.status).json(e.body);
    }
  });

  return router;
}
