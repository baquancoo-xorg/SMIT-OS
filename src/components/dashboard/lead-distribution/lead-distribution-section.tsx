import { AlertCircle } from 'lucide-react';
import { useLeadDistribution } from '../../../hooks/use-lead-distribution';
import { LeadDistributionBySource } from './lead-distribution-by-source';
import { LeadDistributionByAe } from './lead-distribution-by-ae';
import { LeadDistributionByCountry } from './lead-distribution-by-country';

interface Props {
  from: string;
  to: string;
}

export function LeadDistributionSection({ from, to }: Props) {
  const { data, isLoading, error } = useLeadDistribution({ from, to });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-[340px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-[340px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-[340px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center py-16 text-rose-600">
        <AlertCircle className="mr-2" size={18} />
        <span className="text-sm font-medium">Failed to load distribution data</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <LeadDistributionBySource data={data?.bySource} />
      <LeadDistributionByCountry data={data?.byCountry} />
      <LeadDistributionByAe data={data?.byAe} />
    </div>
  );
}
