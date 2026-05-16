import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, DollarSign, Activity, Users, Calculator } from 'lucide-react';
import { useAdsCampaignsQuery, useAdsAttributionQuery } from '../../../../hooks/use-ads-tracker';
import { GlassCard, KpiCard, EmptyState, SectionCard } from '../../../ui';
import { Megaphone } from 'lucide-react';

/**
 * Dashboard Marketing tab — compact summary of Ads spend + top-converting campaigns.
 *
 * Phase 8 follow-up batch 13 (2026-05-11): full migration to v2 primitives.
 * - 4 inline KpiCard helpers (highlight + plain) → v2 KpiCard (Bento decorative)
 * - Top campaigns table card → v2 GlassCard wrapper + token-driven typography
 * - EmptyState v2 cho zero campaigns
 */

interface Props {
  from: string;
  to: string;
}

function fmtMoney(n: number, currency = 'VND') {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' ' + currency;
}

function fmtNumber(n: number) {
  return n.toLocaleString('en-US');
}

export default function MarketingTab({ from, to }: Props) {
  const params = useMemo(() => ({ from, to }), [from, to]);
  const campaignsQuery = useAdsCampaignsQuery(params);
  const attributionQuery = useAdsAttributionQuery(params);
  const campaigns = campaignsQuery.data ?? [];
  const attribution = attributionQuery.data ?? [];

  const totals = useMemo(() => {
    const spend = campaigns.reduce((s, c) => s + Number(c.spendTotal ?? 0), 0);
    const active = campaigns.filter((c) => c.status === 'ACTIVE').length;
    const totalLeads = attribution.reduce((s, a) => s + Number(a.leadCount ?? 0), 0);
    const cpl = totalLeads > 0 ? spend / totalLeads : null;
    const currency = campaigns[0]?.currency ?? 'VND';
    return { spend, active, totalLeads, cpl, currency };
  }, [campaigns, attribution]);

  const topByRoas = useMemo(() => {
    return [...attribution]
      .filter((a) => Number(a.spendTotal ?? 0) > 0)
      .sort((a, b) => {
        // ROAS proxy: leadCount / spend (no revenue per campaign yet).
        const ra = Number(a.leadCount ?? 0) / Number(a.spendTotal);
        const rb = Number(b.leadCount ?? 0) / Number(b.spendTotal);
        return rb - ra;
      })
      .slice(0, 5);
  }, [attribution]);

  return (
    <SectionCard eyebrow="Marketing" title="Campaign Intelligence">
      <div className="space-y-[var(--space-lg)]">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard label="Total Spend" value={fmtMoney(totals.spend, totals.currency)} icon={<DollarSign />} accent="primary" decorative />
        <KpiCard label="Active Campaigns" value={String(totals.active)} unit={`/ ${campaigns.length}`} icon={<Activity />} accent="info" />
        <KpiCard label="Leads from Ads" value={fmtNumber(totals.totalLeads)} icon={<Users />} accent="success" />
        <KpiCard
          label="Avg CPL"
          value={totals.cpl != null ? fmtMoney(totals.cpl, totals.currency) : '—'}
          icon={<Calculator />}
          accent="warning"
        />
      </div>

      <GlassCard variant="surface" padding="md" className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 size-32 rounded-full bg-primary-container/40 blur-3xl" />
        <div className="relative mb-4 flex items-center justify-between">
          <h3 className="font-headline text-[length:var(--text-h5)] font-bold text-on-surface">
            Top campaigns by <em className="font-medium text-primary italic">conversion</em>
          </h3>
          <Link
            to="/ads-tracker"
            className="inline-flex items-center gap-1 text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-primary hover:underline"
          >
            View all <ExternalLink size={10} />
          </Link>
        </div>
        <div className="relative overflow-x-auto">
          {topByRoas.length === 0 ? (
            <EmptyState
              icon={<Megaphone />}
              title="No campaign attribution yet"
              description="Sync Meta + ensure Lead.source matches utm_campaign."
              variant="inline"
            />
          ) : (
            <table className="w-full text-[length:var(--text-body-sm)]">
              <thead>
                <tr className="border-b border-outline-variant/40 text-left text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">UTM</th>
                  <th className="px-4 py-3 text-right">Spend</th>
                  <th className="px-4 py-3 text-right">Leads</th>
                  <th className="px-4 py-3 text-right">CPL</th>
                </tr>
              </thead>
              <tbody>
                {topByRoas.map((a) => (
                  <tr key={a.campaignId} className="border-b border-outline-variant/30 last:border-0">
                    <td className="px-4 py-3 font-medium text-on-surface">{a.campaignName}</td>
                    <td className="px-4 py-3 font-mono text-[length:var(--text-caption)] text-on-surface-variant">
                      {a.utmCampaign ?? <span className="text-on-surface-variant/60">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-headline font-bold">{fmtMoney(a.spendTotal, a.currency)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{a.leadCount}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {a.cpl != null ? fmtMoney(a.cpl, a.currency) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>
      </div>
    </SectionCard>
  );
}
