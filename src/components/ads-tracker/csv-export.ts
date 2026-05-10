import { api } from '../../lib/api';
import { buildCsv, downloadCsv } from '../../lib/csv-export';

export async function exportAdsCampaignsToCsv(params?: { from?: string; to?: string }) {
  const qp = params
    ? Object.fromEntries(Object.entries(params).filter(([, v]) => !!v) as [string, string][])
    : undefined;
  const res = await api.getAdsCampaigns(qp);
  const headers = [
    'Platform',
    'Campaign',
    'Status',
    'UTM',
    'Spend',
    'Currency',
    'Impressions',
    'Clicks',
    'Conversions',
    'CTR (%)',
  ];
  const rows = res.data.campaigns.map((c) => [
    c.platform,
    c.name,
    c.status,
    c.utmCampaign ?? '',
    c.spendTotal.toFixed(2),
    c.currency,
    c.impressions,
    c.clicks,
    c.conversions,
    (c.ctr * 100).toFixed(2),
  ]);

  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(buildCsv(headers, rows), `ads-campaigns-${date}.csv`);
}

export async function exportAdsAttributionToCsv(params?: { from?: string; to?: string }) {
  const qp = params
    ? Object.fromEntries(Object.entries(params).filter(([, v]) => !!v) as [string, string][])
    : undefined;
  const res = await api.getAdsAttribution(qp);
  const headers = ['Campaign', 'UTM', 'Spend', 'Currency', 'Leads', 'Qualified', 'CPL'];
  const rows = res.data.campaigns.map((a) => [
    a.campaignName,
    a.utmCampaign ?? '',
    a.spendTotal.toFixed(2),
    a.currency,
    a.leadCount,
    a.qualifiedCount,
    a.cpl != null ? a.cpl.toFixed(2) : '',
  ]);

  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(buildCsv(headers, rows), `ads-attribution-${date}.csv`);
}
