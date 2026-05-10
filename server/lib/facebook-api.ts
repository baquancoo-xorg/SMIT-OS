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

// ============================================
// Campaign-level endpoints (Phase 3 acquisition trackers)
// ============================================

export interface FbCampaign {
  id: string;
  name: string;
  status: string; // ACTIVE | PAUSED | ARCHIVED | DELETED
  effective_status?: string;
  start_time?: string;
  stop_time?: string;
  objective?: string;
}

export interface FetchCampaignsResult {
  success: boolean;
  data?: FbCampaign[];
  error?: string;
}

/**
 * Fetch campaigns metadata for an ad account.
 * Used by ads-sync to populate `AdCampaign` rows.
 */
export async function getCampaigns(token: string, accountId: string): Promise<FetchCampaignsResult> {
  const cleanAccountId = accountId.replace('act_', '');
  const url = new URL(
    `https://graph.facebook.com/${FB_API_VERSION}/act_${cleanAccountId}/campaigns`
  );
  url.searchParams.set('access_token', token);
  url.searchParams.set('fields', 'id,name,status,effective_status,start_time,stop_time,objective');
  url.searchParams.set('limit', '200');

  try {
    const all: FbCampaign[] = [];
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

export interface FbCampaignInsightDay {
  date_start: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  actions?: Array<{ action_type: string; value: string }>;
}

export interface FetchCampaignInsightsResult {
  success: boolean;
  data?: FbCampaignInsightDay[];
  error?: string;
}

/**
 * Fetch campaign-level daily insights (spend/impressions/clicks/conversions).
 */
export async function getCampaignInsights(
  token: string,
  campaignId: string,
  since: string,
  until: string
): Promise<FetchCampaignInsightsResult> {
  const url = new URL(`https://graph.facebook.com/${FB_API_VERSION}/${campaignId}/insights`);
  url.searchParams.set('access_token', token);
  url.searchParams.set('level', 'campaign');
  url.searchParams.set('time_range', JSON.stringify({ since, until }));
  url.searchParams.set('time_increment', '1');
  url.searchParams.set('fields', 'date_start,spend,impressions,clicks,actions');
  url.searchParams.set('limit', '500');

  try {
    const all: FbCampaignInsightDay[] = [];
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

/**
 * Extract conversion count from FB actions array (lead/purchase/onsite_conversion.lead_grouped).
 */
export function extractConversionCount(actions?: Array<{ action_type: string; value: string }>): number {
  if (!actions || !Array.isArray(actions)) return 0;
  const types = new Set([
    'lead',
    'purchase',
    'onsite_conversion.lead_grouped',
    'offsite_conversion.fb_pixel_lead',
    'offsite_conversion.fb_pixel_purchase',
  ]);
  let total = 0;
  for (const a of actions) {
    if (types.has(a.action_type)) total += Number(a.value) || 0;
  }
  return total;
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
