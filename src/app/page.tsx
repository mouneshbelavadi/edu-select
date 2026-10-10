import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import collegesData from '@/data/colleges.json';
import pathwaysData from '@/data/careers/pathways.json';
import branchesData from '@/data/careers/engineeringBranches.json';
import graduateCareersData from '@/data/careers/graduateCareers.json';
import examsData from '@/data/careers/exams.json';
import govtJobsData from '@/data/careers/govtJobs.json';
import clustersData from '@/data/careers/careerClusters.json';
import { HomeLevelCard } from '@/components/home/HomeLevelCard';
import { OpenAiDrawerButton } from '@/components/home/HomeAiDrawer';
import { CollegeCard, CollegeCardData } from '@/components/features/CollegeCard';
import { CheckIcon } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: 'EduSelect — Educational Guidance & Career Roadmaps for Indian Students',
  description:
    'Start from where you are — 10th, 12th/PU, ITI, diploma, engineering or any degree — and see every path, entrance exam and job it leads to. Built on NIRF 2025, JoSAA and official notices.',
  openGraph: {
    title: 'EduSelect — Educational Guidance & Career Roadmaps for Indian Students',
    description:
      'Step-by-step career roadmaps, entrance exams, accredited colleges, and government jobs for Indian students and parents.',
    type: 'website',
  },
};

// 8 Level Cards Configuration
const LEVEL_CARDS = [
  {
    slug: '10th',
    title: 'After 10th',
    description: 'Explore 11th/12th PUC streams, polytechnic diplomas and ITI trade certifications.',
    imageSrc: '/images/home/level-10th.webp',
    altText: 'Indian student studying at a wooden desk at home with textbooks and geometry box',
  },
  {
    slug: '12th',
    title: 'After 12th / PUC',
    description: 'Find degree pathways across science (PCM/PCB), commerce and humanities.',
    imageSrc: '/images/home/level-12th.webp',
    altText: 'Pre-university students walking in a sunlit college corridor carrying academic files',
  },
  {
    slug: 'iti',
    title: 'ITI graduate',
    description: 'Explore lateral diploma entry, CITS instructor training and PSU technician roles.',
    imageSrc: '/images/home/level-iti.webp',
    altText: 'Student wiring an electrical panel in a clean training workshop',
  },
  {
    slug: 'diploma',
    title: 'Polytechnic diploma',
    description: 'Lateral entry into 2nd-year B.Tech, junior engineer exams and technical careers.',
    imageSrc: '/images/home/level-diploma.webp',
    altText: 'Polytechnic students measuring a machined component with a vernier caliper in a lab',
  },
  {
    slug: 'btech',
    title: 'B.Tech / B.E.',
    description: 'Core engineering careers, software roles, GATE for PSUs and master’s programs.',
    imageSrc: '/images/home/level-btech.webp',
    altText: 'Engineering students assembling a robotics circuit board in a modern lab',
  },
  {
    slug: 'degree',
    title: 'General degree',
    description: 'Postgraduate programs, banking exams, civil services and corporate roles.',
    imageSrc: '/images/home/level-degree.webp',
    altText: 'College students studying and taking notes with a laptop in a bright library',
  },
  {
    slug: 'professional',
    title: 'Professional degree',
    description: 'Specialised certifications, clinical training and industry licensing.',
    imageSrc: '/images/home/level-professional.webp',
    altText: 'Nursing student in scrubs practising a blood-pressure check in a skills lab',
  },
  {
    slug: 'pg',
    title: 'Postgraduate',
    description: 'Doctoral research, academia, corporate R&D and executive leadership paths.',
    imageSrc: '/images/home/level-pg.webp',
    altText: 'Postgraduate researcher in a lab coat examining samples under an optical microscope',
  },
];

// Timeline steps for Section D
const HOW_IT_WORKS_STEPS = [
  {
    step: '1',
    title: 'Pick your level',
    description: 'Select your current qualification — from 10th standard to post-graduation — to see eligible pathways.',
  },
  {
    step: '2',
    title: 'Compare paths and exams',
    description: 'Examine career trajectories, national and state entrance tests, and realistic timelines side by side.',
  },
  {
    step: '3',
    title: 'Get a year-by-year roadmap',
    description: 'Follow structured semester milestones covering essential skills, practical projects, and certifications.',
  },
  {
    step: '4',
    title: 'Shortlist colleges',
    description: 'Filter accredited institutions by NIRF 2025 ranking, estimated fees, and available branches.',
  },
];

export default function HomePage() {
  // Compute real data numbers dynamically at build time
  const totalColleges = collegesData.length;
  const totalCareerPaths = pathwaysData.items.length + branchesData.items.length + graduateCareersData.items.length;
  const govtExamsCount = examsData.items.filter(
    (e) => e.type === 'government-recruitment'
  ).length;

  // Compute item counts for the 8 clusters
  const allCareerItems = [
    ...pathwaysData.items,
    ...branchesData.items,
    ...graduateCareersData.items,
    ...govtJobsData.items,
  ];

  const getClusterCount = (clusterId: string) => {
    return allCareerItems.filter((item) => {
      if (item.clusterIds && Array.isArray(item.clusterIds)) {
        return item.clusterIds.includes(clusterId);
      }
      if ((item as any).clusterId === clusterId) return true;
      return false;
    }).length;
  };

  // 8 Cluster cards config
  const clusterCards = [
    {
      id: 'computing-ai',
      name: 'Computer Science, AI & Data',
      imageSrc: '/images/home/cluster-computing.webp',
      altText: 'Software engineer at dual monitors in a modern office with indoor plants',
      count: getClusterCount('computing-ai'),
      isLarge: true,
    },
    {
      id: 'medicine-health',
      name: 'Medicine & Healthcare',
      imageSrc: '/images/home/cluster-medicine.webp',
      altText: 'Doctor in white coat and stethoscope standing calmly in a hospital corridor',
      count: getClusterCount('medicine-health'),
      isLarge: true,
    },
    {
      id: 'engineering-tech',
      name: 'Engineering & Technology',
      imageSrc: '/images/home/cluster-engineering.webp',
      altText: 'Woman civil engineer in hard hat checking blueprints on a tablet at sunset',
      count: getClusterCount('engineering-tech'),
      isLarge: false,
    },
    {
      id: 'commerce-finance',
      name: 'Commerce & Finance',
      imageSrc: '/images/home/cluster-commerce.webp',
      altText: 'Finance professional reviewing financial charts on a laptop in a glass conference room',
      count: getClusterCount('commerce-finance'),
      isLarge: false,
    },
    {
      id: 'law',
      name: 'Law & Judiciary',
      imageSrc: '/images/home/cluster-law.webp',
      altText: 'Lawyer in black coat and white bands on outdoor stone steps holding case files',
      count: getClusterCount('law'),
      isLarge: false,
    },
    {
      id: 'design-creative',
      name: 'Design, Arts & Creative',
      imageSrc: '/images/home/cluster-design.webp',
      altText: 'Designer sketching with colour pencils at a desk with fabric swatches',
      count: getClusterCount('design-creative'),
      isLarge: false,
    },
    {
      id: 'defence-uniformed',
      name: 'Defence & Uniformed Services',
      imageSrc: '/images/home/cluster-defence.webp',
      altText: 'Cadets in plain olive training gear jogging on an open athletic track at dawn',
      count: getClusterCount('defence-uniformed'),
      isLarge: false,
    },
    {
      id: 'government-civil',
      name: 'Civil Services & Government',
      imageSrc: '/images/home/cluster-government.webp',
      altText: 'Civil services aspirant studying with newspapers and notebooks in a library',
      count: getClusterCount('government-civil'),
      isLarge: false,
    },
  ];

  // Top NIRF 2025 Colleges
  const topColleges: CollegeCardData[] = (collegesData as any[])
    .filter((c) => c.nirfRank2025 !== null && c.nirfRank2025 !== undefined && !isNaN(c.nirfRank2025))
    .sort((a, b) => (a.nirfRank2025 || 999) - (b.nirfRank2025 || 999))
    .slice(0, 4)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug || c.id,
      city: c.city,
      state: c.state,
      type: c.type,
      typeDetail: c.typeDetail,
      established: c.established,
      fees: c.fees,
      feesDisplay: c.feesDisplay,
      feesIsEstimate: c.feesIsEstimate,
      rating: c.rating,
      ratingDisplay: c.ratingDisplay,
      nirfRank2025: c.nirfRank2025,
      nirfBand2025: c.nirfBand2025,
      imageUrl: c.imageUrl,
    }));

  return (
    <div className="w-full bg-white text-slate selection:bg-marigold/30 selection:text-ink-900">
      {/* ━━ SECTION A: HERO ━━ */}
      <section className="bg-white pt-10 pb-16 sm:pt-14 sm:pb-24 border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline, Subtext, Buttons & Real Computed Numbers */}
            <div className="hero-seq-1 lg:col-span-6 flex flex-col items-start">
              <h1 className="font-fraunces text-[38px] sm:text-[46px] lg:text-[60px] font-bold text-ink-900 tracking-[-0.02em] leading-[1.10]">
                Find the course, the college and the career that fit you.
              </h1>
              <p className="mt-5 text-[17px] leading-[1.6] text-slate max-w-[70ch]">
                Start from where you are — 10th, 12th/PU, ITI, diploma, engineering or any degree — and see every path,
                entrance exam and job it leads to.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#levels"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-[12px] bg-ink hover:bg-ink-900 text-white font-semibold text-sm sm:text-base transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Choose your level
                </a>

                <OpenAiDrawerButton
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-[12px] border-2 border-ink text-ink hover:bg-blue-50/60 font-semibold text-sm sm:text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink cursor-pointer"
                >
                  Ask the AI counsellor
                </OpenAiDrawerButton>
              </div>

              {/* Direct Quick Access for Karnataka Directories */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-ink-900 mr-1">Quick Access:</span>
                <Link
                  href="/puc-colleges"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors shadow-2xs"
                >
                  <span>🏛️ Karnataka PUC Colleges (6,400+)</span>
                </Link>
                <Link
                  href="/kcet-2026-predictor"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors shadow-2xs"
                >
                  <span>⚡ KCET 2026 Predictor</span>
                </Link>
                <Link
                  href="/medical-allied-health"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors shadow-2xs"
                >
                  <span>🩺 Medical & Allied Seats (788)</span>
                </Link>
              </div>

              {/* Real Numbers Computed at Build Time */}
              <p className="mt-6 text-xs sm:text-sm text-[#475569] font-medium flex items-center gap-2 flex-wrap">
                <span>{totalColleges} engineering colleges</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span>{totalCareerPaths} career paths</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span>{govtExamsCount} government exams</span>
              </p>
            </div>

            {/* Right Column: Hero Photo with Roadmap Preview Card Below (No Overlapping) */}
            <div className="lg:col-span-6 w-full flex flex-col gap-5">
              {/* Hero Photo Frame */}
              <div className="hero-seq-2 relative aspect-[16/10] w-full rounded-[20px] overflow-hidden bg-slate-100 border border-[#E2E8F0] shadow-sm">
                <Image
                  src="/images/home/hero-students.webp"
                  alt="Three Indian college students smiling and reviewing career pathways on a laptop together on college steps"
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 600px"
                  className="object-cover object-[65%_35%]"
                />
              </div>

              {/* Roadmap Preview Card (Cleanly Positioned Below Photo) */}
              <div className="hero-seq-3 w-full bg-white rounded-[12px] border border-[#E2E8F0] shadow-soft-ink p-4 sm:p-5">
                {/* Bar Header */}
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-ink" />
                    <span className="text-xs font-bold text-ink-900 tracking-wide">
                      Roadmap preview
                    </span>
                  </div>
                  <span className="text-xs text-[#475569] font-medium">4-Year progression</span>
                </div>

                <div className="mb-3">
                  <span className="text-xs font-semibold text-ink">Class 12th PCM pathway</span>
                  <h2 className="text-sm font-bold text-ink-900">B.Tech in Computer Science</h2>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-[8px] bg-paper border border-[#E2E8F0]">
                    <div className="w-5 h-5 rounded-full bg-ink text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-ink-900">Year 1 · Foundation & entrance</span>
                      <p className="text-[#475569] text-[11px] mt-0.5">
                        Calculus, programming fundamentals, and entrance qualifications (JEE / KCET).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-[8px] bg-paper border border-[#E2E8F0]">
                    <div className="w-5 h-5 rounded-full bg-ink text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-ink-900">Years 2–3 · Core competencies</span>
                      <p className="text-[#475569] text-[11px] mt-0.5">
                        Data structures, algorithms, systems, and summer internship.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-[8px] bg-paper border border-[#E2E8F0]">
                    <div className="w-5 h-5 rounded-full bg-ink text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-ink-900">Year 4 · Placements & GATE</span>
                      <p className="text-[#475569] text-[11px] mt-0.5">
                        Campus recruitment drives, PSU tests, or postgraduate applications.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-[8px] bg-paper border border-[#E2E8F0]">
                    <div className="w-5 h-5 rounded-full bg-leaf text-white flex items-center justify-center shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-ink-900">Career outcome</span>
                      <p className="text-[#475569] text-[11px] mt-0.5">
                        Software development engineer or PSU technical officer.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] text-center">
                  <span className="text-[11px] text-[#475569]">
                    Built from NIRF 2025, JoSAA and official exam notices
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ SECTION B: "WHERE ARE YOU RIGHT NOW?" ━━ */}
      <section id="levels" className="bg-paper py-16 sm:py-24 scroll-mt-16 border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-fraunces text-[28px] sm:text-[36px] font-bold text-ink-900 tracking-[-0.02em]">
              Where are you right now?
            </h2>
            <p className="mt-3 text-[17px] leading-[1.6] text-slate">
              Select your current education level to view practical roadmaps, degrees, entrance tests, and career
              outcomes.
            </p>
          </div>

          {/* 8 Level Cards in 4x2 Grid (2 columns on mobile) */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {LEVEL_CARDS.map((card) => (
              <HomeLevelCard
                key={card.slug}
                slug={card.slug}
                title={card.title}
                description={card.description}
                imageSrc={card.imageSrc}
                altText={card.altText}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ━━ SECTION C: "EXPLORE BY CAREER" (BENTO GRID) ━━ */}
      <section className="bg-white py-16 sm:py-24 border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="font-fraunces text-[28px] sm:text-[36px] font-bold text-ink-900 tracking-[-0.02em]">
                Explore by career
              </h2>
              <p className="mt-3 text-[17px] leading-[1.6] text-slate">
                Discover distinct professional industries and learn what qualifications and exams lead to each field.
              </p>
            </div>
            <Link
              href="/careers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-ink-900 transition-colors shrink-0"
            >
              <span>View all career areas</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Bento Grid: Computing & Medicine large, 6 standard, 9th tile all areas */}
          <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[190px] gap-4 sm:gap-6">
            {/* 1. Computing (Large: 2 cols x 2 rows) */}
            <Link
              href="/careers?cluster=computing-ai"
              className="group relative rounded-[20px] overflow-hidden border border-[#E2E8F0] hover:border-ink transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ink col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-2 aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto"
            >
              <Image
                src={clusterCards[0].imageSrc}
                alt={clusterCards[0].altText}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 600px"
                className="object-cover group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-col justify-end text-white z-10">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white">
                    {clusterCards[0].count} options
                  </span>
                  <span className="text-white/80 group-hover:translate-x-1 transition-transform text-sm" aria-hidden="true">
                    →
                  </span>
                </div>
                <h3 className="font-fraunces font-bold text-xl sm:text-2xl text-white mt-2 leading-tight">
                  {clusterCards[0].name}
                </h3>
              </div>
            </Link>

            {/* 2. Engineering (Standard) */}
            <Link
              href="/careers?cluster=engineering-tech"
              className="group relative rounded-[20px] overflow-hidden border border-[#E2E8F0] hover:border-ink transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ink col-span-1 aspect-[4/3] sm:aspect-[3/4] lg:aspect-auto"
            >
              <Image
                src={clusterCards[2].imageSrc}
                alt={clusterCards[2].altText}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                className="object-cover group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end text-white z-10">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white w-fit">
                  {clusterCards[2].count} options
                </span>
                <h3 className="font-fraunces font-bold text-base sm:text-lg text-white mt-1.5 leading-snug">
                  {clusterCards[2].name}
                </h3>
              </div>
            </Link>

            {/* 3. Commerce (Standard) */}
            <Link
              href="/careers?cluster=commerce-finance"
              className="group relative rounded-[20px] overflow-hidden border border-[#E2E8F0] hover:border-ink transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ink col-span-1 aspect-[4/3] sm:aspect-[3/4] lg:aspect-auto"
            >
              <Image
                src={clusterCards[3].imageSrc}
                alt={clusterCards[3].altText}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                className="object-cover group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end text-white z-10">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white w-fit">
                  {clusterCards[3].count} options
                </span>
                <h3 className="font-fraunces font-bold text-base sm:text-lg text-white mt-1.5 leading-snug">
                  {clusterCards[3].name}
                </h3>
              </div>
            </Link>

            {/* 4. Law (Standard) */}
            <Link
              href="/careers?cluster=law"
              className="group relative rounded-[20px] overflow-hidden border border-[#E2E8F0] hover:border-ink transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ink col-span-1 aspect-[4/3] sm:aspect-[3/4] lg:aspect-auto"
            >
              <Image
                src={clusterCards[4].imageSrc}
                alt={clusterCards[4].altText}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                className="object-cover group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end text-white z-10">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white w-fit">
                  {clusterCards[4].count} options
                </span>
                <h3 className="font-fraunces font-bold text-base sm:text-lg text-white mt-1.5 leading-snug">
                  {clusterCards[4].name}
                </h3>
              </div>
            </Link>

            {/* 5. Design (Standard) */}
            <Link
              href="/careers?cluster=design-creative"
              className="group relative rounded-[20px] overflow-hidden border border-[#E2E8F0] hover:border-ink transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ink col-span-1 aspect-[4/3] sm:aspect-[3/4] lg:aspect-auto"
            >
              <Image
                src={clusterCards[5].imageSrc}
                alt={clusterCards[5].altText}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                className="object-cover group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end text-white z-10">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white w-fit">
                  {clusterCards[5].count} options
                </span>
                <h3 className="font-fraunces font-bold text-base sm:text-lg text-white mt-1.5 leading-snug">
                  {clusterCards[5].name}
                </h3>
              </div>
            </Link>

            {/* 6. Defence (Standard) */}
            <Link
              href="/careers?cluster=defence-uniformed"
              className="group relative rounded-[20px] overflow-hidden border border-[#E2E8F0] hover:border-ink transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ink col-span-1 aspect-[4/3] sm:aspect-[3/4] lg:aspect-auto"
            >
              <Image
                src={clusterCards[6].imageSrc}
                alt={clusterCards[6].altText}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                className="object-cover group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end text-white z-10">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white w-fit">
                  {clusterCards[6].count} options
                </span>
                <h3 className="font-fraunces font-bold text-base sm:text-lg text-white mt-1.5 leading-snug">
                  {clusterCards[6].name}
                </h3>
              </div>
            </Link>

            {/* 7. Government & Civil Services (Standard) */}
            <Link
              href="/careers?cluster=government-civil"
              className="group relative rounded-[20px] overflow-hidden border border-[#E2E8F0] hover:border-ink transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ink col-span-1 aspect-[4/3] sm:aspect-[3/4] lg:aspect-auto"
            >
              <Image
                src={clusterCards[7].imageSrc}
                alt={clusterCards[7].altText}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                className="object-cover group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end text-white z-10">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white w-fit">
                  {clusterCards[7].count} options
                </span>
                <h3 className="font-fraunces font-bold text-base sm:text-lg text-white mt-1.5 leading-snug">
                  {clusterCards[7].name}
                </h3>
              </div>
            </Link>

            {/* 8. Medicine (Large: 2 cols x 2 rows) */}
            <Link
              href="/careers?cluster=medicine-health"
              className="group relative rounded-[20px] overflow-hidden border border-[#E2E8F0] hover:border-ink transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ink col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-2 aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto"
            >
              <Image
                src={clusterCards[1].imageSrc}
                alt={clusterCards[1].altText}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 600px"
                className="object-cover group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-col justify-end text-white z-10">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white">
                    {clusterCards[1].count} options
                  </span>
                  <span className="text-white/80 group-hover:translate-x-1 transition-transform text-sm" aria-hidden="true">
                    →
                  </span>
                </div>
                <h3 className="font-fraunces font-bold text-xl sm:text-2xl text-white mt-2 leading-tight">
                  {clusterCards[1].name}
                </h3>
              </div>
            </Link>

            {/* 9. Ninth Tile: All 19 Career Areas */}
            <Link
              href="/careers"
              className="group relative rounded-[20px] bg-paper border border-[#E2E8F0] hover:border-ink transition-all duration-200 p-6 flex flex-col justify-between overflow-hidden focus-visible:outline-2 focus-visible:outline-ink col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-1 min-h-[170px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#B26E00] uppercase tracking-wider bg-marigold/15 px-3 py-1 rounded-full">
                  Comprehensive directory
                </span>
                <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center group-hover:translate-x-1 transition-transform text-sm">
                  →
                </div>
              </div>
              <div className="mt-3">
                <h3 className="font-fraunces text-xl font-bold text-ink-900 group-hover:text-ink transition-colors">
                  All 19 career areas
                </h3>
                <p className="text-xs sm:text-sm text-slate mt-1 line-clamp-2">
                  Browse engineering, sciences, commerce, creative arts, and public sector disciplines.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ━━ SECTION D: "HOW EDUSELECT WORKS" ━━ */}
      <section className="bg-paper py-16 sm:py-24 border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-fraunces text-[28px] sm:text-[36px] font-bold text-ink-900 tracking-[-0.02em]">
              How EduSelect works
            </h2>
            <p className="mt-3 text-[17px] leading-[1.6] text-slate">
              A straightforward sequence to help students and parents make informed educational decisions.
            </p>
          </div>

          {/* Horizontal timeline on desktop / Vertical on mobile */}
          <div className="mt-12 sm:mt-16 relative">
            {/* Desktop connecting line */}
            <div
              className="hidden md:block absolute top-5 left-10 right-10 h-0.5 border-t-2 border-dashed border-slate-300 z-0"
              aria-hidden="true"
            />

            {/* Mobile connecting line */}
            <div
              className="md:hidden absolute top-5 bottom-8 left-5 w-0.5 border-l-2 border-dashed border-slate-300 z-0"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-6 relative z-10">
              {HOW_IT_WORKS_STEPS.map((item) => (
                <div key={item.step} className="flex md:flex-col items-start gap-4 md:gap-4 pl-12 md:pl-0">
                  {/* Step circle badge */}
                  <div className="absolute left-0 md:static w-10 h-10 rounded-full bg-ink text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                    {item.step}
                  </div>

                  <div>
                    <h3 className="font-fraunces text-lg sm:text-xl font-bold text-ink-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━ SECTION E: "TOP COLLEGES BY NIRF 2025" ━━ */}
      <section className="bg-white py-16 sm:py-24 border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="font-fraunces text-[28px] sm:text-[36px] font-bold text-ink-900 tracking-[-0.02em]">
                Top colleges by NIRF 2025
              </h2>
              <p className="mt-3 text-[17px] leading-[1.6] text-slate">
                Explore premier institutions ranked by the Ministry of Education's National Institutional Ranking
                Framework.
              </p>
            </div>
            <Link
              href="/colleges?sortBy=nirf"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-ink-900 transition-colors shrink-0"
            >
              <span>See all colleges</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* College Cards Grid */}
          <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topColleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
        </div>
      </section>

      {/* ━━ SECTION F: AI COUNSELLOR BAND ━━ */}
      <section className="bg-ink-900 text-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Photo */}
            <div className="lg:col-span-5 w-full">
              <div className="relative aspect-[4/3] w-full rounded-[20px] overflow-hidden bg-ink shadow-2xl border border-white/10">
                <Image
                  src="/images/home/ai-counsellor.webp"
                  alt="Indian mother and teenage son looking at career options together on a smartphone at home in warm light"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 500px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right Column: AI Guidance Content & Pre-filled Chips */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <h2 className="font-fraunces text-[28px] sm:text-[36px] font-bold text-white tracking-[-0.02em] leading-tight">
                Not sure yet? Ask the AI counsellor.
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-[65ch]">
                Receive instant suggestions based on your academic stream, scores, target entrance exams, and career
                goals.
              </p>

              {/* 3 Pre-filled Question Chips */}
              <div className="mt-6 flex flex-col gap-3 w-full max-w-xl">
                {[
                  'Best options after PCB without NEET?',
                  'PSU or private job after ECE?',
                  'Government jobs after B.Com?',
                ].map((chip) => (
                  <OpenAiDrawerButton
                    key={chip}
                    question={chip}
                    className="w-full text-left p-3.5 sm:p-4 rounded-[12px] bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/30 text-white text-xs sm:text-sm font-medium transition-colors flex items-center justify-between group cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <span>{chip}</span>
                    <span className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all text-sm shrink-0 ml-2" aria-hidden="true">
                      Ask →
                    </span>
                  </OpenAiDrawerButton>
                ))}
              </div>

              {/* Trust Disclaimer */}
              <p className="mt-5 text-xs text-slate-400">
                Answers come from EduSelect's curated data — always confirm with the official notification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ SECTION G: DATA TRUST STRIP ━━ */}
      <section className="bg-paper py-8 sm:py-10 border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm sm:text-base text-slate">
            Built on NIRF 2025, JoSAA, NTA, UPSC and SSC information.{' '}
            <Link
              href="/about-data"
              className="text-ink font-semibold hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ink rounded-xs inline-flex items-center gap-1"
            >
              <span>Learn about our data sources</span>
              <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
