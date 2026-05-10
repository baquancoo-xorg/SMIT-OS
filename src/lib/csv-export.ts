/**
 * Shared CSV export utility for Acquisition trackers.
 * Pattern adapted from `src/components/lead-tracker/csv-export.ts`.
 */

function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map(escapeCsvCell).join(',');
  const bodyLines = rows.map((row) =>
    row
      .map((cell) => escapeCsvCell(cell == null ? '' : String(cell)))
      .join(',')
  );
  return [headerLine, ...bodyLines].join('\r\n');
}

export function downloadCsv(content: string, filename: string): void {
  // UTF-8 BOM for correct Vietnamese rendering in Excel
  const bom = '﻿';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
