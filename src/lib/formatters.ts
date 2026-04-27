export function formatCurrency(v: number): string {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v);
}

export function formatNumber(v: number): string {
  return new Intl.NumberFormat('vi-VN').format(v);
}

export function formatDecimal(v: number, digits = 1): string {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(v);
}

export function formatPercent(v: number): string {
  return `${v.toFixed(1)}%`;
}

export function formatRoas(v: number): string {
  return `${v.toFixed(2)}x`;
}

export function formatDateDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
