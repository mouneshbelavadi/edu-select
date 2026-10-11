import 'server-only';

import collegesData from '@/data/colleges.json';
import pucData from '@/data/pucColleges.json';
import medicalData from '@/data/karnatakaMedicalSeats.json';
import pathwaysData from '@/data/careers/pathways.json';
import examsData from '@/data/careers/exams.json';
import branchesData from '@/data/careers/engineeringBranches.json';

import { SearchItem, SearchMatch, SearchResponse, SearchDomain } from './types';
import { normalizeText, tokenize, sanitizeQuery } from './normalizer';
import { extractIntent } from './intentParser';
import { damerauLevenshtein, isTypoMatch } from './fuzzy';
import synonymsData from './synonyms.json';

const INSTITUTION_SYNONYMS: Record<string, string> = synonymsData.institutions;
const CITY_SYNONYMS: Record<string, string> = synonymsData.cities;

interface InvertedIndexEntry {
  itemIndex: number;
  field: 'code' | 'title' | 'location' | 'category' | 'tags';
}

class UniversalSearchEngine {
  private items: SearchItem[] = [];
  private invertedIndex: Map<string, InvertedIndexEntry[]> = new Map();
  private isIndexed = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isIndexed) return;
    const start = Date.now();

    // 1. Index 455 Engineering Colleges
    (collegesData as any[]).forEach((col) => {
      this.items.push({
        id: col.id,
        domain: 'colleges',
        title: col.name,
        code: col.entranceExams?.[0]?.code || col.id,
        subtitle: `${col.city}, ${col.state}`,
        location: `${col.city} ${col.state}`,
        category: col.typeDetail || col.type,
        management: col.type === 'GOVERNMENT' ? 'Government' : 'Private',
        fee: col.fees,
        rank: col.nirfRank2025 || null,
        tags: [
          col.city,
          col.state,
          ...(col.courses || []).map((c: any) => c.name || c.branchCode),
          ...(col.entranceExams || []).map((e: any) => `${e.exam} ${e.code}`),
        ],
        metadata: { slug: col.slug, established: col.established },
      });
    });

    // 2. Index 6,417 Pre-University Colleges
    (pucData.colleges as any[]).forEach((puc) => {
      this.items.push({
        id: puc.id,
        domain: 'puc',
        title: puc.name,
        code: puc.code,
        subtitle: `${puc.district}, Karnataka • ${puc.management}`,
        location: `${puc.district} Karnataka ${puc.address}`,
        category: (puc.streams || []).join(' '),
        management: puc.management.toLowerCase().includes('government')
          ? 'Government'
          : puc.management.toLowerCase().includes('aided')
          ? 'Aided'
          : 'Private',
        tags: [puc.district, puc.code, ...(puc.streams || [])],
        metadata: { district: puc.district, streams: puc.streams },
      });
    });

    // 3. Index 788 Health Sciences Colleges
    (medicalData.institutes as any[]).forEach((med) => {
      this.items.push({
        id: med.id,
        domain: 'medical',
        title: med.name,
        code: med.code,
        subtitle: `${med.discipline} • ${med.city} • ${med.managementType}`,
        location: `${med.city} Karnataka ${med.address}`,
        category: med.discipline,
        management: med.managementType.toLowerCase().includes('government')
          ? 'Government'
          : med.managementType.toLowerCase().includes('aided')
          ? 'Aided'
          : 'Private',
        seats: med.totalApprovedSeats,
        tags: [
          med.discipline,
          med.course,
          med.city,
          med.entranceExam,
          ...(med.coursesOffered || []),
        ],
        metadata: {
          govQuotaSeats: med.govQuotaSeats,
          totalApprovedSeats: med.totalApprovedSeats,
          discipline: med.discipline,
        },
      });
    });

    // 4. Index Career Explorer (Pathways, Exams, Branches)
    (pathwaysData.items as any[]).forEach((p) => {
      this.items.push({
        id: p.id,
        domain: 'careers',
        title: p.name,
        subtitle: `${p.level} Pathway • ${p.category}`,
        category: p.category,
        tags: [...(p.streams || []), ...(p.sectors || []), ...(p.keySubjects || [])],
        metadata: { level: p.level, duration: p.duration },
      });
    });

    (examsData.items as any[]).forEach((e) => {
      this.items.push({
        id: e.id,
        domain: 'careers',
        title: e.name,
        subtitle: `${e.type} Exam conducted by ${e.conductingBody}`,
        tags: [e.type, e.conductingBody, ...(e.forLevels || [])],
        metadata: { officialSite: e.officialSite },
      });
    });

    (branchesData.items as any[]).forEach((b) => {
      const rolesArray = b.roles && typeof b.roles === 'object'
        ? [...(b.roles.entry || []), ...(b.roles.mid || []), ...(b.roles.senior || [])]
        : Array.isArray(b.roles) ? b.roles : [];
      const recruitersArray = b.topRecruiters && typeof b.topRecruiters === 'object'
        ? [...(b.topRecruiters.private || []), ...(b.topRecruiters.public || [])]
        : Array.isArray(b.topRecruiters) ? b.topRecruiters : [];

      this.items.push({
        id: b.id,
        domain: 'careers',
        title: b.name,
        code: b.code,
        subtitle: `Engineering Branch • GATE: ${b.gatePaper || 'N/A'}`,
        category: 'Engineering Specialization',
        tags: [b.code, ...(b.aliases || []), ...rolesArray, ...recruitersArray],
        metadata: { outlook: b.outlook },
      });
    });

    // 5. Build Inverted Index
    this.items.forEach((item, itemIdx) => {
      const addToken = (token: string, field: InvertedIndexEntry['field']) => {
        if (!token) return;
        const norm = normalizeText(token);
        if (norm.length < 2) return;
        if (!this.invertedIndex.has(norm)) {
          this.invertedIndex.set(norm, []);
        }
        this.invertedIndex.get(norm)!.push({ itemIndex: itemIdx, field });
      };

      // Index code (exact tokens)
      if (item.code) {
        tokenize(item.code).forEach((t) => addToken(t, 'code'));
      }
      // Index title tokens
      tokenize(item.title).forEach((t) => addToken(t, 'title'));
      // Index location tokens
      if (item.location) {
        tokenize(item.location).forEach((t) => addToken(t, 'location'));
      }
      // Index category tokens
      if (item.category) {
        tokenize(item.category).forEach((t) => addToken(t, 'category'));
      }
      // Index tags
      (item.tags || []).forEach((tag) => {
        tokenize(tag).forEach((t) => addToken(t, 'tags'));
      });
    });

    this.isIndexed = true;
    console.log(`⚡ Inverted Index built for ${this.items.length} items in ${Date.now() - start}ms`);
  }

  public search(
    rawQuery: string,
    options: {
      domain?: SearchDomain;
      limit?: number;
      page?: number;
      management?: string;
      city?: string;
    } = {}
  ): SearchResponse {
    const startTime = Date.now();
    const query = sanitizeQuery(rawQuery || '');
    const intent = extractIntent(query);
    const domainFilter = options.domain || intent.targetDomain || 'all';
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));

    if (!query.trim()) {
      return {
        query,
        intent,
        results: [],
        totalMatches: 0,
        page,
        limit,
        totalPages: 0,
        tookMs: Date.now() - startTime,
      };
    }

    const normQuery = normalizeText(query);
    const queryTokens = tokenize(normQuery);

    // Check alias / institution acronym replacement (e.g. "rvce" -> "rv college of engineering")
    const expandedTokens = [...queryTokens];
    queryTokens.forEach((tok) => {
      if (INSTITUTION_SYNONYMS[tok]) {
        tokenize(INSTITUTION_SYNONYMS[tok]).forEach((t) => expandedTokens.push(t));
      }
      if (CITY_SYNONYMS[tok]) {
        expandedTokens.push(CITY_SYNONYMS[tok]);
      }
    });

    // Score all candidate items
    const candidateScores = new Map<number, { score: number; matchType: SearchMatch['matchedOn']; details: string }>();

    // 1. Inverted index exact token traversal
    expandedTokens.forEach((token) => {
      const entries = this.invertedIndex.get(token);
      if (entries) {
        entries.forEach((e) => {
          const item = this.items[e.itemIndex];
          if (domainFilter !== 'all' && item.domain !== domainFilter) return;

          let weight = 10;
          let matchType: SearchMatch['matchedOn'] = 'token_match';

          if (e.field === 'code') {
            weight = 100;
            matchType = 'exact_code';
          } else if (e.field === 'title') {
            weight = 40;
            matchType = 'exact_title';
          } else if (e.field === 'location') {
            weight = 20;
          }

          const existing = candidateScores.get(e.itemIndex) || { score: 0, matchType, details: '' };
          candidateScores.set(e.itemIndex, {
            score: existing.score + weight,
            matchType: existing.score === 0 ? matchType : existing.matchType,
            details: `Matched on token "${token}" in ${e.field}`,
          });
        });
      }
    });

    // 2. Direct string containment & Fuzzy fallback for small queries or typos
    if (candidateScores.size === 0 || queryTokens.length <= 2) {
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        if (domainFilter !== 'all' && item.domain !== domainFilter) continue;

        const normTitle = normalizeText(item.title);
        const normCode = normalizeText(item.code || '');

        // Exact code match
        if (normCode && (normCode === normQuery || normCode.startsWith(normQuery))) {
          candidateScores.set(i, { score: 120, matchType: 'exact_code', details: `Exact code match (${item.code})` });
          continue;
        }

        // Full phrase substring match in title
        if (normTitle.includes(normQuery)) {
          candidateScores.set(i, { score: 70, matchType: 'exact_title', details: `Title contains "${normQuery}"` });
          continue;
        }

        // Fuzzy match on tokens (Typo tolerance)
        for (const qTok of queryTokens) {
          if (qTok.length < 3) continue;
          const titleTokens = tokenize(normTitle);
          for (const tTok of titleTokens) {
            if (isTypoMatch(qTok, tTok)) {
              const current = candidateScores.get(i) || { score: 0, matchType: 'fuzzy', details: '' };
              candidateScores.set(i, {
                score: current.score + 25,
                matchType: 'fuzzy',
                details: `Typo resolution: "${qTok}" matches "${tTok}"`,
              });
              break;
            }
          }
        }
      }
    }

    // 3. Post-scoring Boosts & Intent Filters
    const scoredMatches: SearchMatch[] = [];

    candidateScores.forEach((info, idx) => {
      const item = this.items[idx];
      let finalScore = info.score;

      // Filter by Intent City / District
      if (intent.cityOrDistrict) {
        const itemLoc = normalizeText(item.location || '');
        if (itemLoc.includes(intent.cityOrDistrict)) {
          finalScore += 30; // Boost exact city match
        } else if (candidateScores.size > 20) {
          // Penalize location mismatch if many results
          finalScore -= 20;
        }
      }

      // Filter by Intent Management (Government / Private / Aided)
      if (intent.management && item.management) {
        if (item.management.toLowerCase() === intent.management.toLowerCase()) {
          finalScore += 25;
        } else if (candidateScores.size > 20) {
          finalScore -= 30;
        }
      }

      // Filter by Intent Budget
      if (intent.maxBudget && item.fee) {
        if (item.fee <= intent.maxBudget) {
          finalScore += 20;
        } else {
          finalScore -= 40;
        }
      }

      // Filter by Intent Discipline (Medical / Dental / Pharmacy / Nursing)
      if (intent.discipline && item.category) {
        if (item.category.toLowerCase().includes(intent.discipline.toLowerCase())) {
          finalScore += 40;
        } else {
          finalScore -= 50;
        }
      }

      // NIRF Rank boost (institutes ranked 1-100 get up to +20 points)
      if (item.rank && item.rank > 0 && item.rank <= 100) {
        finalScore += Math.max(5, 25 - Math.round(item.rank / 4));
      }

      if (finalScore > 5) {
        scoredMatches.push({
          item,
          score: finalScore,
          matchedOn: info.matchType,
          matchDetails: info.details,
        });
      }
    });

    // 4. Deterministic Sort (Score desc -> Rank asc -> Title asc -> ID asc)
    scoredMatches.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.item.rank && b.item.rank) return a.item.rank - b.item.rank;
      if (a.item.rank && !b.item.rank) return -1;
      if (!a.item.rank && b.item.rank) return 1;
      return a.item.title.localeCompare(b.item.title);
    });

    const totalMatches = scoredMatches.length;
    const totalPages = Math.ceil(totalMatches / limit);
    const offset = (page - 1) * limit;
    const paginated = scoredMatches.slice(offset, offset + limit);

    // Did you mean suggestion if empty or low matches
    let didYouMean: string | undefined;
    if (totalMatches === 0) {
      for (const tok of queryTokens) {
        for (const cityAlias of Object.keys(CITY_SYNONYMS)) {
          if (damerauLevenshtein(tok, cityAlias) === 1) {
            didYouMean = query.replace(tok, CITY_SYNONYMS[cityAlias]);
            break;
          }
        }
      }
    }

    return {
      query,
      intent,
      results: paginated,
      totalMatches,
      page,
      limit,
      totalPages,
      tookMs: Date.now() - startTime,
      didYouMean,
    };
  }
}

// Global Singleton Instance
export const searchEngine = new UniversalSearchEngine();
