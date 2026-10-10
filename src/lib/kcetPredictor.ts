import kcet2026CutoffsJson from '@/data/kcet2026Cutoffs.json';

export interface KCETInput {
  physicsKCET: number; // 0 - 60
  chemistryKCET: number; // 0 - 60
  mathsKCET: number; // 0 - 60
  physicsBoard: number; // 0 - 100
  chemistryBoard: number; // 0 - 100
  mathsBoard: number; // 0 - 100
  category: 'GM' | '2A' | '2B' | '3A' | '3B' | 'SC' | 'ST';
  quota?: 'general' | 'rural' | 'kannada';
  preferredBranches?: string[];
}

export interface CollegeCutoff {
  collegeCode?: string;
  vtuCode?: string;
  collegeName: string;
  collegeSlug: string;
  location: string;
  city?: string;
  type: 'Government' | 'Private' | 'Autonomous' | 'Deemed' | string;
  rating: number;
  branch: string;
  branchCode: string;
  cutoffs: {
    GM: number;
    '2A': number;
    '2B': number;
    '3A': number;
    '3B': number;
    SC: number;
    ST: number;
  };
  feesPerYear: number;
  avgPackageLPA: number;
  gmClosingRank2026?: number;
  source?: string;
}

export interface PredictionResult {
  compositeScore: number; // out of 100
  kcetPercentage: number;
  boardPercentage: number;
  estimatedRankMin: number;
  estimatedRankMax: number;
  predictedRankMedian: number;
  category: string;
  quota: string;
  recommendations: {
    college: CollegeCutoff;
    cutoff: number;
    chance: 'High Chance' | 'Moderate Chance' | 'Dream / Ambitious';
    chanceColor: 'green' | 'amber' | 'purple';
    matchReason: string;
  }[];
}

// Official KEA UGCET-2026 Cutoff Matrix (1,218+ branch cutoffs across 242 colleges)
export const KARNATAKA_COLLEGES_CUTOFFS: CollegeCutoff[] = kcet2026CutoffsJson as CollegeCutoff[];

/**
 * Predict KCET 2026 Rank & College Matches based on KEA 50:50 Composite Formula
 */
export function calculateKCET2026Prediction(input: KCETInput): PredictionResult {
  // 1. Calculate KCET Marks and Percentage (Total 180)
  const totalKCET = Math.min(180, Math.max(0, input.physicsKCET + input.chemistryKCET + input.mathsKCET));
  const kcetPercentage = (totalKCET / 180) * 100;

  // 2. Calculate Board PCM Marks and Percentage (Total 300)
  const totalBoard = Math.min(300, Math.max(0, input.physicsBoard + input.chemistryBoard + input.mathsBoard));
  const boardPercentage = (totalBoard / 300) * 100;

  // 3. KEA Composite Score (50% KCET + 50% Board)
  const compositeScore = Number(((kcetPercentage * 0.5) + (boardPercentage * 0.5)).toFixed(2));

  // 4. Estimate Rank Bracket based on Composite Score & KEA historical distribution
  let estimatedRankMin = 1;
  let estimatedRankMax = 500;
  let predictedRankMedian = 250;

  if (compositeScore >= 96) {
    estimatedRankMin = 1;
    estimatedRankMax = 350;
    predictedRankMedian = Math.round(1 + ((100 - compositeScore) / 4) * 349);
  } else if (compositeScore >= 92) {
    estimatedRankMin = 351;
    estimatedRankMax = 1200;
    predictedRankMedian = Math.round(351 + ((96 - compositeScore) / 4) * 849);
  } else if (compositeScore >= 88) {
    estimatedRankMin = 1201;
    estimatedRankMax = 2800;
    predictedRankMedian = Math.round(1201 + ((92 - compositeScore) / 4) * 1599);
  } else if (compositeScore >= 83) {
    estimatedRankMin = 2801;
    estimatedRankMax = 5500;
    predictedRankMedian = Math.round(2801 + ((88 - compositeScore) / 5) * 2699);
  } else if (compositeScore >= 78) {
    estimatedRankMin = 5501;
    estimatedRankMax = 9800;
    predictedRankMedian = Math.round(5501 + ((83 - compositeScore) / 5) * 4299);
  } else if (compositeScore >= 72) {
    estimatedRankMin = 9801;
    estimatedRankMax = 17500;
    predictedRankMedian = Math.round(9801 + ((78 - compositeScore) / 6) * 7699);
  } else if (compositeScore >= 66) {
    estimatedRankMin = 17501;
    estimatedRankMax = 28000;
    predictedRankMedian = Math.round(17501 + ((72 - compositeScore) / 6) * 10499);
  } else if (compositeScore >= 60) {
    estimatedRankMin = 28001;
    estimatedRankMax = 44000;
    predictedRankMedian = Math.round(28001 + ((66 - compositeScore) / 6) * 15999);
  } else if (compositeScore >= 54) {
    estimatedRankMin = 44001;
    estimatedRankMax = 65000;
    predictedRankMedian = Math.round(44001 + ((60 - compositeScore) / 6) * 20999);
  } else if (compositeScore >= 48) {
    estimatedRankMin = 65001;
    estimatedRankMax = 92000;
    predictedRankMedian = Math.round(65001 + ((54 - compositeScore) / 6) * 26999);
  } else {
    estimatedRankMin = 92001;
    estimatedRankMax = 145000;
    predictedRankMedian = Math.round(92001 + ((48 - Math.max(20, compositeScore)) / 28) * 52999);
  }

  // Quota adjustments (Rural / Kannada Medium give statistical percentile boost)
  if (input.quota === 'rural' || input.quota === 'kannada') {
    predictedRankMedian = Math.max(1, Math.round(predictedRankMedian * 0.92));
    estimatedRankMin = Math.max(1, Math.round(estimatedRankMin * 0.92));
    estimatedRankMax = Math.max(1, Math.round(estimatedRankMax * 0.95));
  }

  // 5. Match Colleges and Branches based on Category Cutoff
  const categoryKey = input.category || 'GM';
  const hasPreferredBranches = input.preferredBranches && input.preferredBranches.length > 0;

  const recommendations = KARNATAKA_COLLEGES_CUTOFFS
    .filter((college) => {
      if (!hasPreferredBranches) return true;
      return input.preferredBranches!.includes(college.branchCode);
    })
    .map((college) => {
      const cutoff = college.cutoffs[categoryKey] || college.cutoffs.GM;

      let chance: 'High Chance' | 'Moderate Chance' | 'Dream / Ambitious';
      let chanceColor: 'green' | 'amber' | 'purple';
      let matchReason = '';

      if (predictedRankMedian <= cutoff * 0.85) {
        chance = 'High Chance';
        chanceColor = 'green';
        matchReason = `Your estimated rank (~${predictedRankMedian.toLocaleString()}) is comfortably within the previous year ${categoryKey} cutoff (${cutoff.toLocaleString()}).`;
      } else if (predictedRankMedian <= cutoff * 1.12) {
        chance = 'Moderate Chance';
        chanceColor = 'amber';
        matchReason = `Your estimated rank (~${predictedRankMedian.toLocaleString()}) is competitive with the ${categoryKey} cutoff (${cutoff.toLocaleString()}). High chance in Round 2 or Extended Round.`;
      } else if (predictedRankMedian <= cutoff * 1.35) {
        chance = 'Dream / Ambitious';
        chanceColor = 'purple';
        matchReason = `Your estimated rank is ambitious compared to the closing rank (${cutoff.toLocaleString()}). Worth adding in Round 1 option entry.`;
      } else {
        return null;
      }

      return {
        college,
        cutoff,
        chance,
        chanceColor,
        matchReason,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => {
      // Sort priority: High Chance first, then highest rating & avg package
      const chancePriority = { 'High Chance': 1, 'Moderate Chance': 2, 'Dream / Ambitious': 3 };
      if (chancePriority[a.chance] !== chancePriority[b.chance]) {
        return chancePriority[a.chance] - chancePriority[b.chance];
      }
      return b.college.rating - a.college.rating;
    });

  return {
    compositeScore,
    kcetPercentage: Number(kcetPercentage.toFixed(2)),
    boardPercentage: Number(boardPercentage.toFixed(2)),
    estimatedRankMin,
    estimatedRankMax,
    predictedRankMedian,
    category: input.category,
    quota: input.quota || 'general',
    recommendations,
  };
}
