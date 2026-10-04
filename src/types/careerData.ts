// Type definitions for the EduSelect career + college datasets (compiled 2026-10-04).
// Copy to src/types/careerData.ts. Every data file is shaped { meta, items } except taxonomy.json and karnatakaPatch.json.

export type QualificationLevelId =
  | 'CLASS_10' | 'CLASS_12' | 'ITI' | 'DIPLOMA' | 'UG_ENGG' | 'UG_OTHER' | 'PROFESSIONAL' | 'PG';
export type StreamId =
  | 'PCM' | 'PCB' | 'PCMB' | 'PCMC' | 'COMMERCE_MATHS' | 'COMMERCE_NO_MATHS' | 'ARTS' | 'VOCATIONAL' | 'ANY';
export type Riasec = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type Outlook = 'GROWING' | 'STABLE' | 'DECLINING';
export type Sector = 'GOVT' | 'PSU' | 'PRIVATE' | 'SELF' | 'ABROAD' | 'DEFENCE';

export interface SourceRef { id: string; title: string; url: string }
export interface DatasetMeta {
  dataset: string; description: string; version: string; compiledOn: string; region: 'India'; currency: 'INR';
  disclaimer: string; sources: SourceRef[]; [extra: string]: unknown;
}
export interface Dataset<T> { meta: DatasetMeta; items: T[] }
export interface Range { min: number; max: number }

// ---------- taxonomy.json ----------
export interface QualificationLevel { id: QualificationLevelId; label: string; shortLabel: string; description: string; nextLevels: QualificationLevelId[] }
export interface Stream { id: StreamId; label: string; forLevels: QualificationLevelId[]; subjects: string[] }
export interface RiasecInfo { code: Riasec; label: string; description: string; examples: string[] }
export interface BandOption { id: string; label: string; min?: number | null; max?: number | null; badge?: string }
export interface Taxonomy {
  meta: DatasetMeta;
  qualificationLevels: QualificationLevel[];
  streams: Stream[];
  riasec: RiasecInfo[];
  subjectsLiked: string[];
  filters: {
    budgetTotalINR: BandOption[]; durationYears: BandOption[]; sector: BandOption[]; entrySalaryLPA: BandOption[];
    outlook: BandOption[]; location: BandOption[]; entranceRequired: BandOption[];
  };
  aptitudeFit: Record<string, string[]>;
  outlookRules: Record<Outlook, { examples: string[]; evidence: string; uiRule?: string; sourceIds: string[] }>;
  marketFacts: { fact: string; sourceId: string }[];
}

// ---------- careerClusters.json ----------
export interface CareerCluster { id: string; label: string; icon: string; description: string; riasec: Riasec[]; subjects: string[] }

// ---------- exams.json ----------
export interface Exam {
  id: string; name: string; conductingBody: string;
  type: 'entrance' | 'counselling' | 'professional' | 'government-recruitment' | 'eligibility-test';
  forLevels: QualificationLevelId[]; purpose: string; eligibility: string; frequency: string;
  officialSite: string | null; note: string | null;
}

// ---------- pathways.json ----------
export interface Cost {
  basis: 'perYear' | 'total' | 'perCycle';
  govt: number[] | null; private: number[] | null; note: string | null; // [min, max] INR
}
export interface GlobalMobility {
  target_country: string;
  mandatory_certifications?: string[];
  total_estimated_capital_outlay_INR?: [number, number] | number[];
  exams?: string[];
  critical_thresholds?: string;
  licensure_process?: string;
  visa_type?: string;
  net_monthly_savings_INR?: number;
  regulatory_body?: string;
}

export interface IndustrialLinkage {
  corridor: string;
  region: string;
  anchor_corporations: string[];
  immediate_roles: string[];
  subsidized_policy?: string;
  institutions?: string[];
}

export interface Pathway {
  id: string; level: QualificationLevelId; streams: StreamId[]; category: string; clusterIds: string[]; name: string;
  eligibility: string; duration: string; durationYears: Range | null; isJob: boolean;
  entranceExamIds: string[]; entranceRequired: boolean; cost: Cost; keySubjects: string[];
  nextSteps: string[]; nextExamIds: string[]; outcomes: string[]; riasec: Riasec[]; subjectsLiked: string[];
  sectors: Sector[]; outlook: Outlook; abroadFriendly: boolean; isEstimate: boolean; asOfYear: number; sourceIds: string[];
  // optional extras
  branches?: string[]; parentId?: string; linkedTrades?: string; regulator?: string;
  linkedDataset?: 'engineeringBranches' | 'govtJobs'; linkedFilter?: { minQualification: string };
  // NCrF and Global Expansion Fields
  ncrf_credit_level?: string;
  global_mobility?: GlobalMobility;
  industrial_linkage?: IndustrialLinkage;
}

// ---------- engineeringBranches.json ----------
export interface EngineeringBranch {
  id: string; code: string; name: string; aliases: string[]; gatePaper: string; clusterIds: string[];
  roles: { entry: string[]; mid: string[]; senior: string[] };
  sectors: string[]; topRecruiters: { private: string[]; public: string[] }; psusViaGate: string[];
  eseEligible: boolean; eseStream: string | null; certifications: string[]; emergingRoles: string[];
  salaryLPA: { fresher: Range; mid3to5: Range; senior10plus: Range }; salaryNote: string;
  outlook: Outlook; riasec: Riasec[]; isEstimate: boolean; asOfYear: number; notes: string | null;
  // Deep-tech additions
  global_shortage_indicator?: boolean;
  key_competencies?: string[];
}
export interface EngineeringBranchesFile extends Dataset<EngineeringBranch> {
  commonToAllBranches: {
    governmentExams: { examId: string; note: string }[];          // examId -> govtJobs.json id
    higherStudies: { name: string; examIds: string[]; note: string }[]; // examIds -> exams.json id
    nonCoreCareers: string[];
    psuEntry: { description: string; payScale: string; typicalGeneralAgeCaps: Record<string, number>; sourceIds: string[]; isEstimate: boolean };
    governmentPay: { post: string; payLevel: number; basicPay: number; approxGrossMonthly: string }[];
  };
}

// ---------- graduateCareers.json ----------
export interface GraduateCareer {
  id: string; qualification: string; level: 'UG_OTHER' | 'PROFESSIONAL' | 'PG'; clusterIds: string[];
  roles: string[]; sectors: string[]; govtJobIds: string[]; pgOptions: string[]; pgExamIds: string[];
  salaryLPA: { fresher: Range; fiveYears: Range } | null; riasec: Riasec[]; outlook: Outlook;
  isEstimate: boolean; asOfYear: number; note: string | null;
  ncrf_credit_level?: string;
  fellowshipStipendMonthly?: number;
}

// ---------- govtJobs.json ----------
export type MinQualification =
  | 'CLASS_10' | 'ITI' | 'CLASS_12' | 'DIPLOMA' | 'GRADUATE' | 'ENGINEERING' | 'PG' | 'MBBS' | 'LLB' | 'PROFESSIONAL';
export interface GovtJob {
  id: string; minQualification: MinQualification; exam: string; conductingBody: string; posts: string[];
  ageLimit: { min: number | null; max: number; text: string }; selectionStages: string[];
  payLevels: number[]; basicPayINR: number[]; approxInHand: string; clusterIds: string[];
  officialSite: string | null; note: string | null; outlook: Outlook; isEstimate: boolean; asOfYear: number;
  // State executive, uniformed & apex scientific recruitment additions
  estimatedGrossInHand?: [number, number] | number[];
  vacancies2026?: number;
  physicalRequirements?: {
    maleHeightCm?: number;
    maleChestExpansionCm?: number;
    femaleHeightCm?: number;
    femaleWeightKg?: number;
    notes?: string;
  };
  trainingStipendMonthly?: number;
  startingGrossMonthly?: number;
  indemnityBondINR?: number;
}
// meta extras: ageRelaxation, payMatrixLevel1to14, minQualifications, eligibleAlso (qualification -> minQualification[] the candidate can apply for)

// ---------- colleges/*.json (extends the existing CollegeDetail in src/lib/collegeRepository.ts) ----------
export interface PlacementStats {
  year: number; medianLPA: number | null; averageLPA: number | null; highestLPA: number | null;
  source: string; sourceUrl?: string; verified: boolean;
}
export interface RealCollegeExtras {
  typeDetail: string;
  institutionCategory: 'IIT' | 'NIT' | 'NIT_NEW' | 'INI_CENTRAL' | 'IIIT_PPP' | 'CENTRAL_UNIV' | 'CENTRAL_DEEMED' | 'STATE' | 'STATE_UNIV' | 'STATE_DEEMED' | 'AIDED' | 'PRIVATE' | 'DEEMED' | 'PRIVATE_UNIV';
  rating: number | null;            // null when not NIRF-ranked
  ratingBasis: string | null;
  nirfRank2025: number | null;
  nirfBand2025: '1-100' | '101-150' | '151-200' | null;
  nirfNote: string | null;
  feesMax: number;
  feesIsEstimate: boolean;
  placementStats: PlacementStats | null;
  admissionRoutes: string[];        // JA, JM, STATE, KCET, COMEDK, MERIT10, OWN:<exam>
  routeNote: string | null;
  coursesNote: string;
  established: number | null;
  verificationStatus: 'partially-verified' | 'needs-verification';
  sourceUrls: string[];
  isRealData: true;
}

// ---------- UI Cards & Search ----------
export interface CareerCard {
  kind: 'pathway' | 'branch' | 'degree' | 'govtJob';
  id: string;
  title: string;
  subtitle: string;
  level: QualificationLevelId;
  clusterIds: string[];
  clusterName?: string;
  subjectMatches?: string[];
  outlook: Outlook;
  entranceRequired: boolean;
  examNames: string[];
  durationText: string;
  totalCostINR: { min: number; max: number } | null;
  entrySalaryLPA: { min: number; max: number; basis?: string } | null;
  sectors: Sector[] | string[];
  riasec: Riasec[];
  abroadFriendly: boolean;
  isEstimate: boolean;
  // Extended taxonomy badges & metadata
  ncrfLevel?: string;
  globalMobility?: GlobalMobility;
  industrialLinkage?: IndustrialLinkage;
  globalShortage?: boolean;
  keyCompetencies?: string[];
  estimatedGrossMonthly?: string;
}

