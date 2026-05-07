export interface LeadFlowSummary {
  inflow: number;
  cleared: number;
  activeBacklog: number;
  clearanceRate: number | null;
}

export interface LeadFlowDailyItem {
  date: string;
  inflow: number;
  cleared: number;
  activeBacklog: number;
}

export interface LeadFlowResponse {
  summary: LeadFlowSummary;
  daily: LeadFlowDailyItem[];
}
