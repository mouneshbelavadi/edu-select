/**
 * Dedicated Admin & Demo Accounts Seed Script
 * Reads SEED_ADMIN_PASSWORD and SEED_DEMO_PASSWORD from environment variables.
 * Skips each if not set.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  console.log('⚡ Starting Admin & Demo Student Account Setup...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@collegediscovery.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const studentEmail = process.env.STUDENT_EMAIL || 'aarav.sharma@example.com';
  const studentPassword = process.env.SEED_DEMO_PASSWORD;
  const now = new Date();

  if (adminPassword) {
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: {
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
      create: {
        name: 'Platform Administrator',
        email: adminEmail.toLowerCase(),
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        lastLoginAt: now,
      },
    });
    console.log(`✅ [PostgreSQL] Admin verified: ${adminUser.email} (Role: ${adminUser.role})`);
  } else {
    console.log('ℹ️ SEED_ADMIN_PASSWORD not set, skipping admin user seeding.');
  }

  if (studentPassword) {
    const studentPasswordHash = await bcrypt.hash(studentPassword, 10);
    const studentUser = await prisma.user.upsert({
      where: { email: studentEmail.toLowerCase() },
      update: {
        passwordHash: studentPasswordHash,
        role: 'USER',
      },
      create: {
        name: 'Aarav Sharma',
        email: studentEmail.toLowerCase(),
        passwordHash: studentPasswordHash,
        role: 'USER',
      },
    });
    console.log(`✅ [PostgreSQL] Student verified: ${studentUser.email} (Role: ${studentUser.role})`);
  } else {
    console.log('ℹ️ SEED_DEMO_PASSWORD not set, skipping demo student seeding.');
  }

  console.log('✨ Seed complete.');
}

seedAdmin()
  .catch((err) => {
    console.error('❌ Failed to seed admin:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
