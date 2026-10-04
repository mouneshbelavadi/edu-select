import { db } from './db';
import { getCollegeByIdOrSlug, CollegeDetail } from './collegeRepository';

interface DevSavedRecord {
  id: string;
  userId: string;
  collegeId: string;
  createdAt: string;
}

interface DevSavedComparison {
  id: string;
  userId: string;
  name: string;
  collegeIds: string[];
  createdAt: string;
}

// In-memory store for local development only
const devSavedStore: {
  colleges: DevSavedRecord[];
  comparisons: DevSavedComparison[];
} = {
  colleges: [],
  comparisons: [],
};

export async function getSavedCollegesForUser(userId: string): Promise<CollegeDetail[]> {
  if (process.env.DATABASE_URL) {
    try {
      const saved = await db.savedCollege.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      const colleges: CollegeDetail[] = [];
      for (const item of saved) {
        const college = await getCollegeByIdOrSlug(item.collegeId);
        if (college) {
          colleges.push(college);
        }
      }
      return colleges;
    } catch (err) {
      console.warn('Database query failed in getSavedCollegesForUser:', err);
    }
  }

  // Development in-memory fallback
  if (process.env.NODE_ENV !== 'production') {
    const userSaved = devSavedStore.colleges.filter((c) => c.userId === userId);
    const colleges: CollegeDetail[] = [];
    for (const item of userSaved) {
      const college = await getCollegeByIdOrSlug(item.collegeId);
      if (college) {
        colleges.push(college);
      }
    }
    return colleges;
  }

  return [];
}

export async function saveCollegeForUser(userId: string, collegeId: string) {
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    const err = new Error('Database not configured');
    (err as any).statusCode = 503;
    throw err;
  }

  const college = await getCollegeByIdOrSlug(collegeId);
  if (!college) {
    throw new Error('College not found in database');
  }

  if (process.env.DATABASE_URL) {
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
      return { success: true, college };
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
    }
  }

  // Development in-memory fallback
  const exists = devSavedStore.colleges.some(
    (c) => c.userId === userId && (c.collegeId === college.id || c.collegeId === collegeId || c.collegeId === college.slug)
  );
  if (!exists) {
    devSavedStore.colleges.unshift({
      id: `save-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      collegeId: college.id,
      createdAt: new Date().toISOString(),
    });
  }

  return { success: true, college };
}

export async function removeSavedCollegeForUser(userId: string, collegeId: string) {
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    const err = new Error('Database not configured');
    (err as any).statusCode = 503;
    throw err;
  }

  const college = await getCollegeByIdOrSlug(collegeId);
  const targetId = college?.id || collegeId;

  if (process.env.DATABASE_URL) {
    try {
      await db.savedCollege.deleteMany({
        where: {
          userId,
          collegeId: targetId,
        },
      });
      return { success: true };
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
    }
  }

  // Development in-memory fallback
  devSavedStore.colleges = devSavedStore.colleges.filter(
    (c) => !(c.userId === userId && (c.collegeId === targetId || c.collegeId === collegeId || c.collegeId === college?.slug))
  );

  return { success: true };
}

export async function getSavedComparisonsForUser(userId: string) {
  if (process.env.DATABASE_URL) {
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
    } catch (err) {
      console.warn('Database query failed in getSavedComparisonsForUser:', err);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    return devSavedStore.comparisons.filter((c) => c.userId === userId);
  }

  return [];
}

export async function saveComparisonForUser(userId: string, name: string, collegeIds: string[]) {
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    const err = new Error('Database not configured');
    (err as any).statusCode = 503;
    throw err;
  }

  if (process.env.DATABASE_URL) {
    try {
      const saved = await db.savedComparison.create({
        data: { userId, name, collegeIds },
      });
      return {
        id: saved.id,
        name: saved.name,
        collegeIds: saved.collegeIds,
        createdAt: saved.createdAt.toISOString(),
      };
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
    }
  }

  // Development in-memory fallback
  const record: DevSavedComparison = {
    id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    name,
    collegeIds,
    createdAt: new Date().toISOString(),
  };
  devSavedStore.comparisons.unshift(record);
  return record;
}

export async function removeSavedComparisonForUser(userId: string, id: string) {
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    const err = new Error('Database not configured');
    (err as any).statusCode = 503;
    throw err;
  }

  if (process.env.DATABASE_URL) {
    try {
      await db.savedComparison.deleteMany({
        where: { userId, id },
      });
      return { success: true };
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
    }
  }

  // Development in-memory fallback
  devSavedStore.comparisons = devSavedStore.comparisons.filter(
    (c) => !(c.userId === userId && c.id === id)
  );

  return { success: true };
}
