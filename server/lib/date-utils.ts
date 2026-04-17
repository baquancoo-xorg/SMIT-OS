/** YYYY-MM-DD in LOCAL timezone (avoids UTC shift bug) */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDateRange(from: Date, to: Date): string[] {
  const out: string[] = [];
  const cur = new Date(from);
  while (cur <= to) {
    out.push(formatDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/** Compute previous period of same length (exclusive of `from`) */
export function previousPeriod(from: Date, to: Date) {
  const days = Math.ceil((to.getTime() - from.getTime()) / 86_400_000) + 1;
  const previousTo = new Date(from);
  previousTo.setDate(previousTo.getDate() - 1);
  const previousFrom = new Date(previousTo);
  previousFrom.setDate(previousFrom.getDate() - days + 1);
  return { previousFrom, previousTo };
}

/** Parse YYYY-MM-DD string to Date with time set appropriately */
export function parseFromTo(fromStr: string, toStr: string) {
  const from = new Date(`${fromStr}T00:00:00`);
  const to = new Date(`${toStr}T23:59:59.999`);
  return { from, to };
}
