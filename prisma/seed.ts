import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Create Users
  const u1 = await prisma.user.create({
    data: {
      fullName: 'Hoàng Nguyễn',
      department: 'BOD',
      role: 'Agency PM',
      avatar: 'https://picsum.photos/seed/quan/100/100',
    },
  });

  const u2 = await prisma.user.create({
    data: {
      fullName: 'Minh Trần',
      department: 'Tech',
      role: 'Tech Lead',
      avatar: 'https://picsum.photos/seed/minh/100/100',
    },
  });

  // Create Sprints
  const s1 = await prisma.sprint.create({
    data: {
      name: 'Sprint 1: Foundation',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-04-14'),
    },
  });

  // Create Objectives
  const o1 = await prisma.objective.create({
    data: {
      title: 'Xây dựng nền tảng SMIT OS',
      department: 'BOD',
      progressPercentage: 45,
      keyResults: {
        create: [
          { title: 'Hoàn thành 100% Core UI', progressPercentage: 80 },
          { title: 'Setup Database & Backend', progressPercentage: 10 },
        ],
      },
    },
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
