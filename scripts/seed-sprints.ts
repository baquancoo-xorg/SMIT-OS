import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sprints = [
  { name: 'Sprint 1', start: '2026-03-23', end: '2026-04-05' },
  { name: 'Sprint 2', start: '2026-04-06', end: '2026-04-19' },
  { name: 'Sprint 3', start: '2026-04-20', end: '2026-05-03' },
  { name: 'Sprint 4', start: '2026-05-04', end: '2026-05-17' },
  { name: 'Sprint 5', start: '2026-05-18', end: '2026-05-31' },
  { name: 'Sprint 6', start: '2026-06-01', end: '2026-06-14' },
  { name: 'Sprint 7', start: '2026-06-15', end: '2026-06-28' },
];

async function main() {
  console.log('🚀 Importing Sprints Q2/2026...\n');

  // Clear existing sprints
  await prisma.sprint.deleteMany();
  console.log('🗑️  Cleared existing sprints\n');

  // Create new sprints
  for (const sprint of sprints) {
    await prisma.sprint.create({
      data: {
        name: sprint.name,
        startDate: new Date(sprint.start),
        endDate: new Date(sprint.end),
      },
    });
    console.log(`✅ ${sprint.name}: ${sprint.start} → ${sprint.end}`);
  }

  console.log(`\n🎉 Imported ${sprints.length} sprints!`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
