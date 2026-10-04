# EduSelect — Master Career Taxonomy & Complete Course Matrix

> **Authoritative Deep-Dive Reference Guide for Students, Parents, and Educational Researchers**  
> *Compiled from EduSelect's 7 Relational Datasets: 100 Pathways, 29 Engineering Branches, 80 Entrance Exams, 28 Graduate Degrees, and 39 Government Jobs.*  
> *Includes official 7th CPC Central Pay Scales, NIRF 2025 engineering linkages, and verified entrance exams for the 2025–2026 academic cycle.*

---

## 📖 Table of Contents
1. [How the Selection Engine Works: The User Experience & Architecture](#1-how-the-selection-engine-works)
2. [How Are We Doing That? Technical Architecture & Code Implementation](#2-how-are-we-doing-that-technical-architecture)
3. [Stage 1: "I am in 10th" (Class 10 / SSLC / Matriculation)](#3-stage-1-i-am-in-10th)
   - [3.1 Class 11–12 / Pre-University (PU) Streams](#31-class-1112--pu-streams)
   - [3.2 Technical Diplomas & Vocational Routes](#32-technical-diplomas--polytechnic-after-10th)
   - [3.3 The 20 ITI Industrial Trades (National Trade Certificates)](#33-the-20-iti-industrial-trades)
   - [3.4 Defence Feeder & Armed Forces Feeder Entries](#34-defence-feeder--armed-forces-entry-after-10th)
   - [3.5 Direct Government Jobs for 10th Pass](#35-direct-government-jobs-requiring-class-10)
4. [Stage 2: "I am in 12th / PU" (All Streams Detailed)](#4-stage-2-i-am-in-12th--pu)
   - [4.1 If You Select: Science — PCM & PCMC (Maths & CS)](#41-science--pcm--pcmc-physics-chemistry-maths--cs)
   - [4.2 If You Select: Science — PCB & PCMB (Biology & Medicine)](#42-science--pcb--pcmb-physics-chemistry-biology--maths)
   - [4.3 If You Select: Commerce (With & Without Maths)](#43-commerce-with--without-maths)
   - [4.4 If You Select: Arts / Humanities / Open to Any Stream](#44-arts--humanities--open-to-any-stream)
   - [4.5 Direct Government Jobs for 12th Pass](#45-government-jobs-requiring-class-12)
5. [Stage 3: "I am in ITI" (Industrial Training Institutes)](#5-stage-3-i-am-in-iti)
6. [Stage 4: "I am in Diploma / Polytechnic"](#6-stage-4-i-am-in-diploma--polytechnic)
7. [Stage 5: "I am in Engineering (B.E. / B.Tech)" — All 29 Branches Detailed](#7-stage-5-i-am-in-engineering-be--btech--29-branches-detailed)
8. [Stage 6: "I am in Another Degree" (B.Sc, BCA, B.Com, BA, BBA)](#8-stage-6-other-undergraduate-degrees-bsc-bca-bcom-ba-bba)
9. [Stage 7: Master Government Jobs Directory (39 Central & State Examinations)](#9-stage-7-master-government-jobs-directory-39-exams)
10. [Stage 8: Master Entrance Exams Directory (80 National & State Exams)](#10-stage-8-master-entrance-exams-directory-80-exams)
11. [Contributor & Research Guide for Your Friend](#11-contributor--research-guide-for-your-friend)

---

## 1. How the Selection Engine Works

When any student, parent, or counselor opens `/careers` in EduSelect, the page presents a clear 3-step decision flow:

### Step 1: "Where are you right now?" (Primary Qualification Level)
The student clicks one of **8 qualification buttons**:
* **After 10th** (`level=CLASS_10`)
* **After 12th / PU** (`level=CLASS_12`)
* **After ITI** (`level=ITI`)
* **After Diploma** (`level=DIPLOMA`)
* **Engineering student / graduate** (`level=UG_ENGG`)
* **Other graduate (B.Sc, B.Com, BA, BCA, BBA)** (`level=UG_OTHER`)
* **Professional degree (MBBS, LLB, B.Pharm, B.Arch)** (`level=PROFESSIONAL`)
* **Postgraduate (M.Tech, MBA, M.Sc, MCA)** (`level=PG`)

### Step 2: "What is your stream / field of interest?" (Conditional Context)
* If they clicked **"After 12th / PU"**, Step 2 dynamically asks:  
  `[PCM] [PCB] [PCMB] [PCMC] [Commerce + Maths] [Commerce (No Maths)] [Arts/Humanities] [Vocational]`
* If they clicked **"Engineering"**, Step 2 allows picking specific branch families:  
  `[CSE & IT] [AI & Data Science] [Electronics & Electrical] [Mechanical & Aerospace] [Civil] [Chemical & Bio]`
* If they clicked **"After 10th"**, it automatically shows:  
  `Class 11-12 Streams`, `Polytechnic Diplomas`, `20 ITI Trades`, `Defence Soldier Entries`, `Direct 10th Govt Jobs`.

### Step 3: Multi-Faceted Filtering & Live Matching (Optional Filters)
* **RIASEC Personality Types:** Filter by Realistic (Doer), Investigative (Thinker), Artistic (Creator), Social (Helper), Enterprising (Persuader), Conventional (Organizer).
* **Favorite Subjects:** Mathematics, Physics, Chemistry, Biology, Computer Science, Economics, Law, Art, History.
* **Budget Range:** Govt/Subsidized (< ₹25k/yr), Moderate (< ₹1 Lakh/yr), Private (< ₹3 Lakh/yr).
* **Career Outlook:** Growing (High demand), Stable, Niche.
* **Instant Search:** Search any keyword (e.g., *"Robotics"*, *"Pilot"*, *"ISRO"*, *"Civil Judge"*).

### The Result: Automatic Filtered List
Without page reloads, the server instantly serves matching cards with:
1. **Pathway or Branch Title & Cluster**
2. **Duration & Eligibility**
3. **Entrance Exams Required**
4. **Estimated Tuition Cost & Fresher Salary Ranges**
5. **Top Job Roles & Sector Alignment**
6. **1-Click Deep Dive Link** to full roadmap, colleges offering it, and PSU recruitment options.

---

## 2. How Are We Doing That? Technical Architecture

EduSelect does not use arbitrary static text or hallucinated AI responses. It is powered by a high-performance **relational in-memory architecture**:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 1. DATA LAYER: 7 Normalized Static JSON Datasets (in src/data/careers/)          │
│    pathways.json (100)       exams.json (80)           engineeringBranches.json  │
│    careerClusters.json (19)  graduateCareers.json (28) govtJobs.json (39)        │
│    taxonomy.json (Streams, Qualification levels, RIASEC definitions)             │
└───────────────────────────────────────┬──────────────────────────────────────────┘
                                        │ In-Memory Fast Lookup Maps
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 2. REPOSITORY & REVERSE-INDEX ENGINE (src/lib/careers/repository.ts)             │
│    • Evaluates qualification hierarchy & cascade rules                           │
│    • Unifies 4 entity types into polymorphic CareerCard objects                  │
│    • Resolves foreign keys: examIds -> exam names; clusterIds -> cluster names   │
│    • Sub-millisecond execution; zero database query bottleneck                   │
└───────────────────────────────────────┬──────────────────────────────────────────┘
                                        │ REST API: GET /api/careers?[params]
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 3. CLIENT REACT 18 + SWR (src/app/careers/page.tsx)                              │
│    • URL search parameters (?level=...&stream=...) serve as single source of truth│
│    • Browser Back/Forward buttons preserve active filter selections              │
│    • SWR caches queries with zero UI lag                                         │
└───────────────────────────────────────┬──────────────────────────────────────────┘
                                        │ Cross-Linkage
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 4. 455 REAL COLLEGES CROSS-LINKAGE (src/data/colleges.json)                      │
│    • Branch codes (e.g., "CSE") link to colleges offering B.Tech in CSE          │
│    • College detail pages link to corresponding post-graduation career roadmaps  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Stage 1: "I am in 10th"

Selecting `level=CLASS_10` immediately presents students with all viable paths starting from Class 10:

### 3.1 Class 11–12 / PU Streams

| Pathway ID | Stream Name | Key Subjects | Duration | Target Clusters | Next Progression Steps |
|:---|:---|:---|:---:|:---|:---|
| `a-pcm` | **Science - PCM (Physics, Chemistry, Maths)** | Physics, Chemistry, Mathematics, English | 2 years | Engineering & Technology, Computer Science, AI & Data | JEE Main / JEE Advanced for IITs, NITs, IIITs; State CETs (KCET, MHT CET, EAPCET, WBJEE, KEAM...); NDA (defence officer) |
| `a-pcb` | **Science - PCB (Physics, Chemistry, Biology)** | Physics, Chemistry, Biology, English | 2 years | Medicine & Healthcare, Agriculture, Veterinary & Food | NEET-UG (MBBS, BDS, AYUSH, veterinary); B.Sc Nursing, allied health; B.Pharm |
| `a-pcmb` | **Science - PCMB (Physics, Chemistry, Maths, Biology)** | Physics, Chemistry, Mathematics, Biology | 2 years | Engineering & Technology, Medicine & Healthcare | Keeps both JEE and NEET open; IISER BS-MS via IAT; Biotechnology / bioinformatics |
| `a-pcmc` | **Science - PCM + Computer Science (PCMC)** | Physics, Chemistry, Mathematics, Computer Science | 2 years | Computer Science, AI & Data, Engineering & Technology | B.Tech CSE / AI / Data Science; BCA; B.Sc Computer Science |
| `a-com-maths` | **Commerce with Maths** | Accountancy, Business Studies, Economics, Mathematics | 2 years | Commerce, Finance & Accounting, Business & Management | CA / CS / CMA; B.Com, BBA; IPMAT (IIM integrated MBA) |
| `a-com` | **Commerce without Maths** | Accountancy, Business Studies, Economics | 2 years | Commerce, Finance & Accounting, Business & Management | B.Com, BBA; CS (Company Secretary); CLAT (law) |
| `a-arts` | **Arts / Humanities** | History, Political Science, Geography, Psychology, Sociology, Economics, Languages | 2 years | Humanities, Social Work & Psychology, Law & Judiciary | BA (any major) via CUET; CLAT (5-year law); Design (NIFT/NID/UCEED) |
| `a-vocational` | **Vocational stream (NSQF subject in Class 11-12)** | Academic core + IT/ITeS, retail, healthcare, automotive, agriculture, tourism etc. | 2 years | Skilled Trades, ITI & Diploma | B.Voc; Diploma; Any UG via CUET |

### 3.2 Technical Diplomas & Polytechnic After 10th

| Pathway ID | Route Name | Category | Duration | Eligibility / Note | Next Steps |
|:---|:---|:---|:---:|:---|:---|
| `a-diploma` | **Diploma in Engineering (Polytechnic)** | Diploma / Polytechnic | 3 years | Class 10 pass + state polytechnic entrance or merit | Junior Engineer (JE) jobs: SSC JE, RRB JE, state JE; Lateral entry to B.E./B.Tech 2nd year (DCET, ECET, DSE, LET...) |
| `a-iti` | **ITI (Industrial Training Institute) - NCVT/SCVT trades** | ITI | 1-2 years | Class 8 or 10 pass (by trade); age 14+ | Apprenticeship (NAPS); RRB ALP / Technician |
| `a-paramedical` | **Paramedical certificate / diploma (lab, X-ray, OT, ECG, GDA)** | Paramedical certificate | 6 months - 2 years | Class 10 (some courses need Class 12) | B.Sc allied health later; Hospital jobs |
| `a-nios` | **NIOS (National Institute of Open Schooling)** | Open schooling | Self-paced | Open to all | Valid for JEE / NEET / CUET and all degrees |
| `a-pmkvy` | **Skill India / PMKVY short-term courses** | Skill course | 150-600 hours | Usually age 15+ | Placement support; Self-employment |
| `a-arts-sports` | **Performing arts / sports academies (SAI, Khelo India)** | Talent route | Varies | Talent / trials | BFA / BPA later; Sports quota jobs |
| `a-govt-10` | **Government jobs for 10th pass (SSC MTS, SSC GD, RRB Group D, India Post GDS, police constable)** | Government job after 10th | Job | Class 10 pass; age limits by exam | See government jobs with minimum qualification Class 10 |

### 3.3 The 20 ITI Industrial Trades

Industrial Training Institutes (ITIs) offer National Trade Certificates (NTC) recognized nationwide under DGT / NCVT:

| Trade ID | Trade Name | Duration | RIASEC | Govt / PSU Alignment | Key Career Outcomes |
|:---|:---|:---:|:---:|:---|:---|
| `iti-electrician` | **ITI - Electrician** | 2 years | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Electrician, Wireman, Maintenance technician |
| `iti-fitter` | **ITI - Fitter** | 2 years | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Fitter, Assembly technician, Maintenance fitter |
| `iti-turner` | **ITI - Turner** | 2 years | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Turner / lathe operator, CNC operator |
| `iti-machinist` | **ITI - Machinist** | 2 years | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Machinist, CNC machinist |
| `iti-mmv` | **ITI - Mechanic Motor Vehicle** | 2 years | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Auto mechanic, Service technician, Workshop supervisor |
| `iti-electronics-mechanic` | **ITI - Electronics Mechanic** | 2 years | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Electronics repair technician, Assembly line technician |
| `iti-rac` | **ITI - Refrigeration & Air-Conditioning Technician** | 2 years | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | AC / refrigeration technician, HVAC technician |
| `iti-draughtsman-civil` | **ITI - Draughtsman (Civil)** | 2 years | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Civil draughtsman, AutoCAD drafter |
| `iti-draughtsman-mech` | **ITI - Draughtsman (Mechanical)** | 2 years | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Mechanical draughtsman, CAD drafter |
| `iti-instrument-mechanic` | **ITI - Instrument Mechanic** | 2 years | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Instrument technician, Calibration technician |
| `iti-wireman` | **ITI - Wireman** | 2 years | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Wireman, Electrical helper |
| `iti-welder` | **ITI - Welder** | 1 year | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Welder (arc/gas/TIG/MIG), Fabricator |
| `iti-plumber` | **ITI - Plumber** | 1 year | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Plumber, Pipe fitter |
| `iti-copa` | **ITI - COPA (Computer Operator & Programming Assistant)** | 1 year | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Computer operator, Data entry operator, Office assistant |
| `iti-carpenter` | **ITI - Carpenter** | 1 year | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Carpenter, Furniture maker |
| `iti-sewing` | **ITI - Sewing Technology** | 1 year | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Tailor, Garment machine operator |
| `iti-diesel-mechanic` | **ITI - Mechanic Diesel** | 1 year | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Diesel engine mechanic, Generator technician |
| `iti-tractor-mechanic` | **ITI - Mechanic Tractor** | 1 year | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Tractor mechanic, Farm machinery technician |
| `iti-stenographer` | **ITI - Stenographer & Secretarial Assistant** | 1 year | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Stenographer, Secretarial assistant |
| `iti-solar` | **ITI - Solar Technician (Electrical)** | 1 year | R | Railway ALP/Tech, DRDO, ISRO, Electricity Boards | Solar PV installer, Solar maintenance technician |

### 3.4 Defence Feeder & Armed Forces Entry After 10th

| Pathway ID | Wing / Role | Category | Age Limits | Exam / Selection Route |
|:---|:---|:---|:---:|:---|
| `a-agniveer-gd` | **Army Agniveer - General Duty** | Defence after 10th | 17.5–21 years | Up to 25% retained as regular soldiers; Priority in CAPF / state police after exit |
| `a-agniveer-tradesman` | **Army Agniveer - Tradesman** | Defence after 10th | 17.5–21 years | Retention as regular soldier (up to 25%) |
| `a-navy-mr` | **Navy Agniveer - MR (Musician / Matric Recruit)** | Defence after 10th | 17.5–21 years | Retention as sailor |
| `a-icg-db` | **Coast Guard Navik (Domestic Branch)** | Defence after 10th | 17.5–21 years | Promotions within Coast Guard |
| `a-sainik` | **Sainik Schools / Rashtriya Military Schools** | Defence feeder | 17.5–21 years | NDA after Class 12 |

### 3.5 Direct Government Jobs Requiring Class 10

| Job ID | Examination / Body | Primary Posts | 7th CPC Level | Basic Pay / Month | Approx In-Hand |
|:---|:---|:---|:---:|:---:|:---|
| `ssc-mts` | **SSC MTS & Havaldar** (Staff Selection Commission) | Multi-Tasking Staff, Havaldar (CBIC/CBN) | Level 1 | ₹18,000 | ~₹25,000-32,000/month |
| `ssc-gd` | **SSC GD Constable** (Staff Selection Commission) | Constable (GD) in CAPFs, SSF, Assam Rifles | Level 3 | ₹21,700 | ~₹28,000-38,000/month |
| `rrb-group-d` | **RRB Group D (Level 1)** (Railway Recruitment Boards) | Track maintainer, Helper, Assistant (various departments) | Level 1 | ₹18,000 | ~₹25,000-30,000/month |
| `india-post-gds` | **India Post Gramin Dak Sevak** (Department of Posts) | Branch Postmaster, Assistant Branch Postmaster, Dak Sevak | Level 1 | ₹18,000 | TRCA ₹10,000-29,380/month |
| `agniveer` | **Agniveer (Army / Navy / Air Force)** (Ministry of Defence) | Agniveer | Level 1 | ₹18,000 | ₹30,000-40,000/month package (70% in hand: ₹21,000-28,000); ~₹11.71 lakh Seva Nidhi at exit |
| `state-police-constable` | **State Police Constable** (State police recruitment boards) | Constable | Level 3 | ₹21,700 | Varies by state |

---

## 4. Stage 2: "I am in 12th / PU"

Selecting `level=CLASS_12` opens Step 2 where the student chooses their exact higher secondary stream:

### 4.1 Science — PCM & PCMC (Physics, Chemistry, Maths & CS)

Students with Mathematics as a core subject can pursue engineering, architecture, aviation, merchant navy, defence, pure sciences, and computing degrees:

| Pathway ID | Field / Career Pathway | Duration | Entrance Exams Required | Top Career Outcomes |
|:---|:---|:---:|:---|:---|
| `b-btech` | **B.E. / B.Tech (Engineering)** | 4 years | JEE Main, JEE Advanced, JoSAA counselling | Software engineer, Core engineer, PSU executive |
| `b-barch` | **B.Arch (Architecture)** | 5 years | NATA, JEE Main | Architect, Urban designer, Interior architect |
| `b-bplan` | **B.Planning** | 4 years | JEE Main | Urban planner, Transport planner, GIS analyst |
| `b-bsc-pcm` | **B.Sc (Physics, Chemistry, Maths, Statistics, Computer Science, Electronics, Geology)** | 3-4 years | CUET-UG | Research scientist (after M.Sc/PhD), Data analyst, Teacher / lecturer |
| `b-bsms` | **BS-MS / Integrated M.Sc (IISER, NISER, CEBS)** | 5 years | IISER Aptitude Test (IAT), NEST | Scientist, Researcher, Professor |
| `b-stat-math` | **B.Stat / B.Math (ISI) and B.Sc Maths (CMI)** | 3 years | ISI admission test, CMI entrance | Quant analyst, Actuary, Statistician |
| `b-bca` | **BCA / B.Sc Data Science / AI / Cyber Security** | 3-4 years | CUET-UG | Software developer, Data analyst, Cybersecurity analyst |
| `b-cpl` | **Commercial Pilot Licence (CPL)** | 18-24 months | DGCA CPL exams + Class 1 medical | First Officer → Captain, Flight instructor, Charter pilot |
| `b-ame` | **Aircraft Maintenance Engineering (B1 / B2)** | 2-4 years | Merit / Direct Admission | Licensed aircraft maintenance engineer, MRO technician |
| `b-merchant-navy` | **Merchant Navy - DNS / B.Sc Nautical Science / B.Tech Marine Engineering** | 1-4 years | IMU CET | Deck cadet → Captain, Engine cadet → Chief Engineer |
| `b-nda` | **NDA (National Defence Academy)** | 3 + 1 years training | UPSC NDA & NA | Army / Navy / Air Force officer |
| `b-tes` | **Army TES / Navy 10+2 B.Tech Cadet Entry** | 4 years | Army TES (10+2 Technical Entry), Navy 10+2 B.Tech Cadet Entry, JEE Main | Technical officer (Army / Navy) |
| `b-agniveer-12` | **Agniveer Vayu / Navy SSR / Coast Guard Navik (GD)** | 4 years (Agniveer) / career (Coast Guard) | Agniveer Vayu, Agniveer (Navy) MR / SSR, Coast Guard Navik (GD / DB) | Airman, Sailor, Navik |
| `b-pharmacy` | **B.Pharm / D.Pharm / Pharm.D** | 4 / 2 / 6 years | KCET, MHT CET, AP EAPCET | Pharmacist, QA/QC analyst, Regulatory affairs |
| `b-optometry` | **B.Optom (Optometry)** | 4 years | CUET-UG | Optometrist, Vision scientist |
| `b-agri` | **B.Sc Agriculture / Horticulture / Forestry / Fisheries; B.Tech Dairy / Food / Agricultural Engineering** | 4 years | CUET-UG, KCET, MHT CET | Agriculture officer, Bank agriculture field officer, Agri-business manager |
| `b-actuarial` | **Actuarial Science (IAI)** | 3-6 years (exams alongside degree/job) | ACET | Actuarial analyst, Actuary |
| `b-economics` | **BA / B.Sc Economics (Hons)** | 3-4 years | CUET-UG | Research analyst, Economist, Policy analyst |

### 4.2 Science — PCB & PCMB (Physics, Chemistry, Biology & Maths)

Students with Biology can explore medical clinical practice, veterinary medicine, pharmacy, nursing, biotechnology, allied health sciences, and agricultural science:

| Pathway ID | Field / Career Pathway | Duration | Entrance Exams Required | Top Career Outcomes |
|:---|:---|:---:|:---|:---|
| `b-btech` | **B.E. / B.Tech (Engineering)** | 4 years | JEE Main, JEE Advanced, JoSAA counselling | Software engineer, Core engineer, PSU executive |
| `b-barch` | **B.Arch (Architecture)** | 5 years | NATA, JEE Main | Architect, Urban designer, Interior architect |
| `b-bplan` | **B.Planning** | 4 years | JEE Main | Urban planner, Transport planner, GIS analyst |
| `b-bsc-pcm` | **B.Sc (Physics, Chemistry, Maths, Statistics, Computer Science, Electronics, Geology)** | 3-4 years | CUET-UG | Research scientist (after M.Sc/PhD), Data analyst, Teacher / lecturer |
| `b-bsms` | **BS-MS / Integrated M.Sc (IISER, NISER, CEBS)** | 5 years | IISER Aptitude Test (IAT), NEST | Scientist, Researcher, Professor |
| `b-stat-math` | **B.Stat / B.Math (ISI) and B.Sc Maths (CMI)** | 3 years | ISI admission test, CMI entrance | Quant analyst, Actuary, Statistician |
| `b-cpl` | **Commercial Pilot Licence (CPL)** | 18-24 months | DGCA CPL exams + Class 1 medical | First Officer → Captain, Flight instructor, Charter pilot |
| `b-ame` | **Aircraft Maintenance Engineering (B1 / B2)** | 2-4 years | NEET / State CET / Merit | Licensed aircraft maintenance engineer, MRO technician |
| `b-merchant-navy` | **Merchant Navy - DNS / B.Sc Nautical Science / B.Tech Marine Engineering** | 1-4 years | IMU CET | Deck cadet → Captain, Engine cadet → Chief Engineer |
| `b-nda` | **NDA (National Defence Academy)** | 3 + 1 years training | UPSC NDA & NA | Army / Navy / Air Force officer |
| `b-tes` | **Army TES / Navy 10+2 B.Tech Cadet Entry** | 4 years | Army TES (10+2 Technical Entry), Navy 10+2 B.Tech Cadet Entry, JEE Main | Technical officer (Army / Navy) |
| `b-agniveer-12` | **Agniveer Vayu / Navy SSR / Coast Guard Navik (GD)** | 4 years (Agniveer) / career (Coast Guard) | Agniveer Vayu, Agniveer (Navy) MR / SSR, Coast Guard Navik (GD / DB) | Airman, Sailor, Navik |
| `b-mbbs` | **MBBS (Bachelor of Medicine & Surgery)** | 5.5 years (incl. internship) | NEET-UG | Doctor, Medical officer, Specialist (after PG) |
| `b-bds` | **BDS (Dental Surgery)** | 5 years | NEET-UG | Dentist, Dental surgeon, Army Dental Corps officer |
| `b-ayush` | **AYUSH - BAMS / BHMS / BUMS / BSMS / BNYS** | 5.5 years | NEET-UG | AYUSH doctor, Wellness consultant |
| `b-bvsc` | **BVSc & AH (Veterinary Science)** | 5.5 years | NEET-UG | Veterinarian, Veterinary officer, Dairy / poultry consultant |
| `b-nursing` | **B.Sc Nursing / GNM / ANM** | 4 / 3 / 2 years | NEET-UG, AIIMS paramedical / B.Sc Nursing | Staff nurse, Nursing officer, ICU nurse |
| `b-pharmacy` | **B.Pharm / D.Pharm / Pharm.D** | 4 / 2 / 6 years | KCET, MHT CET, AP EAPCET | Pharmacist, QA/QC analyst, Regulatory affairs |
| `b-rehab` | **Physiotherapy (BPT), Occupational Therapy (BOT), Audiology & Speech-Language Pathology (BASLP)** | 4-4.5 years | CUET-UG | Physiotherapist, Occupational therapist, Audiologist / speech therapist |
| `b-medtech` | **Medical technology - BMLT, Radiology / Imaging, OT, Dialysis, Cardiac, Respiratory, Emergency Medical Technology** | 3-4 years | CUET-UG, AIIMS paramedical / B.Sc Nursing | Medical lab technologist, Radiographer, OT technologist |
| `b-optometry` | **B.Optom (Optometry)** | 4 years | CUET-UG | Optometrist, Vision scientist |
| `b-nutrition` | **B.Sc Nutrition & Dietetics / Public Health (BPH)** | 3-4 years | CUET-UG | Clinical dietitian, Nutritionist, Public health officer |
| `b-agri` | **B.Sc Agriculture / Horticulture / Forestry / Fisheries; B.Tech Dairy / Food / Agricultural Engineering** | 4 years | CUET-UG, KCET, MHT CET | Agriculture officer, Bank agriculture field officer, Agri-business manager |
| `b-lifesci` | **B.Sc Biotechnology / Microbiology / Biochemistry / Zoology / Botany** | 3-4 years | CUET-UG | Research associate, Clinical research associate, Lab analyst |
| `b-actuarial` | **Actuarial Science (IAI)** | 3-6 years (exams alongside degree/job) | ACET | Actuarial analyst, Actuary |
| `b-psychology` | **BA / B.Sc Psychology** | 3-4 years | CUET-UG | Counsellor, HR associate, UX researcher |

### 4.3 Commerce (With & Without Maths)

Commerce offers elite professional finance qualifications (Chartered Accountancy, Company Secretary, CMA, Actuarial Science) alongside corporate management and economics:

| Pathway ID | Pathway / Qualification | Stream Prerequisite | Duration | Entrance / Foundation Exam | Typical Outcome Roles |
|:---|:---|:---:|:---:|:---|:---|
| `b-stat-math` | **B.Stat / B.Math (ISI) and B.Sc Maths (CMI)** | Maths Mandatory | 3 years | ISI admission test, CMI entrance | Quant analyst, Actuary, Statistician |
| `b-bca` | **BCA / B.Sc Data Science / AI / Cyber Security** | Maths Mandatory | 3-4 years | CUET-UG | Software developer, Data analyst, Cybersecurity analyst |
| `b-bcom` | **B.Com / B.Com (Hons)** | Maths Optional | 3-4 years | CUET-UG | Accountant, Audit associate, Tax consultant |
| `b-bba` | **BBA / BMS** | Maths Optional | 3-4 years | CUET-UG | Sales / marketing executive, HR associate, Operations analyst |
| `b-ca` | **Chartered Accountancy (CA) - ICAI** | Maths Optional | ~4.5-5 years (Foundation → Intermediate → 3-yr articleship → Final) | CA Foundation | Chartered accountant, Auditor, Tax advisor |
| `b-cs` | **Company Secretary (CS) - ICSI** | Maths Optional | ~3-4 years (CSEET → Executive → Professional) | CSEET | Company secretary, Compliance officer |
| `b-cma` | **Cost & Management Accountancy (CMA) - ICMAI** | Maths Optional | ~3-4 years | CMA Foundation | Cost accountant, Management accountant |
| `b-acca` | **ACCA (global accounting qualification)** | Maths Optional | 2-4 years | Merit / ICAI / CUET | Accountant (global), Auditor |
| `b-cfa` | **CFA / FRM (investment & risk)** | Maths Optional | 2-4 years | Merit / ICAI / CUET | Equity research analyst, Portfolio manager, Risk analyst |
| `b-actuarial` | **Actuarial Science (IAI)** | Maths Mandatory | 3-6 years (exams alongside degree/job) | ACET | Actuarial analyst, Actuary |
| `b-economics` | **BA / B.Sc Economics (Hons)** | Maths Mandatory | 3-4 years | CUET-UG | Research analyst, Economist, Policy analyst |

### 4.4 Arts / Humanities / Open to Any Stream

Humanities and open pathways span five-year integrated legal degrees (BA LLB), professional design (B.Des), journalism, civil services, psychology, and hospitality:

| Pathway ID | Field / Career Pathway | Category | Entrance Exams | Key Outcomes |
|:---|:---|:---|:---|:---|
| `b-bca` | **BCA / B.Sc Data Science / AI / Cyber Security** | Computer applications | CUET-UG | Software developer, Data analyst, Cybersecurity analyst |
| `b-gp-rating` | **GP Rating (Merchant Navy crew)** | Merchant Navy | CLAT / NID / CUET / Merit | Deck rating, Engine rating |
| `b-nda` | **NDA (National Defence Academy)** | Defence after 12th | UPSC NDA & NA | Army / Navy / Air Force officer |
| `b-agniveer-12` | **Agniveer Vayu / Navy SSR / Coast Guard Navik (GD)** | Defence after 12th | Agniveer Vayu, Agniveer (Navy) MR / SSR, Coast Guard Navik (GD / DB) | Airman, Sailor, Navik |
| `b-nutrition` | **B.Sc Nutrition & Dietetics / Public Health (BPH)** | Allied health | CUET-UG | Clinical dietitian, Nutritionist, Public health officer |
| `b-bcom` | **B.Com / B.Com (Hons)** | Commerce | CUET-UG | Accountant, Audit associate, Tax consultant |
| `b-bba` | **BBA / BMS** | Management | CUET-UG | Sales / marketing executive, HR associate, Operations analyst |
| `b-ipm` | **Integrated Programme in Management (IIM Indore, Rohtak, Ranchi, Bodh Gaya, Jammu)** | Management | IPMAT, JIPMAT | Management trainee, Consultant, Analyst |
| `b-ca` | **Chartered Accountancy (CA) - ICAI** | Professional finance | CA Foundation | Chartered accountant, Auditor, Tax advisor |
| `b-cs` | **Company Secretary (CS) - ICSI** | Professional finance | CSEET | Company secretary, Compliance officer |
| `b-cma` | **Cost & Management Accountancy (CMA) - ICMAI** | Professional finance | CMA Foundation | Cost accountant, Management accountant |
| `b-acca` | **ACCA (global accounting qualification)** | Professional finance | CLAT / NID / CUET / Merit | Accountant (global), Auditor |
| `b-cfa` | **CFA / FRM (investment & risk)** | Professional finance | CLAT / NID / CUET / Merit | Equity research analyst, Portfolio manager, Risk analyst |
| `b-economics` | **BA / B.Sc Economics (Hons)** | Social science | CUET-UG | Research analyst, Economist, Policy analyst |
| `b-law` | **5-year integrated law - BA / BBA / B.Sc / B.Com LLB** | Law | CLAT, AILET, LSAT-India | Advocate, Corporate lawyer, Judge |
| `b-design` | **Design - B.Des / B.FTech (fashion, product, communication, UX/UI, game, interior)** | Design | NIFT entrance, NID DAT, UCEED | UX / UI designer, Fashion designer, Product designer |
| `b-fine-arts` | **BFA / BPA - fine arts, music, dance, theatre, film-making** | Fine & performing arts | CLAT / NID / CUET / Merit | Artist, Illustrator, Performer |
| `b-bjmc` | **BJMC / Mass Communication / Advertising / PR** | Media | CUET-UG | Journalist, PR executive, Content strategist |
| `b-hotel` | **Hotel Management - B.Sc Hospitality & Hotel Administration** | Hospitality | NCHM JEE | Hotel operations trainee, Chef, Front office manager |
| `b-culinary` | **Culinary arts / Tourism / Event management** | Hospitality | CLAT / NID / CUET / Merit | Chef, Travel consultant, Event manager |
| `b-cabin-crew` | **Cabin crew / Airport management** | Aviation | CLAT / NID / CUET / Merit | Cabin crew, Airport ground staff |
| `b-ba` | **BA (English, History, Political Science, Sociology, Geography, Languages)** | Humanities | CUET-UG | Civil servant, Teacher, Content writer |
| `b-psychology` | **BA / B.Sc Psychology** | Humanities | CUET-UG | Counsellor, HR associate, UX researcher |
| `b-liberal-arts` | **Liberal Arts (4-year)** | Humanities | CLAT / NID / CUET / Merit | Policy analyst, Consultant |
| `b-bsw` | **BSW (Social Work)** | Social work | CUET-UG | NGO programme officer, CSR executive, Community worker |
| `b-teaching` | **ITEP (4-year integrated B.Ed) / B.El.Ed / D.El.Ed** | Education | NCET (ITEP) | School teacher (PRT/TGT) |
| `b-bped` | **B.P.Ed / B.Sc Sports Science** | Sports | CLAT / NID / CUET / Merit | PE teacher, Coach, Fitness trainer |
| `b-languages` | **Foreign languages (BA)** | Humanities | CUET-UG | Translator, Interpreter, Localisation specialist |
| `b-animation` | **Animation / VFX / Gaming** | Design | CLAT / NID / CUET / Merit | 3D artist, VFX artist, Game designer |
| `b-library-voc` | **B.Voc / B.Lib.I.Sc / Paralegal courses** | Vocational degree | CLAT / NID / CUET / Merit | Librarian, Legal assistant, Sector specialist |
| `b-govt-12` | **Government jobs for 12th pass (SSC CHSL, SSC Steno, RRB NTPC UG, Agniveer, police)** | Government job after 12th | CLAT / NID / CUET / Merit | LDC / JSA, Data entry operator, Stenographer |

### 4.5 Government Jobs Requiring Class 12

| Job ID | Examination / Body | Primary Posts | 7th CPC Level | Basic Pay / Month | Approx In-Hand |
|:---|:---|:---|:---:|:---:|:---|
| `ssc-chsl` | **SSC CHSL** (Staff Selection Commission) | Lower Division Clerk / Junior Secretariat Assistant, Data Entry Operator, Postal / Sorting Assistant | Level 2, 4 | ₹19,900, ₹25,500 | ~₹28,000-40,000/month |
| `ssc-steno` | **SSC Stenographer Grade C & D** (Staff Selection Commission) | Stenographer Grade C, Stenographer Grade D | Level 4, 6 | ₹25,500, ₹35,400 | ~₹35,000-55,000/month |
| `rrb-ntpc-ug` | **RRB NTPC (Undergraduate posts)** (Railway Recruitment Boards) | Junior Clerk cum Typist, Accounts Clerk, Trains Clerk, Commercial cum Ticket Clerk | Level 2, 3 | ₹19,900, ₹21,700 | ~₹28,000-38,000/month |
| `nda` | **UPSC NDA & NA** (UPSC) | Officer cadet (Army, Navy, Air Force) | Level 10 | ₹56,100 | Level 10 + Military Service Pay on commission |

---

## 5. Stage 3: "I am in ITI"

Selecting `level=ITI` shows post-ITI apprenticeships, lateral entry diploma options, and technician public sector jobs:

| Pathway ID | Progression Route | Nature of Advancement | Duration | Key Outcomes |
|:---|:---|:---|:---:|:---|
| `i-apprentice` | **Apprenticeship (National Apprenticeship Promotion Scheme)** | After ITI | 6 months - 2 years | Apprentice → technician |
| `i-rrb` | **RRB ALP / Technician (Railways)** | After ITI | Job | Assistant Loco Pilot, Technician |
| `i-lateral` | **Lateral entry to Diploma (2nd year)** | After ITI | 2 years | Junior engineer |
| `i-abroad` | **Skilled trades abroad (Gulf, Europe, Japan)** | After ITI | Job | Welder, Electrician, Plumber |

### Major Government & PSU Technician Roles for ITI Holders:
* **RRB ALP / Technician** (Railway Recruitment Boards) — Posts: **Assistant Loco Pilot, Technician**; Pay Level 2 (₹19,900/month basic); In-hand: ~₹30,000-40,000/month; Official: rrbcdg.gov.in

---

## 6. Stage 4: "I am in Diploma / Polytechnic"

Selecting `level=DIPLOMA` surfaces Junior Engineer government roles and lateral entry to B.Tech 2nd year:

| Pathway ID | Progression Vector | Description | Duration | Key Career Opportunities |
|:---|:---|:---|:---:|:---|
| `d-lateral` | **Lateral entry to B.E./B.Tech (2nd year)** | 3-year engineering diploma | 3 years | Engineer |
| `d-je` | **Junior Engineer jobs (SSC JE, RRB JE, state JE)** | Diploma in Civil/Mechanical/Electrical (by post); age 18-32 | Job | Junior Engineer |
| `d-industry` | **Industry jobs (technician, supervisor, draughtsman)** | Diploma | Job | Technician, Site supervisor, CAD draughtsman |

### Government Junior Engineer (JE) Roles for Diploma Holders:
* **SSC JE** (Staff Selection Commission) — Posts: **Junior Engineer (Civil / Mechanical / Electrical) in CPWD, MES, BRO, CWC etc.**; Pay Level 6 (₹35,400/month basic); In-hand: ~₹55,000-65,000 gross; Official: https://ssc.gov.in
* **RRB JE** (Railway Recruitment Boards) — Posts: **Junior Engineer, Depot Material Superintendent, Chemical & Metallurgical Assistant**; Pay Level 6 (₹35,400/month basic); In-hand: ~₹55,000-65,000 gross; Official: ssc.gov.in / rrbcdg.gov.in

---

## 7. Stage 5: "I am in Engineering (B.E. / B.Tech)" — 29 Branches Detailed

Selecting `level=UG_ENGG` unlocks all 29 engineering branches, detailing fresher placement CTC ranges, core vs tech roles, and GATE PSU eligibility:

| Code | Branch Name | Cluster | Fresher CTC Range | Top Entry Roles | GATE PSU Recruiter Eligibility |
|:---:|:---|:---|:---:|:---|:---|
| **CSE** | [B.Tech Computer Science & Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-cse) | Computer Science, AI & Data | ₹3.5–₹45 LPA | Software development engineer (SDE), Full-stack developer, QA / test engineer | IOCL, ONGC (IT), GAIL |
| **IT** | [B.Tech Information Technology](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-it) | Computer Science, AI & Data | ₹3.5–₹40 LPA | Software developer, System / network engineer, Cloud support engineer | IOCL, ONGC (IT), GAIL |
| **ISE** | [B.Tech Information Science & Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-ise) | Computer Science, AI & Data | ₹3.5–₹40 LPA | Software developer, Data engineer, QA engineer | IOCL, ONGC (IT), GAIL |
| **AI** | [B.Tech Artificial Intelligence & Machine Learning](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-ai) | Computer Science, AI & Data | ₹4–₹12 LPA | ML engineer, Data analyst, AI application developer | IOCL, ONGC (IT), GAIL |
| **DS** | [B.Tech Data Science](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-ds) | Computer Science, AI & Data | ₹4–₹12 LPA | Data analyst, Data engineer, BI developer | IOCL, ONGC (IT), GAIL |
| **CY** | [B.Tech Cyber Security](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-cy) | Computer Science, AI & Data | ₹4–₹8 LPA | SOC analyst, Security engineer, VAPT tester | IOCL, ONGC (IT), GAIL |
| **IOT** | [B.Tech Internet of Things](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-iot) | Computer Science, AI & Data | ₹4–₹8 LPA | Embedded / IoT developer, Firmware engineer | BEL, ECIL |
| **ECM** | [B.Tech Electronics & Computer Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-ecm) | Computer Science, AI & Data | ₹4–₹8 LPA | Embedded developer, Software engineer, Hardware validation engineer | BEL, ECIL |
| **ECE** | [B.Tech Electronics & Communication Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-ece) | Engineering & Technology | ₹4–₹12 LPA | VLSI design / verification engineer, Embedded engineer, Telecom / network engineer | BEL, HAL, POWERGRID |
| **EEE** | [B.Tech Electrical & Electronics Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-eee) | Engineering & Technology | ₹3.5–₹8 LPA | Graduate engineer trainee (GET), Power systems engineer, Electrical design engineer | NTPC, POWERGRID, BHEL |
| **EIE** | [B.Tech Electronics & Instrumentation Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-eie) | Engineering & Technology | ₹3.5–₹7 LPA | Control / instrumentation engineer, Automation engineer | ONGC, IOCL, BPCL |
| **ME** | [B.Tech Mechanical Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-me) | Engineering & Technology | ₹3–₹7 LPA | Graduate engineer trainee (design / production), Quality engineer, CAD/CAE engineer | ONGC, NTPC, IOCL |
| **CIVIL** | [B.Tech Civil Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-civil) | Engineering & Technology | ₹2.5–₹6 LPA | Site engineer, Quantity surveyor, Structural design engineer | NTPC, POWERGRID, NHPC |
| **CHE** | [B.Tech Chemical Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-che) | Engineering & Technology | ₹4–₹9 LPA | Process engineer, Production engineer | IOCL, ONGC, GAIL |
| **AERO** | [B.Tech Aerospace / Aeronautical Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-aero) | Engineering & Technology | ₹4–₹10 LPA | Design / stress engineer, MRO engineer | HAL, ISRO, DRDO |
| **AUTO** | [B.Tech Automobile Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-auto) | Engineering & Technology | ₹3–₹7 LPA | Design / testing engineer, Service engineer | Via Mechanical (GATE ME) |
| **BT** | [B.Tech Biotechnology](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-bt) | Engineering & Technology | ₹3–₹6 LPA | Research associate, QC analyst | Few - mainly research institutes |
| **BME** | [B.Tech Biomedical Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-bme) | Engineering & Technology | ₹3–₹6 LPA | Clinical / application engineer, Service engineer | Limited |
| **IPE** | [B.Tech Industrial & Production Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-ipe) | Engineering & Technology | ₹3–₹7 LPA | Planning / quality engineer, Operations analyst | Via Mechanical |
| **MME** | [B.Tech Metallurgical & Materials Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-mme) | Engineering & Technology | ₹4–₹9 LPA | Process / QA metallurgist | SAIL, NALCO, RINL |
| **MIN** | [B.Tech Mining Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-min) | Engineering & Technology | ₹5–₹10 LPA | Statutory mining engineer (graduate trainee) | Coal India, NMDC, NLC India |
| **PE** | [B.Tech Petroleum Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-pe) | Engineering & Technology | ₹6–₹15 LPA | Drilling / reservoir / production engineer | ONGC, Oil India, GAIL |
| **MAR** | [B.Tech Marine Engineering / Naval Architecture](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-mar) | Engineering & Technology | ₹6–₹15 LPA | Marine engineer (4th engineer), Ship design engineer | SCI, Cochin Shipyard, Mazagon Dock |
| **AGRI** | [B.Tech Agricultural Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-agri) | Engineering & Technology | ₹3–₹6 LPA | Farm machinery engineer, Irrigation engineer | Limited |
| **TEX** | [B.Tech Textile Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-tex) | Engineering & Technology | ₹3–₹5 LPA | Production / quality engineer | Limited |
| **ENV** | [B.Tech Environmental Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-env) | Engineering & Technology | ₹3–₹6 LPA | EHS engineer, Environmental consultant | Limited |
| **RAI** | [B.Tech Robotics / Mechatronics](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-rai) | Engineering & Technology | ₹4–₹9 LPA | Automation / robotics engineer | Via Mechanical / ECE |
| **FT** | [B.Tech Food Technology](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-ft) | Engineering & Technology | ₹3–₹5 LPA | QA / R&D executive, Production executive | Limited |
| **CER** | [B.Tech Ceramic Engineering](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/app/careers/branch/branch-cer) | Engineering & Technology | ₹3–₹5 LPA | Process engineer | Limited |

### Post-Engineering Government & Public Sector Avenues:
* **UPSC Engineering Services (ESE / IES)** (UPSC) — Posts: **Group A engineer (Railways, CPWD, CWC, MES, Telecom, etc.)**; Pay Level 10 (₹56,100/month basic); In-hand: Level 10 (₹56,100 basic); ~₹90,000-1,05,000 gross; Official: https://upsc.gov.in
* **GATE → PSU Executive Trainee** (PSUs (ONGC, NTPC, IOCL, BHEL, POWERGRID, GAIL, etc.)) — Posts: **Executive Trainee / Graduate Engineer Trainee**; Pay Level  (/month basic); In-hand: E2 IDA ₹40,000-1,40,000 basic; ~₹12-20 LPA CTC; Official: null
* **Army TGC / Navy SSC (Tech) / Coast Guard Assistant Commandant** (Indian Army / Navy / Coast Guard) — Posts: **Technical officer**; Pay Level 10 (₹56,100/month basic); In-hand: Level 10 + MSP; Official: https://joinindianarmy.nic.in
* **Navy SSC (Technical)** (Indian Navy) — Posts: **Short Service Commission officer (Engineering / Electrical / Naval Architecture)**; Pay Level 10 (₹56,100/month basic); In-hand: Level 10 + MSP; Official: https://www.joinindiannavy.gov.in
* **Coast Guard Assistant Commandant** (Indian Coast Guard) — Posts: **Assistant Commandant (GD / Technical)**; Pay Level 10 (₹56,100/month basic); In-hand: Level 10; Official: https://joinindiancoastguard.cdac.in

---

## 8. Stage 6: Other Undergraduate Degrees (B.Sc, BCA, B.Com, BA, BBA)

Selecting `level=UG_OTHER` models 28 specialised professional career transitions for non-engineering graduates:

| Degree ID | Graduate Degree / Pathway | Key Entry Sectors | Next Postgraduate Options | Career Outcomes | Fresher CTC Range |
|:---|:---|:---|:---|:---|:---:|
| `grad-bsc-pcm` | **B.Sc Physics / Chemistry / Maths** | Pharma & chemicals, Analytics | M.Sc (IIT JAM, CUET-PG), CSIR NET → research | QC analyst, Data analyst | ₹2.5–₹5 LPA |
| `grad-bsc-stats` | **B.Sc Statistics** | Analytics, Insurance | M.Stat (ISI), M.Sc Statistics | Data analyst, Actuarial analyst | ₹3.5–₹7 LPA |
| `grad-bsc-life` | **B.Sc Life Sciences (Biology, Biotech, Microbiology, Biochemistry)** | Pharma, CROs | M.Sc, MPH | Clinical research associate, Pharmacovigilance associate | ₹2.5–₹4 LPA |
| `grad-bsc-cs-bca` | **B.Sc Computer Science / BCA** | IT services, Product companies | MCA (NIMCET), MBA | Software developer, Tester | ₹3–₹6 LPA |
| `grad-bcom` | **B.Com** | Accounting & audit, Banking | M.Com, MBA | Accountant, Audit associate | ₹2.5–₹5 LPA |
| `grad-ba-economics` | **BA Economics** | Research, Banking | MA Economics (DSE, JNU, IGIDR), UPSC IES | Research analyst, Policy associate | ₹3–₹6 LPA |
| `grad-ba-english` | **BA English** | Publishing, Media | MA English, B.Ed | Content writer, Editor | ₹2.5–₹4.5 LPA |
| `grad-ba-social` | **BA History / Political Science / Sociology / Geography** | NGOs, Research | MA, MSW | Researcher, NGO programme associate | ₹2.5–₹4 LPA |
| `grad-psychology` | **BA / B.Sc Psychology** | HR, Tech (UX research) | MA / M.Sc Psychology, M.Phil Clinical Psychology (RCI licence) | HR associate, UX researcher | ₹2.5–₹4 LPA |
| `grad-languages` | **BA Languages** | Localisation, Tourism | MA | Translator, Interpreter | ₹3–₹6 LPA |
| `grad-bba` | **BBA / BMS** | FMCG, Retail | MBA | Sales executive, HR associate | ₹3–₹5 LPA |
| `grad-llb` | **LLB / BA LLB** | Law firms, Corporate legal | LLM (CLAT PG) | Litigation advocate, Corporate lawyer | ₹2–₹20 LPA |
| `grad-mbbs` | **MBBS** | Government hospitals, Private hospitals | MD / MS / DNB (NEET-PG), USMLE / PLAB (abroad) | Medical officer, Resident doctor | ₹8–₹15 LPA |
| `grad-bds` | **BDS** | Own clinic, Hospitals | MDS (NEET-MDS) | Dentist, Dental officer | ₹3–₹6 LPA |
| `grad-ayush` | **BAMS / BHMS / BUMS / BSMS** | Government AYUSH, Wellness | MD (AYUSH) via AIAPGET | AYUSH medical officer, Wellness consultant | ₹3–₹6 LPA |
| `grad-bpharm` | **B.Pharm** | Pharma manufacturing, Regulatory | M.Pharm (GPAT), MBA Pharma | QA/QC executive, Regulatory affairs associate | ₹2.5–₹5 LPA |
| `grad-nursing` | **B.Sc Nursing** | Hospitals, AIIMS / ESIC | M.Sc Nursing | Staff nurse, Nursing officer | ₹3–₹5 LPA |
| `grad-allied` | **Allied health (BPT, BMLT, Radiology, etc.)** | Hospitals, Diagnostics | MPT / M.Sc | Physiotherapist, Medical lab technologist | ₹2.5–₹4.5 LPA |
| `grad-bsc-agri` | **B.Sc Agriculture** | Government agriculture, Banks | M.Sc (ICAR AIEEA-PG), MBA Agribusiness | Agriculture extension officer, Bank Agriculture Field Officer | ₹3–₹6 LPA |
| `grad-bdes` | **B.Des** | Tech, Fashion | M.Des (CEED) | UX / product designer, Visual designer | ₹4–₹10 LPA |
| `grad-bfa` | **BFA** | Studios, Advertising | MFA | Illustrator, Animator | ₹2.5–₹5 LPA |
| `grad-bjmc` | **BJMC / Mass Communication** | News media, PR agencies | IIMC PG diploma | Reporter, PR executive | ₹2.5–₹5 LPA |
| `grad-bhm` | **BHM / Hotel Management** | Hotels, Cruise lines | MBA Hospitality | Hotel operations executive, Chef de partie | ₹2.5–₹4 LPA |
| `grad-barch` | **B.Arch** | Architecture firms, Real estate | M.Arch / M.Plan (GATE AR) | Architect, Urban designer | ₹3–₹6 LPA |
| `grad-bed` | **B.Ed** | Government schools, Private schools | M.Ed | School teacher (TGT/PGT), Academic coordinator | Standard |
| `grad-any-pg` | **Any postgraduate (MA / M.Sc / M.Com / M.Tech)** | Universities, Research institutes | PhD | Assistant professor, Junior Research Fellow | Standard |
| `grad-mba` | **MBA / PGDM** | Consulting, BFSI | Executive programmes, CFA | Management trainee, Product manager | ₹6–₹30 LPA |
| `grad-mca` | **MCA** | IT services, Product companies | Certifications, M.Tech | Software engineer, Data engineer | ₹3.5–₹10 LPA |

---

## 9. Stage 7: Master Government Jobs Directory (39 Exams)

EduSelect models 39 major public sector recruitment examinations mapped strictly against the 7th Central Pay Commission:

| Job ID | Examination Name | Conducting Body | Min. Qualification | Pay Level | Basic Pay / Month | Approx In-Hand | Posts Recruited |
|:---|:---|:---|:---:|:---:|:---:|:---|:---|
| `ssc-mts` | **SSC MTS & Havaldar** | Staff Selection Commission | `CLASS_10` | Level 1 | ₹18,000 | ~₹25,000-32,000/month | Multi-Tasking Staff, Havaldar (CBIC/CBN) |
| `ssc-gd` | **SSC GD Constable** | Staff Selection Commission | `CLASS_10` | Level 3 | ₹21,700 | ~₹28,000-38,000/month | Constable (GD) in CAPFs, SSF, Assam Rifles |
| `rrb-group-d` | **RRB Group D (Level 1)** | Railway Recruitment Boards | `CLASS_10` | Level 1 | ₹18,000 | ~₹25,000-30,000/month | Track maintainer, Helper |
| `india-post-gds` | **India Post Gramin Dak Sevak** | Department of Posts | `CLASS_10` | Level  |  | TRCA ₹10,000-29,380/month | Branch Postmaster, Assistant Branch Postmaster |
| `agniveer` | **Agniveer (Army / Navy / Air Force)** | Ministry of Defence | `CLASS_10` | Level  |  | ₹30,000-40,000/month package (70% in hand: ₹21,000-28,000); ~₹11.71 lakh Seva Nidhi at exit | Agniveer |
| `state-police-constable` | **State Police Constable** | State police recruitment boards | `CLASS_10` | Level 3 | ₹21,700 | Varies by state | Constable |
| `rrb-alp` | **RRB ALP / Technician** | Railway Recruitment Boards | `ITI` | Level 2 | ₹19,900 | ~₹30,000-40,000/month | Assistant Loco Pilot, Technician |
| `ssc-chsl` | **SSC CHSL** | Staff Selection Commission | `CLASS_12` | Level 2, 4 | ₹19,900, ₹25,500 | ~₹28,000-40,000/month | Lower Division Clerk / Junior Secretariat Assistant, Data Entry Operator |
| `ssc-steno` | **SSC Stenographer Grade C & D** | Staff Selection Commission | `CLASS_12` | Level 4, 6 | ₹25,500, ₹35,400 | ~₹35,000-55,000/month | Stenographer Grade C, Stenographer Grade D |
| `rrb-ntpc-ug` | **RRB NTPC (Undergraduate posts)** | Railway Recruitment Boards | `CLASS_12` | Level 2, 3 | ₹19,900, ₹21,700 | ~₹28,000-38,000/month | Junior Clerk cum Typist, Accounts Clerk |
| `nda` | **UPSC NDA & NA** | UPSC | `CLASS_12` | Level 10 | ₹56,100 | Level 10 + Military Service Pay on commission | Officer cadet (Army, Navy, Air Force) |
| `ssc-je` | **SSC JE** | Staff Selection Commission | `DIPLOMA` | Level 6 | ₹35,400 | ~₹55,000-65,000 gross | Junior Engineer (Civil / Mechanical / Electrical) in CPWD, MES, BRO, CWC etc. |
| `rrb-je` | **RRB JE** | Railway Recruitment Boards | `DIPLOMA` | Level 6 | ₹35,400 | ~₹55,000-65,000 gross | Junior Engineer, Depot Material Superintendent |
| `upsc-cse` | **UPSC Civil Services (IAS / IPS / IFS / IRS)** | UPSC | `GRADUATE` | Level 10 | ₹56,100 | Level 10 (₹56,100 basic) + DA/HRA | IAS, IPS |
| `upsc-cds` | **UPSC CDS** | UPSC | `GRADUATE` | Level 10 | ₹56,100 | Level 10 + MSP | IMA, INA |
| `upsc-capf` | **UPSC CAPF Assistant Commandant** | UPSC | `GRADUATE` | Level 10 | ₹56,100 | Level 10 | Assistant Commandant (BSF, CRPF, CISF, ITBP, SSB) |
| `afcat` | **AFCAT** | Indian Air Force | `GRADUATE` | Level 10 | ₹56,100 | Level 10 + MSP | Flying branch, Ground Duty (Technical) |
| `ssc-cgl` | **SSC CGL** | Staff Selection Commission | `GRADUATE` | Level 4, 5, 6, 7, 8 | ₹25,500, ₹29,200, ₹35,400, ₹44,900, ₹47,600 | Inspector (Level 7): ~₹70,000-80,000 gross | Assistant Section Officer, Income Tax / GST / Excise Inspector |
| `ssc-cpo` | **SSC CPO** | Staff Selection Commission | `GRADUATE` | Level 6 | ₹35,400 | ~₹55,000-65,000 gross | Sub-Inspector (Delhi Police, CAPFs) |
| `ssc-jht` | **SSC Junior Hindi Translator** | Staff Selection Commission | `GRADUATE` | Level 6 | ₹35,400 | ~₹55,000-65,000 gross | Junior Hindi Translator, Junior Translation Officer |
| `ibps-po` | **IBPS PO** | IBPS | `GRADUATE` | Level  |  | JMGS-I basic ~₹48,480; ~₹80,000-90,000 gross | Probationary Officer |
| `sbi-po` | **SBI PO** | State Bank of India | `GRADUATE` | Level  |  | JMGS-I; ~₹80,000-90,000 gross | Probationary Officer |
| `ibps-clerk` | **IBPS Clerk / SBI Clerk / IBPS RRB** | IBPS / SBI | `GRADUATE` | Level  |  | ~₹40,000-45,000 gross | Clerk / Junior Associate, Office Assistant (RRB) |
| `ibps-so` | **IBPS Specialist Officer** | IBPS | `GRADUATE` | Level  |  | JMGS-I; ~₹80,000-90,000 gross | IT Officer, Agriculture Field Officer |
| `rbi-grade-b` | **RBI Grade B / RBI Assistant** | Reserve Bank of India | `GRADUATE` | Level  |  | Grade B ~₹1.5 lakh+/month gross; Assistant ~₹45,000-50,000 | Grade B Officer (DR General, DEPR, DSIM), Assistant |
| `nabard-grade-a` | **NABARD / SEBI Grade A, LIC AAO** | NABARD / SEBI / LIC | `GRADUATE` | Level  |  | ~₹0.9-1.5 lakh+/month gross | Assistant Manager, Assistant Administrative Officer |
| `lic-aao` | **LIC AAO** | Life Insurance Corporation of India | `GRADUATE` | Level  |  | ~₹90,000+/month gross | Assistant Administrative Officer |
| `rrb-ntpc-grad` | **RRB NTPC (Graduate posts)** | Railway Recruitment Boards | `GRADUATE` | Level 4, 5, 6 | ₹25,500, ₹29,200, ₹35,400 | ~₹45,000-65,000 gross | Station Master, Goods Train Manager |
| `ctet-kvs-nvs` | **CTET / State TET → KVS, NVS, state teacher recruitment** | CBSE / KVS / NVS / States | `GRADUATE` | Level 6, 7, 8 | ₹35,400, ₹44,900, ₹47,600 | TGT Level 7 (₹44,900 basic) | PRT, TGT |
| `upsc-ese` | **UPSC Engineering Services (ESE / IES)** | UPSC | `ENGINEERING` | Level 10 | ₹56,100 | Level 10 (₹56,100 basic); ~₹90,000-1,05,000 gross | Group A engineer (Railways, CPWD, CWC, MES, Telecom, etc.) |
| `gate-psu` | **GATE → PSU Executive Trainee** | PSUs (ONGC, NTPC, IOCL, BHEL, POWERGRID, GAIL, etc.) | `ENGINEERING` | Level  |  | E2 IDA ₹40,000-1,40,000 basic; ~₹12-20 LPA CTC | Executive Trainee / Graduate Engineer Trainee |
| `army-tgc` | **Army TGC / Navy SSC (Tech) / Coast Guard Assistant Commandant** | Indian Army / Navy / Coast Guard | `ENGINEERING` | Level 10 | ₹56,100 | Level 10 + MSP | Technical officer |
| `navy-ssc-tech` | **Navy SSC (Technical)** | Indian Navy | `ENGINEERING` | Level 10 | ₹56,100 | Level 10 + MSP | Short Service Commission officer (Engineering / Electrical / Naval Architecture) |
| `icg-ac` | **Coast Guard Assistant Commandant** | Indian Coast Guard | `ENGINEERING` | Level 10 | ₹56,100 | Level 10 | Assistant Commandant (GD / Technical) |
| `ugc-net-jobs` | **UGC NET / JRF, CSIR NET** | NTA | `PG` | Level 10 | ₹56,100 | JRF ₹37,000/month; Assistant Professor Level 10 | Assistant Professor, Junior Research Fellow |
| `upsc-cms` | **UPSC Combined Medical Services** | UPSC | `MBBS` | Level 10 | ₹56,100 | Level 10 + Non-Practising Allowance | Medical Officer (Railways, CGHS, Ordnance Factories, municipal bodies) |
| `aiims-norcet` | **AIIMS NORCET (Nursing Officer)** | AIIMS New Delhi | `PROFESSIONAL` | Level 7 | ₹44,900 | Level 7 (₹44,900 basic) | Nursing Officer at AIIMS |
| `judiciary` | **Civil Judge (Junior Division)** | State PSC / High Court | `LLB` | Level  |  | ~₹77,840 starting basic (SNJPC) | Civil Judge (Junior Division) / Judicial Magistrate |
| `state-psc` | **State Civil Services & State PSC posts (KAS, MPSC, UPPSC, BPSC, TNPSC, etc.)** | State Public Service Commissions | `GRADUATE` | Level  |  | State pay scales | Deputy Collector, DSP |

---

## 10. Stage 8: Master Entrance Exams Directory (80 Exams)

Here are all 80 entrance examinations referenced across pathways and engineering branches:

| Exam ID | Official Exam Name | Conducting Body | Type | Level / Domain | Frequency | Official Website |
|:---|:---|:---|:---:|:---|:---|:---|
| `jee-main` | **JEE Main** | National Testing Agency (NTA) | entrance | CLASS_12 | Twice a year (January & April sessions) | [Official Link](https://nta.ac.in) |
| `jee-advanced` | **JEE Advanced** | IITs (organising IIT rotates) | entrance | CLASS_12 | Once a year (May/June) | [Official Link](https://jeeadv.ac.in) |
| `josaa` | **JoSAA counselling** | Joint Seat Allocation Authority | counselling | CLASS_12 | Annually (June-July) | [Official Link](https://josaa.nic.in) |
| `bitsat` | **BITSAT** | BITS Pilani | entrance | CLASS_12 | Twice a year | [Official Link](https://www.bitsadmission.com) |
| `viteee` | **VITEEE** | VIT University | entrance | CLASS_12 | Annually | [Official Link](https://vit.ac.in) |
| `srmjeee` | **SRMJEEE** | SRM Institute of Science & Technology | entrance | CLASS_12 | Multiple phases | [Official Link](https://www.srmist.edu.in) |
| `met` | **MET (Manipal Entrance Test)** | Manipal Academy of Higher Education | entrance | CLASS_12 | Multiple sessions | [Official Link](https://manipal.edu) |
| `kcet` | **KCET** | Karnataka Examinations Authority (KEA) | entrance | CLASS_12 | Annually (April) | [Official Link](https://cetonline.karnataka.gov.in/kea/) |
| `comedk` | **COMEDK UGET** | Consortium of Medical, Engineering & Dental Colleges of Karnataka | entrance | CLASS_12 | Annually (May) | [Official Link](https://www.comedk.org) |
| `mht-cet` | **MHT CET** | State CET Cell, Maharashtra | entrance | CLASS_12 | Annually | [Official Link](https://cetcell.mahacet.org) |
| `ap-eapcet` | **AP EAPCET** | APSCHE (conducted by JNTU Kakinada) | entrance | CLASS_12 | Annually | [Official Link](https://cets.apsche.ap.gov.in) |
| `tg-eapcet` | **TG EAPCET** | TGCHE (conducted by JNTU Hyderabad) | entrance | CLASS_12 | Annually | [Official Link](https://eapcet.tgche.ac.in) |
| `wbjee` | **WBJEE** | West Bengal Joint Entrance Examinations Board | entrance | CLASS_12 | Annually | [Official Link](https://wbjeeb.nic.in) |
| `keam` | **KEAM** | Commissioner for Entrance Examinations, Kerala | entrance | CLASS_12 | Annually | [Official Link](https://cee.kerala.gov.in) |
| `ojee` | **OJEE** | Odisha Joint Entrance Examination Committee | entrance | CLASS_12 | Annually | [Official Link](https://ojee.nic.in) |
| `gujcet` | **GUJCET** | Gujarat Secondary & Higher Secondary Education Board | entrance | CLASS_12 | Annually | [Official Link](https://gseb.org) |
| `tnea` | **TNEA** | Directorate of Technical Education, Tamil Nadu | counselling | CLASS_12 | Annually | [Official Link](https://www.tneaonline.org) |
| `ugeac` | **UGEAC (Bihar)** | Bihar Combined Entrance Competitive Examination Board | counselling | CLASS_12 | Annually | [Official Link](https://bceceboard.bihar.gov.in) |
| `uptac` | **UPTAC** | Dr. A.P.J. Abdul Kalam Technical University (AKTU) | counselling | CLASS_12 | Annually | [Official Link](https://uptac.admissions.nic.in) |
| `jcece` | **JCECE** | Jharkhand Combined Entrance Competitive Examination Board | entrance | CLASS_12 | Annually | [Official Link](https://jceceb.jharkhand.gov.in) |
| `assam-cee` | **Assam CEE** | Assam Science and Technology University | entrance | CLASS_12 | Annually | [Official Link](null) |
| `gcet-goa` | **GCET (Goa)** | Directorate of Technical Education, Goa | entrance | CLASS_12 | Annually | [Official Link](null) |
| `tjee` | **TJEE** | Tripura Board of Joint Entrance Examination | entrance | CLASS_12 | Annually | [Official Link](null) |
| `reap` | **REAP (Rajasthan)** | Rajasthan Engineering Admission Process | counselling | CLASS_12 | Annually | [Official Link](null) |
| `hstes` | **HSTES counselling** | Haryana State Technical Education Society | counselling | CLASS_12 | Annually | [Official Link](null) |
| `lateral-entry` | **Diploma lateral-entry exams (DCET, AP/TS ECET, Maharashtra DSE, TNEA-LE, Kerala LET, WB JELET, OJEE-LE, ACPDC D2D)** | State technical education bodies | entrance | DIPLOMA | Annually | [Official Link](null) |
| `polytechnic-entrance` | **State polytechnic admission (entrance or Class 10 merit)** | State Directorates of Technical Education | entrance | CLASS_10 | Annually | [Official Link](null) |
| `iti-admission` | **ITI admission (merit)** | State DTE / DGT | counselling | CLASS_10 | Annually | [Official Link](https://dgt.gov.in) |
| `nata` | **NATA** | Council of Architecture | entrance | CLASS_12 | Multiple attempts per year | [Official Link](https://www.nata.in) |
| `iat` | **IISER Aptitude Test (IAT)** | IISERs | entrance | CLASS_12 | Annually | [Official Link](https://www.iiseradmission.in) |
| `nest` | **NEST** | NISER Bhubaneswar & UM-DAE CEBS | entrance | CLASS_12 | Annually | [Official Link](https://www.nestexam.in) |
| `isi-admission` | **ISI admission test** | Indian Statistical Institute | entrance | CLASS_12 | Annually | [Official Link](https://www.isical.ac.in) |
| `cmi-entrance` | **CMI entrance** | Chennai Mathematical Institute | entrance | CLASS_12 | Annually | [Official Link](https://www.cmi.ac.in) |
| `cuet-ug` | **CUET-UG** | NTA | entrance | CLASS_12 | Annually (May-June) | [Official Link](https://nta.ac.in) |
| `neet-ug` | **NEET-UG** | NTA | entrance | CLASS_12 | Once a year (May) | [Official Link](https://nta.ac.in) |
| `aiims-paramedical` | **AIIMS paramedical / B.Sc Nursing** | AIIMS New Delhi | entrance | CLASS_12 | Annually | [Official Link](https://www.aiimsexams.ac.in) |
| `ca-foundation` | **CA Foundation** | ICAI | professional | CLASS_12 | Multiple times a year | [Official Link](https://www.icai.org) |
| `cseet` | **CSEET** | ICSI | professional | CLASS_12 | Multiple times a year | [Official Link](https://www.icsi.edu) |
| `cma-foundation` | **CMA Foundation** | ICMAI | professional | CLASS_12 | Twice a year | [Official Link](https://icmai.in) |
| `acet` | **ACET** | Institute of Actuaries of India | professional | CLASS_12 | Multiple times a year | [Official Link](https://www.actuariesindia.org) |
| `ipmat` | **IPMAT** | IIM Indore / IIM Rohtak | entrance | CLASS_12 | Annually | [Official Link](https://www.iimidr.ac.in) |
| `jipmat` | **JIPMAT** | NTA | entrance | CLASS_12 | Annually | [Official Link](https://nta.ac.in) |
| `clat` | **CLAT** | Consortium of National Law Universities | entrance | CLASS_12, UG_OTHER | Once a year (December) | [Official Link](https://consortiumofnlus.ac.in) |
| `ailet` | **AILET** | National Law University Delhi | entrance | CLASS_12 | Annually (December) | [Official Link](https://nationallawuniversitydelhi.in) |
| `lsat-india` | **LSAT-India** | LSAC Global | entrance | CLASS_12 | Varies | [Official Link](null) |
| `mh-cet-law` | **MH CET Law** | State CET Cell, Maharashtra | entrance | CLASS_12 | Annually | [Official Link](https://cetcell.mahacet.org) |
| `nift` | **NIFT entrance** | National Institute of Fashion Technology | entrance | CLASS_12 | Annually | [Official Link](https://www.nift.ac.in) |
| `nid-dat` | **NID DAT** | National Institute of Design | entrance | CLASS_12 | Annually | [Official Link](https://admissions.nid.edu) |
| `uceed` | **UCEED** | IIT Bombay | entrance | CLASS_12 | Annually (January) | [Official Link](https://www.uceed.iitb.ac.in) |
| `nchm-jee` | **NCHM JEE** | NTA | entrance | CLASS_12 | Annually | [Official Link](https://nta.ac.in) |
| `ncet` | **NCET (ITEP)** | NTA | entrance | CLASS_12 | Annually | [Official Link](https://nta.ac.in) |
| `nda` | **UPSC NDA & NA** | UPSC | government-recruitment | CLASS_12 | Twice a year | [Official Link](https://upsc.gov.in) |
| `army-tes` | **Army TES (10+2 Technical Entry)** | Indian Army | government-recruitment | CLASS_12 | Twice a year | [Official Link](https://joinindianarmy.nic.in) |
| `navy-btech` | **Navy 10+2 B.Tech Cadet Entry** | Indian Navy | government-recruitment | CLASS_12 | Twice a year | [Official Link](https://www.joinindiannavy.gov.in) |
| `agniveer-army` | **Agniveer (Army)** | Indian Army | government-recruitment | CLASS_10, CLASS_12 | Annually | [Official Link](https://joinindianarmy.nic.in) |
| `agniveer-navy` | **Agniveer (Navy) MR / SSR** | Indian Navy | government-recruitment | CLASS_10, CLASS_12 | Twice a year | [Official Link](https://www.joinindiannavy.gov.in) |
| `agniveer-vayu` | **Agniveer Vayu** | Indian Air Force | government-recruitment | CLASS_12 | Twice a year | [Official Link](https://agnipathvayu.cdac.in) |
| `icg-navik` | **Coast Guard Navik (GD / DB)** | Indian Coast Guard | government-recruitment | CLASS_10, CLASS_12 | Twice a year | [Official Link](https://joinindiancoastguard.cdac.in) |
| `aissee` | **AISSEE (Sainik School entrance)** | NTA | entrance | CLASS_10 | Annually | [Official Link](https://nta.ac.in) |
| `imu-cet` | **IMU CET** | Indian Maritime University | entrance | CLASS_12 | Annually | [Official Link](https://www.imu.edu.in) |
| `dgca-cpl` | **DGCA CPL exams + Class 1 medical** | Directorate General of Civil Aviation | professional | CLASS_12 | On demand | [Official Link](https://www.dgca.gov.in) |
| `gate` | **GATE** | IISc / IITs (organising institute rotates) | entrance | UG_ENGG, UG_OTHER | Annually (February) | [Official Link](null) |
| `cat` | **CAT** | IIMs | entrance | UG_ENGG, UG_OTHER, PROFESSIONAL | Annually (November) | [Official Link](https://iimcat.ac.in) |
| `xat` | **XAT** | XLRI | entrance | UG_ENGG, UG_OTHER | Annually (January) | [Official Link](https://xatonline.in) |
| `gmat` | **GMAT** | GMAC | entrance | UG_ENGG, UG_OTHER | On demand | [Official Link](https://www.mba.com) |
| `gre` | **GRE (+ TOEFL/IELTS)** | ETS | entrance | UG_ENGG, UG_OTHER | On demand | [Official Link](https://www.ets.org/gre) |
| `iit-jam` | **IIT JAM** | IITs / IISc (organising institute rotates) | entrance | UG_OTHER | Annually (February) | [Official Link](null) |
| `cuet-pg` | **CUET-PG** | NTA | entrance | UG_OTHER, UG_ENGG | Annually | [Official Link](https://nta.ac.in) |
| `nimcet` | **NIMCET** | NITs (rotating) | entrance | UG_OTHER | Annually | [Official Link](https://nimcet.admissions.nic.in) |
| `neet-pg` | **NEET-PG** | National Board of Examinations in Medical Sciences (NBEMS) | entrance | PROFESSIONAL | Annually | [Official Link](https://natboard.edu.in) |
| `neet-mds` | **NEET-MDS** | NBEMS | entrance | PROFESSIONAL | Annually | [Official Link](https://natboard.edu.in) |
| `gpat` | **GPAT** | NBEMS | entrance | PROFESSIONAL | Annually | [Official Link](https://natboard.edu.in) |
| `aiapget` | **AIAPGET** | NTA | entrance | PROFESSIONAL | Annually | [Official Link](https://nta.ac.in) |
| `icar-pg` | **ICAR AIEEA-PG / AICE-JRF/SRF** | NTA | entrance | UG_OTHER | Annually | [Official Link](https://nta.ac.in) |
| `gat-b` | **GAT-B** | NTA | entrance | UG_OTHER | Annually | [Official Link](https://nta.ac.in) |
| `ceed` | **CEED** | IIT Bombay | entrance | UG_OTHER | Annually | [Official Link](https://www.ceed.iitb.ac.in) |
| `clat-pg` | **CLAT PG** | Consortium of NLUs | entrance | PROFESSIONAL | Annually | [Official Link](https://consortiumofnlus.ac.in) |
| `aibe` | **AIBE (All India Bar Examination)** | Bar Council of India | professional | PROFESSIONAL | Twice a year | [Official Link](null) |
| `ugc-net` | **UGC NET / JRF** | NTA | eligibility-test | PG | Twice a year | [Official Link](https://nta.ac.in) |
| `csir-net` | **CSIR NET** | NTA | eligibility-test | PG | Twice a year | [Official Link](https://nta.ac.in) |

---

## 11. Contributor & Research Guide for Your Friend

This section is specially designed for your research partner or friend who wants to conduct deep analysis, verify details against state gazettes, and contribute additional data.

### What Can Your Friend Research & Add?
1. **Regional State Entrance Exams:** Additional state engineering or polytechnic CETs (e.g. OJEE, BCECE, GUJCET).
2. **New Emerging Engineering Specializations:** Space Tech, Semiconductor Fabrication, Quantum Computing.
3. **Niche Polytechnic & ITI Trades:** State-specific vocational trades.
4. **State Public Service Commission Exams:** KPSC KAS, MPSC, TNPSC, UPPSC exams.
5. **Verified College Placements:** Additional placement and recruiter statistics for tier-2/3 institutions.

### Where Are the Files in the Codebase?
* **Pathways (100 items):** [`src/data/careers/pathways.json`](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/data/careers/pathways.json)
* **Engineering Branches (29 items):** [`src/data/careers/engineeringBranches.json`](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/data/careers/engineeringBranches.json)
* **Entrance Exams (80 items):** [`src/data/careers/exams.json`](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/data/careers/exams.json)
* **Government Jobs (39 items):** [`src/data/careers/govtJobs.json`](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/data/careers/govtJobs.json)
* **Graduate Degrees (28 items):** [`src/data/careers/graduateCareers.json`](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/data/careers/graduateCareers.json)
* **455 Colleges Dataset:** [`src/data/colleges.json`](file:///c:/Users/moune/OneDrive/Desktop/edu-select/src/data/colleges.json)

### Schema Example: Adding a New Pathway
Your friend can simply open `src/data/careers/pathways.json` and append a new object to the `"items"` array:
```json
{
  "id": "p-semiconductor-tech",
  "level": "CLASS_12",
  "streams": ["PCM", "PCMC"],
  "category": "Engineering",
  "clusterIds": ["engineering-tech", "computing-ai"],
  "name": "B.Tech in Semiconductor Engineering & VLSI Design",
  "eligibility": "Class 12 with Physics, Mathematics, and Chemistry (min 60%)",
  "duration": "4 years",
  "durationYears": { "min": 4, "max": 4 },
  "isJob": false,
  "entranceExamIds": ["jee-main", "jee-advanced", "kcet"],
  "entranceRequired": true,
  "cost": {
    "basis": "perYear",
    "govt": [25000, 85000],
    "private": [150000, 350000],
    "note": "Tuition fees per year; hostel extra"
  },
  "keySubjects": ["VLSI Design", "Digital Electronics", "Semiconductor Physics", "Verilog/VHDL"],
  "nextSteps": ["M.Tech in Microelectronics", "GATE in ECE", "Semiconductor Fab Placements"],
  "outcomes": ["VLSI Design Engineer", "Silicon Validation Engineer", "FPGA Developer"],
  "riasec": ["R", "I"],
  "subjectsLiked": ["Mathematics", "Physics", "Electronics"],
  "sectors": ["PRIVATE", "PSU"],
  "outlook": "GROWING",
  "abroadFriendly": true,
  "isEstimate": true,
  "asOfYear": 2026
}
```

### Verification & Safety Command
After your friend makes any changes, run this command in terminal:
```bash
npm run verify:all
```
This script automatically checks relational foreign keys, validates counts, scans for errors, and confirms production readiness with 0 errors.
