import { useMemo } from 'react';
import type { AdsAttribution } from '../../types';

interface Props {
  rows: AdsAttribution[];
  unmatched?: { source: string; count: number }[];
}

function fmtMoney(n: number, currency: string) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' ' + currency;
}

export default function AttributionTable({ rows, unmatched }: Props) {
  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => b.spendTotal - a.spendTotal);
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/40">
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">UTM</th>
                <th className="px-4 py-3 text-right">Spend</th>
                <th className="px-4 py-3 text-right">Leads</th>
                <th className="px-4 py-3 text-right">Qualified</th>
                <th className="px-4 py-3 text-right">CPL</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                    No attribution data — sync Meta + ensure Lead.source matches utm_campaign
                  </td>
                </tr>
              ) : (
                sorted.map((r) => (
                  <tr key={r.campaignId} className="border-b border-white/30 hover:bg-white/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-on-surface">{r.campaignName}</td>
                    <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">
                      {r.utmCampaign ?? <span className="text-slate-300">missing</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-headline font-black">
                      {fmtMoney(r.spendTotal, r.currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold">{r.leadCount}</td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-tertiary">
                      {r.qualifiedCount}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold">
                      {r.cpl != null ? fmtMoney(r.cpl, r.currency) : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {unmatched && unmatched.length > 0 && (
        <div className="bg-amber-50/70 backdrop-blur-md border border-amber-200/40 rounded-3xl shadow-sm p-4 xl:p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-amber-500 text-[18px]">warning</span>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-700">
              Lead sources without matching campaign ({unmatched.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {unmatched.slice(0, 20).map((u) => (
              <span
                key={u.source}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold"
              >
                <span className="font-mono">{u.source}</span>
                <span className="opacity-60">×{u.count}</span>
              </span>
            ))}
          </div>
          {unmatched.length > 20 && (
            <p className="text-[10px] text-amber-600 mt-2 font-medium">
              + {unmatched.length - 20} more — see UTM guideline doc
            </p>
          )}
        </div>
      )}
    </div>
  );
}
