import { Activity, Calculator, DollarSign, Users } from 'lucide-react';
import { KpiCard } from '@/components/ui/kpi-card';

interface AdsKpiCardsProps {
  spend: number;
  active: number;
  totalCampaigns: number;
  totalLeads: number;
  avgCpl: number | null;
  currency: string;
}

function fmtMoney(n: number, currency = 'VND') {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)} ${currency}`;
}

export function AdsKpiCards({ spend, active, totalCampaigns, totalLeads, avgCpl, currency }: AdsKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <KpiCard label="Total Spend" value={fmtMoney(spend, currency)} icon={<DollarSign />} />
      <KpiCard label="Active Campaigns" value={String(active)} unit={`/ ${totalCampaigns}`} icon={<Activity />} accent="info" />
      <KpiCard label="Leads Attributed" value={totalLeads.toLocaleString()} icon={<Users />} accent="success" />
      <KpiCard label="Avg CPL" value={avgCpl != null ? fmtMoney(avgCpl, currency) : '—'} icon={<Calculator />} accent="warning" />
    </div>
  );
}
