import AcquisitionOverviewTab from '../../../dashboard/acquisition-overview/acquisition-overview-tab';
import { Card } from '../../ui';

interface JourneyFunnelV5Props {
  from: string;
  to: string;
}

export function JourneyFunnelV5({ from, to }: JourneyFunnelV5Props) {
  return (
    <Card padding="md" glow className="space-y-4">
      {/* ui-canon-ok: section header font-black for KPI headline */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-text">Acquisition</p>
        <h2 className="mt-1 font-headline text-2xl font-black tracking-tight text-text-1">Journey Funnel</h2>
      </div>
      <AcquisitionOverviewTab from={from} to={to} />
    </Card>
  );
}
