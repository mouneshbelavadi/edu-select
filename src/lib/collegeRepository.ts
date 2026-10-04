import collegesData from '@/data/colleges.json';
import { CollegeQueryInput } from './validation/college';
import { db } from './db';
import { PlacementStats } from '@/types/careerData';

export interface CollegeDetail {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  rating: number | null;
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

  // RealCollegeExtras optional fields
  typeDetail?: string;
  institutionCategory?: string;
  ratingBasis?: string | null;
  nirfRank2025?: number | null;
  nirfBand2025?: string | null;
  nirfNote?: string | null;
  feesMax?: number;
  feesIsEstimate?: boolean;
  placementStats?: PlacementStats | null;
  admissionRoutes?: string[];
  routeNote?: string | null;
  coursesNote?: string;
  established?: number | null;
  verificationStatus?: string;
  sourceUrls?: string[];
  isRealData?: boolean;
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

function matchesCategory(college: CollegeDetail, categoryFilter: string): boolean {
  const cat = categoryFilter.trim().toLowerCase();
  const instCat = (college.institutionCategory || '').toLowerCase();
  const colType = (college.type || '').toLowerCase();
  const typeDetail = (college.typeDetail || '').toLowerCase();
  const name = college.name.toLowerCase();

  switch (cat) {
    case 'iit':
      return instCat === 'iit' || name.startsWith('iit ') || name.includes('indian institute of technology');
    case 'nit':
      return instCat.includes('nit') || name.startsWith('nit ') || name.includes('national institute of technology');
    case 'iiit':
      return instCat.includes('iiit') || name.startsWith('iiit ') || name.includes('information technology') || typeDetail.includes('iiit');
    case 'central':
      return instCat.includes('central') || instCat === 'ini_central' || typeDetail.includes('central');
    case 'state govt':
    case 'state government':
    case 'state':
      return (
        instCat.includes('state') ||
        typeDetail.includes('state government') ||
        (colType === 'government' && !instCat.includes('iit') && !instCat.includes('nit') && !instCat.includes('central'))
      );
    case 'private':
      return instCat.includes('private') || instCat.includes('aided') || colType === 'private' || typeDetail.includes('private');
    case 'deemed':
      return instCat.includes('deemed') || colType === 'deemed' || typeDetail.includes('deemed');
    default:
      return instCat.includes(cat) || colType.includes(cat) || typeDetail.includes(cat);
  }
}

function getNirfSortScore(college: CollegeDetail): number {
  if (college.nirfRank2025 !== null && college.nirfRank2025 !== undefined && !isNaN(college.nirfRank2025)) {
    return college.nirfRank2025;
  }
  if (college.nirfBand2025 === '101-150') return 125;
  if (college.nirfBand2025 === '151-200') return 175;
  return 999999;
}

export async function getColleges(params: CollegeQueryInput) {
  const {
    search,
    city,
    state,
    type,
    category,
    exam,
    branch,
    minFees,
    maxFees,
    minRating,
    sortBy = 'nirf',
    sortOrder = 'asc',
    page = 1,
    limit = 12,
  } = params;

  const dataset = await getMergedDataset();
  let filtered = [...dataset];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.state && c.state.toLowerCase().includes(q)) ||
        (c.typeDetail && c.typeDetail.toLowerCase().includes(q)) ||
        (c.affiliation && c.affiliation.toLowerCase().includes(q)) ||
        (c.overview && c.overview.toLowerCase().includes(q)) ||
        (c.entranceExams && c.entranceExams.some((e) => e.exam?.toLowerCase().includes(q) || e.code?.toLowerCase().includes(q))) ||
        (c.admissionRoutes && c.admissionRoutes.some((r) => r.toLowerCase().includes(q))) ||
        (c.courses && c.courses.some((course) =>
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

  if (category) {
    filtered = filtered.filter((c) => matchesCategory(c, category));
  }

  if (exam) {
    const examQ = exam.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        (c.entranceExams && c.entranceExams.some((e) => e.exam?.toLowerCase().includes(examQ) || e.code?.toLowerCase().includes(examQ))) ||
        (c.admissionRoutes && c.admissionRoutes.some((r) => r.toLowerCase().includes(examQ)))
    );
  }

  if (branch) {
    const branchQ = branch.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.courses &&
        c.courses.some(
          (crs) =>
            crs.branchCode.toLowerCase() === branchQ ||
            crs.branchCode.toLowerCase().includes(branchQ) ||
            crs.name.toLowerCase().includes(branchQ)
        )
    );
  }

  if (minFees !== undefined) {
    filtered = filtered.filter((c) => c.fees >= minFees);
  }

  if (maxFees !== undefined) {
    filtered = filtered.filter((c) => c.fees <= maxFees);
  }

  // minRating ignores null ratings
  if (minRating !== undefined) {
    filtered = filtered.filter((c) => c.rating !== null && c.rating !== undefined && c.rating >= minRating);
  }

  filtered.sort((a, b) => {
    if (sortBy === 'nirf') {
      const scoreA = getNirfSortScore(a);
      const scoreB = getNirfSortScore(b);
      return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
    }

    if (sortBy === 'rating') {
      if (a.rating === null && b.rating === null) return 0;
      if (a.rating === null) return 1;
      if (b.rating === null) return -1;
      return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
    }

    let valA = (a as any)[sortBy];
    let valB = (b as any)[sortBy];
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
