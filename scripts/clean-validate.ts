/**
 * Phase 0: Cleaning, Validation & Duplicate Detection Engine
 * 
 * Enforces non-negotiables:
 * - Read-only Excel processing
 * - Normalization (casing, abbreviations like Inst. -> Institute)
 * - Exact vs Fuzzy duplicate detection
 * - Flags questionable records as NEEDS_REVIEW (never discards)
 */

import { VALID_28_STATES } from './inspect-excel';

export interface RawCollegeRecord {
  name: string;
  state: string;
  city?: string;
  type?: string;
  fees?: number | string;
  rating?: number | string;
  rawRow: Record<string, any>;
  sheetName: string;
  rowIndex: number;
}

export interface CleanedCollegeRecord {
  id: string;
  name: string;
  slug: string;
  state: string;
  city: string;
  type: 'GOVERNMENT' | 'PRIVATE' | 'DEEMED';
  establishedYear: number;
  fees: number;
  rating: number;
  overview: string;
  status: 'VALID' | 'NEEDS_REVIEW' | 'EXACT_DUPLICATE' | 'FUZZY_DUPLICATE';
  reviewReason?: string;
}

export function normalizeCollegeName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\bInst\b/gi, 'Institute')
    .replace(/\bTech\b/gi, 'Technology')
    .replace(/\bUniv\b/gi, 'University')
    .replace(/\bEngg\b/gi, 'Engineering')
    .replace(/\bCol\b/gi, 'College');
}

export function generateSlug(name: string, state: string): string {
  const base = `${name}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return base;
}

export function validateState(stateName: string): string | null {
  const match = VALID_28_STATES.find(
    (s) => s.toLowerCase() === stateName.trim().toLowerCase()
  );
  return match || null;
}

export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function isFuzzyDuplicate(name1: string, name2: string): boolean {
  const n1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const n2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (n1 === n2) return true;
  const dist = levenshteinDistance(n1, n2);
  const maxLen = Math.max(n1.length, n2.length);
  return maxLen > 8 && dist <= 2;
}
