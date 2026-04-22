import { ExtractorContext, Extractor } from './types';
import { SheetData } from '../../../types/sheets-export.types';

export const crmLeadTracker: Extractor = async (ctx): Promise<SheetData> => {
  const leads = await ctx.prisma.lead.findMany({
    orderBy: { receivedDate: 'desc' },
    take: 1000,
  });

  const headers = [
    'ID', 'Customer Name', 'AE', 'Received Date', 'Resolved Date',
    'Status', 'Lead Type', 'Unqualified Type', 'Notes', 'Created At'
  ];

  const rows = leads.map(lead => [
    lead.id,
    lead.customerName,
    lead.ae,
    lead.receivedDate.toISOString().split('T')[0],
    lead.resolvedDate?.toISOString().split('T')[0] || '',
    lead.status,
    lead.leadType || '',
    lead.unqualifiedType || '',
    lead.notes || '',
    lead.createdAt.toISOString(),
  ]);

  return { sheetName: 'CRM-LeadTracker', headers, rows };
};
