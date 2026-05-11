/**
 * v4 className combiner. Joins truthy strings with spaces.
 * Zero deps (avoids clsx import). Falsy values dropped.
 *
 * Usage:
 *   cn('base', condition && 'active', isError ? 'error' : null)
 */
export type ClassValue = string | number | null | undefined | false;

export function cn(...inputs: ClassValue[]): string {
  let out = '';
  for (const c of inputs) {
    if (!c && c !== 0) continue;
    if (out) out += ' ';
    out += String(c);
  }
  return out;
}
