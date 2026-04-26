export interface CallPerformancePerAeItem {
  aeUserId: string;
  aeName: string;
  totalCalls: number;
  answeredCalls: number;
  answerRate: number;
  avgDuration: number;
  totalLeadsCalled: number;
  callsPerLead: number;
}

export interface CallPerformanceHeatmapItem {
  dayOfWeek: number;
  hour: number;
  callCount: number;
}

export interface CallPerformanceConversionItem {
  aeUserId: string;
  aeName: string;
  callsToQualified: number;
  callsToUnqualified: number;
  avgCallsBeforeClose: number;
}

export interface CallPerformanceTrendItem {
  date: string;
  calls: number;
  answered: number;
  avgDuration: number;
}

export interface CallPerformanceResponse {
  perAe: CallPerformancePerAeItem[];
  heatmap: CallPerformanceHeatmapItem[];
  conversion: CallPerformanceConversionItem[];
  trend: CallPerformanceTrendItem[];
}

export interface CallPerformanceCallInput {
  subscriberId: number | null;
  employeeUserId: number | null;
  totalDuration: number | null;
  callStartTime: Date | null;
  createdAt: Date;
}

export type SubscriberStatusMap = Map<number, { status: string | null }>;
