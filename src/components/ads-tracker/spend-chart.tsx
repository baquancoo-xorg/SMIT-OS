import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { AdsCampaignSummary } from '../../types';

interface Props {
  campaigns: AdsCampaignSummary[];
  /** Optional: per-campaign daily series (when a single campaign is selected). */
  dailySpend?: { date: string; spend: number }[];
}

/**
 * Daily spend trend across all campaigns. When `dailySpend` is provided (single-campaign
 * detail view), uses that directly. Otherwise we approximate from campaign totals as
 * a flat line — until backend exposes a top-level "spend by date across campaigns" endpoint
 * (Phase 5 dashboard will add it).
 */
export default function SpendChart({ campaigns, dailySpend }: Props) {
  const data = useMemo(() => {
    if (dailySpend && dailySpend.length > 0) return dailySpend;
    // Aggregate fallback: bucket campaigns by name showing campaign-level total. Keeps
    // the chart non-empty for the campaigns list view.
    return campaigns.slice(0, 10).map((c) => ({
      date: c.name.length > 16 ? c.name.slice(0, 16) + '…' : c.name,
      spend: Math.round(c.spendTotal),
    }));
  }, [campaigns, dailySpend]);

  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm p-4 xl:p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-2xl font-black font-headline">
          Spend <span className="text-primary italic">trend</span>
        </h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {dailySpend ? 'Daily' : 'Top campaigns'}
        </p>
      </div>
      <div className="h-[280px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: 16,
                fontSize: 12,
              }}
              formatter={(v: number) => v.toLocaleString('en-US')}
            />
            <Line
              type="monotone"
              dataKey="spend"
              stroke="var(--md-sys-color-primary, #6750A4)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
