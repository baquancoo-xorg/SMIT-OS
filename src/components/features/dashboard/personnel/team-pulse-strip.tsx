/**
 * Team Pulse — 4 KPI strip: Job avg, Personal avg, General avg, Attention count.
 * Each KPI shows current value + QoQ delta vs previous quarter.
 * v4 contract (docs/ui-design-contract.md §3, §5): rounded-card, accent var(--brand-500), no solid orange.
 */

import { Briefcase, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { KpiCard } from '../../../ui/kpi-card';
import type { PulseData } from '../../../../hooks/use-personnel-dashboard';

interface Props {
  data: PulseData | undefined;
  loading?: boolean;
}

function deltaFromScale(delta: number): number {
  // Scale 1-5 → render delta as fractional points (not %). KpiCard expects percent;
  // we encode as multiplied by 20 for visual consistency (1 point ≈ 20%).
  return delta * 20;
}

export function TeamPulseStrip({ data, loading }: Props) {
  const current = data?.current;
  const delta = data?.delta;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        label="Job avg"
        value={current ? current.job.toFixed(1) : '—'}
        unit="/5"
        icon={<Briefcase />}
        deltaPercent={delta ? deltaFromScale(delta.job) : undefined}
        deltaLabel={data ? `vs ${data.prevQuarter}` : undefined}
        accent="primary"
        loading={loading}
      />
      <KpiCard
        label="Personal avg"
        value={current ? current.personal.toFixed(1) : '—'}
        unit="/5"
        icon={<Heart />}
        deltaPercent={delta ? deltaFromScale(delta.personal) : undefined}
        deltaLabel={data ? `vs ${data.prevQuarter}` : undefined}
        accent="info"
        loading={loading}
      />
      <KpiCard
        label="General avg"
        value={current ? current.general.toFixed(1) : '—'}
        unit="/5"
        icon={<Sparkles />}
        deltaPercent={delta ? deltaFromScale(delta.general) : undefined}
        deltaLabel={data ? `vs ${data.prevQuarter}` : undefined}
        accent="success"
        loading={loading}
      />
      <AttentionKpi data={data} loading={loading} />
    </div>
  );
}

function AttentionKpi({ data, loading }: Props) {
  const attention = data?.attentionCount ?? 0;
  const atRisk = data?.atRiskCount ?? 0;
  const total = attention + atRisk;
  const onboarding = data?.onboardingCount ?? 0;
  const sublabel = data
    ? `${atRisk} at-risk · ${attention} cảnh báo${onboarding > 0 ? ` · ${onboarding} onboard` : ''}`
    : undefined;
  return (
    <KpiCard
      label="Attention"
      value={total}
      icon={<AlertCircle />}
      deltaLabel={sublabel}
      accent={atRisk > 0 ? 'error' : attention > 0 ? 'warning' : 'success'}
      loading={loading}
    />
  );
}
