import DashboardTab from '../../../lead-tracker/dashboard-tab';
import { Card } from '../../ui';

interface LeadFlowPanelV5Props {
  from: string;
  to: string;
}

export function LeadFlowPanelV5({ from, to }: LeadFlowPanelV5Props) {
  return (
    <Card padding="md" glow className="space-y-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-text">Lead flow</p>
        <h2 className="mt-1 font-headline text-2xl font-black tracking-tight text-text-1">Clearance Queue</h2>
      </div>
      <DashboardTab dateFrom={from} dateTo={to} />
    </Card>
  );
}
