import { getLeadSyncPrisma } from './state';

export async function loadStatusMap() {
  const prisma = getLeadSyncPrisma();
  const rows = await prisma.leadStatusMapping.findMany({
    where: { active: true },
    select: { crmStatus: true, smitStatus: true },
  });

  return rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.crmStatus] = row.smitStatus;
    return acc;
  }, {});
}
