import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Globe } from 'lucide-react';
import type { LeadDistributionByCountryItem } from '../../../types/lead-distribution';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface Props {
  data?: LeadDistributionByCountryItem[];
}

export function LeadDistributionByCountry({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-full flex items-center justify-center">
        <p className="text-sm text-slate-400">Không có dữ liệu</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Lead By Country</h3>
          <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">Distribution by region</p>
        </div>
        <div className="size-7 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center">
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
              nameKey="country"
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
                const item = data.find((d) => d.country === value);
                const pct = total > 0 && item ? ((item.count / total) * 100).toFixed(0) : '0';
                return `${value} (${item?.count || 0}) - ${pct}%`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2">
        <span className="text-lg font-black text-slate-900">{total}</span>
        <span className="text-xs font-bold text-slate-400 ml-1">total leads</span>
      </div>
    </div>
  );
}
