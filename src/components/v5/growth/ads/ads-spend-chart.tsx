import { Card } from '../../ui';
import SpendChart from '../../../ads-tracker/spend-chart';
import type { AdsCampaignSummary } from '../../../../types';

interface AdsSpendChartProps {
  campaigns: AdsCampaignSummary[];
}

export function AdsSpendChart({ campaigns }: AdsSpendChartProps) {
  return (
    <Card padding="md" glow className="flex min-h-0 flex-col overflow-hidden">
      {/* ui-canon-ok: section header font-black for KPI headline */}
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-text">Performance</p>
        <h2 className="mt-1 font-headline text-2xl font-black tracking-tight text-text-1">Spend Trend</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <SpendChart campaigns={campaigns} />
      </div>
    </Card>
  );
}
