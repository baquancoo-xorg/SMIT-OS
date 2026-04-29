import { getCrmClient, safeCrmQuery } from '../../lib/crm-db';

export type EmployeeMapValue = {
  id?: string; // deprecated: không còn link SMIT-OS User
  fullName: string;
};

/**
 * Load employee map từ CRM smit_employee trực tiếp.
 * Fallback chain: lark_info.name → lark_info.en_name → zalo_pancake_info.name → CRM-emp-{id}
 */
export async function loadEmployeeMap(): Promise<Map<number, EmployeeMapValue>> {
  const crm = getCrmClient();
  if (!crm) return new Map();

  const rows = await safeCrmQuery(
    () =>
      crm.smit_employee.findMany({
        where: { PEERDB_IS_DELETED: false },
        select: { user_id: true, lark_info: true, zalo_pancake_info: true },
      }),
    [],
  );

  const map = new Map<number, EmployeeMapValue>();
  for (const row of rows ?? []) {
    const lark = row.lark_info as { name?: string; en_name?: string } | null;
    const pancake = row.zalo_pancake_info as { name?: string } | null;
    const name =
      lark?.name?.trim() ||
      lark?.en_name?.trim() ||
      pancake?.name?.trim() ||
      `CRM-emp-${row.user_id}`;
    map.set(row.user_id, { fullName: name });
  }
  return map;
}
