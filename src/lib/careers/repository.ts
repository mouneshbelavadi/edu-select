import 'server-only';

import taxonomyData from '@/data/careers/taxonomy.json';
import careerClustersData from '@/data/careers/careerClusters.json';
import pathwaysData from '@/data/careers/pathways.json';
import examsData from '@/data/careers/exams.json';
import engineeringBranchesData from '@/data/careers/engineeringBranches.json';
import graduateCareersData from '@/data/careers/graduateCareers.json';
import govtJobsData from '@/data/careers/govtJobs.json';

import {
  Taxonomy,
  Dataset,
  CareerCluster,
  Pathway,
  Exam,
  EngineeringBranch,
  EngineeringBranchesFile,
  GraduateCareer,
  GovtJob,
  CareerCard,
  QualificationLevelId,
  Riasec,
  Outlook,
  Sector,
} from '@/types/careerData';
import { CareerSearchQuery } from '@/lib/validation/careers';

// Typed datasets
const taxonomy = taxonomyData as unknown as Taxonomy;
const careerClusters = (careerClustersData as unknown as Dataset<CareerCluster>).items;
const pathways = (pathwaysData as unknown as Dataset<Pathway>).items;
const exams = (examsData as unknown as Dataset<Exam>).items;
const engineeringBranchesFile = engineeringBranchesData as unknown as EngineeringBranchesFile;
const engineeringBranches = engineeringBranchesFile.items;
const graduateCareers = (graduateCareersData as unknown as Dataset<GraduateCareer>).items;
const govtJobsFile = govtJobsData as unknown as Dataset<GovtJob> & {
  meta: {
    eligibleAlso: Record<string, string[]>;
    ageRelaxation: { OBC: number; SC_ST: number; PwD: number; note: string };
    payMatrixLevel1to14: Record<string, number>;
  };
};
const govtJobs = govtJobsFile.items;
const eligibleAlso = govtJobsFile.meta.eligibleAlso || {};

// Map Indexes
const examsMap = new Map<string, Exam>();
exams.forEach((e) => examsMap.set(e.id, e));

const govtJobsMap = new Map<string, GovtJob>();
govtJobs.forEach((g) => govtJobsMap.set(g.id, g));

const branchesMap = new Map<string, EngineeringBranch>();
const branchesCodeMap = new Map<string, EngineeringBranch>();
engineeringBranches.forEach((b) => {
  branchesMap.set(b.id, b);
  branchesCodeMap.set(b.code.toUpperCase(), b);
});

const clustersMap = new Map<string, CareerCluster>();
careerClusters.forEach((c) => clustersMap.set(c.id, c));

const pathwaysMap = new Map<string, Pathway>();
pathways.forEach((p) => pathwaysMap.set(p.id, p));

const graduateCareersMap = new Map<string, GraduateCareer>();
graduateCareers.forEach((g) => graduateCareersMap.set(g.id, g));

// Helper: Calculate total cost range for a pathway
function calculatePathwayCost(pathway: Pathway): { min: number; max: number } | null {
  const cost = pathway.cost;
  if (!cost) return null;
  const govtMin = cost.govt ? cost.govt[0] : null;
  const govtMax = cost.govt ? cost.govt[1] : null;
  const pvtMin = cost.private ? cost.private[0] : null;
  const pvtMax = cost.private ? cost.private[1] : null;

  const minBase = govtMin ?? pvtMin ?? 0;
  const maxBase = pvtMax ?? govtMax ?? 0;

  if (minBase === 0 && maxBase === 0) return null;

  if (cost.basis === 'perYear') {
    const minYears = pathway.durationYears?.min || 1;
    const maxYears = pathway.durationYears?.max || minYears;
    return {
      min: minBase * minYears,
      max: maxBase * maxYears,
    };
  }

  return { min: minBase, max: maxBase };
}

// Transform helpers to unified CareerCard
function pathwayToCard(p: Pathway): CareerCard {
  const clusterName = p.clusterIds?.[0] ? clustersMap.get(p.clusterIds[0])?.label : undefined;
  return {
    kind: 'pathway',
    id: p.id,
    title: p.name,
    subtitle: p.category || p.eligibility,
    level: p.level,
    clusterIds: p.clusterIds,
    clusterName,
    outlook: p.outlook,
    entranceRequired: p.entranceRequired,
    examNames: (p.entranceExamIds || []).map((id) => examsMap.get(id)?.name || id).filter(Boolean),
    durationText: p.duration,
    totalCostINR: calculatePathwayCost(p),
    entrySalaryLPA: p.global_mobility?.net_monthly_savings_INR
      ? {
          min: Number(((p.global_mobility.net_monthly_savings_INR * 12) / 100000).toFixed(1)),
          max: Number(((p.global_mobility.net_monthly_savings_INR * 12) / 100000).toFixed(1)),
          basis: 'Net Savings',
        }
      : null,
    sectors: p.sectors,
    riasec: p.riasec,
    abroadFriendly: p.abroadFriendly,
    isEstimate: p.isEstimate,
    ncrfLevel:
      p.ncrf_credit_level ||
      (p.level === 'CLASS_10'
        ? 'NCrF Level 3'
        : p.level === 'CLASS_12'
        ? 'NCrF Level 4'
        : p.level === 'ITI'
        ? 'NCrF Level 4.5'
        : p.level === 'DIPLOMA'
        ? 'NCrF Level 5'
        : 'NCrF Level 7'),
    globalMobility: p.global_mobility,
    industrialLinkage: p.industrial_linkage,
    subjectMatches: p.keySubjects,
  };
}

function branchToCard(b: EngineeringBranch): CareerCard {
  const clusterName = b.clusterIds?.[0] ? clustersMap.get(b.clusterIds[0])?.label : 'Engineering';
  return {
    kind: 'branch',
    id: b.id,
    title: `B.Tech in ${b.name}`,
    subtitle: b.aliases?.slice(0, 2).join(', ') || '4-Year Engineering Degree',
    level: 'UG_ENGG',
    clusterIds: b.clusterIds,
    clusterName,
    outlook: b.outlook,
    entranceRequired: true,
    examNames: ['JEE Main', 'JEE Advanced', 'KCET / State CET'],
    durationText: '4 years',
    totalCostINR: { min: 200000, max: 1500000 },
    entrySalaryLPA: {
      min: b.salaryLPA.fresher.min,
      max: b.salaryLPA.fresher.max,
      basis: 'Fresher CTC',
    },
    sectors: b.sectors as Sector[],
    riasec: b.riasec,
    abroadFriendly: true,
    isEstimate: b.isEstimate,
    ncrfLevel: 'NCrF Level 7 (4-Year Engineering Degree)',
    globalShortage: b.global_shortage_indicator,
    keyCompetencies: b.key_competencies,
    subjectMatches: b.key_competencies,
  };
}

function degreeToCard(g: GraduateCareer): CareerCard {
  const clusterName = g.clusterIds?.[0] ? clustersMap.get(g.clusterIds[0])?.label : 'Degree & Career';
  return {
    kind: 'degree',
    id: g.id,
    title: g.qualification,
    subtitle: g.roles?.slice(0, 3).join(', ') || 'Degree / Professional Program',
    level: g.level as QualificationLevelId,
    clusterIds: g.clusterIds,
    clusterName,
    outlook: g.outlook,
    entranceRequired: (g.pgExamIds?.length || 0) > 0,
    examNames: (g.pgExamIds || []).map((id) => examsMap.get(id)?.name || id).filter(Boolean),
    durationText: g.level === 'PG' ? '2 years' : '3–5 years',
    totalCostINR: null,
    entrySalaryLPA: g.salaryLPA
      ? {
          min: g.salaryLPA.fresher.min,
          max: g.salaryLPA.fresher.max,
          basis: 'Fresher CTC',
        }
      : null,
    sectors: g.sectors as Sector[],
    riasec: g.riasec,
    abroadFriendly: false,
    isEstimate: g.isEstimate,
    ncrfLevel: g.ncrf_credit_level || (g.level === 'PG' ? 'NCrF Level 8' : 'NCrF Level 6'),
  };
}

function govtJobToCard(j: GovtJob): CareerCard {
  const minLpa = j.basicPayINR?.length ? Number(((j.basicPayINR[0] * 12) / 100000).toFixed(2)) : 2.5;
  const maxLpa = j.basicPayINR?.length
    ? Number((((j.basicPayINR[j.basicPayINR.length - 1] || j.basicPayINR[0]) * 12) / 100000).toFixed(2))
    : minLpa;

  const level: QualificationLevelId =
    j.minQualification === 'CLASS_10'
      ? 'CLASS_10'
      : j.minQualification === 'CLASS_12'
      ? 'CLASS_12'
      : j.minQualification === 'ITI'
      ? 'ITI'
      : j.minQualification === 'DIPLOMA'
      ? 'DIPLOMA'
      : j.minQualification === 'ENGINEERING'
      ? 'UG_ENGG'
      : j.minQualification === 'GRADUATE'
      ? 'UG_OTHER'
      : j.minQualification === 'PG'
      ? 'PG'
      : 'PROFESSIONAL';

  const clusterName = j.clusterIds?.[0] ? clustersMap.get(j.clusterIds[0])?.label : 'Government Job';

  return {
    kind: 'govtJob',
    id: j.id,
    title: j.exam,
    subtitle: `${j.conductingBody} • ${j.posts?.slice(0, 2).join(', ')}`,
    level,
    clusterIds: j.clusterIds,
    clusterName,
    outlook: j.outlook,
    entranceRequired: true,
    examNames: [j.exam],
    durationText: j.ageLimit?.text || `Age ${j.ageLimit?.min || 18}–${j.ageLimit?.max || 30}`,
    totalCostINR: null,
    entrySalaryLPA: {
      min: minLpa,
      max: maxLpa,
      basis: '7th CPC Basic Pay',
    },
    sectors: ['GOVT'],
    riasec: ['C', 'R'],
    abroadFriendly: false,
    isEstimate: j.isEstimate,
    estimatedGrossMonthly: j.approxInHand,
    ncrfLevel:
      j.minQualification === 'ENGINEERING'
        ? 'NCrF Level 7'
        : j.minQualification === 'GRADUATE'
        ? 'NCrF Level 6'
        : j.minQualification === 'DIPLOMA'
        ? 'NCrF Level 5'
        : 'NCrF Level 4',
  };
}

// Repository Exports
export function getTaxonomy(): Taxonomy {
  return taxonomy;
}

export function getClusters(): CareerCluster[] {
  return careerClusters;
}

export function getExam(id: string): Exam | undefined {
  return examsMap.get(id);
}

export function getGovtJob(id: string): GovtJob | undefined {
  return govtJobsMap.get(id);
}

export function getBranchByCode(code: string): EngineeringBranch | undefined {
  return branchesCodeMap.get(code.toUpperCase());
}

export function searchCareers(query: Partial<CareerSearchQuery> = {}) {
  const {
    level,
    stream,
    branch,
    kind,
    q,
    cluster,
    riasec,
    subjects,
    outlook,
    sector,
    budget,
    duration,
    salary,
    entrance,
    abroad,
    sort = 'relevance',
    page = 1,
    limit = 20,
  } = query;

  let candidateCards: CareerCard[] = [];

  // 1. Level Rules
  if (!level) {
    candidateCards = [
      ...pathways.map(pathwayToCard),
      ...engineeringBranches.map(branchToCard),
      ...graduateCareers.map(degreeToCard),
      ...govtJobs.map(govtJobToCard),
    ];
  } else if (level === 'CLASS_10') {
    const matchedPathways = pathways.filter((p) => p.level === 'CLASS_10');
    const allowedGovtQuals = new Set(eligibleAlso.CLASS_10 || ['CLASS_10']);
    const matchedGovt = govtJobs.filter((g) => allowedGovtQuals.has(g.minQualification));
    candidateCards = [...matchedPathways.map(pathwayToCard), ...matchedGovt.map(govtJobToCard)];
  } else if (level === 'CLASS_12') {
    const matchedPathways = pathways.filter((p) => {
      if (p.level !== 'CLASS_12') return false;
      if (!stream || stream === 'ANY') return true;
      return p.streams?.includes(stream as any) || p.streams?.includes('ANY');
    });
    const allowedGovtQuals = new Set(eligibleAlso.CLASS_12 || ['CLASS_10', 'CLASS_12']);
    const matchedGovt = govtJobs.filter((g) => allowedGovtQuals.has(g.minQualification));
    candidateCards = [...matchedPathways.map(pathwayToCard), ...matchedGovt.map(govtJobToCard)];
  } else if (level === 'ITI') {
    const matchedPathways = pathways.filter((p) => p.level === 'ITI');
    const allowedGovtQuals = new Set(eligibleAlso.ITI || ['CLASS_10', 'ITI']);
    const matchedGovt = govtJobs.filter((g) => allowedGovtQuals.has(g.minQualification));
    candidateCards = [...matchedPathways.map(pathwayToCard), ...matchedGovt.map(govtJobToCard)];
  } else if (level === 'DIPLOMA') {
    const matchedPathways = pathways.filter((p) => p.level === 'DIPLOMA');
    const allowedGovtQuals = new Set(eligibleAlso.DIPLOMA || ['CLASS_10', 'CLASS_12', 'DIPLOMA']);
    const matchedGovt = govtJobs.filter((g) => allowedGovtQuals.has(g.minQualification));
    candidateCards = [...matchedPathways.map(pathwayToCard), ...matchedGovt.map(govtJobToCard)];
  } else if (level === 'UG_ENGG') {
    let branches = engineeringBranches;
    if (branch) {
      branches = branches.filter((b) => b.code.toUpperCase() === branch.toUpperCase());
    }
    const matchedPathways = pathways.filter((p) => p.level === 'UG_ENGG');
    const allowedGovtQuals = new Set(
      eligibleAlso.ENGINEERING || ['CLASS_10', 'CLASS_12', 'DIPLOMA', 'GRADUATE', 'ENGINEERING']
    );
    const matchedGovt = govtJobs.filter((g) => allowedGovtQuals.has(g.minQualification));
    candidateCards = [
      ...branches.map(branchToCard),
      ...matchedPathways.map(pathwayToCard),
      ...matchedGovt.map(govtJobToCard),
    ];
  } else if (level === 'UG_OTHER') {
    const matchedGrad = graduateCareers.filter((g) => g.level === 'UG_OTHER');
    const matchedPathways = pathways.filter((p) => p.level === 'UG_OTHER');
    const allowedGovtQuals = new Set(eligibleAlso.GRADUATE || ['CLASS_10', 'CLASS_12', 'GRADUATE']);
    const matchedGovt = govtJobs.filter((g) => allowedGovtQuals.has(g.minQualification));
    candidateCards = [
      ...matchedGrad.map(degreeToCard),
      ...matchedPathways.map(pathwayToCard),
      ...matchedGovt.map(govtJobToCard),
    ];
  } else if (level === 'PROFESSIONAL') {
    const matchedGrad = graduateCareers.filter((g) => g.level === 'PROFESSIONAL');
    const matchedPathways = pathways.filter((p) => p.level === 'PROFESSIONAL');
    const allowedGovtQuals = new Set(['MBBS', 'LLB', 'PROFESSIONAL', 'GRADUATE', 'CLASS_12', 'CLASS_10']);
    const matchedGovt = govtJobs.filter((g) => allowedGovtQuals.has(g.minQualification));
    candidateCards = [
      ...matchedGrad.map(degreeToCard),
      ...matchedPathways.map(pathwayToCard),
      ...matchedGovt.map(govtJobToCard),
    ];
  } else if (level === 'PG') {
    const matchedGrad = graduateCareers.filter((g) => g.level === 'PG');
    const matchedPathways = pathways.filter((p) => p.level === 'PG');
    const allowedGovtQuals = new Set(eligibleAlso.PG || ['CLASS_10', 'CLASS_12', 'GRADUATE', 'PG']);
    const matchedGovt = govtJobs.filter((g) => allowedGovtQuals.has(g.minQualification));
    candidateCards = [
      ...matchedGrad.map(degreeToCard),
      ...matchedPathways.map(pathwayToCard),
      ...matchedGovt.map(govtJobToCard),
    ];
  }

  // 2. Kind Filter
  if (kind) {
    candidateCards = candidateCards.filter((c) => c.kind === kind);
  }

  // 3. Search query q
  if (q && q.trim()) {
    const queryTerm = q.trim().toLowerCase();
    candidateCards = candidateCards.filter((c) => {
      if (c.title.toLowerCase().includes(queryTerm)) return true;
      if (c.subtitle.toLowerCase().includes(queryTerm)) return true;
      if (c.id.toLowerCase().includes(queryTerm)) return true;
      if (c.examNames.some((e) => e.toLowerCase().includes(queryTerm))) return true;

      // Check deep fields based on kind
      if (c.kind === 'pathway') {
        const p = pathwaysMap.get(c.id);
        if (p?.outcomes?.some((o) => o.toLowerCase().includes(queryTerm))) return true;
        if (p?.keySubjects?.some((s) => s.toLowerCase().includes(queryTerm))) return true;
      } else if (c.kind === 'branch') {
        const b = branchesMap.get(c.id);
        if (b?.aliases?.some((a) => a.toLowerCase().includes(queryTerm))) return true;
        if (b?.roles?.entry?.some((r) => r.toLowerCase().includes(queryTerm))) return true;
        if (b?.roles?.mid?.some((r) => r.toLowerCase().includes(queryTerm))) return true;
        if (b?.roles?.senior?.some((r) => r.toLowerCase().includes(queryTerm))) return true;
        if (b?.topRecruiters?.private?.some((r) => r.toLowerCase().includes(queryTerm))) return true;
      } else if (c.kind === 'degree') {
        const g = graduateCareersMap.get(c.id);
        if (g?.roles?.some((r) => r.toLowerCase().includes(queryTerm))) return true;
        if (g?.pgOptions?.some((o) => o.toLowerCase().includes(queryTerm))) return true;
      } else if (c.kind === 'govtJob') {
        const j = govtJobsMap.get(c.id);
        if (j?.posts?.some((p) => p.toLowerCase().includes(queryTerm))) return true;
        if (j?.conductingBody?.toLowerCase().includes(queryTerm)) return true;
      }
      return false;
    });
  }

  // 4. Cluster filter
  if (cluster) {
    candidateCards = candidateCards.filter((c) => c.clusterIds.includes(cluster));
  }

  // 5. RIASEC filter
  const riasecArray = Array.isArray(riasec) ? riasec : riasec ? [riasec] : [];
  if (riasecArray.length > 0) {
    const rSet = new Set(riasecArray.map((r) => r.toUpperCase()));
    candidateCards = candidateCards.filter((c) => c.riasec.some((r) => rSet.has(r)));
  }

  // 6. Subjects filter
  const subjectsArray = Array.isArray(subjects) ? subjects : subjects ? [subjects] : [];
  if (subjectsArray.length > 0) {
    const sSet = new Set(subjectsArray.map((s) => s.toLowerCase()));
    candidateCards = candidateCards.filter((c) => {
      if (c.kind === 'pathway') {
        const p = pathwaysMap.get(c.id);
        return p?.subjectsLiked?.some((s) => sSet.has(s.toLowerCase()));
      }
      // For branches, degrees, govt jobs: match through cluster subjects
      return c.clusterIds.some((cid) => {
        const cl = clustersMap.get(cid);
        return cl?.subjects?.some((s) => sSet.has(s.toLowerCase()));
      });
    });
  }

  // 7. Outlook filter
  const outlookArray = Array.isArray(outlook) ? outlook : outlook ? [outlook] : [];
  if (outlookArray.length > 0) {
    const oSet = new Set(outlookArray);
    candidateCards = candidateCards.filter((c) => oSet.has(c.outlook));
  }

  // 8. Sector filter
  const sectorArray = Array.isArray(sector) ? sector : sector ? [sector] : [];
  if (sectorArray.length > 0) {
    const sSet = new Set(sectorArray);
    candidateCards = candidateCards.filter((c) => c.sectors.some((sec) => sSet.has(sec)));
  }

  // 9. Abroad Friendly
  if (abroad === true || abroad === 'true') {
    candidateCards = candidateCards.filter((c) => c.abroadFriendly);
  }

  // 10. Entrance exam required
  if (entrance !== undefined) {
    const isEntrance = entrance === true || entrance === 'true';
    candidateCards = candidateCards.filter((c) => c.entranceRequired === isEntrance);
  }

  // 11. Budget filter
  if (budget) {
    candidateCards = candidateCards.filter((c) => {
      if (!c.totalCostINR) return true; // Items with no cost skip this filter
      const { min, max } = c.totalCostINR;
      if (budget === 'under-50k') return max <= 50000;
      if (budget === '50k-2l') return min >= 50000 && max <= 200000;
      if (budget === '2l-10l') return min >= 200000 && max <= 1000000;
      if (budget === '10l-plus') return max >= 1000000;
      return true;
    });
  }

  // 12. Duration filter
  if (duration) {
    candidateCards = candidateCards.filter((c) => {
      const d = c.durationText.toLowerCase();
      if (duration === '1-year') return d.includes('1 year') || d.includes('6 month');
      if (duration === '2-years') return d.includes('2 year');
      if (duration === '3-4-years') return d.includes('3 year') || d.includes('4 year');
      if (duration === '5-plus') return d.includes('5 year') || d.includes('5.5 year');
      return true;
    });
  }

  // 13. Salary filter
  if (salary) {
    candidateCards = candidateCards.filter((c) => {
      if (!c.entrySalaryLPA) return true;
      const { max } = c.entrySalaryLPA;
      if (salary === 'under-3l') return max < 3;
      if (salary === '3l-6l') return max >= 3 && max <= 6;
      if (salary === '6l-12l') return max >= 6 && max <= 12;
      if (salary === '12l-plus') return max >= 12;
      return true;
    });
  }

  // Facet counts before pagination
  const facets = {
    kinds: {
      pathway: candidateCards.filter((c) => c.kind === 'pathway').length,
      branch: candidateCards.filter((c) => c.kind === 'branch').length,
      degree: candidateCards.filter((c) => c.kind === 'degree').length,
      govtJob: candidateCards.filter((c) => c.kind === 'govtJob').length,
    },
    outlooks: {
      GROWING: candidateCards.filter((c) => c.outlook === 'GROWING').length,
      STABLE: candidateCards.filter((c) => c.outlook === 'STABLE').length,
      DECLINING: candidateCards.filter((c) => c.outlook === 'DECLINING').length,
    },
    clusters: {} as Record<string, number>,
  };
  candidateCards.forEach((c) => {
    c.clusterIds.forEach((cid) => {
      facets.clusters[cid] = (facets.clusters[cid] || 0) + 1;
    });
  });

  // Sorting
  const rSet = new Set((riasecArray || []).map((r) => r.toUpperCase()));
  const sSet = new Set((subjectsArray || []).map((s) => s.toLowerCase()));

  candidateCards.sort((a, b) => {
    if (sort === 'salary_desc') {
      const aSal = a.entrySalaryLPA?.max ?? -1;
      const bSal = b.entrySalaryLPA?.max ?? -1;
      return bSal - aSal;
    }
    if (sort === 'cost_asc') {
      const aCost = a.totalCostINR?.min ?? 99999999;
      const bCost = b.totalCostINR?.min ?? 99999999;
      return aCost - bCost;
    }
    if (sort === 'duration_asc') {
      return a.durationText.localeCompare(b.durationText);
    }

    // Default: relevance
    // Score = (RIASEC overlap * 2) + subject overlap + outlook score
    const aRiasecMatch = a.riasec.filter((r) => rSet.has(r)).length;
    const bRiasecMatch = b.riasec.filter((r) => rSet.has(r)).length;

    let aSubMatch = 0;
    let bSubMatch = 0;
    if (sSet.size > 0) {
      if (a.kind === 'pathway') {
        aSubMatch = (pathwaysMap.get(a.id)?.subjectsLiked || []).filter((s) => sSet.has(s.toLowerCase())).length;
      }
      if (b.kind === 'pathway') {
        bSubMatch = (pathwaysMap.get(b.id)?.subjectsLiked || []).filter((s) => sSet.has(s.toLowerCase())).length;
      }
    }

    const outlookScore = (o: Outlook) => (o === 'GROWING' ? 3 : o === 'STABLE' ? 1 : 0);
    const aScore = aRiasecMatch * 2 + aSubMatch + outlookScore(a.outlook);
    const bScore = bRiasecMatch * 2 + bSubMatch + outlookScore(b.outlook);

    if (bScore !== aScore) return bScore - aScore;
    return a.title.localeCompare(b.title);
  });

  const total = candidateCards.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedItems = candidateCards.slice(startIndex, startIndex + limit);

  return {
    items: paginatedItems,
    total,
    page,
    totalPages,
    facets,
  };
}

export function getCareerDetail(kind: 'pathway' | 'branch' | 'degree' | 'govtJob', id: string) {
  if (kind === 'pathway') {
    const pathway = pathwaysMap.get(id);
    if (!pathway) return null;

    const resolvedEntranceExams = (pathway.entranceExamIds || []).map((eid) => examsMap.get(eid)).filter(Boolean);
    const resolvedNextExams = (pathway.nextExamIds || []).map((eid) => examsMap.get(eid)).filter(Boolean);
    const resolvedClusters = (pathway.clusterIds || []).map((cid) => clustersMap.get(cid)).filter(Boolean);

    let linkedItems: any[] = [];
    if (pathway.linkedDataset === 'engineeringBranches') {
      linkedItems = engineeringBranches;
    } else if (pathway.linkedDataset === 'govtJobs') {
      const minQual = pathway.linkedFilter?.minQualification;
      linkedItems = minQual ? govtJobs.filter((g) => g.minQualification === minQual) : govtJobs;
    }

    return {
      kind,
      item: pathway,
      resolvedEntranceExams,
      resolvedNextExams,
      resolvedClusters,
      linkedItems,
      sources: (pathwaysData as any).meta?.sources || [],
    };
  }

  if (kind === 'branch') {
    let branch = branchesMap.get(id);
    if (!branch) {
      branch = branchesCodeMap.get(id.toUpperCase());
    }
    if (!branch) return null;

    const resolvedClusters = (branch.clusterIds || []).map((cid) => clustersMap.get(cid)).filter(Boolean);
    const common = engineeringBranchesFile.commonToAllBranches;
    const resolvedGovtExams = (common?.governmentExams || []).map((ge) => ({
      ...ge,
      job: govtJobsMap.get(ge.examId),
    }));
    const resolvedHigherStudies = (common?.higherStudies || []).map((hs) => ({
      ...hs,
      exams: (hs.examIds || []).map((eid) => examsMap.get(eid)).filter(Boolean),
    }));

    return {
      kind,
      item: branch,
      resolvedClusters,
      commonToAllBranches: {
        ...common,
        governmentExams: resolvedGovtExams,
        higherStudies: resolvedHigherStudies,
      },
      sources: (engineeringBranchesData as any).meta?.sources || [],
    };
  }

  if (kind === 'degree') {
    const graduate = graduateCareersMap.get(id);
    if (!graduate) return null;

    const resolvedClusters = (graduate.clusterIds || []).map((cid) => clustersMap.get(cid)).filter(Boolean);
    const resolvedGovtJobs = (graduate.govtJobIds || []).map((gid) => govtJobsMap.get(gid)).filter(Boolean);
    const resolvedPgExams = (graduate.pgExamIds || []).map((eid) => examsMap.get(eid)).filter(Boolean);

    return {
      kind,
      item: graduate,
      resolvedClusters,
      resolvedGovtJobs,
      resolvedPgExams,
      sources: (graduateCareersData as any).meta?.sources || [],
    };
  }

  if (kind === 'govtJob') {
    const job = govtJobsMap.get(id);
    if (!job) return null;

    const resolvedClusters = (job.clusterIds || []).map((cid) => clustersMap.get(cid)).filter(Boolean);

    return {
      kind,
      item: job,
      resolvedClusters,
      ageRelaxation: govtJobsFile.meta.ageRelaxation,
      payMatrixLevel1to14: govtJobsFile.meta.payMatrixLevel1to14,
      sources: (govtJobsData as any).meta?.sources || [],
    };
  }

  return null;
}
