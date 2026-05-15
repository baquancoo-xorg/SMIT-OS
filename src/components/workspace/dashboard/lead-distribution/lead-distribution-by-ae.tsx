import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';
import type { LeadDistributionByAeItem } from '@/types/lead-distribution';

interface Props {
  data?: LeadDistributionByAeItem[];
}

export function LeadDistributionByAe({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-card border border-outline-variant/40 bg-surface/70 backdrop-blur-md p-5 shadow-sm">
        <p className="text-[length:var(--text-body-sm)] text-on-surface-variant">Không có dữ liệu</p>
      </div>
    );
  }

  const chartData = data.slice(0, 12);

  return (
    <div className="h-full rounded-card border border-outline-variant/40 bg-surface/70 backdrop-blur-md p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">By AE Workload</h3>
          <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">Active vs Cleared per AE</p>
        </div>
        <div className="flex size-7 items-center justify-center rounded-button bg-surface-container text-on-surface-variant">
          <Users size={14} />
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--md-sys-color-outline-variant, var(--sys-color-border))" />
            <XAxis type="number" tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--sys-color-text-2)' }} axisLine={false} tickLine={false} />
            <YAxis
              dataKey="ae"
              type="category"
              tick={{ fontSize: 9, fontWeight: 600, fill: 'var(--sys-color-text-2)' }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
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
              formatter={(value: number, name: string) => [`${value} leads`, name]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '8px' }}
            />
            <Bar dataKey="active" name="Active" stackId="a" fill="var(--color-warning)" radius={[0, 0, 0, 0]} barSize={16} />
            <Bar dataKey="cleared" name="Cleared" stackId="a" fill="var(--color-success)" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
