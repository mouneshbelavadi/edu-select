import fs from 'fs';
import path from 'path';
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

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'colleges28States.json');

function getLiveDataset(): CollegeDetail[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading live colleges28States.json:', err);
  }
  return collegesData as CollegeDetail[];
}

function writeLiveDataset(dataset: CollegeDetail[]) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataset, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing live colleges28States.json:', err);
  }
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

  let filtered = [...getLiveDataset()];

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
  const dataset = getLiveDataset();

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
  const dataset = getLiveDataset();
  const cleanId = decodeURIComponent(identifier).trim().toLowerCase();

  const index = dataset.findIndex(
    (c) =>
      c.slug.toLowerCase() === cleanId ||
      c.id.toLowerCase() === cleanId ||
      c.name.toLowerCase() === cleanId
  );

  if (index === -1) {
    throw new Error('College not found');
  }

  const existing = dataset[index];
  const updated: CollegeDetail = {
    ...existing,
    ...updates,
    id: existing.id,
    slug: existing.slug,
    totalBranchesOffered: updates.courses ? updates.courses.length : existing.totalBranchesOffered,
    lastVerified: updates.lastVerified || `Edited on ${new Date().toLocaleDateString('en-IN')}`,
  };

  dataset[index] = updated;
  writeLiveDataset(dataset);

  // Sync to PostgreSQL if connected
  try {
    await db.college.updateMany({
      where: {
        OR: [{ id: existing.id }, { slug: existing.slug }],
      },
      data: {
        name: updated.name,
        city: updated.city,
        state: updated.state,
        fees: updated.fees,
        rating: updated.rating,
        overview: updated.overview,
      },
    });
  } catch {}

  return updated;
}
