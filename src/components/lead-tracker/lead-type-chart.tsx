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
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6',
  '#a855f7', '#eab308', '#3b82f6',
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
              labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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
