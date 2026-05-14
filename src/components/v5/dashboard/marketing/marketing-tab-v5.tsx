import MarketingTab from '../../../dashboard/marketing/marketing-tab';
import { Card } from '../../ui';

interface MarketingTabV5Props {
  from: string;
  to: string;
}

export function MarketingTabV5({ from, to }: MarketingTabV5Props) {
  return (
    <Card padding="md" glow className="space-y-4">
      {/* ui-canon-ok: section header font-black for KPI headline */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-text">Marketing</p>
        <h2 className="mt-1 font-headline text-2xl font-black tracking-tight text-text-1">Campaign Intelligence</h2>
      </div>
      <MarketingTab from={from} to={to} />
    </Card>
  );
}
