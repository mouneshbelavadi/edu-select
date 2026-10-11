export type StudentLevel =
  | '10th'
  | '12th'
  | 'iti'
  | 'diploma'
  | 'btech'
  | 'degree'
  | 'professional'
  | 'pg';

export type StudentStream =
  | 'PCM'
  | 'PCB'
  | 'PCMB'
  | 'PCMC'
  | 'Commerce'
  | 'Arts'
  | 'Other';

export type StudentBoard = 'Karnataka' | 'CBSE' | 'ICSE' | 'Other';

export type StudentCategory =
  | 'GM'
  | '1'
  | '2A'
  | '2B'
  | '3A'
  | '3B'
  | 'SC'
  | 'ST';

export interface StudentMarks {
  percent?: number;
  kcet?: number;
  pcmBoard?: number;
  neet?: number;
  jee?: number;
}

export interface StudentProfile {
  level: StudentLevel;
  stream?: StudentStream;
  board?: StudentBoard;
  state?: string;            // for state-specific results
  district?: string;
  marks?: StudentMarks;
  category?: StudentCategory;
  interests?: string[];      // "doctor", "coding", "defence", "business"...
  budgetPerYear?: number;
}

export interface JourneyResolution {
  level: StudentLevel;
  stream?: StudentStream;
  state?: string;
  headline: string;
  subheadline: string;
  primaryPathways: string[];
  entranceExams: {
    name: string;
    code: string;
    purpose: string;
    url?: string;
  }[];
  eligibleCollegeDatasets: {
    datasetId: 'puc' | 'engineering' | 'medical' | 'pathways';
    title: string;
    route: string;
    recordCountNotice: string;
    isAvailable: boolean;
  }[];
  coverageHonestyNotice?: {
    availableData: string;
    missingDataNotice: string;
    recommendedExternalPortal: string;
    externalUrl: string;
  };
  recommendedTools: {
    title: string;
    description: string;
    route: string;
    badge?: string;
  }[];
  nextProgressionSteps: string[];
}
