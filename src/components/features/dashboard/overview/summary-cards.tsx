import { CreditCard, DollarSign, TrendingUp, Users } from 'lucide-react';
import { formatCurrency } from '../../../../lib/formatters';
import type { SummaryMetrics } from '../../../../types/dashboard-overview';
import { KpiCard } from '../../../ui';

interface SummaryKpiRowProps {
  data: SummaryMetrics;
}

export function SummaryKpiRow({ data }: SummaryKpiRowProps) {
  const metrics = [
    { label: 'Revenue', value: formatCurrency(data.revenue.value), icon: <DollarSign /> },
    { label: 'Ad Spend', value: formatCurrency(data.adSpend.value), icon: <CreditCard /> },
    { label: 'Signups', value: data.signups.value.toLocaleString('vi-VN'), icon: <Users /> },
    { label: 'ROAS', value: `${data.roas.value.toFixed(2)}x`, icon: <TrendingUp /> },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((item) => (
        <KpiCard key={item.label} label={item.label} value={item.value} icon={item.icon} />
      ))}
    </div>
  );
}
