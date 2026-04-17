// CRM Database Connection (External read-only)
// Only initialize if CRM_DATABASE_URL is configured and client exists

let crmPrisma: any = null;

function initCrmClient() {
  if (crmPrisma) return crmPrisma;
  if (!process.env.CRM_DATABASE_URL) {
    console.warn('[CRM] CRM_DATABASE_URL not configured - CRM features disabled');
    return null;
  }
  try {
    // @ts-ignore - generated to custom path
    const { PrismaClient } = require('../../node_modules/.prisma/crm-client');
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

export async function isCrmDatabaseAvailable(): Promise<boolean> {
  const client = initCrmClient();
  if (!client) return false;
  try {
    await client.crmSubscriber.count({ take: 1 });
    return true;
  } catch (err) {
    console.warn('[CRM] connection failed:', (err as Error).message);
    return false;
  }
}

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

export default crmPrisma;
