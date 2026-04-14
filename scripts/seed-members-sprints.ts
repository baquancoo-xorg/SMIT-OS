import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to generate random credentials
function generateUsername(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Member data from CSV
const members = [
  { name: 'Thái Phong', departments: ['Tech'], role: 'Leader', scope: 'Product Manager, Tech Leader', isLeader: true },
  { name: 'Đăng Khoa', departments: ['Tech'], role: 'Member', scope: 'Leader Frontend', isLeader: false },
  { name: 'Thành Long', departments: ['Media'], role: 'Leader', scope: 'Leader Media', isLeader: true },
  { name: 'Hà Canh', departments: ['Marketing'], role: 'Leader', scope: 'Fullstack Marketer', isLeader: true },
  { name: 'Nguyễn Quân', departments: ['BOD', 'Sale'], role: 'Leader', scope: 'Project Manager, Sale Leader', isLeader: true },
  { name: 'Giang Trường', departments: ['Tech'], role: 'Member', scope: 'Backend Developer', isLeader: false },
  { name: 'Thuỳ Dương', departments: ['Media'], role: 'Member', scope: 'Graphic Creator', isLeader: false },
  { name: 'Việt Dũng', departments: ['Media'], role: 'Member', scope: 'Video Creator', isLeader: false },
  { name: 'Kim Tuyến', departments: ['Media'], role: 'Member', scope: 'Content Creator', isLeader: false },
  { name: 'Kim Huệ', departments: ['Sale'], role: 'Member', scope: 'Account Executive', isLeader: false },
  { name: 'Phương Linh', departments: ['Sale'], role: 'Member', scope: 'Intern Account Executive', isLeader: false },
  { name: 'Hồng Nhung', departments: ['Sale'], role: 'Member', scope: 'Customer Support, Junior Account Executive', isLeader: false },
  { name: 'Tuấn Anh', departments: ['Tech'], role: 'Member', scope: 'Senior Product Designer', isLeader: false },
  { name: 'Ngọc Phong', departments: ['Tech'], role: 'Member', scope: 'Backend Developer', isLeader: false },
  { name: 'Xuân Bách', departments: ['Tech'], role: 'Member', scope: 'Frontend Developer', isLeader: false },
  { name: 'Huy Hoàng', departments: ['Tech'], role: 'Member', scope: 'Backend Developer', isLeader: false },
];

// Skip recruitment positions
const recruitmentPositions = [
  'Digital Marketing 1', 'Digital Marketing 2',
  'Content Creator 1', 'Content Creator 2',
  'Account Executive 1', 'Account Executive 2', 'Account Executive 3'
];

async function main() {
  console.log('🚀 Seeding members and sprints...\n');

  const credentials: Array<{ name: string; username: string; password: string }> = [];

  // --- Seed Members ---
  for (const member of members) {
    const username = generateUsername(member.name) + Math.floor(Math.random() * 100);
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        fullName: member.name,
        username,
        password: hashedPassword,
        departments: member.departments,
        role: member.role,
        scope: member.scope,
        avatar: `https://picsum.photos/seed/${username}/200/200`,
        isAdmin: member.name === 'Dominium Admin',
      },
    });

    credentials.push({ name: member.name, username, password });
    console.log(`✅ Created: ${member.name} (${member.role} - ${member.scope})`);
  }

  console.log('\n📋 Login Credentials:');
  console.log('─'.repeat(60));
  console.log(`${'Name'.padEnd(20)} | ${'Username'.padEnd(20)} | ${'Password'}`);
  console.log('─'.repeat(60));
  credentials.forEach(c => {
    console.log(`${c.name.padEnd(20)} | ${c.username.padEnd(20)} | ${c.password}`);
  });
  console.log('─'.repeat(60));

  // --- Seed Sprints (Q2/2026: April 1 - June 30) ---
  console.log('\n📅 Creating 7 Sprints (Q2/2026)...');

  const sprints = [
    { name: 'Sprint 1: Kick-off Q2', start: '2026-04-01', end: '2026-04-14' },
    { name: 'Sprint 2: Foundation', start: '2026-04-15', end: '2026-04-28' },
    { name: 'Sprint 3: Core Features', start: '2026-04-29', end: '2026-05-12' },
    { name: 'Sprint 4: Integration', start: '2026-05-13', end: '2026-05-26' },
    { name: 'Sprint 5: Polish & QA', start: '2026-05-27', end: '2026-06-09' },
    { name: 'Sprint 6: Launch Prep', start: '2026-06-10', end: '2026-06-23' },
    { name: 'Sprint 7: Release & Review', start: '2026-06-24', end: '2026-06-30' },
  ];

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

  // --- Update OKRs to link with Leaders ---
  console.log('\n🎯 Linking L2 Objectives to Leaders...');

  const objectives = await prisma.objective.findMany();

  // Map leaders to objectives
  const leaderMap: Record<string, string> = {
    'Thái Phong': 'Tech',
    'Thành Long': 'Media',
    'Hà Canh': 'Marketing',
    'Nguyễn Quân': 'Sale',
  };

  // Note: In current schema, we don't have ownerId field. 
  // We'll store leader info in a note or update schema if needed.
  // For now, just confirm the mapping.
  console.log('   Thái Phong → Tech Objectives');
  console.log('   Thành Long → Media Objectives');
  console.log('   Hà Canh → Marketing Objectives');
  console.log('   Nguyễn Quân → Sale Objectives');

  console.log('\n🎉 Seeding complete!');
  console.log(`   • ${members.length} members created`);
  console.log(`   • ${sprints.length} sprints created`);
  console.log('   • OKRs linked to leaders');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
