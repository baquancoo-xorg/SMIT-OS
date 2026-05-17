/**
 * Top movers — top 3 ↑ and top 3 ↓ skills by absolute Δ vs previous quarter.
 * Δ ≥ 1 threshold enforced server-side; this component just renders.
 */

import { TrendingUp, TrendingDown } from 'lucide-react';
import type { TopMover } from '../../../../hooks/use-personnel-dashboard';

interface Props {
  topUp: TopMover[];
  topDown: TopMover[];
}

function MoverRow({ mover, direction }: { mover: TopMover; direction: 'up' | 'down' }) {
  const sign = direction === 'up' ? '+' : '';
  const cls = direction === 'up' ? 'text-success' : 'text-error';
  return (
    <li className="flex items-center justify-between gap-3 rounded-input bg-surface-2/60 px-3 py-2">
      <span className="truncate text-xs font-semibold text-text-1">{mover.label}</span>
      <span className="flex items-center gap-2 text-xs">
        <span className="font-mono text-text-muted">{mover.from.toFixed(1)} → {mover.to.toFixed(1)}</span>
        <span className={`font-bold ${cls}`}>{sign}{mover.delta.toFixed(1)}</span>
      </span>
    </li>
  );
}

export function TopMoversList({ topUp, topDown }: Props) {
  if (topUp.length === 0 && topDown.length === 0) {
    return <p className="text-xs text-text-muted">Chưa có biến động kỹ năng đáng kể (Δ ≥ 1).</p>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section>
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-success">
          <TrendingUp className="size-3.5" /> Tăng mạnh
        </h4>
        {topUp.length > 0 ? (
          <ul className="space-y-1.5">
            {topUp.map((m) => <MoverRow key={m.skillId} mover={m} direction="up" />)}
          </ul>
        ) : (
          <p className="text-xs text-text-muted">Không có skill tăng ≥ 1 điểm.</p>
        )}
      </section>
      <section>
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-error">
          <TrendingDown className="size-3.5" /> Giảm sâu
        </h4>
        {topDown.length > 0 ? (
          <ul className="space-y-1.5">
            {topDown.map((m) => <MoverRow key={m.skillId} mover={m} direction="down" />)}
          </ul>
        ) : (
          <p className="text-xs text-text-muted">Không có skill giảm ≥ 1 điểm.</p>
        )}
      </section>
    </div>
  );
}
