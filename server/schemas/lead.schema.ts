import { z } from 'zod';

export const LEAD_STATUSES = [
  'Đang liên hệ',
  'Đang nuôi dưỡng',
  'Qualified',
  'Unqualified',
] as const;

export const LEAD_TYPES = ['Việt Nam', 'Quốc Tế'] as const;

export const createLeadSchema = z.object({
  customerName: z.string().min(1),
  ae: z.string().min(1),
  receivedDate: z.string(),
  resolvedDate: z.string().optional().nullable(),
  status: z.enum(LEAD_STATUSES),
  leadType: z.enum(LEAD_TYPES).optional().nullable(),
  unqualifiedType: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateLeadSchema = createLeadSchema.partial();
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
