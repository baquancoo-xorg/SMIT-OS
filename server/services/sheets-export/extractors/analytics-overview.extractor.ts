import { ExtractorContext, Extractor } from './types';
import { SheetData } from '../../../types/sheets-export.types';

export const analyticsOverviewRealtime: Extractor = async (ctx): Promise<SheetData> => {
  // Get last 30 days of Facebook ads data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const rawAds = await ctx.prisma.rawAdsFacebook.findMany({
    where: { dateStart: { gte: thirtyDaysAgo } },
    orderBy: { dateStart: 'desc' },
  });

  // Aggregate by date
  const byDate = new Map<string, { spend: number; impressions: number; clicks: number; reach: number }>();

  for (const ad of rawAds) {
    const dateKey = ad.dateStart.toISOString().split('T')[0];
    const existing = byDate.get(dateKey) || { spend: 0, impressions: 0, clicks: 0, reach: 0 };
    existing.spend += Number(ad.spend || 0);
    existing.impressions += Number(ad.impressions || 0);
    existing.clicks += Number(ad.clicks || 0);
    existing.reach += Number(ad.reach || 0);
    byDate.set(dateKey, existing);
  }

  const headers = [
    'Date', 'Ad Spend', 'Impressions', 'Reach', 'Clicks', 'CTR', 'CPM', 'CPC'
  ];

  const rows: (string | number | boolean | null)[][] = [];
  for (const [date, data] of Array.from(byDate.entries()).sort((a, b) => b[0].localeCompare(a[0]))) {
    const ctr = data.impressions > 0 ? ((data.clicks / data.impressions) * 100).toFixed(2) : 0;
    const cpm = data.impressions > 0 ? ((data.spend / data.impressions) * 1000).toFixed(2) : 0;
    const cpc = data.clicks > 0 ? (data.spend / data.clicks).toFixed(2) : 0;

    rows.push([
      date,
      data.spend.toFixed(2),
      data.impressions,
      data.reach,
      data.clicks,
      ctr,
      cpm,
      cpc,
    ]);
  }

  return { sheetName: 'Analytics-Realtime', headers, rows };
};

export const analyticsOverviewCohort: Extractor = async (ctx): Promise<SheetData> => {
  // Weekly cohort aggregation
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const rawAds = await ctx.prisma.rawAdsFacebook.findMany({
    where: { dateStart: { gte: ninetyDaysAgo } },
    orderBy: { dateStart: 'asc' },
  });

  // Group by week
  const byWeek = new Map<string, { spend: number; impressions: number; clicks: number; days: number }>();

  for (const ad of rawAds) {
    const date = new Date(ad.dateStart);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    const existing = byWeek.get(weekKey) || { spend: 0, impressions: 0, clicks: 0, days: 0 };
    existing.spend += Number(ad.spend || 0);
    existing.impressions += Number(ad.impressions || 0);
    existing.clicks += Number(ad.clicks || 0);
    existing.days++;
    byWeek.set(weekKey, existing);
  }

  const headers = ['Week Starting', 'Total Spend', 'Avg Daily Spend', 'Total Impressions', 'Total Clicks', 'CTR'];

  const rows: (string | number | boolean | null)[][] = [];
  for (const [week, data] of Array.from(byWeek.entries()).sort((a, b) => b[0].localeCompare(a[0]))) {
    const ctr = data.impressions > 0 ? ((data.clicks / data.impressions) * 100).toFixed(2) : 0;
    const avgDaily = data.days > 0 ? (data.spend / data.days).toFixed(2) : 0;

    rows.push([week, data.spend.toFixed(2), avgDaily, data.impressions, data.clicks, ctr]);
  }

  return { sheetName: 'Analytics-Cohort', headers, rows };
};
