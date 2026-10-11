import { ExtractedIntent, SearchDomain } from './types';
import { normalizeText, tokenize } from './normalizer';
import synonymsData from './synonyms.json';

const CITY_SYNONYMS: Record<string, string> = synonymsData.cities;
const BRANCH_SYNONYMS: Record<string, string> = synonymsData.branches;
const ROLE_SYNONYMS: Record<string, string> = synonymsData.rolesAndConcepts;

export function extractIntent(rawQuery: string): ExtractedIntent {
  const clean = normalizeText(rawQuery);
  const rawTokens = tokenize(clean);

  const intent: ExtractedIntent = {
    rawQuery,
    cleanQuery: clean,
    tokens: rawTokens,
  };

  // 1. Budget extraction: e.g. "under 1 lakh", "under 1.5l", "fees below 200000", "< 100000"
  const budgetMatch = clean.match(/(?:under|below|less than|within|fees?)\s*(?:of)?\s*(?:rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(lakh|lakhs|l|k|thousand)?/i);
  if (budgetMatch) {
    const num = parseFloat(budgetMatch[1]);
    const unit = (budgetMatch[2] || '').toLowerCase();
    if (unit.startsWith('l')) {
      intent.maxBudget = num * 100000;
    } else if (unit.startsWith('k') || unit.startsWith('thous')) {
      intent.maxBudget = num * 1000;
    } else if (num < 100) {
      // e.g. "under 2" usually means 2 lakhs in college fee context
      intent.maxBudget = num * 100000;
    } else {
      intent.maxBudget = num;
    }
  }

  // 2. Level extraction: "after 10th", "10th", "after 12th", "12th", "diploma", "btech", "degree"
  if (clean.includes('after 10th') || clean.includes('10th') || clean.includes('sslc') || clean.includes('matric')) {
    intent.level = '10th';
    intent.targetDomain = 'puc';
  } else if (clean.includes('after 12th') || clean.includes('12th') || clean.includes('puc') || clean.includes('plus two')) {
    intent.level = '12th';
  } else if (clean.includes('diploma') || clean.includes('polytechnic')) {
    intent.level = 'diploma';
  } else if (clean.includes('btech') || clean.includes('be') || clean.includes('engineering')) {
    intent.level = 'btech';
    if (!intent.targetDomain) intent.targetDomain = 'colleges';
  }

  // 3. Discipline & Medical Intent
  if (clean.includes('mbbs') || clean.includes('doctor') || clean.includes('medical') || clean.includes('vaidya')) {
    intent.discipline = 'Medical';
    intent.targetDomain = 'medical';
  } else if (clean.includes('dental') || clean.includes('bds') || clean.includes('dentist')) {
    intent.discipline = 'Dental';
    intent.targetDomain = 'medical';
  } else if (clean.includes('pharmacy') || clean.includes('bpharm') || clean.includes('dpharm')) {
    intent.discipline = 'Pharmacy';
    intent.targetDomain = 'medical';
  } else if (clean.includes('nursing') || clean.includes('nurse') || clean.includes('bsc nursing')) {
    intent.discipline = 'Nursing';
    intent.targetDomain = 'medical';
  }

  // 4. Management extraction: Government, Private, Aided
  if (clean.includes('government') || clean.includes('govt') || clean.includes('sarkari')) {
    intent.management = 'Government';
  } else if (clean.includes('private') || clean.includes('pvt')) {
    intent.management = 'Private';
  } else if (clean.includes('aided')) {
    intent.management = 'Aided';
  }

  // 5. NIRF / Top ranking priority: "best", "top", "nirf", "ranking"
  if (clean.includes('nirf') || clean.includes('top ranked') || clean.includes('best colleges') || clean.includes('ranking')) {
    intent.isNirfPriority = true;
  }

  // 6. City / District extraction
  for (const token of rawTokens) {
    if (CITY_SYNONYMS[token]) {
      intent.cityOrDistrict = CITY_SYNONYMS[token];
      break;
    }
  }

  // 7. Branch extraction
  for (const token of rawTokens) {
    if (BRANCH_SYNONYMS[token]) {
      intent.branch = BRANCH_SYNONYMS[token];
      break;
    }
  }

  // 8. Stream extraction (Science, Commerce, Arts, PCMB, PCMC)
  if (clean.includes('pcmc')) intent.stream = 'PCMC';
  else if (clean.includes('pcmb')) intent.stream = 'PCMB';
  else if (clean.includes('science')) intent.stream = 'Science';
  else if (clean.includes('commerce') || clean.includes('ebac')) intent.stream = 'Commerce';
  else if (clean.includes('arts') || clean.includes('humanities') || clean.includes('hepa') || clean.includes('heps')) intent.stream = 'Arts';

  return intent;
}
