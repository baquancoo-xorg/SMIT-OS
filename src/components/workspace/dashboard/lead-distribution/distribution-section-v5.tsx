import { LeadDistributionSection } from '@/components/workspace/dashboard/lead-distribution';
import { Card } from '@/components/ui/card';

interface DistributionSectionV5Props {
  from: string;
  to: string;
}

export function DistributionSectionV5({ from, to }: DistributionSectionV5Props) {
  return (
    <Card padding="md" glow className="space-y-4">
      {/* ui-canon-ok: section header font-black for KPI headline */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-text">Distribution</p>
        <h2 className="mt-1 font-headline text-2xl font-black tracking-tight text-text-1">Lead Allocation</h2>
      </div>
      <LeadDistributionSection from={from} to={to} />
    </Card>
  );
}
