import { useState, useEffect, useCallback } from 'react';
import { Globe } from 'lucide-react';
import { api } from '../../lib/api';
import type { Lead } from '../../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GlassCard, Spinner } from '../ui';

/**
 * Pie chart visualizing leads distribution by leadType (e.g. Việt Nam vs Quốc Tế).
 *
 * Phase 8 follow-up batch 5 (2026-05-10): wrapper migrated to v2 GlassCard
 * (`rounded-card` drift fixed → `rounded-card` token) + Spinner v2 + token
 * typography. Recharts internals giữ nguyên (chart-specific brand colors).
 */

const COLORS = [
  'var(--sys-color-accent)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-error)',
  'var(--color-secondary)',
  'var(--color-info)',
  'var(--sys-color-accent-text)',
  'var(--color-success-container)',
  'var(--sys-color-accent-dim)',
  'var(--color-info-container)',
];

interface Props {
  dateFrom: string;
  dateTo: string;
}

export default function LeadTypeChart({ dateFrom, dateTo }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const data = await api.getLeads(params);
      setLeads(data);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const leadTypeMap = new Map<string, number>();
  leads.forEach((l) => {
    const type = l.leadType || 'Unknown';
    leadTypeMap.set(type, (leadTypeMap.get(type) || 0) + 1);
  });

  const chartData = [...leadTypeMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (loading) {
    return (
      <GlassCard variant="surface" padding="lg" className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="surface" padding="md">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
            Leads by Country
          </h3>
          <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">
            Distribution across countries
          </p>
        </div>
        <div className="flex size-7 items-center justify-center rounded-button bg-surface-container text-on-surface-variant">
          <Globe size={14} />
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="30%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              dataKey="value"
              nameKey="name"
              paddingAngle={2}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={{ stroke: 'var(--sys-color-text-2)', strokeWidth: 1 }}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--md-sys-color-surface-container-high, var(--sys-color-surface-2))',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                border: '1px solid var(--md-sys-color-outline-variant, var(--sys-color-border))',
                boxShadow: 'var(--sys-shadow-card)',
                color: 'var(--md-sys-color-on-surface, var(--sys-color-text-1))',
              }}
              itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
              formatter={(value: number) => [`${value} leads`, 'Count']}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingLeft: '16px' }}
              formatter={(value) => {
                const item = chartData.find((d) => d.name === value);
                return `${value} (${item?.value || 0})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
