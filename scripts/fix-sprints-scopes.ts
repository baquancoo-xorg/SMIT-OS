import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing sprints and adding user scopes...\n');

  // --- Fix Sprint Dates (from CSV sheet) ---
  console.log('📅 Fixing Sprint dates...');
  
  await prisma.sprint.deleteMany();
  console.log('✅ Cleared existing sprints');

  const correctSprints = [
    { name: 'Sprint 1', start: '2026-03-23', end: '2026-04-05' },
    { name: 'Sprint 2', start: '2026-04-06', end: '2026-04-19' },
    { name: 'Sprint 3', start: '2026-04-20', end: '2026-05-03' },
    { name: 'Sprint 4', start: '2026-05-04', end: '2026-05-17' },
    { name: 'Sprint 5', start: '2026-05-18', end: '2026-05-31' },
    { name: 'Sprint 6', start: '2026-06-01', end: '2026-06-14' },
    { name: 'Sprint 7', start: '2026-06-15', end: '2026-06-28' },
  ];

  for (const sprint of correctSprints) {
    await prisma.sprint.create({
      data: {
        name: sprint.name,
        startDate: new Date(sprint.start),
        endDate: new Date(sprint.end),
      },
    });
    console.log(`✅ ${sprint.name}: ${sprint.start} → ${sprint.end}`);
  }

  // --- Add Scope to Users ---
  console.log('\n👥 Adding scopes to users...');

  const userScopes: Record<string, string> = {
    'Thái Phong': 'Product Manager, Tech Leader',
    'Đăng Khoa': 'Leader Frontend',
    'Thành Long': 'Leader Media',
    'Hà Canh': 'Fullstack Marketer',
    'Nguyễn Quân': 'Project Manager, Sale Leader',
    'Giang Trường': 'Backend Developer',
    'Thuỳ Dương': 'Graphic Creator',
    'Việt Dũng': 'Video Creator',
    'Kim Tuyến': 'Content Creator',
    'Kim Huệ': 'Account Executive',
    'Phương Linh': 'Intern Account Executive',
    'Hồng Nhung': 'Customer Support, Junior Account Executive',
    'Tuấn Anh': 'Senior Product Designer',
    'Ngọc Phong': 'Backend Developer',
    'Xuân Bách': 'Frontend Developer',
    'Huy Hoàng': 'Backend Developer',
  };

  const users = await prisma.user.findMany();
  
  for (const user of users) {
    const scope = userScopes[user.fullName];
    if (scope && !user.scope) {
      await prisma.user.update({
        where: { id: user.id },
        data: { scope },
      });
      console.log(`✅ ${user.fullName}: ${scope}`);
    }
  }

  console.log('\n🎉 Fix complete!');
  console.log(`   • 7 sprints updated with correct dates`);
  console.log(`   • ${users.length} users updated with scopes`);
}

main()
  .catch((e) => {
    console.error('❌ Fix failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
