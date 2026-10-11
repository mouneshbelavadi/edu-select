export type SearchDomain = 'colleges' | 'puc' | 'medical' | 'careers' | 'all';

export interface SearchItem {
  id: string;
  domain: SearchDomain;
  title: string;
  code?: string;
  subtitle?: string;
  location?: string; // city, district, state
  category?: string; // branch, stream, discipline
  management?: string; // Government, Private, Aided
  fee?: number;
  rank?: number | null;
  seats?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ExtractedIntent {
  rawQuery: string;
  cleanQuery: string;
  targetDomain?: SearchDomain;
  level?: '10th' | '12th' | 'diploma' | 'btech';
  stream?: string;
  discipline?: 'Medical' | 'Dental' | 'Pharmacy' | 'Nursing';
  branch?: string;
  cityOrDistrict?: string;
  management?: 'Government' | 'Private' | 'Aided';
  maxBudget?: number;
  isNirfPriority?: boolean;
  tokens: string[];
}

export interface SearchMatch {
  item: SearchItem;
  score: number;
  matchedOn: 'exact_code' | 'exact_title' | 'prefix' | 'token_match' | 'synonym' | 'fuzzy';
  matchDetails: string;
}

export interface SearchResponse {
  query: string;
  intent: ExtractedIntent;
  results: SearchMatch[];
  totalMatches: number;
  page: number;
  limit: number;
  totalPages: number;
  tookMs: number;
  didYouMean?: string;
  suggestions?: string[];
}
