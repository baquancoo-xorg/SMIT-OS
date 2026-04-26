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
