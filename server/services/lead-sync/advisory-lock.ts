import { getLeadSyncPrisma } from './state';

export async function withAdvisoryLock<T>(key: bigint, fn: () => Promise<T>): Promise<T | null> {
  const prisma = getLeadSyncPrisma();

  const lockRows = await prisma.$queryRaw<Array<{ locked: boolean }>>`
    SELECT pg_try_advisory_lock(${key}) AS locked
  `;

  const isLocked = lockRows[0]?.locked === true;
  if (!isLocked) {
    return null;
  }

  try {
    return await fn();
  } finally {
    await prisma.$queryRaw`
      SELECT pg_advisory_unlock(${key})
    `;
  }
}
