const FB_API_VERSION = process.env.FB_API_VERSION ?? 'v21.0';

export interface FetchInsightsResult {
  success: boolean;
  data?: any[];
  error?: string;
}

export async function fetchInsights(
  token: string,
  accountId: string,
  since: string,
  until: string
): Promise<FetchInsightsResult> {
  const fields = [
    'ad_id',
    'ad_name',
    'adset_id',
    'adset_name',
    'campaign_id',
    'campaign_name',
    'objective',
    'spend',
    'impressions',
    'reach',
    'clicks',
    'ctr',
    'cpm',
    'cpc',
    'frequency',
    'actions',
    'video_play_actions',
    'video_thruplay_watched_actions',
    'conversions',
  ].join(',');

  const cleanAccountId = accountId.replace('act_', '');
  const url = new URL(
    `https://graph.facebook.com/${FB_API_VERSION}/act_${cleanAccountId}/insights`
  );
  url.searchParams.set('access_token', token);
  url.searchParams.set('level', 'ad');
  url.searchParams.set('time_range', JSON.stringify({ since, until }));
  url.searchParams.set('time_increment', '1');
  url.searchParams.set('fields', fields);
  url.searchParams.set('limit', '500');

  try {
    const all: any[] = [];
    let next: string | null = url.toString();
    while (next) {
      const res = await fetch(next);
      const json = await res.json();
      if (json.error) return { success: false, error: json.error.message };
      all.push(...(json.data ?? []));
      next = json.paging?.next ?? null;
    }
    return { success: true, data: all };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export function parseInsightRow(row: any) {
  return {
    dateStart: new Date(row.date_start),
    adId: row.ad_id,
    adName: row.ad_name,
    adsetId: row.adset_id,
    adsetName: row.adset_name,
    campaignId: row.campaign_id,
    campaignName: row.campaign_name,
    campaignObjective: row.objective,
    spend: row.spend ? Number(row.spend) : null,
    impressions: row.impressions ? BigInt(row.impressions) : null,
    reach: row.reach ? BigInt(row.reach) : null,
    clicks: row.clicks ? BigInt(row.clicks) : null,
    ctr: row.ctr ? Number(row.ctr) : null,
    cpm: row.cpm ? Number(row.cpm) : null,
    cpc: row.cpc ? Number(row.cpc) : null,
    frequency: row.frequency ? Number(row.frequency) : null,
    actions: row.actions ?? null,
    videoViews: row.video_play_actions ?? null,
    videoPlayCount: null,
    videoThruplayCount: row.video_thruplay_watched_actions
      ? Number(row.video_thruplay_watched_actions[0]?.value ?? 0)
      : null,
    conversions: row.conversions ?? null,
  };
}
