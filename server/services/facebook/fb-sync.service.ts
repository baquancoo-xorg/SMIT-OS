import { PrismaClient } from '@prisma/client';
import { fetchInsights, parseInsightRow } from '../../lib/facebook-api';
import { getDecryptedToken } from './fb-token.service';

const prisma = new PrismaClient();
const MAX_DAYS_PER_CHUNK = 30;

export interface FbSyncResult {
  accountId: string;
  success: boolean;
  rowsInserted: number;
  rowsUpdated: number;
  error?: string;
  duration: number;
}

export function splitDateRange(start: string, end: string) {
  const chunks: { start: string; end: string }[] = [];
  const s = new Date(start);
  const e = new Date(end);
  let cs = new Date(s);
  while (cs <= e) {
    const ce = new Date(cs);
    ce.setDate(ce.getDate() + MAX_DAYS_PER_CHUNK - 1);
    if (ce > e) ce.setTime(e.getTime());
    chunks.push({
      start: cs.toISOString().slice(0, 10),
      end: ce.toISOString().slice(0, 10),
    });
    cs = new Date(ce);
    cs.setDate(cs.getDate() + 1);
  }
  return chunks;
}

export async function syncFbAdAccount(
  accountId: string,
  dateStart: string,
  dateEnd: string
): Promise<FbSyncResult> {
  const t0 = Date.now();
  let rowsInserted = 0;

  try {
    const token = await getDecryptedToken(accountId);
    if (!token) {
      return {
        accountId,
        success: false,
        rowsInserted: 0,
        rowsUpdated: 0,
        error: 'Token not found',
        duration: Date.now() - t0,
      };
    }

    const chunks = splitDateRange(dateStart, dateEnd);
    for (const c of chunks) {
      const result = await fetchInsights(token, accountId, c.start, c.end);
      if (!result.success || !result.data) {
        await prisma.etlErrorLog.create({
          data: {
            sourceId: accountId,
            sourceType: 'fb_ads',
            errorType: 'api_error',
            errorMessage: result.error ?? 'unknown',
            errorDetails: { dateStart: c.start, dateEnd: c.end },
          },
        });
        continue;
      }

      const rows = result.data.map((r) => {
        const p = parseInsightRow(r);
        return {
          accountId,
          dateStart: p.dateStart,
          adId: p.adId ?? '',
          adName: p.adName,
          adsetId: p.adsetId,
          adsetName: p.adsetName,
          campaignId: p.campaignId,
          campaignName: p.campaignName,
          campaignObjective: p.campaignObjective,
          spend: p.spend,
          impressions: p.impressions,
          reach: p.reach,
          clicks: p.clicks,
          ctr: p.ctr,
          cpm: p.cpm,
          cpc: p.cpc,
          frequency: p.frequency,
          actions: p.actions ? JSON.parse(JSON.stringify(p.actions)) : undefined,
          conversions: p.conversions ? JSON.parse(JSON.stringify(p.conversions)) : undefined,
          videoViews: p.videoViews ? JSON.parse(JSON.stringify(p.videoViews)) : undefined,
          videoPlayCount: p.videoPlayCount,
          videoThruplayCount: p.videoThruplayCount,
          insightsRaw: JSON.parse(JSON.stringify(r)),
        };
      });

      await prisma.$transaction(
        rows.map((d) =>
          prisma.rawAdsFacebook.upsert({
            where: {
              accountId_dateStart_adId: {
                accountId: d.accountId,
                dateStart: d.dateStart,
                adId: d.adId,
              },
            },
            update: { ...d, syncedAt: new Date() },
            create: { ...d, syncedAt: new Date() },
          })
        )
      );
      rowsInserted += rows.length;

      if (chunks.indexOf(c) < chunks.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    await prisma.fbAdAccountConfig.update({
      where: { accountId },
      data: { lastSyncAt: new Date(), lastSyncStatus: 'success' },
    });

    return {
      accountId,
      success: true,
      rowsInserted,
      rowsUpdated: 0,
      duration: Date.now() - t0,
    };
  } catch (err) {
    await prisma.etlErrorLog.create({
      data: {
        sourceId: accountId,
        sourceType: 'fb_ads',
        errorType: 'sync_error',
        errorMessage: (err as Error).message,
      },
    });
    await prisma.fbAdAccountConfig
      .update({
        where: { accountId },
        data: { lastSyncAt: new Date(), lastSyncStatus: 'failed' },
      })
      .catch(() => {});

    return {
      accountId,
      success: false,
      rowsInserted,
      rowsUpdated: 0,
      error: (err as Error).message,
      duration: Date.now() - t0,
    };
  }
}
