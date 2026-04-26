import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultMappings = [
  { crmStatus: 'new', smitStatus: 'Mới' },
  { crmStatus: 'mql_contacting', smitStatus: 'Đang liên hệ' },
  { crmStatus: 'mql_nurturing', smitStatus: 'Đang nuôi dưỡng' },
  { crmStatus: 'mql_qualified', smitStatus: 'Qualified' },
  { crmStatus: 'mql_unqualified', smitStatus: 'Unqualified' },
] as const;

async function main() {
  for (const mapping of defaultMappings) {
    await prisma.leadStatusMapping.upsert({
      where: { crmStatus: mapping.crmStatus },
      update: {
        smitStatus: mapping.smitStatus,
        active: true,
      },
      create: {
        crmStatus: mapping.crmStatus,
        smitStatus: mapping.smitStatus,
        active: true,
      },
    });
  }

  const total = await prisma.leadStatusMapping.count();
  console.log(`[lead-status-mapping.seed] done. total mappings=${total}`);
}

main()
  .catch((error) => {
    console.error('[lead-status-mapping.seed] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
