import { PrismaClient } from '@prisma/client';

let _prisma: PrismaClient;

export function initLeadSyncPrisma(prisma: PrismaClient) {
  _prisma = prisma;
}

export function getLeadSyncPrisma() {
  if (!_prisma) {
    throw new Error('Lead sync service not initialized - call initLeadSyncPrisma first');
  }
  return _prisma;
}
