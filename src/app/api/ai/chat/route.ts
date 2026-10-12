import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { generateText, isGeminiConfigured } from '@/lib/ai/gemini';

// Static Data
import pathwaysData from '@/data/careers/pathways.json';
import engineeringBranchesData from '@/data/careers/engineeringBranches.json';
import examsData from '@/data/careers/exams.json';
import govtJobsData from '@/data/careers/govtJobs.json';
import graduateCareersData from '@/data/careers/graduateCareers.json';
import collegesData from '@/data/colleges.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pathways = (pathwaysData as any).items || [];
const branches = (engineeringBranchesData as any).items || [];
const exams = (examsData as any).items || [];
const govtJobs = (govtJobsData as any).items || [];
const graduateCareers = (graduateCareersData as any).items || [];
const colleges = Array.isArray(collegesData) ? collegesData : (collegesData as any).colleges || [];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SCOPE_RESTRICTION_REPLY = `### 🎓 EduSelect Career Counsellor

I am EduSelect's specialized **AI Career & College Counsellor**. I am dedicated exclusively to helping students, parents, and aspirants navigate:
- **Educational Pathways:** What to choose after Class 10th, 12th / PUC, ITI, or Polytechnic Diplomas
- **Degrees & Programs:** Engineering (31 branches), Medicine (MBBS, BDS, AYUSH, Nursing), Commerce (CA, CS, B.Com, BBA), Humanities & Law
- **Colleges & Admissions:** Verified KCET / NEET / JEE cutoffs, tuition fees, and NIRF rankings across India
- **Career Planning:** Salary progressions, job profiles, entrance exams, and industry outlooks

*I do not write computer code, debug software, or answer non-educational topics.*

Please ask me any question about your **education, college options, entrance exams, or career choices!**`;

// Detect coding or non-educational queries to enforce student-only counseling scope
function isNonEducationalQuery(query: string): boolean {
  const q = query.toLowerCase().trim();

  // If the query asks about career, admission, branch, college, degree, or exam, it's definitely educational
  const isEducationContext = /\b(career|job|salary|course|college|degree|branch|b\.?tech|engineering|bca|mca|syllabus|admission|cutoff|placement|scope|future|after\s*10|after\s*12|student|school|study|learn|curriculum|eligible|eligibility|prerequisite)\b/i.test(q);

  // 1. Explicit code generation or debugging requests
  const isCodeGeneration =
    /\b(write|generate|give\s*me|create|debug|fix)\s+(a\s+)?(code|script|program|function|class|regex|query|leetcode\s*solution)\b/i.test(q) ||
    /\b(write\s+(python|javascript|typescript|c\+\+|java|c#|sql|html|css|react)\s+(code|script|program))\b/i.test(q) ||
    /^(def\s+|function\s+|class\s+|SELECT\s+|#include\s+|import\s+react)/i.test(q);

  if (isCodeGeneration && (!isEducationContext || /\b(code\s+for|solve\s+this|fix\s+my|debug\s+my)\b/i.test(q))) {
    return true;
  }

  // 2. Unrelated non-educational topics (cooking, sports scores, entertainment gossip, politics)
  const isUnrelatedTopic =
    /\b(recipe|how\s+to\s+cook|ingredients\s+for|bake\s+a\s+cake|who\s+won\s+the\s+(ipl|match|world\s*cup)|movie\s+box\s+office|celebrity\s+gossip)\b/i.test(q);

  if (isUnrelatedTopic && !isEducationContext) {
    return true;
  }

  return false;
}

// Helper to retrieve verified context items from our datasets
function retrieveRelevantData(query: string) {
  const q = query.toLowerCase();
  const matchedPathways: any[] = [];
  const matchedBranches: any[] = [];
  const matchedExams: any[] = [];
  const matchedGovtJobs: any[] = [];
  const matchedColleges: any[] = [];
  const sources: { title: string; url: string; type: string }[] = [];

  // 1. Check Class 10 intent
  if (/\b(10th|class\s*10|tenth|sslc|matric)\b/.test(q)) {
    const c10Pathways = pathways.filter((p: any) => p.level === 'CLASS_10');
    if (/\b(science|pcm|pcb|doctor|engineer|medical)\b/.test(q)) {
      matchedPathways.push(...c10Pathways.filter((p: any) => ['a-pcm', 'a-pcb', 'a-pcmb', 'a-pcmc', 'a-paramedical'].includes(p.id)));
    } else if (/\b(commerce|finance|business|ca|accounts)\b/.test(q)) {
      matchedPathways.push(...c10Pathways.filter((p: any) => ['a-com-maths', 'a-com'].includes(p.id)));
    } else if (/\b(diploma|polytechnic)\b/.test(q)) {
      matchedPathways.push(...c10Pathways.filter((p: any) => p.id === 'a-diploma'));
    } else if (/\b(iti|trade|welder|electrician|fitter)\b/.test(q)) {
      matchedPathways.push(...c10Pathways.filter((p: any) => p.id === 'a-iti' || p.id.startsWith('iti-')).slice(0, 5));
    } else {
      matchedPathways.push(...c10Pathways.slice(0, 8));
    }
  }

  // 2. Check Medical / Doctor intent
  if (/\b(doctor|mbbs|bds|neet|medical|ayush|biology|pcb|clinic|hospital)\b/.test(q)) {
    matchedPathways.push(...pathways.filter((p: any) => ['a-pcb', 'a-pcmb', 'b-mbbs', 'b-bds', 'b-ayush', 'b-nursing', 'b-pharmacy'].includes(p.id)));
    matchedExams.push(...exams.filter((e: any) => e.id === 'neet-ug' || e.name?.toLowerCase().includes('neet')));
  }

  // 3. Check Engineering / B.Tech intent
  if (/\b(engineer|engineering|b\.?tech|b\.?e|iit|nit|kcet|jee|cse|computer|software|coding)\b/.test(q)) {
    matchedPathways.push(...pathways.filter((p: any) => ['a-pcm', 'a-pcmc', 'b-btech'].includes(p.id)));
    matchedBranches.push(...branches.slice(0, 6));
    matchedExams.push(...exams.filter((e: any) => ['jee-main', 'jee-advanced', 'kcet'].includes(e.id)));
  }

  // 4. Check Commerce / Management / Law intent
  if (/\b(commerce|ca|chartered|mba|bcom|bba|ipm|law|clat|cs|cma)\b/.test(q)) {
    matchedPathways.push(...pathways.filter((p: any) => ['b-bcom', 'b-bba', 'b-ipm', 'b-ca', 'b-law', 'b-cs'].includes(p.id)));
    matchedExams.push(...exams.filter((e: any) => ['clat', 'ipmat', 'cuet-ug'].includes(e.id)));
  }

  // 5. Check Government Job intent
  if (/\b(govt|government|upsc|ias|ips|ssc|rrb|railway|civil\s*service|bank|po|defence|nda|agniveer)\b/.test(q)) {
    matchedGovtJobs.push(...govtJobs.slice(0, 6));
    matchedExams.push(...exams.filter((e: any) => ['upsc-cse', 'ssc-cgl', 'nda', 'ssc-chsl'].includes(e.id)));
  }

  // 6. Check Colleges intent
  if (/\b(college|university|nirf|fees|rvce|bms|msrit|pes|iit|nit|rank|cutoff)\b/.test(q)) {
    // Find top matching colleges
    const topColleges = colleges
      .filter((c: any) => {
        if (q.includes('karnataka') && c.state?.toLowerCase() !== 'karnataka') return false;
        if (q.includes('rvce') || q.includes('rv')) return c.name.toLowerCase().includes('r.v.') || c.name.toLowerCase().includes('rv');
        if (q.includes('bms')) return c.name.toLowerCase().includes('b.m.s.');
        if (q.includes('msrit') || q.includes('ramaiah')) return c.name.toLowerCase().includes('ramaiah');
        if (c.nirf2025Rank && c.nirf2025Rank <= 50) return true;
        return false;
      })
      .slice(0, 5);

    matchedColleges.push(...topColleges);
  }

  // Deduplicate and prepare sources
  const uniquePathways = Array.from(new Set(matchedPathways.map((p) => p.id)))
    .map((id) => matchedPathways.find((p) => p.id === id))
    .slice(0, 6);

  uniquePathways.forEach((p) => {
    sources.push({
      title: p.name,
      url: `/careers/pathway/${p.id}`,
      type: 'Pathway',
    });
  });

  matchedBranches.slice(0, 3).forEach((b) => {
    sources.push({
      title: `B.Tech ${b.name}`,
      url: `/careers/branch/${b.id}`,
      type: 'Branch',
    });
    if (b.code) {
      sources.push({
        title: `Colleges offering ${b.name} (${b.code})`,
        url: `/colleges?branch=${b.code}`,
        type: 'Colleges',
      });
    }
  });

  if (/\b(doctor|mbbs|bds|neet|medical|ayush|biology|nursing|pharmacy)\b/.test(q)) {
    sources.push({
      title: 'Medical & Allied Health Directory (1,638+ Colleges)',
      url: '/medical-allied-health',
      type: 'Colleges',
    });
  }

  if (/\b(10th|puc|pu\s*college|sslc|class\s*10)\b/.test(q)) {
    sources.push({
      title: 'Karnataka PU Colleges Directory (6,417 Colleges)',
      url: '/puc-colleges',
      type: 'Colleges',
    });
  }

  if (/\b(diploma|polytechnic|dcet)\b/.test(q)) {
    sources.push({
      title: 'Technical Pathways Matrix',
      url: '/pathways',
      type: 'Pathway',
    });
  }

  matchedColleges.slice(0, 3).forEach((c) => {
    sources.push({
      title: `${c.name} (${c.city})`,
      url: `/colleges/${c.id}`,
      type: 'College',
    });
  });

  return {
    pathways: uniquePathways,
    branches: matchedBranches.slice(0, 4),
    exams: matchedExams.slice(0, 3),
    govtJobs: matchedGovtJobs.slice(0, 4),
    colleges: matchedColleges.slice(0, 4),
    sources,
  };
}

// Rule-based fallback response if Gemini is not configured or fails
function buildRuleBasedReply(query: string, data: ReturnType<typeof retrieveRelevantData>): string {
  const q = query.toLowerCase();

  // Doctor / MBBS query
  if (/\b(doctor|mbbs|neet|biology)\b/.test(q)) {
    const isPcmDoctor = /\b(pcm)\b/.test(q);
    if (isPcmDoctor) {
      return `### 🩺 Can You Become a Doctor with PCM?

**Short Answer:** **No, not with pure PCM.** Under the National Medical Commission (NMC) regulations in India:

1. **Mandatory Biology Prerequisite:** To appear for **NEET-UG** and secure an **MBBS, BDS, or AYUSH** seat, a candidate **must have studied Biology or Biotechnology**, along with Physics, Chemistry, and English in Class 11 and 12.
2. **The Direct Solution:** If you are currently in Class 10 or entering 11th:
   - Choose **Science - PCB (Physics, Chemistry, Biology)** if your sole goal is Medicine.
   - Choose **Science - PCMB (Physics, Chemistry, Maths, Biology)** if you want to keep **both NEET (Doctor)** and **JEE / State CET (Engineering)** fully open.
3. **If You Already Passed 12th with PCM:**
   - Under recent NMC relaxations, candidates who completed 12th with PCM can take **Biology as an additional subject** through a recognized board (like NIOS or state board) and qualify for NEET-UG.
4. **Allied Tech Options for PCM Students:**
   - Biomedical Engineering (B.Tech)
   - Bioinformatics & Health Data Science
   - Medical Device Engineering`;
    }

    return `### 🩺 Pathway to Becoming a Licensed Doctor in India

Here is the exact progression based on NMC regulations and EduSelect's verified data:

1. **Class 11 & 12 Foundation:**
   - Stream: **Science - PCB** (Physics, Chemistry, Biology) or **PCMB**.
   - Minimum Marks: 50% aggregate in PCB (40% for SC/ST/OBC).
2. **Entrance Examination:**
   - **NEET-UG** (National Eligibility cum Entrance Test conducted by NTA).
   - Single national entrance exam for MBBS, BDS, BAMS, BHMS across all government and private medical colleges in India.
3. **Undergraduate Medical Degree:**
   - **MBBS:** 5.5 years (4.5 years academic + 1 year mandatory rotating internship).
   - Tuition Cost: ~₹50,000–₹3 Lakh total in government colleges; ~₹40 Lakh–₹1 Crore in private/deemed universities.
4. **Licensing & Specialization:**
   - Pass the **NExT (National Exit Test)** to receive your permanent NMC registration and licence to practice.
   - Post-graduation: MD / MS (3 years) via NEET-PG / NExT Step 2.`;
  }

  // After 10th Dilemma
  if (/\b(10th|after 10|tenth|sslc)\b/.test(q)) {
    return `### 🧭 Top Educational Pathways After Class 10

Based on EduSelect's comprehensive Class 10 pathway matrix, here are your premier choices:

#### 1. Pre-University / Class 11–12 (Higher Secondary)
- **Science (PCM / PCMC):** Direct gateway to Engineering (JEE/CET), Architecture, Defence (NDA officer entry), and Pure Sciences.
- **Science (PCB / PCMB):** Direct route to Medicine (NEET for MBBS/BDS/AYUSH), Pharmacy, Nursing, and Biotechnology.
- **Commerce (with/without Maths):** Direct pathway to CA, CS, CMA, B.Com, BBA, Corporate Law, and Investment Banking.
- **Humanities / Arts:** Excellent for Civil Services (UPSC), Law (5-year BA LLB via CLAT), Psychology, Journalism, and Design.

#### 2. Polytechnic Diploma (3 Years)
- Practical, engineering-focused diploma.
- **Key Advantage:** Eligible for **Lateral Entry directly into 2nd year B.Tech** via state DCET/ECET, skipping 1st year engineering!
- Instant eligibility for Junior Engineer (JE) exams (SSC JE, Railway RRB JE).

#### 3. ITI Trade Certification (1–2 Years)
- Practical craftsman training in trades like Electrician, Fitter, CNC Machinist, COPA, and Electronics.
- Quick employment in Indian Railways, PSUs (DRDO, ISRO, Electricity Boards), and lateral diploma admission.

#### 4. Direct Defence Entry
- **Army Agniveer (GD / Tradesman)** and **Navy Agniveer (MR)** recruit directly after Class 10.`;
  }

  // Medical Bonds & Global Mobility (WFME / USMLE)
  if (/\b(bond|rural\s*service|rural\s*bond|usmle|wfme|plab|doctor\s*abroad|abroad\s*doctor)\b/.test(q)) {
    return `### 🩺 Medical Rural Service Bonds & Global Licensure (WFME / USMLE)

Based on official statutory regulations from the National Medical Commission (NMC):

#### 1. Compulsory Rural Service Bonds in India
- **Mandatory Bond Tenure:** In state and central government medical colleges, MBBS graduates must execute a compulsory rural or tribal service bond of **1 to 5 years** post-internship.
- **Financial Penalties for Non-Compliance:** Range from **₹5 Lakhs** up to **₹1 Crore+** depending on the state (e.g., states with severe mountainous or remote underserved areas enforce strict penalties).
- **Seat-Leaving Penalty:** To deter mid-course abandonment, state counseling authorities (like KEA, MCC) impose forfeiture fines ranging from ₹5 Lakhs to ₹10 Lakhs.

#### 2. Transnational Licensure (Practicing in USA, UK, Australia)
- **WFME 10-Year Recognition:** The National Medical Commission (NMC) has secured prestigious recognition from the **World Federation for Medical Education (WFME)** for a 10-year term.
- **What this means for you:** All NMC-recognized medical college graduates are automatically eligible for **ECFMG certification**, unlocking direct eligibility to sit for:
  - **USMLE (United States Medical Licensing Examination)** for US Residency (PG).
  - **PLAB / UKMLA** for NHS foundation training and licensing in the United Kingdom.
  - **AMC examinations** for medical practice in Australia.
- **For Nursing Graduates:** Passing the **NCLEX-RN** provides direct licensure for North America (USA & Canada), while **OET** qualifies for UK & Gulf hospital migration.`;
  }

  // Chartered Accountancy (ICAI New Scheme)
  if (/\b(ca\s*articleship|articleship|icai|chartered\s*accountant|cma|cs\s*executive)\b/.test(q)) {
    return `### 📊 Chartered Accountancy (ICAI New Scheme of Education & Training)

Under the ICAI New Scheme enacted in July 2023, the CA training model has been structurally revamped:

1. **Shortened Articleship Tenure:**
   - Mandatory practical training has been **reduced from 36 months to 24 months (2 full years)**.
   - Articleship can only commence **after passing both Groups of CA Intermediate** and completing ICITSS (Information Technology and Soft Skills).
2. **Self-Paced Online Modules (SPOM):**
   - Students must qualify in 4 self-paced online modules (Corporate Laws, Economic Laws, Strategic Cost Management) before appearing for the CA Final.
3. **Statutory Articleship Stipends:**
   - Prescribed baseline by city population: **₹3,000 to ₹6,000/month**.
   - Top-tier market rates (Big-4 firms like EY, PwC, Deloitte, KPMG and top national firms): **₹15,000 to ₹25,000/month**.
4. **Compensation Trajectory for Qualified CAs:**
   - **Fresher Starting CTC:** ~₹10 LPA to ₹18 LPA in corporate finance, advisory, and MNC audit.
   - **Mid-Career (3–7 years):** ~₹18 LPA to ₹35 LPA (Audit Managers, Tax Consultants).
   - **Apex / Partner Tier (8+ years):** Equity partnership in accounting firms or Corporate CFO roles regularly exceed **₹1 Crore to ₹5 Crore+** annually.`;
  }

  // Engineering Accreditation & Global Licensure (Washington Accord)
  if (/\b(washington\s*accord|tier\s*1\s*nba|nba\s*tier|fe\s*exam|pe\s*exam|engineer\s*abroad|abroad\s*engineer)\b/.test(q)) {
    return `### ⚙️ Washington Accord & Global Recognition for Indian Engineering Degrees

Engineering degrees in India carry distinct international portability based on National Board of Accreditation (NBA) tiering:

1. **NBA Tier-1 vs. Tier-2 Accreditation:**
   - **Tier-1 Accreditation:** Awarded exclusively to **autonomous colleges, university departments, and deemed universities** (e.g., IITs, NITs, RVCE, BMSCE, PES, COEP).
   - **Tier-2 Accreditation:** Awarded to affiliated, non-autonomous colleges.
2. **The Washington Accord Advantage:**
   - India is a full permanent signatory to the **Washington Accord** through NBA's Tier-1 accredited programs.
   - **Signatory Nations:** USA, UK, Canada, Australia, Japan, Singapore, New Zealand, and others.
   - **Key Benefit:** Degrees from Tier-1 accredited autonomous institutions are recognized as **substantially equivalent** to degrees earned locally in the United States or Australia.
3. **Licensure & Global Visas:**
   - Qualifies graduates to take the **FE (Fundamentals of Engineering)** and **PE (Professional Engineer)** exams under NCEES in the USA.
   - Seamlessly satisfies points criteria for the **Germany Opportunity Card (Chancenkarte)** and **Japan Specified Skilled Worker (SSW)** high-tech talent visas.`;
  }

  // Premier Karnataka Engineering Institutions Comparison
  if (/\b(rvce|bmsce|msrit|pes\s*university|uvce|nitk|compare\s*colleges|top\s*colleges\s*in\s*bangalore)\b/.test(q)) {
    return `### 🏛️ Comparison of Premier Karnataka Engineering Institutes

Based on verified NIRF 2024/2025 rankings, KEA CET cutoffs, and placement records:

| Institution | KEA Code | NIRF Rank | Median CTC | Highest CTC | Govt Quota Fees | Typical KCET CSE Cutoff |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NITK Surathkal** | Central | #17 (Engg) | **₹23.24 LPA** | ₹54.0 LPA | ~₹1,25,000/yr | Top 1500 (JEE Adv / Main) |
| **RV College of Engineering (RVCE)** | E005 | #99 (Engg) | **₹19.70 LPA** | ₹92.0 LPA | ~₹1,25,000/yr | 240 – 350 (KCET GM) |
| **PES University (Ring Road)** | E009 | Deemed | **₹17.99 LPA** | ₹65.0 LPA | ~₹1,30,000/yr | 900 – 1,500 (KCET GM) |
| **BMS College of Engineering (BMSCE)** | E003/E048 | #83 (Engg) | **₹11.40 LPA** | ₹51.5 LPA | ~₹1,25,000/yr | 1,800 – 2,500 (KCET GM) |
| **MS Ramaiah Institute of Tech (MSRIT)** | E006 | #75 (Engg) | **₹8.25 LPA** | ₹50.0 LPA | ~₹1,25,000/yr | 2,000 – 3,600 (KCET GM) |
| **UVCE Bengaluru** | E001 | State Govt | **₹7.50 LPA** | ₹45.0 LPA | **₹53,500/yr** | 3,500 – 5,000 (KCET GM) |

#### Strategic Insights:
- **ROI Apex:** UVCE offers the lowest fee burden (₹53.5k/year) with solid median packages, making it outstanding for value.
- **Top Tech Recruiters:** RVCE and PES lead private campus hiring from global tech giants (Atlassian, Adobe, Microsoft, NVIDIA, Cisco, Amazon).
- **Core Engineering:** NITK Surathkal and RVCE maintain the strongest global alumni networks and PSU/core manufacturing demand.`;
  }

  // Merchant Navy & Specialized Maritime
  if (/\b(merchant\s*navy|imu|imu\s*cet|nautical\s*science|marine\s*engineering)\b/.test(q)) {
    return `### ⚓ Merchant Navy: B.Sc Nautical Science & Marine Engineering

Merchant Navy offers one of the most lucrative and high-liquidity global careers:

1. **Core Qualifications:**
   - **B.Sc Nautical Science (3 Years):** Navigational officer pathway via **IMU-CET** (Indian Maritime University). Leads to Deck Officer / Ship Captain.
   - **B.Tech Marine Engineering (4 Years):** Marine engineering pathway. Leads to Chief Engineer.
2. **Mandatory Pre-requisites:**
   - 10+2 with Physics, Chemistry, and Mathematics (PCM minimum 60% aggregate).
   - Strict DGCA/DG Shipping approved medical fitness and 6/6 eyesight (unaided vision).
3. **Salary & Progression Trajectory:**
   - **Deck Cadet / Engine Cadet (0–1 yr):** Monthly stipend of **₹30,000 to ₹70,000 ($400–$800)** during mandatory sea-time.
   - **3rd Officer / 4th Engineer (2–4 yrs):** Clears Second Mate COC exams. Earns **₹1.5 Lakhs to ₹3.5 Lakhs/month**.
   - **Captain / Master Mariner / Chief Engineer (8+ yrs):** Commands international container/tanker vessels. **Tax-free monthly salary of ₹8 Lakhs to ₹12 Lakhs ($10,000–$15,000/month)**.`;
  }

  // Engineering Branches Comparison (CSE vs ECE vs AI/DS vs Mechanical)
  if (/\b(cse\s*vs\s*ece|ece\s*vs\s*cse|branch\s*comparison|which\s*engineering\s*branch|best\s*engineering\s*branch|cse\s*or\s*ece|ai\s*vs\s*cse)\b/.test(q)) {
    return `### 💻 Branch Comparison: CSE vs ECE vs AI & Data Science

Here is a side-by-side breakdown based on 2024–2025 placement trends, curriculum depth, and long-term career agility:

| Dimension | Computer Science (CSE) | Electronics & Comm (ECE) | AI & Data Science (AI/DS) |
| :--- | :--- | :--- | :--- |
| **Core Curriculum** | Data Structures, Algorithms, OS, Cloud, Web/Mobile | Analog/Digital Circuits, VLSI, Embedded Systems, DSP | Machine Learning, Deep Learning, Statistics, Python/R |
| **Fresher Starting CTC** | **₹6.5 – ₹18.0 LPA** | **₹5.5 – ₹14.0 LPA** | **₹7.0 – ₹19.0 LPA** |
| **Top Recruiters** | Microsoft, Amazon, Google, Atlassian, Infosys | Qualcomm, Texas Instruments, Intel, Apple, Cisco | OpenAI ecosystem, NVIDIA, Fractal Analytics, Target |
| **PSU / Govt Opportunities** | Moderate (NIC, ISRO, DRDO) | **Very High** (ISRO, BEL, BHEL, DRDO, ECIL via GATE) | Moderate to Growing |
| **Long-Term Agility** | Pure Software, Product Management, System Architecture | Hardware + Software versatility (Semiconductor fab + Tech) | Machine Learning Engineer, Data Scientist, GenAI architect |

#### Strategic Advice:
1. **Choose CSE:** If you love pure programming, software problem-solving, algorithms, and desire the broadest campus placement volume.
2. **Choose ECE:** If you want dual versatility—qualifying for IT campus placements *while also* possessing hardware, VLSI chip-design, and central government PSU GATE opportunities.
3. **Choose AI/DS:** If you have strong mathematical and statistical aptitude and want to focus specifically on predictive intelligence, generative AI, and data analytics.`;
  }

  // Polytechnic Diploma vs 11th Science / Lateral Entry
  if (/\b(polytechnic|diploma\s*lateral|dcet|lateral\s*entry|diploma\s*vs\s*11th|polytechnic\s*vs\s*pu|polytechnic\s*vs\s*science)\b/.test(q)) {
    return `### ⚡ Polytechnic Diploma vs. 11th/12th Science & Lateral Entry

Choosing between a 3-Year Polytechnic Diploma and 11th/12th PUC Science depends on your preferred learning style and goals:

#### 1. The Polytechnic Diploma Route (3 Years post-10th)
- **Hands-On Practical Training:** Focuses 70% on laboratory work, workshop practice, and machinery right from day one.
- **Direct 2nd-Year B.Tech Admission (Lateral Entry):**
  - In Karnataka, candidates write the **DCET (Diploma Common Entrance Test)** conducted by KEA.
  - You gain admission directly into the **3rd semester (2nd year)** of B.Tech / B.E., saving one full year of foundation science!
- **Instant Job Readiness:** Immediately eligible for **Junior Engineer (JE)** posts:
  - SSC JE (Central Public Works, MES)
  - Railway RRB JE
  - State Electricity Supply Companies (BESCOM, KPTCL)
  - Private manufacturing CTC: ~₹3.0 – ₹5.0 LPA.

#### 2. The 11th/12th Science Route (2 Years post-10th)
- **Theoretical Foundation:** Emphasizes Physics, Chemistry, and Advanced Mathematics.
- **Wider Exam Portability:** Mandatory if you plan to write **JEE Main / Advanced (IITs/NITs)**, **NEET-UG (Medical)**, or **NDA (Armed Forces Officer entry)**.

#### Summary Verdict:
- Choose **Polytechnic** if you want hands-on technical skills, early financial independence, or an assured lateral route into engineering without intense 2-year competitive exam pressure.
- Choose **11th/12th Science** if your dream is an IIT, NIT, NDA officer entry, or Medicine.`;
  }

  // Government Jobs After 10th and 12th
  if (/\b(govt\s*jobs|government\s*jobs|jobs\s*after\s*10th|jobs\s*after\s*12th|ssc\s*chsl|nda|agniveer|railway\s*jobs)\b/.test(q)) {
    return `### 🏛️ Prestigious Government Jobs After 10th & 12th Pass

Central and state government bodies offer excellent permanent career pathways with high job security, medical benefits, and structured pension schemes:

#### A. Central Govt Jobs After Class 12th Pass:
1. **National Defence Academy (NDA & NA - UPSC):**
   - **Role:** Commissioned Officer in Indian Army, Navy, or Air Force.
   - **Eligibility:** 12th pass (PCM for Air Force/Navy; any stream for Army). Age: 16.5–19.5 years.
   - **Pay Scale:** Starting basic pay ₹56,100/month (Level 10) + allowances.
2. **SSC CHSL (Combined Higher Secondary Level):**
   - **Roles:** Lower Division Clerk (LDC), Junior Secretariat Assistant (JSA), Data Entry Operator (DEO).
   - **Eligibility:** 12th pass from any stream. Age: 18–27 years.
   - **Salary:** ~₹32,000 to ₹45,000/month in Central Ministries.
3. **Railway RRB NTPC (Undergraduate Posts):**
   - **Roles:** Junior Clerk cum Typist, Accounts Clerk, Commercial cum Ticket Clerk.
   - **Salary:** Pay Level 2 & 3 (~₹28,000 to ₹38,000/month).
4. **State Police Constable:**
   - **Eligibility:** 12th pass + Physical Endurance Test. Age: 19–25 years.

#### B. Central Govt Jobs After Class 10th Pass:
1. **SSC MTS & Havaldar:**
   - Multi-Tasking Staff in central government secretariats. Age: 18–25/27 years.
2. **Indian Army Agniveer (General Duty / Tradesmen):**
   - Direct soldier recruitment. Age: 17.5–21 years.
3. **Railway RRB Group D:**
   - Track Maintainer, Assistant Pointsman, Workshop assistant.
4. **India Post GDS (Gramin Dak Sevak):**
   - Merit-based selection on 10th percentage marks (no written exam).`;
  }

  // ITI Trades & Technician Opportunities
  if (/\b(iti|trade|fitter|electrician|copa|machinist|turner|technician)\b/.test(q)) {
    return `### ⚡ ITI Trades: Craftsman Training & Public Sector Careers

Industrial Training Institutes (ITI) provide structured 1- to 2-year technical craft certifications under NCVT (National Council for Vocational Training):

#### Top In-Demand ITI Trades:
1. **Electrician (2 Years):**
   - Domestic & industrial wiring, motor windings, solar power installations, switchgear.
   - Top employers: State Electricity Boards (BESCOM, KPTCL), Indian Railways, Metro Rail.
2. **Fitter (2 Years):**
   - Precision mechanical assembly, machine repair, fabrication, blueprint reading.
   - Top employers: BHEL, HAL, DRDO, Ordnance Factories, Tata Motors.
3. **COPA (Computer Operator and Programming Assistant - 1 Year):**
   - Office automation, database management, network basics, Python/HTML essentials.
   - Immediate openings in government secretariats and data processing centers.
4. **Machinist & Turner (2 Years):**
   - Lathe operations, milling machines, CNC programming, precision manufacturing.

#### Career Progression:
- **Starting CTC:** ₹2.5 – ₹4.0 LPA in manufacturing / ₹30,000–₹40,000/month in Indian Railways.
- **Lateral Pathway:** ITI certificate holders are eligible for direct admission into the **2nd year of Polytechnic Diploma**.
- **Instructor Route:** Pursue **CITS (Craft Instructor Training Scheme)** to become a permanent ITI training instructor.`;
  }

  // Default helpful counselling answer with matched data
  let reply = `### 🎓 EduSelect Career & Higher Education Guidance\n\n`;
  reply += `Thank you for your question. Here is verified information from EduSelect's database:\n\n`;

  if (data.pathways.length > 0) {
    reply += `#### 📌 Relevant Education Pathways:\n`;
    data.pathways.forEach((p) => {
      reply += `- **${p.name}** (${p.duration || 'Standard duration'}): ${p.eligibility || 'Direct eligibility'}. Career outcomes include ${p.outcomes?.slice(0, 3).join(', ') || 'professional roles'}.\n`;
    });
    reply += `\n`;
  }

  if (data.branches.length > 0) {
    reply += `#### ⚡ Engineering Branches:\n`;
    data.branches.forEach((b) => {
      reply += `- **B.Tech in ${b.name}**: Fresher salary ~₹${b.salaryLPA?.fresher?.min || 4}–₹${b.salaryLPA?.fresher?.max || 12} LPA. Outlook: ${b.outlook || 'Growing'}.\n`;
    });
    reply += `\n`;
  }

  if (data.colleges.length > 0) {
    reply += `#### 🏛️ Top Verified Colleges:\n`;
    data.colleges.forEach((c) => {
      reply += `- **${c.name}** (${c.city}, ${c.state}): NIRF Rank #${c.nirf2025Rank || 'Verified'} | Type: ${c.type || 'Institute'} | Median Salary: ₹${c.medianSalaryLpa || 8} LPA.\n`;
    });
    reply += `\n`;
  }

  if (data.exams.length > 0) {
    reply += `#### 📝 Key Entrance Exams:\n`;
    data.exams.forEach((e) => {
      reply += `- **${e.name}**: Conducted by ${e.conductingBody || 'National Agency'}. Mode: ${e.mode || 'Online/Offline'}.\n`;
    });
    reply += `\n`;
  }

  reply += `\n💡 *Tip: Feel free to ask more specific questions, like "Compare CSE vs ECE", "What are the fees for top colleges in Bangalore?", or "What are the job prospects after a Polytechnic diploma?"*`;

  return reply;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth & Rate Limiting
    const session = await getServerSession(authOptions);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const rateKey = session?.user?.id ? `chat:user:${session.user.id}` : `chat:ip:${ip}`;
    const limit = session?.user ? 40 : 20;

    const rateResult = checkRateLimit(rateKey, limit);
    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit reached. Please wait ${rateResult.resetInSec} seconds before sending another message.`,
        },
        { status: 429 }
      );
    }

    // 2. Parse Request
    const body = await request.json();
    const message: string = (body.message || '').trim();
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // 3. Strict Scope Restriction: Answer ONLY student & career guidance questions; refuse coding or unrelated queries
    if (isNonEducationalQuery(message)) {
      return NextResponse.json({
        success: true,
        reply: SCOPE_RESTRICTION_REPLY,
        model: 'guardrail',
        sources: [],
      });
    }

    // 4. Retrieve Verified Context from Our Datasets
    const retrieved = retrieveRelevantData(message);

    // 5. If Gemini is not configured, return rule-based reply
    if (!isGeminiConfigured()) {
      const fallbackReply = buildRuleBasedReply(message, retrieved);
      return NextResponse.json({
        success: true,
        reply: fallbackReply,
        model: 'rule-based',
        sources: retrieved.sources,
      });
    }

    // 6. Construct AI Prompt with Real Dataset Context
    const systemInstruction = `You are EduSelect's expert AI Career & College Counsellor for Indian students and parents.
Your mission is to provide accurate, empathetic, structured, and insightful educational guidance.

CRITICAL SCOPE RESTRICTIONS:
- You are STRICTLY a student career and college counsellor.
- Answer ONLY questions related to educational pathways, admissions, degrees, careers, courses, cutoffs, entrance exams, and syllabus in India.
- REFUSE all coding/programming requests, debugging, general software implementation, unrelated trivia, politics, recipes, or general creative writing.
- If asked for code or an unrelated topic, politely refuse and remind the student that you specialize only in higher education, admissions, and career counseling.

FACTUAL GROUNDING IN INDIAN HIGHER EDUCATION:
1. Ground your advice strictly in authentic Indian education facts:
   - To become a licensed Doctor (MBBS/BDS/AYUSH): Under NMC regulations, Biology is MANDATORY in Class 11-12 (PCB or PCMB). Pure PCM without Biology cannot qualify for NEET-UG or MBBS admission.
   - After Class 10: Choices are 11th-12th Streams (Science, Commerce, Arts), 3-Year Polytechnic Diplomas (with 2nd-year B.Tech lateral entry), ITI Trades, or Direct 10th Defence/Govt exams.
   - B.Tech / Engineering: JEE Main/Advanced, KCET, NIRF 2025 rankings, branch specializations.
   - KEA KCET Karnataka: Evaluates a 50:50 composite score between KCET and Board marks.
2. Structure your replies using clear, clean Markdown:
   - Use headings (###), bold key terms, bullet points, and numbered lists for steps.
   - Include realistic salary expectations, duration, fees, and entrance exams.
   - Provide concrete recommendations of courses and colleges drawn from our verified data.
   - Keep answers comprehensive yet easy to read.
3. Use the VERIFIED DATA below to enrich your response. If relevant colleges, pathways, or exams are provided, mention them naturally.
4. Never invent nonexistent exams, fees, or cutoffs. If something is not certain, advise the student to check official counselling notifications.`;

    // Compact verified data context
    let dataContext = `VERIFIED DATA FROM EDUSELECT DATABASE:\n`;
    if (retrieved.pathways.length) {
      dataContext += `Pathways:\n${retrieved.pathways.map((p) => `- ${p.name} (Duration: ${p.duration}, Eligibility: ${p.eligibility})`).join('\n')}\n\n`;
    }
    if (retrieved.branches.length) {
      dataContext += `Engineering Branches:\n${retrieved.branches.map((b) => `- ${b.name} (Code: ${b.code}, Fresher CTC: ₹${b.salaryLPA?.fresher?.min}-₹${b.salaryLPA?.fresher?.max} LPA)`).join('\n')}\n\n`;
    }
    if (retrieved.colleges.length) {
      dataContext += `Top Colleges:\n${retrieved.colleges.map((c) => `- ${c.name} (${c.city}, ${c.state}): NIRF Rank #${c.nirf2025Rank || 'N/A'}, Fees: ~₹${c.tuitionFeesPerYearInr || 'Govt'}/yr, Placements: ₹${c.medianSalaryLpa || 8} LPA`).join('\n')}\n\n`;
    }
    if (retrieved.exams.length) {
      dataContext += `Entrance Exams:\n${retrieved.exams.map((e) => `- ${e.name} (${e.conductingBody})`).join('\n')}\n\n`;
    }
    if (retrieved.govtJobs.length) {
      dataContext += `Government Jobs:\n${retrieved.govtJobs.map((g) => `- ${g.exam} (${g.conductingBody}): Min Qual: ${g.minQualification}`).join('\n')}\n\n`;
    }

    // Build multi-turn contents format
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Add recent history (up to last 6 messages)
    const recentHistory = history.slice(-6);
    for (const h of recentHistory) {
      contents.push({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      });
    }

    // Add current user prompt with context
    contents.push({
      role: 'user',
      parts: [
        {
          text: `${dataContext}\nSTUDENT QUERY:\n"${message}"\n\nPlease provide a clear, structured, and helpful counselling response.`,
        },
      ],
    });

    try {
      const { text: aiReply, model } = await generateText({
        systemInstruction,
        contents,
        maxOutputTokens: 2500,
        temperature: 0.4,
        thinkingBudget: 0,
      });

      return NextResponse.json({
        success: true,
        reply: aiReply,
        model,
        sources: retrieved.sources,
      });
    } catch (aiErr: any) {
      console.warn('Gemini chat call fell back to rule-based reply:', aiErr?.message || aiErr);
      const fallbackReply = buildRuleBasedReply(message, retrieved);
      return NextResponse.json({
        success: true,
        reply: fallbackReply,
        model: 'rule-based',
        sources: retrieved.sources,
      });
    }
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
