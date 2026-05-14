import { Eye, Heart, Newspaper, TrendingUp } from 'lucide-react';
import { KpiCard } from '../../ui';

export interface MediaKpiData {
  totalPosts: number;
  totalReach: number;
  totalViews: number;
  totalEngagement: number;
  avgEngagementRate: number;
}

function fmtNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}

interface MediaKpiSummaryProps {
  kpi: MediaKpiData;
}

export function MediaKpiSummary({ kpi }: MediaKpiSummaryProps) {
  const { totalPosts, totalReach, totalEngagement, avgEngagementRate } = kpi;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <KpiCard label="Total Posts"       value={totalPosts.toLocaleString()}    icon={<Newspaper />} />
      <KpiCard label="Total Reach"       value={fmtNumber(totalReach)}          icon={<Eye />}       accent="info" />
      <KpiCard label="Total Engagement"  value={fmtNumber(totalEngagement)}     icon={<Heart />}     accent="success" />
      <KpiCard label="Avg Eng. Rate"     value={`${avgEngagementRate.toFixed(2)}%`} icon={<TrendingUp />} accent="warning" />
    </div>
  );
}
