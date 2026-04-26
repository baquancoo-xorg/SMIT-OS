import { getLeadSyncPrisma } from './state';

export type EmployeeMapValue = {
  id: string;
  fullName: string;
};

export async function loadEmployeeMap() {
  const prisma = getLeadSyncPrisma();

  const rows = await prisma.user.findMany({
    where: { crmEmployeeId: { not: null } },
    select: { id: true, fullName: true, crmEmployeeId: true },
  });

  return rows.reduce<Map<number, EmployeeMapValue>>((acc, row) => {
    if (row.crmEmployeeId !== null) {
      acc.set(row.crmEmployeeId, { id: row.id, fullName: row.fullName });
    }
    return acc;
  }, new Map<number, EmployeeMapValue>());
}
