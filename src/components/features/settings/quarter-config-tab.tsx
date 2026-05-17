/**
 * Quarter config admin tab — edit fiscal year start month/day.
 * Drives Personnel Dashboard quarter resolution.
 */

import { useEffect, useState } from 'react';
import { CalendarCog, Save } from 'lucide-react';
import { Button, Input } from '../../ui';

const MONTH_LABELS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

interface QuarterConfig {
  startMonth: number;
  startDay: number;
}

export function QuarterConfigTab() {
  const [config, setConfig] = useState<QuarterConfig | null>(null);
  const [month, setMonth] = useState<number>(1);
  const [day, setDay] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/app-settings/quarter-config', { credentials: 'include' })
      .then((r) => r.json())
      .then((c: QuarterConfig) => {
        setConfig(c);
        setMonth(c.startMonth);
        setDay(c.startDay);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/app-settings/quarter-config', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startMonth: month, startDay: day }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const updated: QuarterConfig = await res.json();
      setConfig(updated);
      setSavedAt(Date.now());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const dirty = config !== null && (config.startMonth !== month || config.startDay !== day);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="rounded-card bg-surface-2 p-2 text-accent-text">
          <CalendarCog className="size-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Fiscal Year</p>
          <h2 className="font-headline text-base font-black text-text-1">Quarter cutoff cho Personnel</h2>
        </div>
      </header>

      <p className="text-sm text-text-2">
        Cấu hình tháng + ngày bắt đầu quý đầu tiên (Q1). Mặc định là dương lịch (1/1).
        Áp dụng ngay cho tất cả nhân sự và dashboard.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-text-muted">Tháng bắt đầu Q1</span>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm font-bold text-text-1"
          >
            {MONTH_LABELS.map((label, i) => (
              <option key={i + 1} value={i + 1}>{label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-text-muted">Ngày bắt đầu Q1</span>
          <Input type="number" min={1} max={31} value={day} onChange={(e) => setDay(Number((e.target as HTMLInputElement).value))} />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" iconLeft={<Save />} onClick={handleSave} isLoading={saving} disabled={!dirty}>
          Lưu thay đổi
        </Button>
        {savedAt && !dirty && <span className="text-xs text-success">Đã lưu ✓</span>}
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    </div>
  );
}
