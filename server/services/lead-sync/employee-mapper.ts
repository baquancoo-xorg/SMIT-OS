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

/**
 * Load AE map by subscriber ID using crm_employee_supervisor relationship.
 * Flow: subscriber_id -> crm_employee_supervisor.asset_id -> employee_user_id -> smit_employee
 * If multiple AE for same subscriber, takes the most recent (by created_at).
 */
export async function loadAeMapBySubscriber(
  crmSubIds: bigint[]
): Promise<Map<bigint, EmployeeMapValue>> {
  if (crmSubIds.length === 0) return new Map();

  const crm = getCrmClient();
  if (!crm) return new Map();

  const subIdNumbers = crmSubIds.map((id) => Number(id));

  // Query crm_employee_supervisor for subscriber mappings, ordered by created_at DESC
  const supervisorRows = await safeCrmQuery(
    () =>
      crm.crm_employee_supervisor.findMany({
        where: {
          asset_id: { in: subIdNumbers },
          asset_type: 'subscriber',
          PEERDB_IS_DELETED: false,
        },
        select: { asset_id: true, employee_user_id: true, created_at: true },
        orderBy: { created_at: 'desc' },
      }),
    [],
  );

  if (!supervisorRows || supervisorRows.length === 0) return new Map();

  // Take only the latest record per asset_id
  const latestByAsset = new Map<number, number>();
  for (const row of supervisorRows) {
    if (row.asset_id == null || row.employee_user_id == null) continue;
    if (!latestByAsset.has(row.asset_id)) {
      latestByAsset.set(row.asset_id, row.employee_user_id);
    }
  }

  const employeeUserIds = [...new Set(latestByAsset.values())];
  if (employeeUserIds.length === 0) return new Map();

  // Load employee names from smit_employee
  const employeeRows = await safeCrmQuery(
    () =>
      crm.smit_employee.findMany({
        where: {
          user_id: { in: employeeUserIds },
          PEERDB_IS_DELETED: false,
        },
        select: { user_id: true, lark_info: true, zalo_pancake_info: true },
      }),
    [],
  );

  // Build user_id -> fullName map
  const employeeNameMap = new Map<number, string>();
  for (const emp of employeeRows ?? []) {
    const lark = emp.lark_info as { name?: string; en_name?: string } | null;
    const pancake = emp.zalo_pancake_info as { name?: string } | null;
    const name =
      lark?.name?.trim() ||
      lark?.en_name?.trim() ||
      pancake?.name?.trim() ||
      `CRM-emp-${emp.user_id}`;
    employeeNameMap.set(emp.user_id, name);
  }

  // Build subscriber_id -> EmployeeMapValue map
  const result = new Map<bigint, EmployeeMapValue>();
  for (const [assetId, empUserId] of latestByAsset) {
    const empName = employeeNameMap.get(empUserId);
    if (empName) {
      result.set(BigInt(assetId), { fullName: empName });
    }
  }

  return result;
}
