import collegesData from '@/data/colleges28States.json';
import { CollegeQueryInput } from './validation/college';
import { db } from './db';

export interface CollegeDetail {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  rating: number;
  ratingDisplay: string;
  fees: number;
  feesDisplay: string;
  overview: string;
  placementText: string;
  reviewsText: string;
  entranceExams: { exam: string; code: string }[];
  courses: {
    id: string;
    name: string;
    branchCode: string;
    duration: string;
    feesDisplay: string;
    seats?: number;
  }[];
  totalBranchesOffered: number;
  affiliation: string;
  approval: string;
  dataSource: string;
  lastVerified: string;
  imageUrl: string;
}

// In-memory overrides cache for development or when DB is unreachable
const devOverrides = new Map<string, Partial<CollegeDetail>>();

async function getOverridesMap(): Promise<Map<string, Partial<CollegeDetail>>> {
  const map = new Map<string, Partial<CollegeDetail>>(devOverrides);
  if (!process.env.DATABASE_URL) {
    return map;
  }
  try {
    const overrides = await db.collegeOverride.findMany();
    for (const ov of overrides) {
      map.set(ov.collegeId, ov.data as Partial<CollegeDetail>);
    }
  } catch (err) {
    // Database unreachable, fall back to in-memory/static data
  }
  return map;
}

async function getMergedDataset(): Promise<CollegeDetail[]> {
  const staticDataset = collegesData as CollegeDetail[];
  const overridesMap = await getOverridesMap();
  if (overridesMap.size === 0) {
    return staticDataset;
  }
  return staticDataset.map((c) => {
    const override = overridesMap.get(c.id);
    return override ? { ...c, ...override } : c;
  });
}

export async function getColleges(params: CollegeQueryInput) {
  const {
    search,
    city,
    state,
    type,
    minFees,
    maxFees,
    minRating,
    sortBy = 'rating',
    sortOrder = 'desc',
    page = 1,
    limit = 12,
  } = params;

  const dataset = await getMergedDataset();
  let filtered = [...dataset];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        (c.affiliation && c.affiliation.toLowerCase().includes(q)) ||
        (c.overview && c.overview.toLowerCase().includes(q)) ||
        (c.entranceExams && c.entranceExams.some(e => e.exam?.toLowerCase().includes(q) || e.code?.toLowerCase().includes(q))) ||
        (c.courses && c.courses.some(course => 
          course.name.toLowerCase().includes(q) || 
          (course.branchCode && course.branchCode.toLowerCase().includes(q))
        ))
    );
  }

  if (city) {
    filtered = filtered.filter((c) => c.city.toLowerCase() === city.toLowerCase());
  }

  if (state) {
    filtered = filtered.filter((c) => c.state.toLowerCase() === state.toLowerCase());
  }

  if (type) {
    filtered = filtered.filter((c) => c.type === type);
  }

  if (minFees !== undefined) {
    filtered = filtered.filter((c) => c.fees >= minFees);
  }

  if (maxFees !== undefined) {
    filtered = filtered.filter((c) => c.fees <= maxFees);
  }

  if (minRating !== undefined) {
    filtered = filtered.filter((c) => c.rating >= minRating);
  }

  filtered.sort((a: any, b: any) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const total = filtered.length;
  const skip = (page - 1) * limit;
  const paginated = filtered.slice(skip, skip + limit);

  return {
    data: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getCollegeByIdOrSlug(identifier: string): Promise<CollegeDetail | null> {
  const cleanId = decodeURIComponent(identifier).trim().toLowerCase();
  const dataset = await getMergedDataset();

  const found = dataset.find(
    (c) =>
      c.slug.toLowerCase() === cleanId ||
      c.id.toLowerCase() === cleanId ||
      c.name.toLowerCase() === cleanId
  );

  if (found) {
    return found;
  }

  // Fallback by ID index
  const num = parseInt(identifier.replace(/[^0-9]/g, ''), 10);
  if (!isNaN(num) && num >= 1 && num <= dataset.length) {
    return dataset[num - 1];
  }

  return null;
}

export async function updateCollege(identifier: string, updates: Partial<CollegeDetail>): Promise<CollegeDetail> {
  const cleanId = decodeURIComponent(identifier).trim().toLowerCase();
  const staticDataset = collegesData as CollegeDetail[];

  const existing = staticDataset.find(
    (c) =>
      c.slug.toLowerCase() === cleanId ||
      c.id.toLowerCase() === cleanId ||
      c.name.toLowerCase() === cleanId
  );

  if (!existing) {
    throw new Error('College not found');
  }

  const updated: CollegeDetail = {
    ...existing,
    ...updates,
    id: existing.id,
    slug: existing.slug,
    totalBranchesOffered: updates.courses ? updates.courses.length : existing.totalBranchesOffered,
    lastVerified: updates.lastVerified || `Edited on ${new Date().toLocaleDateString('en-IN')}`,
  };

  // Upsert into CollegeOverride in PostgreSQL
  if (process.env.DATABASE_URL) {
    try {
      await db.collegeOverride.upsert({
        where: { collegeId: existing.id },
        create: {
          collegeId: existing.id,
          data: updated as any,
        },
        update: {
          data: updated as any,
        },
      });
    } catch (err) {
      console.warn('Failed to upsert CollegeOverride in DB, saving in-memory:', err);
      devOverrides.set(existing.id, updated);
    }
  } else {
    devOverrides.set(existing.id, updated);
  }

  return updated;
}
