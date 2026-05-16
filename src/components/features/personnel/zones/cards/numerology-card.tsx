/**
 * Numerology card. Reads from Personnel.numerologyData (server-computed).
 */

import type { NumerologyData } from '../../../../../lib/personnel/personnel-types';
import { Card } from '../../../../ui';

interface Props {
  data: NumerologyData | null;
}

export function NumerologyCard({ data }: Props) {
  return (
    <Card padding="md" className="flex h-full flex-col">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Numerology</p>
      <h3 className="mt-1 font-headline text-lg font-black text-text-1">Thần số học</h3>

      {!data ? (
        <div className="mt-4 flex flex-1 items-center justify-center rounded-card border border-dashed border-border bg-surface-2 p-6 text-center text-sm text-text-2">
          Cần nhập ngày sinh trong Profile để tính.
        </div>
      ) : (
        <div className="mt-3 flex flex-1 flex-col gap-3">
          <div className="flex items-end gap-3 rounded-card border border-border bg-surface-2 p-4">
            <span className="font-headline text-5xl font-black text-accent-text leading-none">{data.lifePath}</span>
            <div className="pb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Life Path</p>
              <p className="text-sm font-semibold text-text-1">{data.meanings.lifePath.title}</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-text-2">{data.meanings.lifePath.description}</p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <MiniNum value={data.expression} label="Expression" title={data.meanings.expression.title} />
            <MiniNum value={data.soulUrge} label="Soul Urge" title={data.meanings.soulUrge.title} />
            <MiniNum value={data.birthday} label="Birthday" title={data.meanings.birthday.title} />
          </div>
        </div>
      )}
    </Card>
  );
}

function MiniNum({ value, label, title }: { value: number; label: string; title: string }) {
  return (
    <div className="rounded-input border border-border bg-surface p-2 text-center">
      <p className="text-[10px] uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-0.5 font-headline text-xl font-black text-text-1">{value}</p>
      <p className="truncate text-[10px] text-text-2" title={title}>{title}</p>
    </div>
  );
}
