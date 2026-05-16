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
import type { AdsCampaignSummary } from '../../../types';
import { SectionCard } from '../../ui';

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
    <SectionCard eyebrow="Performance" title="Spend Trend">
      <div className="flex items-center justify-end">
        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
          {dailySpend ? 'Daily' : 'Top campaigns'}
        </p>
      </div>
      <div className="h-[280px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--md-sys-color-outline-variant, var(--sys-color-border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--sys-color-text-2)" />
            <YAxis tick={{ fontSize: 10 }} stroke="var(--sys-color-text-2)" />
            <Tooltip
              contentStyle={{
                background: 'var(--md-sys-color-surface-container-high, var(--sys-color-surface-2))',
                border: '1px solid var(--md-sys-color-outline-variant, var(--sys-color-border))',
                borderRadius: 16,
                color: 'var(--md-sys-color-on-surface, var(--sys-color-text-1))',
                fontSize: 12,
              }}
              formatter={(v: number) => v.toLocaleString('en-US')}
            />
            <Line
              type="monotone"
              dataKey="spend"
              stroke="var(--md-sys-color-primary, var(--sys-color-accent))"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
