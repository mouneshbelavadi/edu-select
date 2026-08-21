import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

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

const LOCAL_USERS_FILE = path.join(process.cwd(), 'src', 'data', 'users.json');

// Ensure initial users file exists with verified default accounts
function getInitialUsers(): UserRecord[] {
  const hashAdmin = bcrypt.hashSync('Admin@123456', 10);
  const hashUser = bcrypt.hashSync('password123', 10);

  return [
    {
      id: 'usr-admin-1',
      name: 'Platform Administrator',
      email: 'admin@collegediscovery.com',
      passwordHash: hashAdmin,
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: 'ACTIVE',
    },
    {
      id: 'usr-student-1',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      passwordHash: hashUser,
      role: 'USER',
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      status: 'ACTIVE',
    },
  ];
}

function loadLocalUsers(): UserRecord[] {
  try {
    if (!fs.existsSync(LOCAL_USERS_FILE)) {
      const initial = getInitialUsers();
      saveLocalUsers(initial);
      return initial;
    }
    const raw = fs.readFileSync(LOCAL_USERS_FILE, 'utf-8');
    const users = JSON.parse(raw);
    if (!Array.isArray(users) || users.length === 0) {
      const initial = getInitialUsers();
      saveLocalUsers(initial);
      return initial;
    }
    return users;
  } catch {
    return getInitialUsers();
  }
}

function saveLocalUsers(users: UserRecord[]) {
  try {
    const dir = path.dirname(LOCAL_USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local users store:', err);
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();

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
  } catch {
    // Database is offline or unreachable
  }

  // Fallback to local store
  const users = loadLocalUsers();
  const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  return found || null;
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
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('An account with this email address already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const role = data.role || 'USER';
  const now = new Date().toISOString();

  let dbUser = null;
  try {
    dbUser = await db.user.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: role as any,
      },
    });
  } catch {
    // Database is offline, fallback to local store
  }

  const newUser: UserRecord = {
    id: dbUser ? dbUser.id : `usr-${Date.now()}`,
    name: data.name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    createdAt: now,
    lastLoginAt: null,
    status: 'ACTIVE',
  };

  // Always keep local store in sync
  const users = loadLocalUsers();
  users.push(newUser);
  saveLocalUsers(users);

  return newUser;
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date();

  try {
    await db.user.update({
      where: { email: normalizedEmail },
      data: { lastLoginAt: now },
    });
  } catch {
    // Database offline
  }

  const users = loadLocalUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  if (idx !== -1) {
    users[idx].lastLoginAt = now.toISOString();
    saveLocalUsers(users);
  }
}

/**
 * List all users for the Admin Dashboard (sanitized without passwords)
 */
export async function listAllUsers() {
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
        status: 'ACTIVE',
      }));
    }
  } catch {
    // Database offline
  }

  // Fallback to local store
  const users = loadLocalUsers();
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
