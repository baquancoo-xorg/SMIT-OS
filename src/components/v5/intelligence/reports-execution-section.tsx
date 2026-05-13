import { CheckCircle2, ClipboardList, Target } from 'lucide-react';
import { Card } from '../ui';

export function ReportsExecutionSection() {
  return (
    <section className="grid gap-4 lg:grid-cols-3" aria-label="Execution intelligence">
      <Card padding="lg" glow className="lg:col-span-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Execution</p>
            <h2 className="mt-2 font-headline text-2xl font-black tracking-tight text-text-1">Operating cadence</h2>
            <p className="mt-2 text-sm font-medium text-text-2">
              Daily Sync và Weekly Check-in đang chạy bằng API thật; phần này là intelligence layer gom tín hiệu execution cho vòng sau.
            </p>
          </div>
          <ClipboardList className="size-6 text-accent-text" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Signal label="OKR tree" value="Live" icon={<Target />} />
          <Signal label="Daily Sync" value="DB-backed" icon={<CheckCircle2 />} />
          <Signal label="Weekly Check-in" value="DB-backed" icon={<CheckCircle2 />} />
        </div>
      </Card>

      <Card padding="lg" glow>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Next intelligence cut</p>
        <ul className="mt-4 space-y-3 text-sm font-medium text-text-2">
          <li>• OKR completion trend by cycle</li>
          <li>• Team check-in compliance rate</li>
          <li>• Blocker frequency by department</li>
        </ul>
      </Card>
    </section>
  );
}

function Signal({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-surface-2 p-4">
      <div className="flex items-center justify-between gap-2 text-accent-text [&>svg]:size-4">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">{label}</span>
        {icon}
      </div>
      <p className="mt-3 font-headline text-xl font-black text-text-1">{value}</p>
    </div>
  );
}
