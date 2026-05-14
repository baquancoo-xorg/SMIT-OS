import CallPerformanceSection from '../../../dashboard/call-performance/call-performance-section';
import { Card } from '../../ui';

interface CallPerfSectionV5Props {
  from: string;
  to: string;
}

export function CallPerfSectionV5({ from, to }: CallPerfSectionV5Props) {
  return (
    <Card padding="md" glow className="space-y-4">
      {/* ui-canon-ok: section header font-black for KPI headline */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-text">Call performance</p>
        <h2 className="mt-1 font-headline text-2xl font-black tracking-tight text-text-1">Conversion Operations</h2>
      </div>
      <CallPerformanceSection from={from} to={to} />
    </Card>
  );
}
