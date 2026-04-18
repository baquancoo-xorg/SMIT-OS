import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Setting up initial database...');

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({ where: { isAdmin: true } });
  
  if (existingAdmin) {
    console.log('Admin user already exists. Skipping setup.');
    return;
  }

  // Hash password for admin user
  const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD;
  if (!ADMIN_PASSWORD) {
    console.error('Error: ADMIN_INITIAL_PASSWORD env var required');
    process.exit(1);
  }
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Create Admin User
  const admin = await prisma.user.create({
    data: {
      fullName: 'Dominium Admin',
      username: 'dominium',
      password: hashedPassword,
      departments: ['BOD'],
      role: 'Admin',
      avatar: 'https://picsum.photos/seed/admin/200/200',
      isAdmin: true,
    },
  });

  console.log('✅ Created admin user:', admin.username);
  console.log('✅ Database setup complete!');
  console.log('\nLogin credentials:');
  console.log('  Username: dominium');
  console.log('  Password: <from ADMIN_INITIAL_PASSWORD env var>');
}

main()
  .catch((e) => {
    console.error('Setup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
