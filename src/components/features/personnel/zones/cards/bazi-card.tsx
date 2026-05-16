/**
 * Bát tự (Tứ Trụ) card. VN labels only.
 */

import type { BaziData } from '../../../../../lib/personnel/personnel-types';
import { Card } from '../../../../ui';

interface Props {
  data: BaziData | null;
}

const ELEMENT_BG: Record<string, string> = {
  Kim: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
  Mộc: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  Thủy: 'bg-sky-500/15 text-sky-400 ring-sky-500/30',
  Hỏa: 'bg-rose-500/15 text-rose-400 ring-rose-500/30',
  Thổ: 'bg-yellow-700/15 text-yellow-500 ring-yellow-700/30',
};

export function BaziCard({ data }: Props) {
  return (
    <Card padding="md" className="flex h-full flex-col">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Bát tự</p>
      <h3 className="mt-1 font-headline text-lg font-black text-text-1">Tứ trụ</h3>

      {!data ? (
        <div className="mt-4 flex flex-1 items-center justify-center rounded-card border border-dashed border-border bg-surface-2 p-6 text-center text-sm text-text-2">
          Cần nhập ngày sinh trong Profile để tính.
        </div>
      ) : (
        <div className="mt-3 flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-3 rounded-card border border-border bg-surface-2 p-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${ELEMENT_BG[data.element] ?? 'bg-surface text-text-2 ring-border'}`}>
              Ngũ hành: {data.element || '—'}
            </span>
            <span className="text-xs text-text-2">Nhật chủ: <strong className="text-text-1">{data.dayMaster}</strong></span>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Pillar label="Năm" value={data.yearPillar} />
            <Pillar label="Tháng" value={data.monthPillar} />
            <Pillar label="Ngày" value={data.dayPillar} highlight />
            <Pillar label="Giờ" value={data.hourPillar ?? 'Không xác định'} muted={!data.hourKnown} />
          </div>

          {!data.hourKnown && (
            <p className="text-[11px] text-text-muted">Chưa có giờ sinh → trụ giờ ước lượng 12h và đánh dấu chưa xác định.</p>
          )}
        </div>
      )}
    </Card>
  );
}

function Pillar({ label, value, highlight, muted }: { label: string; value: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div
      className={[
        'rounded-input border p-2 text-center transition',
        highlight ? 'border-accent/50 bg-surface' : 'border-border bg-surface',
        muted ? 'opacity-60' : '',
      ].join(' ')}
    >
      <p className="text-[10px] uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-text-1">{value}</p>
    </div>
  );
}
