import { getCrmClient, safeCrmQuery } from '../../lib/crm-db';

const NOTES_CAP_DAYS = 90;

function formatDateTime(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export async function loadNotesMap(crmSubIds: bigint[]): Promise<Map<bigint, string>> {
  const uniqueIds = Array.from(new Set(crmSubIds.map((id) => Number(id))));
  if (uniqueIds.length === 0) return new Map();

  const crm = getCrmClient();
  if (!crm) return new Map();

  const cutoff = new Date(Date.now() - NOTES_CAP_DAYS * 24 * 60 * 60 * 1000);
  const rows = await safeCrmQuery(
    () =>
      crm.crm_activities.findMany({
        where: {
          subscriber_id: { in: uniqueIds },
          action: 'add_note',
          PEERDB_IS_DELETED: false,
          created_at: { gte: cutoff },
        },
        orderBy: [{ subscriber_id: 'asc' }, { created_at: 'asc' }],
        select: { subscriber_id: true, title: true, details: true, created_at: true },
      }),
    [],
  );

  const grouped = new Map<bigint, string[]>();
  for (const row of rows ?? []) {
    if (row.subscriber_id == null) continue;
    const key = BigInt(row.subscriber_id);
    const title = (row.title ?? '').trim();
    const details = (row.details ?? '').trim();
    const line = `[${formatDateTime(row.created_at)}] ${title}${title && details ? ': ' : ''}${details}`.trim();
    const existing = grouped.get(key) ?? [];
    existing.push(line);
    grouped.set(key, existing);
  }

  return new Map(Array.from(grouped.entries()).map(([k, v]) => [k, v.join('\n\n')]));
}
