/**
 * Text Normalizer and Safety Sanitizer for EduSelect Search
 */

export function sanitizeQuery(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  // Cap length at 120 characters to prevent ReDoS / CPU attacks
  let safe = raw.slice(0, 120);
  // Remove dangerous control characters and null bytes
  safe = safe.replace(/[\x00-\x1F\x7F]/g, ' ');
  return safe;
}

export function normalizeText(text: string): string {
  if (!text) return '';

  let normalized = sanitizeQuery(text).toLowerCase().trim();

  // 1. Unify standard abbreviations and symbols
  normalized = normalized.replace(/b\.?\s*e\.?/gi, 'be');
  normalized = normalized.replace(/b\.?\s*tech\.?/gi, 'btech');
  normalized = normalized.replace(/m\.?\s*tech\.?/gi, 'mtech');
  normalized = normalized.replace(/p\.?\s*u\.?\s*c\.?/gi, 'puc');
  normalized = normalized.replace(/dr\.?\s+/gi, 'doctor ');
  normalized = normalized.replace(/st\.?\s+/gi, 'saint ');
  normalized = normalized.replace(/&/g, ' and ');

  // 2. Remove punctuation, but preserve decimal points between digits (e.g. 1.5 lakh)
  normalized = normalized.replace(/(?<!\d)\.|\.(?!\d)/g, ' ');
  normalized = normalized.replace(/[^a-z0-9\s\.]/gi, ' ');

  // 3. Collapse multiple whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

export function tokenize(text: string): string[] {
  const norm = normalizeText(text);
  if (!norm) return [];
  return norm.split(' ').filter((t) => t.length > 0);
}
