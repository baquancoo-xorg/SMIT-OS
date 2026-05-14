import { format } from 'date-fns';
import type { DateRange } from '../../ui';

export function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function toDateRange(from: string, to: string): DateRange {
  return { from: parseLocalDate(from), to: parseLocalDate(to) };
}

export function fromDateRange(range: DateRange) {
  return {
    from: format(range.from, 'yyyy-MM-dd'),
    to: format(range.to, 'yyyy-MM-dd'),
  };
}
