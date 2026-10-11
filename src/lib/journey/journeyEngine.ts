import journeyMatrixData from '@/data/journeyMatrix.json';
import {
  StudentProfile,
  StudentLevel,
  StudentStream,
  JourneyResolution,
} from '@/types/studentProfile';

interface MatrixRule extends JourneyResolution {
  id: string;
}

const matrixRules: MatrixRule[] = (journeyMatrixData.rules || []) as MatrixRule[];

/**
 * Checks whether a given student profile is eligible to pursue Medical/Dental (MBBS/BDS)
 * Under NMC regulations, Biology or Biotechnology is mandatory. Pure PCM or PCMC students are NOT eligible.
 */
export function isMedicalEligible(profile?: Partial<StudentProfile>): boolean {
  if (!profile) return false;
  const level = profile.level;
  const stream = profile.stream;

  if (level === '10th') {
    // 10th pass students can enter medical route by opting for PCMB in PUC
    return true;
  }

  if (level === '12th') {
    return stream === 'PCB' || stream === 'PCMB';
  }

  return false;
}

/**
 * Checks whether a given student profile is eligible to pursue B.E. / B.Tech Engineering
 * Requires Physics, Chemistry, and Mathematics (PCM, PCMB, PCMC) or an Engineering Diploma.
 * Pure PCB students without Mathematics are NOT eligible.
 */
export function isEngineeringEligible(profile?: Partial<StudentProfile>): boolean {
  if (!profile) return false;
  const level = profile.level;
  const stream = profile.stream;

  if (level === '10th') {
    // 10th pass students can pursue engineering via PUC (PCM/PCMC/PCMB) or 3-year DTE Polytechnic
    return true;
  }

  if (level === '12th') {
    return stream === 'PCM' || stream === 'PCMB' || stream === 'PCMC';
  }

  if (level === 'diploma') {
    return true; // DCET Lateral entry
  }

  return false;
}

/**
 * Resolves the official JourneyResolution based on student level and stream
 */
export function getJourneyResolution(profile: Partial<StudentProfile>): JourneyResolution {
  const level: StudentLevel = profile.level || '12th';
  const stream: StudentStream = profile.stream || (level === '12th' ? 'PCM' : 'Other');

  // Find exact rule match
  let matched = matrixRules.find((r) => r.level === level && r.stream === stream);

  // Fallback for stream within same level
  if (!matched) {
    if (level === '12th') {
      if (stream === 'PCMC') {
        matched = matrixRules.find((r) => r.id === 'JRN-12TH-PCM');
      } else if (stream === 'Commerce') {
        matched = matrixRules.find((r) => r.id === 'JRN-12TH-COMMERCE');
      } else if (stream === 'Arts') {
        matched = matrixRules.find((r) => r.id === 'JRN-12TH-ARTS');
      } else {
        matched = matrixRules.find((r) => r.id === 'JRN-12TH-PCM');
      }
    } else {
      matched = matrixRules.find((r) => r.level === level);
    }
  }

  if (matched) {
    return {
      level: matched.level,
      stream: matched.stream,
      state: profile.state || 'Karnataka',
      headline: matched.headline,
      subheadline: matched.subheadline,
      primaryPathways: matched.primaryPathways,
      entranceExams: matched.entranceExams,
      eligibleCollegeDatasets: matched.eligibleCollegeDatasets,
      coverageHonestyNotice: matched.coverageHonestyNotice,
      recommendedTools: matched.recommendedTools,
      nextProgressionSteps: matched.nextProgressionSteps,
    };
  }

  // Fallback default
  return {
    level,
    stream,
    state: profile.state || 'Karnataka',
    headline: `Educational Pathway: ${level.toUpperCase()}`,
    subheadline: 'Explore matched programs, entrance examinations, and directory databases.',
    primaryPathways: [],
    entranceExams: [],
    eligibleCollegeDatasets: [],
    recommendedTools: [
      {
        title: 'Career Explorer',
        description: 'Browse 108 pathways and entrance requirements.',
        route: '/careers',
      },
    ],
    nextProgressionSteps: [
      'Browse Career Explorer for personalized roadmaps.',
      'Consult the AI Counsellor for eligibility evaluation.',
    ],
  };
}

/**
 * Serializes a StudentProfile to standard URL search parameters
 */
export function profileToSearchParams(profile: Partial<StudentProfile>): URLSearchParams {
  const params = new URLSearchParams();
  if (profile.level) params.set('level', profile.level);
  if (profile.stream) params.set('stream', profile.stream);
  if (profile.board) params.set('board', profile.board);
  if (profile.state) params.set('state', profile.state);
  if (profile.district) params.set('district', profile.district);
  if (profile.category) params.set('category', profile.category);
  if (profile.budgetPerYear) params.set('budget', String(profile.budgetPerYear));
  return params;
}

/**
 * Deserializes search parameters into a partial StudentProfile
 */
export function searchParamsToProfile(searchParams: URLSearchParams | { [key: string]: string | string[] | undefined }): Partial<StudentProfile> {
  const getVal = (k: string): string | undefined => {
    if (typeof (searchParams as any).get === 'function') {
      return (searchParams as URLSearchParams).get(k) || undefined;
    }
    const val = (searchParams as any)[k];
    if (Array.isArray(val)) return val[0];
    return val || undefined;
  };

  const level = getVal('level') as StudentLevel | undefined;
  const stream = getVal('stream') as StudentStream | undefined;
  const board = getVal('board') as any;
  const state = getVal('state');
  const district = getVal('district');
  const category = getVal('category') as any;

  const profile: Partial<StudentProfile> = {};
  if (level) profile.level = level;
  if (stream) profile.stream = stream;
  if (board) profile.board = board;
  if (state) profile.state = state;
  if (district) profile.district = district;
  if (category) profile.category = category;

  return profile;
}
