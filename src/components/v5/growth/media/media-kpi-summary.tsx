import { DollarSign, Eye, Heart, Newspaper } from 'lucide-react';
import { KpiCard } from '../../ui';

interface MediaKpiSummaryProps {
  totalPosts: number;
  totalReach: number;
  totalEngagement: number;
  kolSpend: number;
}

function fmtNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}

export function MediaKpiSummary({ totalPosts, totalReach, totalEngagement, kolSpend }: MediaKpiSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <KpiCard label="Total Posts" value={totalPosts.toLocaleString()} icon={<Newspaper />} />
      <KpiCard label="Total Reach" value={fmtNumber(totalReach)} icon={<Eye />} accent="info" />
      <KpiCard label="Total Engagement" value={fmtNumber(totalEngagement)} icon={<Heart />} accent="success" />
      <KpiCard label="KOL/KOC Spend" value={kolSpend.toLocaleString()} unit="VND" icon={<DollarSign />} accent="warning" />
    </div>
  );
}
