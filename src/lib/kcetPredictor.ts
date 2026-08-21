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
  collegeName: string;
  collegeSlug: string;
  location: string;
  type: 'Government' | 'Private' | 'Autonomous' | 'Deemed';
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

// Top Karnataka Engineering Colleges Historic Cutoff Matrix
export const KARNATAKA_COLLEGES_CUTOFFS: CollegeCutoff[] = [
  // RV College of Engineering (RVCE)
  {
    collegeName: 'RV College of Engineering (RVCE)',
    collegeSlug: 'rv-college-of-engineering-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.8,
    branch: 'Computer Science & Engineering',
    branchCode: 'CSE',
    cutoffs: { GM: 320, '2A': 750, '2B': 1100, '3A': 580, '3B': 490, SC: 2800, ST: 3400 },
    feesPerYear: 285000,
    avgPackageLPA: 19.5,
  },
  {
    collegeName: 'RV College of Engineering (RVCE)',
    collegeSlug: 'rv-college-of-engineering-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.8,
    branch: 'Artificial Intelligence & Machine Learning',
    branchCode: 'AIML',
    cutoffs: { GM: 580, '2A': 1250, '2B': 1800, '3A': 950, '3B': 820, SC: 4200, ST: 5100 },
    feesPerYear: 285000,
    avgPackageLPA: 18.2,
  },
  {
    collegeName: 'RV College of Engineering (RVCE)',
    collegeSlug: 'rv-college-of-engineering-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.8,
    branch: 'Information Science & Engineering',
    branchCode: 'ISE',
    cutoffs: { GM: 620, '2A': 1300, '2B': 1950, '3A': 1050, '3B': 890, SC: 4600, ST: 5500 },
    feesPerYear: 285000,
    avgPackageLPA: 17.8,
  },
  {
    collegeName: 'RV College of Engineering (RVCE)',
    collegeSlug: 'rv-college-of-engineering-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.8,
    branch: 'Electronics & Communication Engineering',
    branchCode: 'ECE',
    cutoffs: { GM: 1200, '2A': 2500, '2B': 3200, '3A': 1900, '3B': 1650, SC: 7800, ST: 8900 },
    feesPerYear: 285000,
    avgPackageLPA: 14.5,
  },
  {
    collegeName: 'RV College of Engineering (RVCE)',
    collegeSlug: 'rv-college-of-engineering-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.8,
    branch: 'Mechanical Engineering',
    branchCode: 'ME',
    cutoffs: { GM: 6500, '2A': 11000, '2B': 14000, '3A': 8500, '3B': 7800, SC: 24000, ST: 28000 },
    feesPerYear: 285000,
    avgPackageLPA: 9.8,
  },

  // BMS College of Engineering (BMSCE)
  {
    collegeName: 'BMS College of Engineering (BMSCE)',
    collegeSlug: 'bms-college-of-engineering-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.6,
    branch: 'Computer Science & Engineering',
    branchCode: 'CSE',
    cutoffs: { GM: 890, '2A': 1900, '2B': 2700, '3A': 1400, '3B': 1200, SC: 5800, ST: 6900 },
    feesPerYear: 260000,
    avgPackageLPA: 14.2,
  },
  {
    collegeName: 'BMS College of Engineering (BMSCE)',
    collegeSlug: 'bms-college-of-engineering-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.6,
    branch: 'Artificial Intelligence & Data Science',
    branchCode: 'AIDS',
    cutoffs: { GM: 1400, '2A': 2800, '2B': 3900, '3A': 2200, '3B': 1850, SC: 8200, ST: 9600 },
    feesPerYear: 260000,
    avgPackageLPA: 13.5,
  },
  {
    collegeName: 'BMS College of Engineering (BMSCE)',
    collegeSlug: 'bms-college-of-engineering-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.6,
    branch: 'Information Science & Engineering',
    branchCode: 'ISE',
    cutoffs: { GM: 1550, '2A': 3100, '2B': 4200, '3A': 2400, '3B': 2100, SC: 8800, ST: 10200 },
    feesPerYear: 260000,
    avgPackageLPA: 13.0,
  },
  {
    collegeName: 'BMS College of Engineering (BMSCE)',
    collegeSlug: 'bms-college-of-engineering-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.6,
    branch: 'Electronics & Communication Engineering',
    branchCode: 'ECE',
    cutoffs: { GM: 2600, '2A': 4800, '2B': 6200, '3A': 3800, '3B': 3200, SC: 13500, ST: 15800 },
    feesPerYear: 260000,
    avgPackageLPA: 11.2,
  },

  // Ramaiah Institute of Technology (MSRIT)
  {
    collegeName: 'Ramaiah Institute of Technology (MSRIT)',
    collegeSlug: 'ms-ramaiah-institute-of-technology-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.6,
    branch: 'Computer Science & Engineering',
    branchCode: 'CSE',
    cutoffs: { GM: 1050, '2A': 2200, '2B': 3100, '3A': 1650, '3B': 1400, SC: 6500, ST: 7800 },
    feesPerYear: 260000,
    avgPackageLPA: 13.8,
  },
  {
    collegeName: 'Ramaiah Institute of Technology (MSRIT)',
    collegeSlug: 'ms-ramaiah-institute-of-technology-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.6,
    branch: 'Information Science & Engineering',
    branchCode: 'ISE',
    cutoffs: { GM: 1750, '2A': 3500, '2B': 4800, '3A': 2800, '3B': 2400, SC: 9600, ST: 11200 },
    feesPerYear: 260000,
    avgPackageLPA: 12.5,
  },
  {
    collegeName: 'Ramaiah Institute of Technology (MSRIT)',
    collegeSlug: 'ms-ramaiah-institute-of-technology-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.6,
    branch: 'Electronics & Communication Engineering',
    branchCode: 'ECE',
    cutoffs: { GM: 2900, '2A': 5400, '2B': 7100, '3A': 4300, '3B': 3700, SC: 14800, ST: 17200 },
    feesPerYear: 260000,
    avgPackageLPA: 10.8,
  },

  // University Visvesvaraya College of Engineering (UVCE)
  {
    collegeName: 'University Visvesvaraya College of Engineering (UVCE)',
    collegeSlug: 'uvce-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Government',
    rating: 4.5,
    branch: 'Computer Science & Engineering',
    branchCode: 'CSE',
    cutoffs: { GM: 1950, '2A': 3800, '2B': 5200, '3A': 3100, '3B': 2700, SC: 9200, ST: 11000 },
    feesPerYear: 45000,
    avgPackageLPA: 11.5,
  },
  {
    collegeName: 'University Visvesvaraya College of Engineering (UVCE)',
    collegeSlug: 'uvce-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Government',
    rating: 4.5,
    branch: 'Information Science & Engineering',
    branchCode: 'ISE',
    cutoffs: { GM: 2900, '2A': 5200, '2B': 6800, '3A': 4400, '3B': 3900, SC: 13000, ST: 15500 },
    feesPerYear: 45000,
    avgPackageLPA: 10.2,
  },
  {
    collegeName: 'University Visvesvaraya College of Engineering (UVCE)',
    collegeSlug: 'uvce-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Government',
    rating: 4.5,
    branch: 'Electronics & Communication Engineering',
    branchCode: 'ECE',
    cutoffs: { GM: 4800, '2A': 8200, '2B': 10500, '3A': 6900, '3B': 6100, SC: 19500, ST: 23000 },
    feesPerYear: 45000,
    avgPackageLPA: 8.9,
  },

  // PES University (Ring Road Campus)
  {
    collegeName: 'PES University (Ring Road Campus)',
    collegeSlug: 'pes-university-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Private',
    rating: 4.6,
    branch: 'Computer Science & Engineering',
    branchCode: 'CSE',
    cutoffs: { GM: 950, '2A': 2100, '2B': 2900, '3A': 1500, '3B': 1300, SC: 6200, ST: 7400 },
    feesPerYear: 420000,
    avgPackageLPA: 15.0,
  },
  {
    collegeName: 'PES University (Ring Road Campus)',
    collegeSlug: 'pes-university-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Private',
    rating: 4.6,
    branch: 'Artificial Intelligence & Machine Learning',
    branchCode: 'AIML',
    cutoffs: { GM: 1600, '2A': 3200, '2B': 4400, '3A': 2500, '3B': 2150, SC: 9000, ST: 10500 },
    feesPerYear: 420000,
    avgPackageLPA: 14.1,
  },
  {
    collegeName: 'PES University (Ring Road Campus)',
    collegeSlug: 'pes-university-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Private',
    rating: 4.6,
    branch: 'Electronics & Communication Engineering',
    branchCode: 'ECE',
    cutoffs: { GM: 3400, '2A': 6200, '2B': 8100, '3A': 4900, '3B': 4300, SC: 16000, ST: 18800 },
    feesPerYear: 420000,
    avgPackageLPA: 11.5,
  },

  // Dayananda Sagar College of Engineering (DSCE)
  {
    collegeName: 'Dayananda Sagar College of Engineering (DSCE)',
    collegeSlug: 'dayananda-sagar-college-of-engineering-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.4,
    branch: 'Computer Science & Engineering',
    branchCode: 'CSE',
    cutoffs: { GM: 3600, '2A': 6900, '2B': 9100, '3A': 5400, '3B': 4800, SC: 17500, ST: 20500 },
    feesPerYear: 245000,
    avgPackageLPA: 10.2,
  },
  {
    collegeName: 'Dayananda Sagar College of Engineering (DSCE)',
    collegeSlug: 'dayananda-sagar-college-of-engineering-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.4,
    branch: 'Artificial Intelligence & Machine Learning',
    branchCode: 'AIML',
    cutoffs: { GM: 5200, '2A': 9500, '2B': 12400, '3A': 7800, '3B': 6900, SC: 23000, ST: 27000 },
    feesPerYear: 245000,
    avgPackageLPA: 9.8,
  },
  {
    collegeName: 'Dayananda Sagar College of Engineering (DSCE)',
    collegeSlug: 'dayananda-sagar-college-of-engineering-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.4,
    branch: 'Information Science & Engineering',
    branchCode: 'ISE',
    cutoffs: { GM: 5500, '2A': 10000, '2B': 13000, '3A': 8200, '3B': 7300, SC: 24500, ST: 28500 },
    feesPerYear: 245000,
    avgPackageLPA: 9.5,
  },

  // Bangalore Institute of Technology (BIT)
  {
    collegeName: 'Bangalore Institute of Technology (BIT)',
    collegeSlug: 'bangalore-institute-of-technology-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.3,
    branch: 'Computer Science & Engineering',
    branchCode: 'CSE',
    cutoffs: { GM: 4200, '2A': 7800, '2B': 10200, '3A': 6200, '3B': 5500, SC: 19800, ST: 23000 },
    feesPerYear: 235000,
    avgPackageLPA: 9.5,
  },
  {
    collegeName: 'Bangalore Institute of Technology (BIT)',
    collegeSlug: 'bangalore-institute-of-technology-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Autonomous',
    rating: 4.3,
    branch: 'Electronics & Communication Engineering',
    branchCode: 'ECE',
    cutoffs: { GM: 8900, '2A': 15000, '2B': 19500, '3A': 12500, '3B': 11200, SC: 36000, ST: 42000 },
    feesPerYear: 235000,
    avgPackageLPA: 8.2,
  },

  // Sri Jayachamarajendra College of Engineering (SJCE / JSS STU, Mysuru)
  {
    collegeName: 'JSS Science and Technology University (SJCE)',
    collegeSlug: 'sjce-mysore',
    location: 'Mysuru, Karnataka',
    type: 'Autonomous',
    rating: 4.5,
    branch: 'Computer Science & Engineering',
    branchCode: 'CSE',
    cutoffs: { GM: 2200, '2A': 4400, '2B': 5900, '3A': 3400, '3B': 2950, SC: 11000, ST: 13000 },
    feesPerYear: 240000,
    avgPackageLPA: 12.0,
  },
  {
    collegeName: 'JSS Science and Technology University (SJCE)',
    collegeSlug: 'sjce-mysore',
    location: 'Mysuru, Karnataka',
    type: 'Autonomous',
    rating: 4.5,
    branch: 'Information Science & Engineering',
    branchCode: 'ISE',
    cutoffs: { GM: 3400, '2A': 6500, '2B': 8600, '3A': 5100, '3B': 4500, SC: 16500, ST: 19500 },
    feesPerYear: 240000,
    avgPackageLPA: 11.2,
  },

  // National Institute of Engineering (NIE Mysuru)
  {
    collegeName: 'The National Institute of Engineering (NIE)',
    collegeSlug: 'nie-mysore',
    location: 'Mysuru, Karnataka',
    type: 'Autonomous',
    rating: 4.4,
    branch: 'Computer Science & Engineering',
    branchCode: 'CSE',
    cutoffs: { GM: 3800, '2A': 7200, '2B': 9500, '3A': 5800, '3B': 5100, SC: 18500, ST: 21500 },
    feesPerYear: 230000,
    avgPackageLPA: 10.5,
  },
  {
    collegeName: 'The National Institute of Engineering (NIE)',
    collegeSlug: 'nie-mysore',
    location: 'Mysuru, Karnataka',
    type: 'Autonomous',
    rating: 4.4,
    branch: 'Information Science & Engineering',
    branchCode: 'ISE',
    cutoffs: { GM: 5800, '2A': 10500, '2B': 13800, '3A': 8600, '3B': 7700, SC: 26000, ST: 30000 },
    feesPerYear: 230000,
    avgPackageLPA: 9.6,
  },

  // Sir M. Visvesvaraya Institute of Technology (SMVIT)
  {
    collegeName: 'Sir M. Visvesvaraya Institute of Technology (SMVIT)',
    collegeSlug: 'smvit-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Private',
    rating: 4.2,
    branch: 'Computer Science & Engineering',
    branchCode: 'CSE',
    cutoffs: { GM: 7500, '2A': 13500, '2B': 17500, '3A': 11000, '3B': 9800, SC: 32000, ST: 37000 },
    feesPerYear: 225000,
    avgPackageLPA: 8.5,
  },
  {
    collegeName: 'Sir M. Visvesvaraya Institute of Technology (SMVIT)',
    collegeSlug: 'smvit-bangalore',
    location: 'Bengaluru, Karnataka',
    type: 'Private',
    rating: 4.2,
    branch: 'Electronics & Communication Engineering',
    branchCode: 'ECE',
    cutoffs: { GM: 16000, '2A': 26000, '2B': 33000, '3A': 22000, '3B': 19800, SC: 58000, ST: 66000 },
    feesPerYear: 225000,
    avgPackageLPA: 7.2,
  },

  // Siddaganga Institute of Technology (SIT Tumkur)
  {
    collegeName: 'Siddaganga Institute of Technology (SIT)',
    collegeSlug: 'sit-tumkur',
    location: 'Tumakuru, Karnataka',
    type: 'Autonomous',
    rating: 4.3,
    branch: 'Computer Science & Engineering',
    branchCode: 'CSE',
    cutoffs: { GM: 5200, '2A': 9600, '2B': 12500, '3A': 7900, '3B': 7000, SC: 23500, ST: 27500 },
    feesPerYear: 220000,
    avgPackageLPA: 9.0,
  },
  {
    collegeName: 'Siddaganga Institute of Technology (SIT)',
    collegeSlug: 'sit-tumkur',
    location: 'Tumakuru, Karnataka',
    type: 'Autonomous',
    rating: 4.3,
    branch: 'Information Science & Engineering',
    branchCode: 'ISE',
    cutoffs: { GM: 8200, '2A': 14500, '2B': 18800, '3A': 12000, '3B': 10800, SC: 34000, ST: 39000 },
    feesPerYear: 220000,
    avgPackageLPA: 8.4,
  },

  // KLE Technological University (Hubballi)
  {
    collegeName: 'KLE Technological University (BVB)',
    collegeSlug: 'kle-technological-university-hubli',
    location: 'Hubballi, Karnataka',
    type: 'Autonomous',
    rating: 4.3,
    branch: 'Computer Science & Engineering',
    branchCode: 'CSE',
    cutoffs: { GM: 6200, '2A': 11200, '2B': 14500, '3A': 9200, '3B': 8200, SC: 27000, ST: 31500 },
    feesPerYear: 220000,
    avgPackageLPA: 8.8,
  },
  {
    collegeName: 'KLE Technological University (BVB)',
    collegeSlug: 'kle-technological-university-hubli',
    location: 'Hubballi, Karnataka',
    type: 'Autonomous',
    rating: 4.3,
    branch: 'Electronics & Communication Engineering',
    branchCode: 'ECE',
    cutoffs: { GM: 14500, '2A': 24000, '2B': 30500, '3A': 20000, '3B': 18000, SC: 54000, ST: 62000 },
    feesPerYear: 220000,
    avgPackageLPA: 7.5,
  },
];

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

  // Quota adjustments (Rural / Kannada Medium give slight percentile boost)
  if (input.quota === 'rural' || input.quota === 'kannada') {
    predictedRankMedian = Math.max(1, Math.round(predictedRankMedian * 0.92));
    estimatedRankMin = Math.max(1, Math.round(estimatedRankMin * 0.92));
    estimatedRankMax = Math.max(1, Math.round(estimatedRankMax * 0.95));
  }

  // 5. Match Colleges and Branches based on Category Cutoff
  const categoryKey = input.category || 'GM';

  const recommendations = KARNATAKA_COLLEGES_CUTOFFS
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
