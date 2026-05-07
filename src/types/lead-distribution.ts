export interface LeadDistributionBySourceItem {
  source: string;
  count: number;
}

export interface LeadDistributionByAeItem {
  ae: string;
  active: number;
  cleared: number;
  total: number;
}

export interface LeadDistributionResponse {
  bySource: LeadDistributionBySourceItem[];
  byAe: LeadDistributionByAeItem[];
}
