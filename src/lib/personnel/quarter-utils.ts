/**
 * Quarter utilities for assessment cycles.
 * Format: "YYYY-Q{1-4}".
 */

export function currentQuarter(now: Date = new Date()): string {
  const year = now.getFullYear();
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `${year}-Q${q}`;
}

export function previousQuarter(quarter: string): string {
  const [yStr, qStr] = quarter.split('-Q');
  let y = parseInt(yStr, 10);
  let q = parseInt(qStr, 10);
  q -= 1;
  if (q < 1) {
    q = 4;
    y -= 1;
  }
  return `${y}-Q${q}`;
}

export function lastNQuarters(n: number, now: Date = new Date()): string[] {
  const result: string[] = [currentQuarter(now)];
  for (let i = 1; i < n; i++) {
    result.unshift(previousQuarter(result[0]));
  }
  return result;
}

export function quarterLabel(quarter: string): string {
  const [y, q] = quarter.split('-Q');
  return `Q${q} ${y}`;
}
