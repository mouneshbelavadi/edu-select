/**
 * Fast Levenshtein & Damerau-Levenshtein distance for typo-tolerant matching
 */

export function damerauLevenshtein(a: string, b: string): number {
  if (!a) return b ? b.length : 0;
  if (!b) return a.length;

  const al = a.length;
  const bl = b.length;
  const d: number[][] = [];

  for (let i = 0; i <= al; i++) {
    d[i] = [];
    d[i][0] = i;
  }
  for (let j = 0; j <= bl; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[al][bl];
}

/**
 * Normalized similarity between two strings: 1.0 = exact match, 0.0 = completely different
 */
export function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  const dist = damerauLevenshtein(a, b);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Checks if query token is a typo match for target token
 * Maximum allowed distance:
 * - len <= 4: max dist 1
 * - len > 4: max dist 2
 */
export function isTypoMatch(queryToken: string, targetToken: string): boolean {
  if (queryToken === targetToken) return true;
  const qLen = queryToken.length;
  const tLen = targetToken.length;
  if (Math.abs(qLen - tLen) > 2) return false;

  const maxAllowed = qLen <= 4 ? 1 : 2;
  const dist = damerauLevenshtein(queryToken, targetToken);
  return dist <= maxAllowed;
}
