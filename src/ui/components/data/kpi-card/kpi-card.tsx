import { cn } from '@/ui/lib/cn';
import { type ReactNode, type MouseEvent, useRef, useCallback } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  delta?: { value: number; direction: 'up' | 'down'; label?: string };
  icon?: ReactNode;
  featured?: boolean;
  className?: string;
}

export function KpiCard({ label, value, delta, icon, featured, className }: KpiCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!featured || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty('--mx', `${x}%`);
    cardRef.current.style.setProperty('--my', `${y}%`);
  }, [featured]);

  return (
    <div
      ref={cardRef}
      data-featured={featured || undefined}
      className={cn('smit-kpi-card', className)}
      onMouseMove={handleMouseMove}
    >
      <div className="flex items-center justify-between">
        <span className="smit-kpi-card-label">{label}</span>
        {icon && <span className="smit-kpi-card-icon">{icon}</span>}
      </div>

      <div className="smit-kpi-card-value">{value}</div>

      {delta && (
        <div className="smit-kpi-card-delta" data-direction={delta.direction}>
          {delta.direction === 'up' ? (
            <ArrowUpRight size={12} strokeWidth={2.5} />
          ) : (
            <ArrowDownRight size={12} strokeWidth={2.5} />
          )}
          <span>{delta.value}%</span>
          {delta.label && <span style={{ color: 'var(--v6-text-3)', marginLeft: 4 }}>{delta.label}</span>}
        </div>
      )}
    </div>
  );
}
