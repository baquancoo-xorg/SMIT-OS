import { api } from '@/lib/api';
import type { Lead } from '@/types';

function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildLeadsCsv(leads: Lead[]): string {
  const headers = ['Customer', 'AE', 'Received', 'Resolved', 'Status', 'Lead Type', 'UQ Reason', 'Notes'];
  const rows = leads.map((l) => [
    l.customerName,
    l.ae,
    l.receivedDate.slice(0, 10),
    l.resolvedDate ? l.resolvedDate.slice(0, 10) : '',
    l.status,
    l.leadType ?? '',
    l.status === 'Unqualified' ? (l.unqualifiedType ?? '') : '',
    l.notes ?? '',
  ].map(escapeCsvCell).join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

function downloadCsv(content: string, filename: string): void {
  // UTF-8 BOM for correct Vietnamese display in Excel
  const bom = '﻿';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportAllLeadsToCsv(): Promise<void> {
  const leads = await api.getLeads();
  const date = new Date().toISOString().slice(0, 10);
  const csv = buildLeadsCsv(leads);
  downloadCsv(csv, `leads-export-${date}.csv`);
}
