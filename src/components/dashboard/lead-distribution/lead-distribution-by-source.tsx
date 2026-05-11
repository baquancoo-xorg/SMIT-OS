import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Globe } from 'lucide-react';
import type { LeadDistributionBySourceItem } from '../../../types/lead-distribution';
import { GlassCard } from '../../ui';

const COLORS = [
  '#0059b6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#94a3b8',
];

interface Props {
  data?: LeadDistributionBySourceItem[];
}

export function LeadDistributionBySource({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <GlassCard variant="surface" padding="md" className="flex h-full items-center justify-center">
        <p className="text-[length:var(--text-body-sm)] text-on-surface-variant">Không có dữ liệu</p>
      </GlassCard>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <GlassCard variant="surface" padding="md" className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">Lead By Source</h3>
          <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">Lead acquisition channels</p>
        </div>
        <div className="flex size-7 items-center justify-center rounded-button bg-surface-container text-on-surface-variant">
          <Globe size={14} />
        </div>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="35%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              dataKey="count"
              nameKey="source"
              paddingAngle={2}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
              style={{ fontSize: '9px', fontWeight: 500 }}
            >
              {data.map((_, index) => (
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
              formatter={(value: number, name: string) => {
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return [`${value} leads (${pct}%)`, name];
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingLeft: '8px', maxWidth: '45%' }}
              formatter={(value) => {
                const item = data.find((d) => d.source === value);
                return `${value} (${item?.count || 0})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-center">
        <span className="font-headline text-[length:var(--text-h6)] font-bold text-on-surface">{total}</span>
        <span className="ml-1 text-[length:var(--text-caption)] font-semibold text-on-surface-variant">total leads</span>
      </div>
    </GlassCard>
  );
}
