import { getCrmClient, safeCrmQuery } from '../../lib/crm-db';

export async function loadResolvedDateMap(crmSubIds: bigint[]): Promise<Map<bigint, Date>> {
  const uniqueIds = Array.from(new Set(crmSubIds.map((id) => Number(id))));
  if (uniqueIds.length === 0) return new Map();

  const crm = getCrmClient();
  if (!crm) return new Map();

  const rows = await safeCrmQuery(
    () =>
      crm.crm_activities.findMany({
        where: {
          subscriber_id: { in: uniqueIds },
          action: 'change_status_subscriber',
          PEERDB_IS_DELETED: false,
        },
        orderBy: [{ subscriber_id: 'asc' }, { created_at: 'desc' }],
        select: { subscriber_id: true, created_at: true },
      }),
    [],
  );

  const result = new Map<bigint, Date>();
  for (const row of rows ?? []) {
    if (row.subscriber_id == null) continue;
    const key = BigInt(row.subscriber_id);
    if (!result.has(key)) result.set(key, row.created_at);
  }
  return result;
}
