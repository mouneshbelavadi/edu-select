'use client';

import React, { Suspense, useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { LevelCard } from '@/components/ui/LevelCard';
import { CareerCardComponent } from '@/components/features/CareerCard';
import { CareerChoicesBar } from '@/components/features/CareerChoicesBar';
import { CareerFilterPanel } from '@/components/features/CareerFilterPanel';
import { CareerCard as CareerCardType } from '@/types/careerData';
import {
  BookOpenIcon,
  GraduationCapIcon,
  WrenchIcon,
  CompassIcon,
  CpuIcon,
  BuildingLibraryIcon,
  ScaleIcon,
  MicroscopeIcon,
  SearchIcon,
  CheckIcon,
} from '@/components/ui/Icons';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 8 Journey Levels (Shared with Home Page)
const JOURNEY_LEVELS = [
  {
    slug: '10th',
    title: 'After 10th',
    description: 'Explore 11th/12th PUC streams, Polytechnic diplomas, and ITI trade certifications.',
    icon: BookOpenIcon,
  },
  {
    slug: '12th',
    title: 'After 12th / PUC',
    description: 'Find degree pathways across Science (PCM/PCB), Commerce, and Arts.',
    icon: GraduationCapIcon,
  },
  {
    slug: 'iti',
    title: 'ITI Graduate',
    description: 'Explore lateral diploma entry, CITS instructor training, and PSU technician roles.',
    icon: WrenchIcon,
  },
  {
    slug: 'diploma',
    title: 'Polytechnic Diploma',
    description: 'Lateral entry into 2nd year B.Tech, Junior Engineer exams, and technical careers.',
    icon: CompassIcon,
  },
  {
    slug: 'btech',
    title: 'B.Tech / B.E.',
    description: 'Core engineering careers, software roles, GATE for PSUs, and master’s programs.',
    icon: CpuIcon,
  },
  {
    slug: 'degree',
    title: 'General Degree',
    description: 'Postgraduate programs, banking exams, civil services, and corporate roles.',
    icon: BuildingLibraryIcon,
  },
  {
    slug: 'professional',
    title: 'Professional Degree',
    description: 'Specialised certifications, industry licensing, and advanced professional practice.',
    icon: ScaleIcon,
  },
  {
    slug: 'pg',
    title: 'Postgraduate',
    description: 'Doctoral research, academia, corporate R&D, and executive leadership paths.',
    icon: MicroscopeIcon,
  },
];

// Step 2 Options per level
const STEP_2_OPTIONS: Record<string, { heading: string; options: { id: string; label: string; desc: string; defaultSubjects?: string[] }[] }> = {
  '10th': {
    heading: 'What are you thinking of?',
    options: [
      { id: 'science', label: 'Science (11th / PUC)', desc: 'Prepares for engineering, medical, and scientific research.', defaultSubjects: ['Physics', 'Chemistry', 'Mathematics'] },
      { id: 'commerce', label: 'Commerce (11th / PUC)', desc: 'Prepares for accounting, business, finance, and economics.', defaultSubjects: ['Accountancy', 'Economics', 'Business Studies'] },
      { id: 'arts', label: 'Humanities / Arts (11th / PUC)', desc: 'Prepares for civil services, law, journalism, and humanities.', defaultSubjects: ['History', 'Political Science', 'English'] },
      { id: 'diploma', label: 'Polytechnic Diploma', desc: '3-year technical diploma with direct 2nd-year B.Tech entry.' },
      { id: 'iti', label: 'ITI Trade Course', desc: '1–2 year practical job-oriented trades for quick employment.' },
      { id: 'not_sure', label: 'Not sure / Exploring', desc: 'Browse all educational pathways eligible after 10th standard.' },
    ],
  },
  '12th': {
    heading: 'Which stream are you studying?',
    options: [
      { id: 'pcm', label: 'Science PCM', desc: 'Physics, Chemistry, and Mathematics.', defaultSubjects: ['Physics', 'Chemistry', 'Mathematics'] },
      { id: 'pcb', label: 'Science PCB', desc: 'Physics, Chemistry, and Biology.', defaultSubjects: ['Physics', 'Chemistry', 'Biology'] },
      { id: 'pcmb', label: 'Science PCMB', desc: 'Physics, Chemistry, Mathematics, and Biology.', defaultSubjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'] },
      { id: 'pcmc', label: 'Science PCMC', desc: 'Physics, Chemistry, Mathematics, and Computer Science.', defaultSubjects: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'] },
      { id: 'commerce_maths', label: 'Commerce with Maths', desc: 'Accounts, Economics, Business, and Mathematics.', defaultSubjects: ['Accountancy', 'Economics', 'Mathematics'] },
      { id: 'commerce_no_maths', label: 'Commerce without Maths', desc: 'Accounts, Business Studies, Economics, and Statistics.', defaultSubjects: ['Accountancy', 'Economics', 'Business Studies'] },
      { id: 'arts', label: 'Humanities / Arts', desc: 'History, Political Science, Psychology, and Literature.', defaultSubjects: ['History', 'Political Science', 'English'] },
      { id: 'vocational', label: 'Vocational / Other', desc: 'Applied technical or vocational higher secondary streams.' },
    ],
  },
  'iti': {
    heading: 'Which trade did you study?',
    options: [
      { id: 'electrician', label: 'Electrician', desc: 'Power supply, wiring, and industrial electrical systems.', defaultSubjects: ['Electrical', 'Physics'] },
      { id: 'fitter', label: 'Fitter', desc: 'Precision machine assembly, benchwork, and fabrication.', defaultSubjects: ['Mechanical'] },
      { id: 'welder', label: 'Welder', desc: 'Arc/TIG/MIG welding, structural fabrication, and inspection.' },
      { id: 'machinist', label: 'Machinist', desc: 'Lathe, milling, CNC machining, and tool making.' },
      { id: 'copa', label: 'COPA', desc: 'Computer Operator and Programming Assistant.', defaultSubjects: ['Computer Science'] },
      { id: 'electronics', label: 'Electronics Mechanic', desc: 'Circuits, PCB repair, and consumer electronics.', defaultSubjects: ['Electronics'] },
      { id: 'other', label: 'Other Approved Trade', desc: 'Other approved NCVT / SCVT technical craft trades.' },
    ],
  },
  'diploma': {
    heading: 'Which branch did you study?',
    options: [
      { id: 'cse', label: 'Computer Science (CSE)', desc: 'Software, web development, and lateral B.Tech entry.', defaultSubjects: ['Computer Science', 'Mathematics'] },
      { id: 'me', label: 'Mechanical Engineering', desc: 'Thermal, manufacturing, CAD, and Junior Engineer roles.', defaultSubjects: ['Mechanical', 'Mathematics'] },
      { id: 'ce', label: 'Civil Engineering', desc: 'Surveying, structures, construction, and public works.', defaultSubjects: ['Civil', 'Mathematics'] },
      { id: 'eee', label: 'Electrical & Electronics', desc: 'Power systems, machines, and state electricity boards.', defaultSubjects: ['Electrical', 'Mathematics'] },
      { id: 'ece', label: 'Electronics & Comm', desc: 'Telecommunications, embedded microcontrollers, and hardware.', defaultSubjects: ['Electronics', 'Mathematics'] },
      { id: 'automobile', label: 'Automobile Engineering', desc: 'Vehicle dynamics, engine testing, and service management.' },
      { id: 'other', label: 'Other Engineering Branch', desc: 'Chemical, mining, commercial practice, or allied branch.' },
    ],
  },
  'btech': {
    heading: 'Which branch are you in?',
    options: [
      { id: 'cse', label: 'Computer Science (CSE)', desc: 'Software engineering, systems, algorithms, and tech placements.', defaultSubjects: ['Computer Science', 'Mathematics'] },
      { id: 'ece', label: 'Electronics & Comm (ECE)', desc: 'VLSI, embedded hardware, wireless telecom, and GATE for PSUs.', defaultSubjects: ['Electronics', 'Mathematics'] },
      { id: 'me', label: 'Mechanical Engineering', desc: 'Core machinery, aerospace, robotics, and central PSUs via GATE.', defaultSubjects: ['Mechanical', 'Mathematics'] },
      { id: 'ce', label: 'Civil Engineering', desc: 'Structural engineering, infrastructure, and state PSC exams.', defaultSubjects: ['Civil', 'Mathematics'] },
      { id: 'eee', label: 'Electrical Engineering', desc: 'Power distribution, renewable energy, and public utilities.', defaultSubjects: ['Electrical', 'Mathematics'] },
      { id: 'ai', label: 'AI & Data Science', desc: 'Machine learning, analytics, and intelligent systems.', defaultSubjects: ['Computer Science', 'Mathematics'] },
      { id: 'other', label: 'Other Branch', desc: 'Biotechnology, Chemical, Aerospace, Metallurgy, etc.' },
    ],
  },
  'degree': {
    heading: 'Which degree are you pursuing?',
    options: [
      { id: 'bsc', label: 'B.Sc (Bachelor of Science)', desc: 'Physics, Chemistry, Maths, IT, Data, or Life Sciences.' },
      { id: 'bcom', label: 'B.Com (Bachelor of Commerce)', desc: 'Accounting, auditing, financial services, and corporate law.' },
      { id: 'bca', label: 'BCA (Computer Applications)', desc: 'Software development, databases, and IT roles.' },
      { id: 'bba', label: 'BBA (Business Administration)', desc: 'Corporate management, marketing, HR, and operations.' },
      { id: 'ba', label: 'B.A. (Bachelor of Arts)', desc: 'Literature, economics, civics, and civil service preparation.' },
      { id: 'other', label: 'Other Undergraduate Degree', desc: 'Other 3-year or 4-year general undergraduate programs.' },
    ],
  },
  'professional': {
    heading: 'Which professional degree?',
    options: [
      { id: 'mbbs', label: 'MBBS / BDS', desc: 'Clinical medicine, surgery, and hospital residencies.' },
      { id: 'law', label: 'Law (LLB / B.A. LLB)', desc: 'Judiciary, corporate advisory, arbitration, and litigation.' },
      { id: 'pharmacy', label: 'Pharmacy (B.Pharm / Pharm.D)', desc: 'Clinical trials, drug regulation, and pharmaceutical firms.' },
      { id: 'architecture', label: 'Architecture (B.Arch)', desc: 'Urban planning, sustainable building design, and landscape.' },
      { id: 'ca', label: 'CA / CS / CMA', desc: 'Chartered accountancy, statutory auditing, and taxation.' },
      { id: 'other', label: 'Other Professional Degree', desc: 'Design (B.Des), hotel management, or specialized fields.' },
    ],
  },
  'pg': {
    heading: 'Which postgraduate field?',
    options: [
      { id: 'mtech', label: 'M.Tech / M.E.', desc: 'Advanced engineering specialization and doctoral research.' },
      { id: 'mba', label: 'MBA / PGDM', desc: 'Corporate leadership, product management, and consulting.' },
      { id: 'msc', label: 'M.Sc / Pure Sciences', desc: 'Research fellowships, laboratory analysis, and analytics.' },
      { id: 'mca', label: 'MCA (Computer Applications)', desc: 'Advanced enterprise software engineering and systems.' },
      { id: 'other', label: 'Other Master’s / Ph.D', desc: 'Other master’s degrees or doctoral programs.' },
    ],
  },
};

// Step 3 Part A: Work Styles (RIASEC in plain English)
const WORK_STYLES = [
  { code: 'R', title: 'Hands-on', description: 'I like tools, machines and practical work.' },
  { code: 'I', title: 'Thinking', description: 'I like research, science and solving problems.' },
  { code: 'A', title: 'Creative', description: 'I like design, writing and new ideas.' },
  { code: 'S', title: 'Helping', description: 'I like teaching, caring and working with people.' },
  { code: 'E', title: 'Leading', description: 'I like business, leadership and persuading.' },
  { code: 'C', title: 'Organised', description: 'I like data, rules, planning and accounts.' },
];

// Step 3 Part B: Subjects
const SUBJECT_OPTIONS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Computer Science',
  'Biology',
  'Economics',
  'Accountancy',
  'English',
  'Mechanical',
  'Civil',
  'Electronics',
  'Electrical',
  'History',
  'Political Science',
  'Business Studies',
];

function CareersExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read state from URL
  const paramLevel = searchParams.get('level') || '';
  const paramStream = searchParams.get('stream') || '';
  const paramInterests = useMemo(() => searchParams.get('interests')?.split(',').filter(Boolean) || [], [searchParams]);
  const paramSubjects = useMemo(() => searchParams.get('subjects')?.split(',').filter(Boolean) || [], [searchParams]);
  const paramKind = searchParams.get('kind') || '';
  const paramOutlook = searchParams.get('outlook') || '';
  const paramBudget = searchParams.get('budget') || '';
  const paramEntrance = searchParams.get('entrance') || '';
  const paramAbroad = searchParams.get('abroad') === 'true';
  const paramSearch = searchParams.get('q') || '';
  const paramSort = searchParams.get('sort') || 'relevance';
  const paramPage = parseInt(searchParams.get('page') || '1', 10);
  const paramStep = searchParams.get('step');

  // Wizard active step state (1, 2, or 3)
  const [activeStep, setActiveStep] = useState<number>(() => {
    if (paramStep === '3') return 3;
    if (paramLevel && paramStream) return 3;
    if (paramLevel) return 2;
    return 1;
  });

  // Local search input
  const [searchInput, setSearchInput] = useState(paramSearch);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  // Sync param search input
  useEffect(() => {
    setSearchInput(paramSearch);
  }, [paramSearch]);

  // Adjust active step if level changes via URL
  useEffect(() => {
    if (paramStep === '3') {
      setActiveStep(3);
    } else if (paramLevel && !paramStream && activeStep === 1) {
      setActiveStep(2);
    }
  }, [paramLevel, paramStream, paramStep, activeStep]);

  // Helper to update query string cleanly
  const updateUrl = (updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    if (!('page' in updates)) {
      params.delete('page');
    }

    router.push(`/careers?${params.toString()}`, { scroll: false });
  };

  // Build SWR query string
  const swrQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (paramLevel) params.set('level', paramLevel);
    if (paramStream) params.set('stream', paramStream);
    if (paramKind) params.set('kind', paramKind);
    if (paramOutlook) params.set('outlook', paramOutlook);
    if (paramBudget) params.set('budget', paramBudget);
    if (paramEntrance) params.set('entrance', paramEntrance);
    if (paramAbroad) params.set('abroad', 'true');
    if (paramSearch) params.set('q', paramSearch);
    if (paramInterests.length) params.set('riasec', paramInterests.join(','));
    if (paramSubjects.length) params.set('subjects', paramSubjects.join(','));
    params.set('sort', paramSort);
    params.set('page', paramPage.toString());
    params.set('limit', '18');
    return params.toString();
  }, [
    paramLevel, paramStream, paramKind, paramOutlook, paramBudget,
    paramEntrance, paramAbroad, paramSearch, paramInterests,
    paramSubjects, paramSort, paramPage
  ]);

  // Fetch career results
  const { data: careersRes, isLoading } = useSWR(
    paramLevel ? `/api/careers?${swrQuery}` : null,
    fetcher,
    { keepPreviousData: true }
  );

  const careers: CareerCardType[] = careersRes?.data?.items || [];
  const totalCount: number = careersRes?.data?.total || 0;

  // Level Selection Handler
  const handleSelectLevel = (slug: string) => {
    if (paramLevel === slug) {
      // Toggle collapse or remain
      setActiveStep(2);
      return;
    }
    updateUrl({
      level: slug,
      stream: null,
      subjects: null,
      interests: null,
    });
    setActiveStep(2);
  };

  // Stream Selection Handler
  const handleSelectStream = (streamId: string) => {
    const streamConfig = STEP_2_OPTIONS[paramLevel]?.options.find((o) => o.id === streamId);
    const defaultSubjs = streamConfig?.defaultSubjects || [];

    updateUrl({
      stream: streamId,
      subjects: defaultSubjs.length ? defaultSubjs.join(',') : paramSubjects.join(',') || null,
    });
    setActiveStep(3);
  };

  // Interest (Work Style) Toggle
  const handleToggleInterest = (code: string) => {
    const next = paramInterests.includes(code)
      ? paramInterests.filter((c) => c !== code)
      : [...paramInterests, code];
    updateUrl({ interests: next.length ? next.join(',') : null });
  };

  // Subject Toggle
  const handleToggleSubject = (subj: string) => {
    const next = paramSubjects.includes(subj)
      ? paramSubjects.filter((s) => s !== subj)
      : [...paramSubjects, subj];
    updateUrl({ subjects: next.length ? next.join(',') : null });
  };

  // Reset/Start Over
  const handleStartOver = () => {
    setSearchInput('');
    setActiveStep(1);
    router.push('/careers');
  };

  // Scroll to results
  const handleSeeCareers = () => {
    resultsHeadingRef.current?.scrollIntoView({ behavior: 'smooth' });
    resultsHeadingRef.current?.focus();
  };

  // Labels for Choices Bar
  const selectedLevelConfig = JOURNEY_LEVELS.find((l) => l.slug === paramLevel);
  const selectedStreamConfig = STEP_2_OPTIONS[paramLevel]?.options.find((s) => s.id === paramStream);
  const selectedInterestsLabels = paramInterests.map((c) => WORK_STYLES.find((w) => w.code === c)?.title || c);

  return (
    <div className="w-full min-h-screen bg-white text-[#0F172A]">
      {/* 1. PAGE HEADER */}
      <section className="border-b border-[#E2E8F0] pt-6 pb-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[#64748B]">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-[#1D4ED8] transition-colors focus-visible:outline-2 focus-visible:outline-[#1D4ED8] rounded">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-[#CBD5E1]">›</li>
              <li className="font-semibold text-[#0F172A]" aria-current="page">Careers</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
            Find careers that fit you
          </h1>
          <p className="mt-2 text-base text-[#475569] leading-relaxed max-w-2xl">
            Answer a few questions and see options, costs, exams and job outlook.
          </p>

          {/* 3-SEGMENT STEP PROGRESS BAR */}
          <div className="mt-8 border border-[#E2E8F0] rounded-[10px] p-2 bg-[#F8FAFC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2" role="navigation" aria-label="Wizard Steps">
            {[
              { num: 1, title: '1. Your level', isCompleted: Boolean(paramLevel), isActive: activeStep === 1 },
              { num: 2, title: '2. Your stream or goal', isCompleted: Boolean(paramStream), isActive: activeStep === 2 },
              { num: 3, title: '3. Your interests (optional)', isCompleted: paramInterests.length > 0 || paramSubjects.length > 0, isActive: activeStep === 3 },
            ].map((step) => (
              <button
                key={step.num}
                type="button"
                onClick={() => {
                  if (step.num === 1) setActiveStep(1);
                  if (step.num === 2 && paramLevel) setActiveStep(2);
                  if (step.num === 3 && paramLevel) setActiveStep(3);
                }}
                disabled={step.num > 1 && !paramLevel}
                className={`flex-1 py-2.5 px-3 rounded-[8px] text-xs sm:text-sm font-semibold text-left sm:text-center transition-all flex items-center justify-between sm:justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                  step.isActive
                    ? 'bg-white text-[#1D4ED8] border border-blue-200 shadow-xs font-bold'
                    : step.isCompleted
                    ? 'text-[#0F172A] hover:bg-white'
                    : 'text-[#64748B]'
                }`}
              >
                <span>{step.title}</span>
                {step.isCompleted && !step.isActive && (
                  <span className="text-[11px] text-[#1D4ED8] font-bold underline sm:ml-1">Edit</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. STICKY YOUR CHOICES BAR */}
      <CareerChoicesBar
        levelLabel={selectedLevelConfig?.title}
        streamLabel={selectedStreamConfig?.label}
        interestsLabels={selectedInterestsLabels}
        subjectsLabels={paramSubjects}
        onRemoveLevel={() => {
          updateUrl({ level: null, stream: null, subjects: null, interests: null });
          setActiveStep(1);
        }}
        onRemoveStream={() => {
          updateUrl({ stream: null });
          setActiveStep(2);
        }}
        onRemoveInterest={(name) => {
          const item = WORK_STYLES.find((w) => w.title === name);
          if (item) handleToggleInterest(item.code);
        }}
        onRemoveSubject={(subj) => handleToggleSubject(subj)}
        onStartOver={handleStartOver}
      />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 flex flex-col gap-12">
        {/* STEP 1: "Where are you right now?" */}
        {activeStep === 1 && (
          <section className="flex flex-col gap-6" aria-labelledby="step-1-heading">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">Step 1</span>
                <h2 id="step-1-heading" className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                  Where are you right now?
                </h2>
              </div>
              <span className="text-xs text-[#64748B]">Select one level to proceed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {JOURNEY_LEVELS.map((level) => (
                <LevelCard
                  key={level.slug}
                  slug={level.slug}
                  title={level.title}
                  description={level.description}
                  icon={level.icon}
                  isSelected={paramLevel === level.slug}
                  onClick={() => handleSelectLevel(level.slug)}
                />
              ))}
            </div>
          </section>
        )}

        {/* STEP 2: Stream or Goal */}
        {activeStep === 2 && paramLevel && STEP_2_OPTIONS[paramLevel] && (
          <section className="flex flex-col gap-6" aria-labelledby="step-2-heading">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                  Step 2 · {selectedLevelConfig?.title}
                </span>
                <h2 id="step-2-heading" className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                  {STEP_2_OPTIONS[paramLevel].heading}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="text-xs font-semibold text-[#1D4ED8] hover:underline"
              >
                Change level
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {STEP_2_OPTIONS[paramLevel].options.map((opt) => {
                const isSelected = paramStream === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectStream(opt.id)}
                    className={`p-4 rounded-[12px] border text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#1D4ED8] ${
                      isSelected
                        ? 'bg-blue-50/40 border-2 border-[#1D4ED8] shadow-xs'
                        : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${isSelected ? 'text-[#1D4ED8]' : 'text-[#0F172A]'}`}>
                        {opt.label}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center shrink-0">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[#475569] leading-relaxed">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm rounded-[8px] transition-colors focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
              >
                Next: Choose interests (optional)
              </button>
              <button
                type="button"
                onClick={handleSeeCareers}
                className="px-4 py-2.5 text-sm font-semibold text-[#475569] hover:text-[#0F172A] rounded-[8px]"
              >
                Skip to results
              </button>
            </div>
          </section>
        )}

        {/* STEP 3 (OPTIONAL): "What do you enjoy?" */}
        {activeStep === 3 && (
          <section className="flex flex-col gap-8 bg-[#F8FAFC] p-6 sm:p-8 rounded-[12px] border border-[#E2E8F0]" aria-labelledby="step-3-heading">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">Step 3 (Optional)</span>
                <h2 id="step-3-heading" className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                  What do you enjoy?
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSeeCareers}
                  className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] underline"
                >
                  Skip this step
                </button>
                <button
                  type="button"
                  onClick={handleSeeCareers}
                  className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-[8px] transition-colors"
                >
                  See my careers
                </button>
              </div>
            </div>

            {/* Part A: Work Style */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-[#0F172A]">
                Part A: Work styles you prefer
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {WORK_STYLES.map((ws) => {
                  const isChecked = paramInterests.includes(ws.code);
                  return (
                    <button
                      key={ws.code}
                      type="button"
                      onClick={() => handleToggleInterest(ws.code)}
                      className={`p-3.5 rounded-[10px] border text-left transition-all ${
                        isChecked
                          ? 'bg-blue-50/50 border-[#1D4ED8] shadow-xs'
                          : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isChecked ? 'text-[#1D4ED8]' : 'text-[#0F172A]'}`}>
                          {ws.title}
                        </span>
                        {isChecked && (
                          <span className="w-4 h-4 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center shrink-0">
                            <CheckIcon className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[#475569] leading-relaxed">
                        {ws.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Part B: Subjects I like */}
            <div className="flex flex-col gap-3 pt-4 border-t border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#0F172A]">
                Part B: Subjects and topics you like
              </h3>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_OPTIONS.map((subj) => {
                  const isChecked = paramSubjects.includes(subj);
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => handleToggleSubject(subj)}
                      className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all border ${
                        isChecked
                          ? 'bg-teal-50 text-[#0D9488] border-teal-300 font-bold'
                          : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-slate-300'
                      }`}
                    >
                      {isChecked ? `✓ ${subj}` : `+ ${subj}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSeeCareers}
                className="px-6 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm rounded-[8px] transition-colors focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
              >
                See my careers
              </button>
            </div>
          </section>
        )}

        {/* 3. RESULTS SECTION (Appears once Step 1 is chosen) */}
        {paramLevel ? (
          <section className="flex flex-col gap-6 pt-4 border-t border-[#E2E8F0]" aria-labelledby="results-heading">
            {/* Header: Title, Live Count, Search & Sort */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2
                  id="results-heading"
                  ref={resultsHeadingRef}
                  tabIndex={-1}
                  className="text-2xl font-bold tracking-tight text-[#0F172A] focus:outline-none"
                >
                  Careers for you
                </h2>
                <p className="text-sm text-[#475569] mt-0.5">
                  Showing {careers.length} of {totalCount} matching career options
                </p>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Search Box */}
                <div className="relative flex-1 sm:w-64">
                  <SearchIcon className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      updateUrl({ q: e.target.value || null });
                    }}
                    placeholder="Search titles..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-[8px] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                </div>

                {/* Sort Dropdown */}
                <select
                  value={paramSort}
                  onChange={(e) => updateUrl({ sort: e.target.value })}
                  className="px-3 py-2 bg-white border border-[#E2E8F0] rounded-[8px] text-sm text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                >
                  <option value="relevance">Best match</option>
                  <option value="cost_asc">Lowest cost</option>
                  <option value="salary_desc">Highest starting salary</option>
                  <option value="duration_asc">Shortest duration</option>
                </select>

                {/* Mobile Filters Drawer Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="md:hidden px-3 py-2 bg-white border border-[#E2E8F0] rounded-[8px] text-sm font-semibold text-[#0F172A] flex items-center gap-1.5"
                >
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] overflow-x-auto pb-1 text-sm font-semibold">
              {[
                { id: '', label: 'All' },
                { id: 'pathway', label: 'Courses' },
                { id: 'branch', label: 'Engineering Branches' },
                { id: 'degree', label: 'Degrees and Roles' },
                { id: 'govtJob', label: 'Government Jobs' },
              ].map((tab) => {
                const isActive = paramKind === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => updateUrl({ kind: tab.id || null })}
                    className={`px-3.5 py-2 border-b-2 whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-[#1D4ED8] text-[#1D4ED8] font-bold'
                        : 'border-transparent text-[#475569] hover:text-[#0F172A]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Workspace: Left Filters + Right Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Desktop Filters Sidebar */}
              <div className="hidden md:block md:col-span-4 lg:col-span-3">
                <CareerFilterPanel
                  outlook={paramOutlook}
                  onOutlookChange={(val) => updateUrl({ outlook: val || null })}
                  budget={paramBudget}
                  onBudgetChange={(val) => updateUrl({ budget: val || null })}
                  abroad={paramAbroad}
                  onAbroadChange={(val) => updateUrl({ abroad: val ? 'true' : null })}
                  entrance={paramEntrance}
                  onEntranceChange={(val) => updateUrl({ entrance: val || null })}
                  onClearAll={() =>
                    updateUrl({
                      outlook: null,
                      budget: null,
                      entrance: null,
                      abroad: null,
                      q: null,
                    })
                  }
                />
              </div>

              {/* Right Side: Career Cards Grid */}
              <div className="col-span-1 md:col-span-8 lg:col-span-9 flex flex-col gap-6">
                {isLoading ? (
                  /* Loading Skeletons */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="h-64 rounded-[12px] bg-slate-100 animate-pulse border border-[#E2E8F0]" />
                    ))}
                  </div>
                ) : careers.length === 0 ? (
                  /* Empty State */
                  <div className="p-12 text-center bg-white rounded-[12px] border border-[#E2E8F0] flex flex-col items-center gap-3">
                    <p className="text-base font-bold text-[#0F172A]">No careers match these filters.</p>
                    <p className="text-sm text-[#475569] max-w-sm">
                      Try removing some filters or expanding your stream options to view eligible career pathways.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        updateUrl({
                          outlook: null,
                          budget: null,
                          entrance: null,
                          abroad: null,
                          q: null,
                        })
                      }
                      className="mt-2 px-4 py-2 bg-[#1D4ED8] text-white text-xs font-semibold rounded-[8px] hover:bg-[#1E40AF]"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  /* 3-Column Responsive Grid with Equal Height */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {careers.map((card) => (
                      <CareerCardComponent
                        key={`${card.kind}-${card.id}`}
                        card={card}
                        selectedSubjects={paramSubjects}
                        selectedInterests={paramInterests}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          /* User has not finished Step 1 */
          <div className="p-8 text-center text-sm text-[#64748B] border border-dashed border-[#E2E8F0] rounded-[12px]">
            Please select where you are right now in Step 1 above to view personalized career roadmaps.
          </div>
        )}

        {/* Footer Note */}
        <div className="pt-6 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
          Information is collected from official websites. Always verify on the official site before applying.
        </div>
      </main>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <CareerFilterPanel
          outlook={paramOutlook}
          onOutlookChange={(val) => updateUrl({ outlook: val || null })}
          budget={paramBudget}
          onBudgetChange={(val) => updateUrl({ budget: val || null })}
          abroad={paramAbroad}
          onAbroadChange={(val) => updateUrl({ abroad: val ? 'true' : null })}
          entrance={paramEntrance}
          onEntranceChange={(val) => updateUrl({ entrance: val || null })}
          onClearAll={() =>
            updateUrl({
              outlook: null,
              budget: null,
              entrance: null,
              abroad: null,
              q: null,
            })
          }
          isMobileDrawer
          onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
        />
      )}
    </div>
  );
}

export default function CareersPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
          <div className="h-10 w-64 bg-slate-100 rounded-[8px] animate-pulse mb-4" />
          <div className="h-4 w-96 bg-slate-100 rounded-[8px] animate-pulse" />
        </div>
      }
    >
      <CareersExplorerContent />
    </Suspense>
  );
}
