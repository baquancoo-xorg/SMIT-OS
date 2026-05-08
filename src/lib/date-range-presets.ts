import type { DateRange } from '../types/dashboard-product';

export const DATE_PRESETS = [
  { key: '7d', label: '7 ngày', days: 7 },
  { key: '30d', label: '30 ngày', days: 30 },
  { key: '90d', label: '90 ngày', days: 90 },
] as const;

export type PresetKey = (typeof DATE_PRESETS)[number]['key'];

export function getPresetRange(key: PresetKey): DateRange {
  const preset = DATE_PRESETS.find((p) => p.key === key);
  if (!preset) return getPresetRange('30d');

  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - preset.days);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function defaultRange(): DateRange {
  return getPresetRange('30d');
}

export function formatDateRange(range: DateRange): string {
  const from = new Date(range.from).toLocaleDateString('vi-VN');
  const to = new Date(range.to).toLocaleDateString('vi-VN');
  return `${from} - ${to}`;
}
