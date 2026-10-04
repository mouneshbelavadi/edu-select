import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed script...');

  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const demoPassword = process.env.SEED_DEMO_PASSWORD;

  if (adminPassword) {
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@collegediscovery.com' },
      update: {
        passwordHash: adminPasswordHash,
        role: Role.ADMIN,
      },
      create: {
        name: 'Platform Administrator',
        email: 'admin@collegediscovery.com',
        passwordHash: adminPasswordHash,
        role: Role.ADMIN,
      },
    });
    console.log(`✅ Seeded admin: ${admin.email}`);
  } else {
    console.log('ℹ️ SEED_ADMIN_PASSWORD not set, skipping admin user seeding.');
  }

  if (demoPassword) {
    const demoPasswordHash = await bcrypt.hash(demoPassword, 10);
    const student = await prisma.user.upsert({
      where: { email: 'aarav.sharma@example.com' },
      update: {
        passwordHash: demoPasswordHash,
        role: Role.USER,
      },
      create: {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        passwordHash: demoPasswordHash,
        role: Role.USER,
      },
    });
    console.log(`✅ Seeded demo student: ${student.email}`);
  } else {
    console.log('ℹ️ SEED_DEMO_PASSWORD not set, skipping demo student seeding.');
  }

  console.log('✨ Seeding complete (colleges live in static JSON and are not seeded into database).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
