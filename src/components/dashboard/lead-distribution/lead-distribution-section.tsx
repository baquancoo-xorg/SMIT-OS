import { AlertCircle } from 'lucide-react';
import { useLeadDistribution } from '../../../hooks/use-lead-distribution';
import { LeadDistributionBySource } from './lead-distribution-by-source';
import { LeadDistributionByAe } from './lead-distribution-by-ae';
import { LeadDistributionByCountry } from './lead-distribution-by-country';
import { GlassCard, Spinner, EmptyState, SectionCard } from '../../v5/ui';

/**
 * Lead distribution 3-column section: by source / by country / by AE.
 *
 * Phase 8 follow-up batch 11 (2026-05-11): wrapper migrated to v2 GlassCard
 * + Spinner + EmptyState. Removed `rounded-card` legacy + manual spinner divs.
 */

interface Props {
  from: string;
  to: string;
}

function LoadingPanel() {
  return (
    <GlassCard variant="surface" padding="md" className="flex h-[340px] items-center justify-center">
      <Spinner size="lg" />
    </GlassCard>
  );
}

export function LeadDistributionSection({ from, to }: Props) {
  const { data, isLoading, error } = useLeadDistribution({ from, to });

  if (isLoading) {
    return (
      <SectionCard eyebrow="Distribution" title="Lead Allocation">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <LoadingPanel />
          <LoadingPanel />
          <LoadingPanel />
        </div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard eyebrow="Distribution" title="Lead Allocation">
        <EmptyState
          icon={<AlertCircle />}
          title="Failed to load distribution data"
          description="Lead distribution unavailable. Try refreshing the page."
          variant="card"
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard eyebrow="Distribution" title="Lead Allocation">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <LeadDistributionBySource data={data?.bySource} />
        <LeadDistributionByCountry data={data?.byCountry} />
        <LeadDistributionByAe data={data?.byAe} />
      </div>
    </SectionCard>
  );
}
