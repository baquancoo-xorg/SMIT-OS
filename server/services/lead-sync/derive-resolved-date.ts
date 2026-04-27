import { safeCrmQuery } from '../../lib/crm-db';
import { getCrmClient } from '../../lib/crm-db';

export async function deriveResolvedDate(crmSubId: bigint, smitStatus: string): Promise<Date | null> {
  if (smitStatus !== 'Qualified' && smitStatus !== 'Unqualified') {
    return null;
  }

  const crm = getCrmClient();
  if (!crm) {
    return null;
  }

  const latest = await safeCrmQuery(
    () =>
      crm.crm_activities.findFirst({
        where: {
          subscriber_id: Number(crmSubId),
          action: 'change_status_subscriber',
          PEERDB_IS_DELETED: false,
        },
        orderBy: { created_at: 'desc' },
        select: { created_at: true },
      }),
    null
  );

  return latest?.created_at ?? null;
}

export async function loadResolvedDateMap(crmSubIds: bigint[]): Promise<Map<bigint, Date>> {
  const uniqueIds = Array.from(new Set(crmSubIds.map((id) => Number(id))));
  if (uniqueIds.length === 0) {
    return new Map<bigint, Date>();
  }

  const crm = getCrmClient();
  if (!crm) {
    return new Map<bigint, Date>();
  }

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
    [] as Array<{ subscriber_id: number; created_at: Date }>
  );

  const resolvedMap = new Map<bigint, Date>();
  for (const row of rows) {
    const key = BigInt(row.subscriber_id);
    if (!resolvedMap.has(key)) {
      resolvedMap.set(key, row.created_at);
    }
  }

  return resolvedMap;
}
