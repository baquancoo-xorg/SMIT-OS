import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Verification Report: WorkItems in Database\n');
  console.log('='.repeat(70));

  // Total count
  const total = await prisma.workItem.count();
  console.log(`\n📋 Total WorkItems: ${total}`);

  // By Sprint
  const sprint1Count = await prisma.workItem.count({ where: { sprint: { name: { contains: 'Sprint 1' } } } });
  const sprint2Count = await prisma.workItem.count({ where: { sprint: { name: { contains: 'Sprint 2' } } } });
  console.log(`   Sprint 1: ${sprint1Count} tasks`);
  console.log(`   Sprint 2: ${sprint2Count} tasks`);

  // By Status
  console.log('\n📊 By Status:');
  const byStatus = await prisma.workItem.groupBy({
    by: ['status'],
    _count: { status: true },
    orderBy: { status: 'asc' },
  });
  byStatus.forEach(item => {
    console.log(`   ${item.status}: ${item._count.status}`);
  });

  // By Type
  console.log('\n📊 By Type:');
  const byType = await prisma.workItem.groupBy({
    by: ['type'],
    _count: { type: true },
    orderBy: { type: 'asc' },
  });
  byType.forEach(item => {
    console.log(`   ${item.type}: ${item._count.type}`);
  });

  // By Priority
  console.log('\n📊 By Priority:');
  const byPriority = await prisma.workItem.groupBy({
    by: ['priority'],
    _count: { priority: true },
    orderBy: { priority: 'asc' },
  });
  byPriority.forEach(item => {
    console.log(`   ${item.priority}: ${item._count.priority}`);
  });

  // Assigned users
  console.log('\n👥 Assignments by User:');
  const assigned = await prisma.workItem.findMany({
    where: { assigneeId: { not: null } },
    include: { assignee: true },
  });
  const userCount = new Map<string, number>();
  assigned.forEach(wi => {
    if (wi.assignee) {
      const name = wi.assignee.fullName;
      userCount.set(name, (userCount.get(name) || 0) + 1);
    }
  });
  Array.from(userCount.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => {
      console.log(`   ${name}: ${count} tasks`);
    });

  console.log('\n' + '='.repeat(70));
  console.log('✅ Verification complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
