# EduSelect Logic Verification & Regulatory Research Verdicts
**Document Version:** 1.0.0  
**Phase:** Phase 1 — Deep Internet Research & Regulatory Logic Audit  
**Audit Date:** October 11, 2026  
**Auditor / Engineer:** Antigravity Senior Full-Stack & Data QA Lead  
**Primary Regulatory Authorities:** KEA (Karnataka Examinations Authority), DPUE (Department of Pre-University Education), DTE Karnataka, NMC (National Medical Commission), NTA, AICTE, NIRF (Ministry of Education), JoSAA.

---

## 1. Executive Summary

This document audits all core business rules, admission algorithms, eligibility constraints, and assumptions implemented across EduSelect against official regulatory statutes and published government notifications.

Every rule has been verified against authoritative public sources with recorded source URLs, verification timestamps, and unambiguous verdicts: **CORRECT**, **WRONG**, **PARTLY**, or **UNVERIFIED**.

---

## 2. Comprehensive Regulatory Verification Table

| Rule ID | Module / Area | Rule in EduSelect Code | Official Regulatory Rule | Authoritative Source URL | Date Checked | Verdict |
|---|---|---|---|---|---|---|
| **R-1A.1** | KCET Engineering Rank | 50% KCET marks + 50% Board (PCM) theory marks out of 180 & 300 respectively. | KEA calculates engineering merit rank by giving equal (50:50) weightage to normalized KCET (Physics, Chemistry, Maths out of 180) and 2nd PUC / 12th Board PCM (out of 300). | [cetonline.karnataka.gov.in](https://cetonline.karnataka.gov.in) / [KEA UGCET Information Bulletin](https://cetonline.karnataka.gov.in/kea/) | 2026-10-11 | **CORRECT** |
| **R-1A.2** | KCET Tie-Breaking | In code: Median rank calculated purely on composite percentage brackets. No tie-breakers implemented. | KEA tie-break order: (1) Higher KCET Maths score, (2) Higher KCET Physics score, (3) Higher aggregate marks in 2nd PUC / 12th, (4) Date of birth (older candidate ranked higher). | [cetonline.karnataka.gov.in](https://cetonline.karnataka.gov.in) | 2026-10-11 | **PARTLY** (Formula correct, but tie-break rules not modelled) |
| **R-1A.3** | KCET Quota Multiplier | `predictedRankMedian = Math.round(predictedRankMedian * 0.92)` applied for Rural / Kannada Medium quota in `kcetPredictor.ts`. | **Rural (15%) and Kannada Medium (5%) are statutory horizontal seat reservations, NOT a rank discount.** A candidate's rank never changes based on quota; rather, reserved category candidates compete in separate horizontal seat pools (GM-R, GM-K, 2A-R, etc.) with more lenient cutoffs. Multiplying rank by 0.92 is mathematically fictitious. | [Karnataka Examination Authority Act & Reservation Orders](https://cetonline.karnataka.gov.in/kea/) | 2026-10-11 | **WRONG** |
| **R-1A.4** | KCET Reservation Categories | `KCETInput['category']` supports `'GM' \| '2A' \| '2B' \| '3A' \| '3B' \| 'SC' \| 'ST'`. | Karnataka recognizes 8 vertical backward class categories: **General Merit (GM), Category-1 (4%), Category-2A (15%), Category-2B (4%), Category-3A (4%), Category-3B (5%), SC (15%), ST (3%/7.5%)**. EduSelect completely omits **Category-1** in the predictor type. | [Karnataka Backward Classes Department / KEA Reservation Policy](https://cetonline.karnataka.gov.in) | 2026-10-11 | **WRONG** (Category-1 omitted) |
| **R-1A.5** | KCET Chance Zones | High Chance <= 0.85 of cutoff; Moderate Chance <= 1.12; Dream <= 1.35. | KEA does not define percentage bands for chance calculation. These are proprietary heuristic confidence intervals. While pedagogically helpful, they must be transparently labelled as heuristic estimations rather than official KEA rules. | Proprietary Heuristic Formulation | 2026-10-11 | **PARTLY** (Heuristic valid for guidance, but must be explicitly disclaimed) |
| **R-1B.1** | Medical / NEET Biology Requirement | Biology/Biotechnology mandatory for medical admission; PCM students cannot access MBBS. | Under NMC Graduate Medical Education Regulations (2023 amendment), candidates must have passed Physics, Chemistry, Biology/Biotechnology and English in Class 12 (either as core subjects or as additional subjects). A student who has only PCM without Biology is ineligible for NEET-UG. | [National Medical Commission (NMC) Public Notice & GMER](https://www.nmc.org.in/) | 2026-10-11 | **CORRECT** |
| **R-1B.2** | Medical Entrance Exam Label | Compare table & medical page display: *"Entrance Exam: NEET UG / KCET"*. | **KCET is NEVER used as an entrance examination for MBBS or BDS.** Admission to 100% of MBBS/BDS seats (All-India, State Govt, Private, Deemed) is strictly through NEET-UG. KEA only acts as the state counseling and allotment authority (UGNEET counselling). Labelling KCET as an entrance exam for MBBS is factually incorrect. | [NMC Regulations / KEA UGNEET Bulletin](https://cetonline.karnataka.gov.in) | 2026-10-11 | **WRONG** |
| **R-1B.3** | Karnataka Medical Seat Quotas | Code splits seats into `totalApprovedSeats` and `govQuotaSeats`. | In Karnataka private medical colleges, seat matrix consists of: (1) Government Quota Seats (~40% non-minority, ~25% minority) counselled by KEA at state subsidized fee; (2) Private / Open Quota Seats (~40%) counselled by KEA; (3) NRI Quota Seats (15%) counselled by KEA; (4) Institutional / Management Quota (~5%). In Government colleges, 15% is AIQ (MCC) and 85% is State Quota (KEA), with a 2026 15% NRI sub-quota. | [Karnataka Medical Education Department / KEA Seat Matrix](https://cetonline.karnataka.gov.in) | 2026-10-11 | **PARTLY** (Simplifies complex 4-tier quota into binary gov/private) |
| **R-1B.4** | Allied Health / Nursing Entrance | B.Sc Nursing, B.Pharm, and Paramedical listed under medical directory. | **B.Sc Nursing:** In Karnataka, KCET (PCB) is mandatory since 2023-24 for KEA government & private quota seats.<br>**B.Pharm / Pharm.D:** KCET (PCM/PCB) is mandatory via KEA.<br>**Paramedical Diplomas:** Governed by Paramedical Board (PMB Karnataka), admission based on SSLC/PUC merit without entrance exam. | [KEA Notification for B.Sc Nursing & Pharma](https://cetonline.karnataka.gov.in) | 2026-10-11 | **CORRECT** |
| **R-1C.1** | After 10th PUC Combinations | Science (PCMB, PCMC, PCME), Commerce (EBAC, HEBA), Arts (HEPS). | Karnataka DPUE curriculum officially structures 4 core combinations + 2 languages. Core codes: PCMB, PCMC, PCME, PCMS in Science; EBAC, HEBA, MEBA, SEBA, CEBA in Commerce; HEPS, HEPK in Arts. | [Department of Pre-University Education (DPUE)](https://pue.karnataka.gov.in) | 2026-10-11 | **CORRECT** |
| **R-1C.2** | Polytechnic (DTE) Admission | 3-year diploma, entry after 10th / SSLC, lateral entry to 2nd year B.E. via DCET. | **Eligibility:** SSLC pass with min 35% aggregate including Science & Mathematics.<br>**Duration:** 3 years (6 semesters).<br>**DCET Lateral Entry:** Minimum 45% aggregate (40% for SC/ST/OBC) in final year of diploma to enter 2nd year (3rd sem) B.E./B.Tech. | [Directorate of Technical Education (DTE)](https://dtetech.karnataka.gov.in) / [KEA DCET](https://cetonline.karnataka.gov.in) | 2026-10-11 | **CORRECT** |
| **R-1C.3** | ITI Trades & Apprenticeship | Craftsmen Training Scheme (CTS), 1-2 year trades, NCVT/SCVT certification, apprenticeship under NAPS. | DGT (Ministry of Skill Development) oversees ITI courses. Trades require 8th or 10th pass. Completion confers National Trade Certificate (NTC) with eligibility for National Apprenticeship Certificate (NAC) and lateral entry to 2nd year Polytechnic in certain states. | [Directorate General of Training (DGT)](https://dgt.gov.in) | 2026-10-11 | **CORRECT** |
| **R-1D.1** | After 12th Engineering Routes | National exams: JEE Main, JEE Advanced, BITSAT. State exams: KCET, COMEDK, MHT-CET, WBJEE. Institutional: VITEEE, SRMJEEE, MET. | Confirmed. JEE Main covers NITs/IIITs/CFTIs; JEE Advanced covers IITs via JoSAA/CSAB. KCET covers Karnataka domicile state seats; COMEDK covers private engineering seats in Karnataka for pan-India students. | [JoSAA](https://josaa.nic.in) / [COMEDK](https://www.comedk.org) | 2026-10-11 | **CORRECT** |
| **R-1E.1** | After Degree / B.Tech Progression | GATE for M.Tech & PSU recruitment, ESE for IES railway/defence/telecom, CAT for MBA, UPSC CSE, State PSCs. | Confirmed. PSUs (IOCL, NTPC, ONGC, BHEL, GAIL, HPCL) recruit Graduate Executive Trainees through valid GATE scores. ESE recruits Group-A engineering services. | [IIT GATE Official Portal](https://gate2025.iitr.ac.in) / [UPSC](https://upsc.gov.in) | 2026-10-11 | **CORRECT** |
| **R-1F.1** | NIRF 2025 Ranking Claims | `colleges.json` lists 91 NIRF ranked institutes with ranks 1–100 or bands. | Official NIRF Engineering Rankings (MoE) rank top 100 institutes numerically and 101–300 in bands. Top sample (IIT Madras #1, IIT Delhi #2, IIT Bombay #3, IIT Kanpur #4, IIT Kharagpur #5, IIT Roorkee #6, IIT Guwahati #7, IIT Hyderabad #8, NIT Tiruchirappalli #9, IIT BHU #10) matches official published data. | [National Institutional Ranking Framework (NIRF)](https://www.nirfindia.org) | 2026-10-11 | **CORRECT** |
| **R-1F.2** | "28 Indian States" Claim | Code & UI state: *"455 Colleges across all 28 Indian States"*. | India consists of **28 States and 8 Union Territories** (NCT of Delhi, Chandigarh, Puducherry, J&K, Ladakh, etc.). While `colleges.json` does include colleges across all 28 states, it completely omits premier institutes in Union Territories such as **IIT Delhi, DTU, NSUT, IIIT Delhi, PEC Chandigarh, and NIT Srinagar**. The phrase is technically accurate for states, but misleading regarding national coverage. | [Survey of India / Ministry of Home Affairs](https://www.mha.gov.in) | 2026-10-11 | **PARTLY** (Technically covers 28 states, but excludes 8 Union Territories including Delhi) |
| **R-1F.3** | Arithmetic Example in Guide | Guide shows demo calculation: KCET 143/180 (79.44%) + Board 277/300 (92.33%) = 83.89%. | Arithmetic calculation: `(79.4444% + 92.3333%) / 2 = 85.8888%` -> **85.89%**. The guide had a typographical error showing 83.89%. | Basic Mathematical Verification | 2026-10-11 | **WRONG** (Documentation typo) |

---

## 3. "What Our Logic Gets Wrong" (Sorted by Seriousness)

Based on our empirical and regulatory audit, here are the logic discrepancies in EduSelect ranked from most critical to least critical:

### Severity 1: Critical — Fictitious Rank Multiplier for Rural / Kannada Quota (`kcetPredictor.ts:129-133`)
* **Current Implementation:** Multiplies estimated rank by `0.92` (an artificial 8% reduction in rank number).
* **The Reality:** KEA **never changes a student's merit rank** based on reservations. Instead, 15% (Rural) and 5% (Kannada Medium) are **horizontal seat quotas**. A student with Rank 15,000 remains Rank 15,000, but has access to seats reserved under GM-R or 2A-R where closing ranks are higher (e.g. 18,000 instead of 14,000).
* **Required Fix:** Remove the `0.92` multiplier on the rank. In the college recommendation matcher, evaluate against the appropriate quota cutoffs (e.g. GM-R/GM-K) or explain the horizontal reservation advantage.

### Severity 2: Critical — Inaccurate Entrance Exam Label for Medical (`karnatakaMedicalSeats.json` & Compare Modal)
* **Current Implementation:** Displays `"Entrance Exam: NEET UG / KCET"` on medical college cards and comparison views.
* **The Reality:** **KCET is NOT an entrance exam for MBBS or BDS.** Only NEET-UG is accepted. KEA only conducts state-level counseling for NEET-qualified candidates. Showing "KCET" makes 12th PCM/PCB students believe they can write KCET to get an MBBS seat.
* **Required Fix:** Update all medical/dental institute records to specify `"Entrance Exam: NEET-UG"` and clarify `"Counselling: KEA UGNEET"`.

### Severity 3: High — Missing Reservation Category-1 (`kcetPredictor.ts:10`)
* **Current Implementation:** Type `KCETInput['category']` only accepts `'GM' | '2A' | '2B' | '3A' | '3B' | 'SC' | 'ST'`.
* **The Reality:** Karnataka has an official **Category-1** (4% reservation) covering extremely backward communities. Students belonging to Category-1 cannot select their category in the predictor.
* **Required Fix:** Add `'1'` (Category-1) to `KCETInput['category']` and include Category-1 closing cutoffs in the predictor engine.

### Severity 4: Medium — Stream Filter Compression on After-10th PU Colleges (`/puc-colleges`)
* **Current Implementation:** Collapses all science combinations into a generic `"Science"` filter, preventing students from filtering for specific combinations like `PCMC` (Engineering-focused) vs `PCMB` (Medical-focused).
* **The Reality:** DPUE explicitly distinguishes between PCMB, PCMC, PCME, and PCMS. A student wanting only Computer Science without Biology cannot filter for PCMC.
* **Required Fix:** Expand stream filter to support granular combinations: `PCMB`, `PCMC`, `Commerce (EBAC/HEBA)`, `Arts`.

### Severity 5: Medium — Omission of Union Territories in "All 28 States" Messaging
* **Current Implementation:** Prominently advertises "455 Colleges across all 28 States".
* **The Reality:** Top institutes in Delhi (IIT Delhi, DTU), Chandigarh (PEC), and J&K (NIT Srinagar) are absent because Union Territories were omitted. Students searching for Delhi colleges find zero results.
* **Required Fix:** Clarify in the UI that coverage spans the 28 Indian States and state whether Union Territories are included or planned for future expansion.

### Severity 6: Low — Arithmetic Typo in Project Guide
* **Current Implementation:** Guide example states `(79.44% + 92.33%) / 2 = 83.89%`.
* **The Reality:** The true average is `85.89%`.
* **Required Fix:** Update the documentation example in `PROJECT_OVERVIEW_GUIDE.md` to show the correct composite arithmetic (`85.89%`).

---

## 4. Phase 1 Conclusion & Transition

All core logic assumptions have now been verified against official regulatory portals with documented evidence.

- **Phase 1 Status:** COMPLETED.
- **Next Phase:** **Phase 2: Data Audit** — Writing and executing scripts to audit schema integrity, duplicate rows, negative/invalid values, and coverage gaps across all 6 production datasets, producing `docs/02_data_audit.md`.
