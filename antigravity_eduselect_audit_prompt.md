# EduSelect: Master Prompt for Antigravity
### Audit + Student-Journey Connection + Search Algorithm + 500 Test Cases

Copy everything below the line into Antigravity as ONE prompt. Attach `PROJECT_OVERVIEW_GUIDE.md` and the page-connection map if possible.

---

## ROLE

You are a senior full-stack engineer, QA lead and data auditor working on **EduSelect** (Next.js 14 App Router, TypeScript, Prisma + Neon, Gemini, bundled JSON datasets: `colleges.json` (455), `pucColleges.json` (6,417), `karnatakaMedicalSeats.json` (788), `kcet2026Cutoffs.json` (1,218), `careers/*.json`, `karnatakaPathways.json`).

The owner builds mostly through AI-assisted prompting. So:
- Explain every finding in simple English, with the file name and line number.
- Never silently change data or logic. Always show BEFORE and AFTER and the evidence.
- Work in phases. Finish and report each phase before starting the next. Do not skip phases.
- Do not break existing working features. Run the build and `node scripts/verify-all.cjs --skip-build` after every phase.

## THE THREE GOALS

1. **Audit**: check whether our logic AND our data are actually correct, using real internet research (official sources first).
2. **Connect the student journey to our data**: whatever a student enters (After 10th, After 12th, ITI, Diploma, B.Tech, etc.), the app must connect that to exactly the data we have and show the right options, colleges, exams and careers.
3. **Search**: build a proper, fast, typo-tolerant search algorithm that understands student language.

Then prove everything with **500 test cases**, written one by one.

---

## PHASE 0: Read before touching anything

1. Read the whole repo structure. List every data file with: path, record count, fields, which pages/APIs use it.
2. Draw a table: `Data file -> fields -> used by -> which student level it serves`.
3. Output `docs/00_repo_map.md`.

Do not edit code in this phase.

---

## PHASE 1: Deep internet research (verify the logic)

Use web search. Prefer official sources: KEA (kea.kar.nic.in), DPUE Karnataka (pue.karnataka.gov.in), DTE Karnataka, NMC (nmc.org.in), NTA / NEET (nta.ac.in), MCC (mcc.nic.in), JoSAA, AICTE, NIRF (nirfindia.org), UGC, VTU, RGUHS, KNC, DGT (ITI), UPSC/GATE sites. Use news/blogs only as a secondary source and mark them as such.

For EACH rule below, record: the rule as our code implements it, the official rule, source URL, date you checked, verdict (CORRECT / WRONG / PARTLY / UNVERIFIED). Never claim "verified" without a URL. If you cannot find proof, write UNVERIFIED.

### Rules to verify

**A. KCET / KEA engineering rank**
- Is the engineering rank really 50% KCET marks + 50% PUC (PCM) marks? Which exact PUC subjects and what total?
- Does KEA normalize as `(KCET/180)*100` and `(PUC PCM/300)*100`? Confirm the current-year formula and any tie-break rules.
- Our code applies a **0.92 rank multiplier for Rural / Kannada Medium**. In reality Rural and Kannada-medium are horizontal reservations on seats, not a rank discount. Find the official rule and decide if the multiplier must be removed or replaced.
- Check the reservation categories (GM, 1, 2A, 2B, 3A, 3B, SC, ST) and whether our list is complete and correctly named.
- Check the zone thresholds (High <= 0.85, Moderate <= 1.12, Dream <= 1.35 of cutoff). These are our own invention. Mark them as "heuristic", test whether they are reasonable against past data, and document it honestly in the UI.
- Check the rank bracket table (composite % -> rank). Compare against published past-year rank lists and report the error percentage.

**B. Medical / NEET**
- Biology/Biotechnology is mandatory for NEET-UG: confirm with NMC/NTA.
- Our compare table shows "Entrance Exam: NEET UG / KCET". KCET is NOT used for MBBS/BDS. Confirm and fix.
- Confirm Karnataka state quota vs management quota vs NRI quota structure, and who counsels (KEA for state seats, MCC for AIQ 15% and deemed). Check our "govQuotaSeats" logic.
- Confirm nursing/pharmacy/paramedical admission routes in Karnataka (RGUHS, KNC, PCI, PMB). Do they go through NEET, KCET, or merit?

**C. After 10th**
- PUC streams and combinations in Karnataka (PCMB, PCMC, PCME, EBAC, HEBA, HEPS, etc.). Confirm names and codes.
- Polytechnic (DTE) admission: eligibility, marks needed, direct-diploma duration, lateral entry (DCET) into 2nd-year B.E., eligibility marks.
- ITI: trades, eligibility, duration, NCVT/SCVT, apprenticeship.
- Other post-10th routes we may be missing: Diploma in other states, CBSE/ICSE 11th, Navodaya/Sainik, JEE-foundation, paramedical diplomas.

**D. After 12th**
- Engineering routes: KCET, COMEDK, JEE Main/Advanced, JoSAA, BITSAT, VITEEE, SRMJEEE, etc. Which are state-wise vs national?
- Medical: NEET-UG, AYUSH, BVSc.
- Commerce/Arts/Law/Design/Defence/Management: CA/CS/CMA, CLAT, CUET, NID/NIFT/UCEED, NDA, IPMAT.
- Eligibility for each (subjects, minimum marks, age).

**E. After degree / B.Tech**
- GATE, ESE, PSU, UPSC, state PSC, MBA (CAT/MAT/CMAT/KMAT), M.Tech (PGCET).

**F. Data facts**
- NIRF 2025 engineering ranking: sample 25 colleges from `colleges.json` and compare to the official list.
- Number of Karnataka engineering colleges, MBBS colleges, dental colleges, PU colleges. Compare our counts against official numbers and explain differences.
- Statement "455 colleges across all 28 states": India has 28 states AND 8 union territories. Check whether the claim is right or misleading, and whether UTs are present.

Output: `docs/01_research_verdicts.md` as a table plus a short list called **"What our logic gets wrong"**, sorted by seriousness.

---

## PHASE 2: Data audit

For every dataset, write a script `scripts/audit-<dataset>.cjs` that checks and prints a report:

1. Schema: missing, null, wrong-type fields.
2. Duplicates: same name+city, same code, near-duplicate names (Levenshtein).
3. Invalid values: negative fees, seats > approved intake, govQuota > total, rank = 0, NIRF rank outside 1-300, impossible districts.
4. Consistency: district names spelled the same everywhere; management type labels uniform; stream labels uniform (e.g. "Science (PCMB/PCMC)" hides the difference between PCM, PCB, PCMB, PCMC. Check whether the data can support a precise filter).
5. Cross-links: every KCET cutoff college maps to a real entry in `colleges.json`. Every career `itemId` referenced exists. Every college `branch` maps to a career branch.
6. Coverage gaps by student level (very important, feeds Phase 3):
   - After 10th: do we have PUC colleges outside Karnataka? Polytechnic colleges list? ITI list? (Docs suggest NO lists for polytechnic/ITI, only pathway text.)
   - After 12th: do we have commerce/arts/law/design/degree colleges, or only engineering (455 pan-India) and Karnataka medical?
   - After degree: do we have M.Tech/MBA institutes?
7. Spot-check 30 random records per dataset against official websites and report mismatches.

Output: `docs/02_data_audit.md` with counts, examples of bad rows, and a fix list. Do NOT auto-fix rows without evidence; produce `data_fix_proposals.json` first.

---

## PHASE 3: Connect the student journey to our data

### 3.1 Define one Student Profile (single source of truth)

```ts
type StudentProfile = {
  level: '10th' | '12th' | 'iti' | 'diploma' | 'btech' | 'degree' | 'professional' | 'pg';
  stream?: 'PCM' | 'PCB' | 'PCMB' | 'PCMC' | 'Commerce' | 'Arts' | 'Other';
  board?: 'Karnataka' | 'CBSE' | 'ICSE' | 'Other';
  state?: string;            // for state-specific results
  district?: string;
  marks?: { percent?: number; kcet?: number; pcmBoard?: number; neet?: number; jee?: number };
  category?: 'GM' | '1' | '2A' | '2B' | '3A' | '3B' | 'SC' | 'ST';
  interests?: string[];      // "doctor", "coding", "defence", "business"...
  budgetPerYear?: number;
};
```

Save it in one place (URL params + store + localStorage) so every page reads the same profile. When the student changes level on the Home page, every other page (Careers, PUC, Colleges, Medical, Pathways, Predictor, AI Counsellor) must respect it.

### 3.2 Build the Eligibility Matrix (data-driven, not hard-coded in pages)

Create `src/lib/journey/journeyEngine.ts` and `src/data/journeyMatrix.json` that maps:

`level + stream (+ marks/state) -> { next steps, entrance exams, college datasets to show, career pathways, tools to link }`

Examples the engine must produce correctly (verify each against Phase 1):
- **10th** -> PUC (Science PCMB/PCMC/PCM/PCB, Commerce, Arts) -> `/puc-colleges?stream=...&district=...`; Polytechnic (DTE) -> `/pathways`; ITI -> `/pathways`. Show a clear "we have college lists for: X; we do NOT yet have lists for: Y" message instead of an empty page.
- **12th PCM** -> Engineering (KCET/COMEDK/JEE) -> `/kcet-2026-predictor`, `/colleges`; NOT medical (no Biology).
- **12th PCB or PCMB** -> NEET -> `/medical-allied-health`; plus engineering only for PCMB.
- **12th PCMC** -> Engineering/Computer routes; NOT medical.
- **12th Commerce / Arts** -> careers (CA, CS, law, design, etc.). Be honest where we have no college lists.
- **Diploma** -> DCET lateral entry -> `/colleges` filtered to lateral-entry capable colleges (only if data supports; else show flag).
- **ITI** -> apprenticeships, DCET (if eligible), government cadres.
- **B.Tech** -> GATE/PSU/MBA/M.Tech/govt jobs.

### 3.3 Make every page "level aware"

- Home level cards pass `level` and `stream`, and the next page shows a "Showing results for: After 12th, PCM, Karnataka" chip the student can edit.
- Each college/career/medical page filters and ranks by the profile (e.g. a PCM student never sees MBBS as a recommended path; a Kannada-medium rural student sees the relevant reservation info).
- Add a "Next steps" panel on every page: "You are here -> what comes next -> data we have for it".
- Fix the contradiction in the page map: medical colleges are compared inside `/medical-allied-health` (isolated modal) while the flow map sends them to `/compare`. Pick the correct behaviour (isolated) and update the map and links.

### 3.4 Coverage honesty

If the student's level has no matching dataset, the UI must say so clearly and still give the best next step (official link + pathway), never an empty list or a wrong page.

Output: `docs/03_journey_design.md` (matrix table, flow diagram) plus the working code, then run the build.

---

## PHASE 4: Search algorithm (proper)

Build one shared search module `src/lib/search/` used by `/colleges`, `/puc-colleges`, `/medical-allied-health`, `/careers`, the navbar search, and the AI Counsellor candidate retrieval.

Requirements:
1. **Normalization**: lowercase, trim, remove punctuation and extra spaces, unify `B.E`/`BE`/`B E`, `&`/`and`, `Dr.`/`Dr`, `St.`/`Saint`.
2. **Synonyms and abbreviations** (editable JSON): CSE = Computer Science = CS; ECE = Electronics and Communication; ISE = Information Science; AIML = AI & ML = Artificial Intelligence; RVCE = R.V. College of Engineering; BMSCE; MSRIT = MS Ramaiah; PCMB; EBAC; "doctor" -> MBBS; "engineer" -> BE/B.Tech; common Kannada/Hinglish words (e.g. "college" spelling variants, "vaidya", "inginiyar") only if you can verify them.
3. **Intent detection** from natural text: "engineering colleges in mysuru under 1 lakh", "after 10th science colleges bangalore", "mbbs government", "best cse nirf" -> extracts level, stream, city/district, management, budget, branch, and applies them as filters.
4. **Ranking**: weighted scoring (BM25-style or simple TF-IDF) with field weights: exact code match > exact name match > prefix match > token match > fuzzy match; boost by NIRF rank and exact district match; penalize partial-word noise. Tie-break deterministically.
5. **Typo tolerance**: edit distance (Levenshtein/Damerau) or `fuse.js`; "banglore", "mysore", "mangalore" (old spellings) must resolve to Bengaluru, Mysuru, Mangaluru.
6. **Performance**: build an in-memory inverted index once; 6,417 PU records must search in under 50 ms on the server. Debounce on the client. Paginate server-side.
7. **Explainability**: each result carries `matchedOn` (why it matched) so tests can assert it.
8. **Empty results**: show "did you mean ...?" and relaxed-filter suggestions.
9. **Safety**: sanitize input, cap length, no regex injection.

Output: `docs/04_search_design.md` and `src/lib/search/*` with unit tests.

---

## PHASE 5: The 500 test cases

### Rules (very important)
- Write them **one by one**, each with its OWN reasoning. Do not generate near-duplicates or fill with templates. If two tests check the same thing, delete one.
- Each test must use a **different testing logic**. Tag every test with one of: `boundary`, `equivalence-class`, `negative`, `invalid-input`, `regression`, `property-based`, `cross-dataset-consistency`, `idempotency`, `permutation`, `state-transition`, `security`, `performance`, `accessibility`, `source-of-truth` (checked against an official source).
- Every test has: `id`, `module`, `logic_type`, `title`, `input`, `expected`, `why_expected` (the rule), `source_url` (when the rule comes from outside), `severity`, `status` (PASS/FAIL/BLOCKED), `actual`.
- Expected results must come from the OFFICIAL rule or independent hand calculation, NEVER copied from what our code currently outputs. (Writing tests from current output just hides bugs.)
- Write in batches of 25. After each batch: run them, record results, then continue.
- Store as `tests/eduselect-500.json` (+ `tests/eduselect-500.csv`) and automate with Vitest/Jest and Playwright for UI/navigation.

### Distribution (must total exactly 500)

| Module | Count | What to focus on |
|---|---:|---|
| Journey connection (level -> data) | 80 | Every level x stream x state combination; PCM must never show MBBS; empty-dataset honesty; profile persists across pages |
| After-10th / PUC directory | 50 | stream/district/management filters, URL sync, codes like EB0006, pagination edges |
| KCET predictor math | 60 | Composite formula, 0 and max marks, over-limit inputs, decimals, each category, quota logic, zone boundaries at exactly 0.85/1.12/1.35, hand-computed examples |
| Medical / NEET rules and compare | 50 | Biology mandatory, quota math (private = total - gov), compare limit 4, isolation from engineering bar, wrong exam labels |
| Engineering colleges filters/sorts | 50 | state/category/branch combos, NIRF sort, fee sort, unranked handling, clear filters |
| Search algorithm | 80 | typos, abbreviations, synonyms, intent text, ranking order, empty results, injection strings, long input, unicode/Kannada |
| AI Counsellor guard | 40 | Hallucinated IDs dropped, fewer than 2 valid -> fallback, PCM-doctor case, rate limit 10/30 per 10 min, prompt-injection attempts |
| Pathways / Diploma / ITI / DCET | 30 | Eligibility, lateral entry, salary tiers present |
| Auth / saved / admin / security | 30 | JWT, RBAC on `/admin`, demo logins, no secrets in client bundle, saved sync |
| Navigation and link integrity | 30 | Every button/link in the page map lands on the right route with the right query params; no dead routes |

### Mandatory seed tests (we already found these problems; confirm and cover them)

1. **Demo arithmetic error in the guide**: KCET 45+48+50 = 143/180 = 79.44%; Board 90+92+95 = 277/300 = 92.33%; composite = **85.89%**, not 83.89% as printed in the guide. Test the engine and fix the guide.
2. **0.92 rank multiplier for Rural/Kannada Medium** is not how KEA works (see Phase 1A). Decide with evidence.
3. **Medical compare table lists "NEET UG / KCET"** as entrance exam. KCET is not an entrance for MBBS/BDS.
4. **Page-map vs implementation mismatch**: map links Medical -> `/compare`, but implementation isolates medical compare in a modal.
5. **PU stream filter** merges PCMB/PCMC into one "Science" value; PCM/PCB/PCMC cannot be distinguished on the PU page.
6. **"All 28 Indian States"** wording: check union territories.
7. **KCET page "Explore Post-B.Tech Options"** link from a post-PUC predictor makes little sense; review.
8. **Zone thresholds (0.85/1.12/1.35)** have no source; mark as heuristic and test against real past-year allotments.
9. **Rate limiter is in-memory** on serverless, so each instance has its own counter. Test and document the limitation.
10. **Hard-coded demo passwords** in the guide (`password123`, `Admin@123456`): confirm they are disabled in production.

Output: `tests/eduselect-500.json`, `tests/RESULTS.md` (pass/fail totals per module, list of failures by severity), and a runner script `npm run test:500`.

---

## PHASE 6: Fix, re-run, report

1. For each FAIL: classify as **data bug / logic bug / test bug / missing feature**. Show root cause in simple English.
2. Fix logic and code first. Fix data only with evidence (Phase 1 URLs).
3. Re-run the full 500 + `verify-all.cjs` + production build. Repeat until zero FAIL or each remaining one is justified as BLOCKED with a reason.
4. Final report `docs/FINAL_AUDIT_REPORT.md`:
   - What was wrong (ranked)
   - What was fixed (before/after)
   - What is still unverified or missing (e.g. polytechnic/ITI/commerce college lists)
   - Test totals per module
   - A 10-line "what to say in the viva" summary using only verified facts

---

## HARD RULES

- No invented sources, numbers or URLs. If unsure, write UNVERIFIED.
- Expected values must come from outside our code.
- Never remove a feature to make a test pass.
- Keep documents in a clean light professional style (white background, simple headings, tables). No dark hacker styling.
- After each phase, stop and print a 5-line summary: what you did, what you found, what you changed, what failed, what is next.

Start with Phase 0 now.
