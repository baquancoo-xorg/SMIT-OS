export const CUTOFF_2026_04_01 = new Date('2026-04-01T00:00:00+07:00');
export const LEAD_SYNC_LOCK_KEY = 3735928559n;
export const BATCH_SIZE = 50;

export const CRM_OWNED_FIELDS = [
  'customerName',
  'ae',
  'receivedDate',
  'resolvedDate',
  'status',
  'notes',
  'leadType',
] as const;
