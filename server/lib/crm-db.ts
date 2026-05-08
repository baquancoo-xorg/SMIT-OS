// CRM Database Connection (External read-only)
// Only initialize if CRM_DATABASE_URL is configured and client exists

import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let crmPrisma: any = null;

function initCrmClient() {
  if (crmPrisma) return crmPrisma;
  if (!process.env.CRM_DATABASE_URL) {
    console.warn('[CRM] CRM_DATABASE_URL not configured - CRM features disabled');
    return null;
  }
  try {
    // Resolve from project root to handle different execution contexts
    const clientPath = path.resolve(process.cwd(), 'node_modules/.prisma/crm-client');
    const { PrismaClient } = require(clientPath);
    crmPrisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    return crmPrisma;
  } catch (err) {
    console.warn('[CRM] CRM client not generated - run: npm run prisma:pull:crm && npm run prisma:gen');
    return null;
  }
}

export { crmPrisma };

export async function safeCrmQuery<T>(
  fn: () => Promise<T>,
  fallback: T | null = null,
): Promise<T | null> {
  const client = initCrmClient();
  if (!client) return fallback;
  try {
    return await fn();
  } catch (err) {
    console.warn('[CRM] query failed:', (err as Error).message);
    return fallback;
  }
}

export function getCrmClient() {
  return initCrmClient();
}
