import fs from 'fs';
import path from 'path';
import { db } from './db';
import { getCollegeByIdOrSlug } from './collegeRepository';

const SAVED_FILE = path.join(process.cwd(), 'src', 'data', 'saved.json');

interface SavedRecord {
  id: string;
  userId: string;
  collegeId: string;
  createdAt: string;
}

interface SavedComparisonRecord {
  id: string;
  userId: string;
  name: string;
  collegeIds: string[];
  createdAt: string;
}

interface SavedStoreState {
  colleges: SavedRecord[];
  comparisons: SavedComparisonRecord[];
}

function loadSavedData(): SavedStoreState {
  try {
    if (fs.existsSync(SAVED_FILE)) {
      const raw = fs.readFileSync(SAVED_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load saved.json, initializing empty state:', e);
  }
  return { colleges: [], comparisons: [] };
}

function writeSavedData(state: SavedStoreState) {
  try {
    const dir = path.dirname(SAVED_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SAVED_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to write saved.json:', e);
  }
}

export async function getSavedCollegesForUser(userId: string) {
  // 1. Try PostgreSQL
  try {
    const saved = await db.savedCollege.findMany({
      where: { userId },
      include: { college: true },
      orderBy: { createdAt: 'desc' },
    });
    if (saved && saved.length > 0) {
      return saved.map((s) => s.college);
    }
  } catch {}

  // 2. Fallback to local store
  const state = loadSavedData();
  const userSaved = state.colleges.filter((c) => c.userId === userId);
  const results = [];

  for (const item of userSaved) {
    const college = await getCollegeByIdOrSlug(item.collegeId);
    if (college) {
      results.push({
        id: college.id,
        name: college.name,
        slug: college.slug,
        city: college.city,
        state: college.state,
        type: college.type,
        rating: college.rating,
        fees: college.fees,
        feesDisplay: college.feesDisplay,
        imageUrl: college.imageUrl,
        establishedYear: 1980,
      });
    }
  }
  return results;
}

export async function saveCollegeForUser(userId: string, collegeId: string) {
  // 1. Verify college exists in Excel repo
  const college = await getCollegeByIdOrSlug(collegeId);
  if (!college) {
    throw new Error('College not found in database');
  }

  // 2. Try PostgreSQL
  try {
    await db.savedCollege.upsert({
      where: {
        userId_collegeId: {
          userId,
          collegeId: college.id,
        },
      },
      create: {
        userId,
        collegeId: college.id,
      },
      update: {},
    });
  } catch {}

  // 3. Update local store
  const state = loadSavedData();
  const exists = state.colleges.some(
    (c) => c.userId === userId && (c.collegeId === college.id || c.collegeId === collegeId || c.collegeId === college.slug)
  );

  if (!exists) {
    state.colleges.unshift({
      id: `save-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      collegeId: college.id,
      createdAt: new Date().toISOString(),
    });
    writeSavedData(state);
  }

  return { success: true, college };
}

export async function removeSavedCollegeForUser(userId: string, collegeId: string) {
  try {
    await db.savedCollege.deleteMany({
      where: { userId, collegeId },
    });
  } catch {}

  const state = loadSavedData();
  const college = await getCollegeByIdOrSlug(collegeId);
  const targetId = college?.id || collegeId;

  state.colleges = state.colleges.filter(
    (c) => !(c.userId === userId && (c.collegeId === targetId || c.collegeId === collegeId || c.collegeId === college?.slug))
  );
  writeSavedData(state);
  return { success: true };
}

export async function getSavedComparisonsForUser(userId: string) {
  try {
    const saved = await db.savedComparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (saved && saved.length > 0) {
      return saved.map((s) => ({
        id: s.id,
        name: s.name,
        collegeIds: s.collegeIds,
        createdAt: s.createdAt.toISOString(),
      }));
    }
  } catch {}

  const state = loadSavedData();
  return state.comparisons.filter((c) => c.userId === userId);
}

export async function saveComparisonForUser(userId: string, name: string, collegeIds: string[]) {
  try {
    const saved = await db.savedComparison.create({
      data: { userId, name, collegeIds },
    });
    return saved;
  } catch {}

  const state = loadSavedData();
  const record: SavedComparisonRecord = {
    id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    name,
    collegeIds,
    createdAt: new Date().toISOString(),
  };
  state.comparisons.unshift(record);
  writeSavedData(state);
  return record;
}

export async function removeSavedComparisonForUser(userId: string, id: string) {
  try {
    await db.savedComparison.deleteMany({
      where: { userId, id },
    });
  } catch {}

  const state = loadSavedData();
  state.comparisons = state.comparisons.filter((c) => !(c.userId === userId && c.id === id));
  writeSavedData(state);
  return { success: true };
}
