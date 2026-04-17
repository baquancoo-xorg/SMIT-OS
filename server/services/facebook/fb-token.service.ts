import { PrismaClient } from '@prisma/client';
import { decrypt } from '../../lib/crypto';

const prisma = new PrismaClient();

export async function getDecryptedToken(accountId: string): Promise<string | null> {
  const cfg = await prisma.fbAdAccountConfig.findUnique({ where: { accountId } });
  if (!cfg?.accessTokenEncrypted) return null;
  try {
    return decrypt(cfg.accessTokenEncrypted);
  } catch (err) {
    console.error('[fb-token] decrypt failed:', (err as Error).message);
    return null;
  }
}

export async function getActiveAccounts() {
  return prisma.fbAdAccountConfig.findMany({
    where: { isActive: true },
    select: { accountId: true, accountName: true, currency: true },
  });
}
