import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useAdsCampaignsQuery, useAdsAttributionQuery } from '../../../hooks/use-ads-tracker';

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
    const spend = campaigns.reduce((s, c) => s + c.spendTotal, 0);
    const active = campaigns.filter((c) => c.status === 'ACTIVE').length;
    const totalLeads = attribution.reduce((s, a) => s + a.leadCount, 0);
    const cpl = totalLeads > 0 ? spend / totalLeads : null;
    const currency = campaigns[0]?.currency ?? 'VND';
    return { spend, active, totalLeads, cpl, currency };
  }, [campaigns, attribution]);

  const topByRoas = useMemo(() => {
    return [...attribution]
      .filter((a) => a.spendTotal > 0)
      .sort((a, b) => {
        // ROAS proxy: leadCount / spend (we don't have revenue per campaign yet).
        const ra = a.leadCount / a.spendTotal;
        const rb = b.leadCount / b.spendTotal;
        return rb - ra;
      })
      .slice(0, 5);
  }, [attribution]);

  return (
    <div className="space-y-[var(--space-lg)]">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Spend" value={fmtMoney(totals.spend, totals.currency)} highlight />
        <KpiCard label="Active Campaigns" value={String(totals.active)} subtitle={`${campaigns.length} total`} />
        <KpiCard label="Leads from Ads" value={fmtNumber(totals.totalLeads)} />
        <KpiCard label="Avg CPL" value={totals.cpl != null ? fmtMoney(totals.cpl, totals.currency) : '—'} />
      </div>

      <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm p-4 xl:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-2xl font-black font-headline">
            Top campaigns by <span className="text-primary italic">conversion</span>
          </h3>
          <Link
            to="/ads-tracker"
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
          >
            View all <ExternalLink size={10} />
          </Link>
        </div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/40">
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">UTM</th>
                <th className="px-4 py-3 text-right">Spend</th>
                <th className="px-4 py-3 text-right">Leads</th>
                <th className="px-4 py-3 text-right">CPL</th>
              </tr>
            </thead>
            <tbody>
              {topByRoas.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-slate-400 font-black uppercase tracking-widest text-[10px]"
                  >
                    No campaign attribution yet
                  </td>
                </tr>
              ) : (
                topByRoas.map((a) => (
                  <tr key={a.campaignId} className="border-b border-white/30">
                    <td className="px-4 py-3 font-medium">{a.campaignName}</td>
                    <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">
                      {a.utmCampaign ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-headline font-black">
                      {fmtMoney(a.spendTotal, a.currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold">{a.leadCount}</td>
                    <td className="px-4 py-3 text-right text-xs font-bold">
                      {a.cpl != null ? fmtMoney(a.cpl, a.currency) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  subtitle,
  highlight,
}: {
  label: string;
  value: string;
  subtitle?: string;
  highlight?: boolean;
}) {
  if (highlight) {
    return (
      <div className="bg-primary text-white p-4 xl:p-6 rounded-3xl shadow-xl shadow-primary/20 flex flex-col gap-2 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 xl:w-32 xl:h-32 bg-white/10 rounded-full -mr-10 -mt-10 xl:-mr-16 xl:-mt-16 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 relative z-10">{label}</p>
        <h4 className="text-2xl xl:text-4xl font-black font-headline relative z-10">{value}</h4>
        {subtitle && <p className="text-[10px] opacity-80 relative z-10">{subtitle}</p>}
      </div>
    );
  }
  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 p-4 xl:p-6 rounded-3xl shadow-sm flex flex-col gap-2 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-20 h-20 xl:w-32 xl:h-32 bg-primary/5 rounded-full -mr-10 -mt-10 xl:-mr-16 xl:-mt-16 group-hover:scale-150 transition-transform duration-700" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{label}</p>
      <h4 className="text-2xl xl:text-4xl font-black font-headline relative z-10">{value}</h4>
      {subtitle && (
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest relative z-10">{subtitle}</p>
      )}
    </div>
  );
}
