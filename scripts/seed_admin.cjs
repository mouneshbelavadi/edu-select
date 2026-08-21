/**
 * Dedicated Admin & Demo Accounts Seed Script
 * 
 * Creates or verifies:
 * 1. Admin: admin@collegediscovery.com (Role: ADMIN, Password: Admin@123456)
 * 2. Student: aarav.sharma@example.com (Role: USER, Password: password123)
 */

const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedAdmin() {
  console.log('⚡ Starting Admin Setup & Account Verification...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@collegediscovery.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const studentEmail = 'aarav.sharma@example.com';
  const studentPassword = 'password123';

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  const studentPasswordHash = await bcrypt.hash(studentPassword, 10);
  const now = new Date();

  // 1. Attempt PostgreSQL Write via Prisma
  try {
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
  } catch (err) {
    console.warn(`⚠️ [PostgreSQL] Offline or unreachable (${err.message}). Updating local persistent store...`);
  }

  // 2. Sync to local persistent JSON store
  const localFile = path.join(__dirname, '..', 'src', 'data', 'users.json');
  let users = [];
  try {
    if (fs.existsSync(localFile)) {
      users = JSON.parse(fs.readFileSync(localFile, 'utf-8'));
    }
  } catch {}

  const ensureUser = (record) => {
    const idx = users.findIndex((u) => u.email.toLowerCase() === record.email.toLowerCase());
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...record };
    } else {
      users.push(record);
    }
  };

  ensureUser({
    id: 'usr-admin-1',
    name: 'Platform Administrator',
    email: adminEmail.toLowerCase(),
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
    createdAt: now.toISOString(),
    lastLoginAt: now.toISOString(),
    status: 'ACTIVE',
  });

  ensureUser({
    id: 'usr-student-1',
    name: 'Aarav Sharma',
    email: studentEmail.toLowerCase(),
    passwordHash: studentPasswordHash,
    role: 'USER',
    createdAt: now.toISOString(),
    lastLoginAt: null,
    status: 'ACTIVE',
  });

  const dir = path.dirname(localFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(localFile, JSON.stringify(users, null, 2), 'utf-8');
  console.log(`✅ [Local Store] Persisted admin & student accounts to ${localFile}`);
  console.log('\n--- Credentials Summary ---');
  console.log(`Admin Login:   ${adminEmail} / ${adminPassword}`);
  console.log(`Student Login: ${studentEmail} / ${studentPassword}`);
}

seedAdmin()
  .catch((err) => {
    console.error('❌ Failed to seed admin:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
