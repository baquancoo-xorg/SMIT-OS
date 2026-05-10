/**
 * Orchestrate Meta Ads sync → AdCampaign + AdSpendRecord (normalized layer).
 * Called by daily cron AND on-demand admin trigger.
 *
 * Flow per active FbAdAccountConfig:
 *  1. Decrypt token
 *  2. Fetch campaigns metadata
 *  3. For each campaign, fetch daily insights (date range)
 *  4. Normalize → upsert AdCampaign + AdSpendRecord
 *  5. Log errors to EtlErrorLog
 */
import { prisma } from '../../lib/prisma';
import { getCampaigns, getCampaignInsights } from '../../lib/facebook-api';
import { getDecryptedToken, getActiveAccounts } from '../facebook/fb-token.service';
import { normalizeMetaCampaign } from './meta-ads-normalize';
import { childLogger } from '../../lib/logger';

const log = childLogger('ads-sync');

export interface AdsSyncResult {
  accountId: string;
  success: boolean;
  campaignsProcessed: number;
  spendRowsUpserted: number;
  warnings: string[];
  error?: string;
  durationMs: number;
}

const DEFAULT_LOOKBACK_DAYS = 30;

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function syncMetaAdAccount(
  accountId: string,
  options: { since?: string; until?: string } = {}
): Promise<AdsSyncResult> {
  const t0 = Date.now();
  const since = options.since ?? dateNDaysAgo(DEFAULT_LOOKBACK_DAYS);
  const until = options.until ?? todayUtc();
  const warnings: string[] = [];

  try {
    const token = await getDecryptedToken(accountId);
    if (!token) {
      return {
        accountId,
        success: false,
        campaignsProcessed: 0,
        spendRowsUpserted: 0,
        warnings: [],
        error: 'Token not found / decrypt failed',
        durationMs: Date.now() - t0,
      };
    }

    const account = await prisma.fbAdAccountConfig.findUnique({
      where: { accountId },
      select: { currency: true },
    });
    const currency = account?.currency ?? 'USD';

    const campaignsResult = await getCampaigns(token, accountId);
    if (!campaignsResult.success || !campaignsResult.data) {
      await prisma.etlErrorLog.create({
        data: {
          sourceId: accountId,
          sourceType: 'meta_ads_campaigns',
          errorType: 'api_error',
          errorMessage: campaignsResult.error ?? 'unknown',
        },
      });
      return {
        accountId,
        success: false,
        campaignsProcessed: 0,
        spendRowsUpserted: 0,
        warnings: [],
        error: campaignsResult.error,
        durationMs: Date.now() - t0,
      };
    }

    let campaignsProcessed = 0;
    let spendRowsUpserted = 0;

    for (const campaign of campaignsResult.data) {
      try {
        const insightsResult = await getCampaignInsights(token, campaign.id, since, until);
        if (!insightsResult.success || !insightsResult.data) {
          warnings.push(`campaign ${campaign.id}: ${insightsResult.error ?? 'no insights'}`);
          await prisma.etlErrorLog.create({
            data: {
              sourceId: accountId,
              sourceType: 'meta_ads_insights',
              errorType: 'api_error',
              errorMessage: insightsResult.error ?? 'no insights',
              errorDetails: { campaignId: campaign.id, since, until },
            },
          });
          continue;
        }

        const result = await normalizeMetaCampaign({
          campaign,
          insightDays: insightsResult.data,
          currency,
        });
        campaignsProcessed += result.campaignsUpserted;
        spendRowsUpserted += result.spendRowsUpserted;
        warnings.push(...result.warnings);

        // Light rate-limit pacing: 250ms between campaigns
        await new Promise((r) => setTimeout(r, 250));
      } catch (campaignErr) {
        warnings.push(`campaign ${campaign.id}: ${(campaignErr as Error).message}`);
      }
    }

    log.info(
      {
        accountId,
        campaignsProcessed,
        spendRowsUpserted,
        warningCount: warnings.length,
        durationMs: Date.now() - t0,
      },
      'meta-ads-sync done'
    );

    return {
      accountId,
      success: true,
      campaignsProcessed,
      spendRowsUpserted,
      warnings,
      durationMs: Date.now() - t0,
    };
  } catch (err) {
    log.error({ err, accountId }, 'meta-ads-sync failed');
    await prisma.etlErrorLog.create({
      data: {
        sourceId: accountId,
        sourceType: 'meta_ads_sync',
        errorType: 'sync_error',
        errorMessage: (err as Error).message,
      },
    });
    return {
      accountId,
      success: false,
      campaignsProcessed: 0,
      spendRowsUpserted: 0,
      warnings,
      error: (err as Error).message,
      durationMs: Date.now() - t0,
    };
  }
}

/**
 * Sync ads for all active accounts.
 */
export async function syncAllMetaAccounts(): Promise<AdsSyncResult[]> {
  const accounts = await getActiveAccounts();
  log.info({ accountCount: accounts.length }, 'starting full meta-ads-sync');
  const results: AdsSyncResult[] = [];
  for (const account of accounts) {
    const result = await syncMetaAdAccount(account.accountId);
    results.push(result);
  }
  return results;
}
