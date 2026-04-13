import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Assigning objective owners...\n');

  // Get all users
  const users = await prisma.user.findMany();

  // Find leaders by name
  const findUser = (name: string) => users.find(u => u.fullName === name);

  // Try multiple name variations
  const nguyenQuan = findUser('Nguyễn Quân') || findUser('Nguyễn Quân') || users.find(u => u.department === 'BOD' && u.role === 'Leader');
  const thaiPhong = findUser('Thái Phong');
  const thanhLong = findUser('Thành Long');
  const haCanh = findUser('Hà Canh');

  console.log('Found users:');
  console.log(`  Nguyễn Quân: ${nguyenQuan?.id || 'NOT FOUND'}`);
  console.log(`  Thái Phong: ${thaiPhong?.id || 'NOT FOUND'}`);
  console.log(`  Thành Long: ${thanhLong?.id || 'NOT FOUND'}`);
  console.log(`  Hà Canh: ${haCanh?.id || 'NOT FOUND'}`);

  // Get all objectives
  const objectives = await prisma.objective.findMany();
  console.log(`\n📊 Found ${objectives.length} objectives\n`);

  let updated = 0;

  for (const obj of objectives) {
    let ownerId: string | null = null;

    // L1 Objectives (BOD department) -> Nguyễn Quân
    if (obj.department === 'BOD') {
      ownerId = nguyenQuan?.id || null;
    }
    // L2 Tech Objectives -> Thái Phong
    else if (obj.department === 'Tech') {
      ownerId = thaiPhong?.id || null;
    }
    // L2 Marketing Objectives -> Hà Canh
    else if (obj.department === 'Marketing') {
      ownerId = haCanh?.id || null;
    }
    // L2 Media Objectives -> Thành Long
    else if (obj.department === 'Media') {
      ownerId = thanhLong?.id || null;
    }
    // L2 Sale Objectives -> Nguyễn Quân
    else if (obj.department === 'Sale') {
      ownerId = nguyenQuan?.id || null;
    }

    if (ownerId) {
      await prisma.objective.update({
        where: { id: obj.id },
        data: { ownerId },
      });
      console.log(`✅ ${obj.title.substring(0, 50)}... → ${obj.department} → ${users.find(u => u.id === ownerId)?.fullName || 'Unknown'}`);
      updated++;
    }
  }

  console.log(`\n🎉 Owner assignment complete!`);
  console.log(`   Updated ${updated}/${objectives.length} objectives`);
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
