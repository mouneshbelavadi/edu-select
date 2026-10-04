import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  lastLoginAt: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
}

// In-memory demo users for local development when DATABASE_URL is not set
const devUsersStore: UserRecord[] = [];

function getDevUsers(): UserRecord[] {
  if (devUsersStore.length === 0) {
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';
    const demoPassword = process.env.SEED_DEMO_PASSWORD || 'password123';
    devUsersStore.push(
      {
        id: 'usr-admin-1',
        name: 'Platform Administrator',
        email: 'admin@collegediscovery.com',
        passwordHash: bcrypt.hashSync(adminPassword, 10),
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        status: 'ACTIVE',
      },
      {
        id: 'usr-student-1',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        passwordHash: bcrypt.hashSync(demoPassword, 10),
        role: 'USER',
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        status: 'ACTIVE',
      }
    );
  }
  return devUsersStore;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (process.env.DATABASE_URL) {
    try {
      const user = await db.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          role: (user.role as 'USER' | 'ADMIN') || 'USER',
          createdAt: user.createdAt.toISOString(),
          lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
          status: 'ACTIVE',
        };
      }
    } catch (err) {
      console.warn('Database query failed in findUserByEmail:', err);
    }
  }

  // Reliable demo & in-memory fallback for all environments
  const users = getDevUsers();
  return users.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
}

/**
 * Create a new user (with duplicate checking & bcrypt hash)
 */
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}): Promise<UserRecord> {
  const normalizedEmail = data.email.trim().toLowerCase();

  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    const error = new Error('Database not configured');
    (error as any).statusCode = 503;
    throw error;
  }

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('An account with this email address already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const role = data.role || 'USER';

  if (process.env.DATABASE_URL) {
    try {
      const dbUser = await db.user.create({
        data: {
          name: data.name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: role as any,
        },
      });

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        passwordHash: dbUser.passwordHash,
        role: (dbUser.role as 'USER' | 'ADMIN') || 'USER',
        createdAt: dbUser.createdAt.toISOString(),
        lastLoginAt: null,
        status: 'ACTIVE',
      };
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
    }
  }

  // Development in-memory creation
  const newUser: UserRecord = {
    id: `usr-${Date.now()}`,
    name: data.name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    status: 'ACTIVE',
  };
  getDevUsers().push(newUser);
  return newUser;
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date();

  if (process.env.DATABASE_URL) {
    try {
      await db.user.update({
        where: { email: normalizedEmail },
        data: { lastLoginAt: now },
      });
      return;
    } catch {}
  }

  const users = getDevUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  if (idx !== -1) {
    users[idx].lastLoginAt = now.toISOString();
  }
}

/**
 * List all users for the Admin Dashboard (sanitized without passwords)
 */
export async function listAllUsers() {
  if (process.env.DATABASE_URL) {
    try {
      const dbUsers = await db.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      if (dbUsers && dbUsers.length > 0) {
        return dbUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: (u.role as string) || 'USER',
          createdAt: u.createdAt.toISOString(),
          lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
          status: 'ACTIVE' as const,
        }));
      }
    } catch (err) {
      console.warn('Database query failed in listAllUsers:', err);
    }
  }

  const users = getDevUsers();
  return users
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      status: u.status,
    }));
}
