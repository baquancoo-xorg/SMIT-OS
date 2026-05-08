import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const users = [
  { name: 'Thái Phong', depts: ['Tech'], scope: 'Product Manager, Tech Leader', role: 'Leader' },
  { name: 'Đăng Khoa', depts: ['Tech'], scope: 'Leader Frontend', role: 'Member' },
  { name: 'Thành Long', depts: ['Media'], scope: 'Leader Media', role: 'Leader' },
  { name: 'Hà Canh', depts: ['Marketing'], scope: 'Fullstack Marketer', role: 'Leader' },
  { name: 'Nguyễn Quân', depts: ['BOD', 'Sale'], scope: 'Project Manager, Sale Leader', role: 'Manager', isAdmin: true },
  { name: 'Giang Trường', depts: ['Tech'], scope: 'Backend Developer', role: 'Member' },
  { name: 'Thuỳ Dương', depts: ['Media'], scope: 'Graphic Creator', role: 'Member' },
  { name: 'Việt Dũng', depts: ['Media'], scope: 'Video Creator', role: 'Member' },
  { name: 'Kim Tuyến', depts: ['Media'], scope: 'Content Creator', role: 'Member' },
  { name: 'Kim Huệ', depts: ['Sale'], scope: 'Account Executive', role: 'Member' },
  { name: 'Phương Linh', depts: ['Sale'], scope: 'Intern Account Executive', role: 'Member' },
  { name: 'Hồng Nhung', depts: ['Sale'], scope: 'Customer Support, Junior Account Executive', role: 'Member' },
  { name: 'Tuấn Anh', depts: ['Tech'], scope: 'Senior Product Designer', role: 'Member' },
  { name: 'Ngọc Phong', depts: ['Tech'], scope: 'Backend Developer', role: 'Member' },
  { name: 'Xuân Bách', depts: ['Tech'], scope: 'Frontend Developer', role: 'Member' },
  { name: 'Huy Hoàng', depts: ['Tech'], scope: 'Backend Developer', role: 'Member' },
];

function toUsername(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '');
}

async function main() {
  const password = await bcrypt.hash('123456', 10);

  console.log('Seeding users...\n');

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const username = toUsername(user.name);
    const avatar = `https://picsum.photos/seed/${username}/200/200`;

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      console.log(`⏭️  Skipped: ${user.name} (${username}) - already exists`);
      continue;
    }

    await prisma.user.create({
      data: {
        fullName: user.name,
        username,
        password,
        departments: user.depts,
        role: user.role,
        scope: user.scope,
        avatar,
        isAdmin: user.isAdmin || false,
      },
    });

    console.log(`✅ Created: ${user.name} (${username}) - ${user.depts.join(', ')} ${user.role}`);
  }

  console.log('\n✅ Seeding complete!');
  console.log('Default password for all users: 123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
