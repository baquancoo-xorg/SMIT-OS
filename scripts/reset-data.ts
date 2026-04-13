import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database - keeping only admin user...');

  // Delete all data except users
  await prisma.weeklyReport.deleteMany();
  console.log('✅ Cleared weekly reports');
  
  await prisma.workItem.deleteMany();
  console.log('✅ Cleared work items');
  
  await prisma.keyResult.deleteMany();
  console.log('✅ Cleared key results');
  
  await prisma.objective.deleteMany();
  console.log('✅ Cleared objectives');
  
  await prisma.sprint.deleteMany();
  console.log('✅ Cleared sprints');

  console.log('\n✅ Database reset complete!');
  console.log('Database now contains:');
  console.log('  - Admin user: dominium');
  console.log('  - All other data cleared');
}

main()
  .catch((e) => {
    console.error('Reset failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
