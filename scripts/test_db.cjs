const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConn() {
  console.log('Testing DATABASE_URL:', process.env.DATABASE_URL);
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL successfully!');
    const count = await prisma.user.count();
    console.log('User count:', count);
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConn();
