import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { LevelCard } from '@/components/ui/LevelCard';
import {
  BookOpenIcon,
  GraduationCapIcon,
  WrenchIcon,
  CompassIcon,
  CpuIcon,
  BuildingLibraryIcon,
  ScaleIcon,
  MicroscopeIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckIcon,
} from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: 'EduSelect — Free Career Guidance & Roadmaps for Indian Students',
  description:
    'Free career-guidance platform for Indian students. Pick your level (After 10th, 12th/PUC, ITI, Diploma, B.Tech, Degree) to get verified roadmaps of courses, entrance exams, colleges, and government jobs.',
  openGraph: {
    title: 'EduSelect — Free Career Guidance & Roadmaps for Indian Students',
    description:
      'Step-by-step educational roadmaps, entrance exams, verified colleges, and government jobs for Indian students.',
    type: 'website',
  },
};

interface JourneyLevelConfig {
  slug: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const JOURNEY_LEVELS: JourneyLevelConfig[] = [
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

const HOW_IT_WORKS_STEPS = [
  {
    number: '1',
    title: 'Select level',
    description: 'Choose your current class, diploma, or degree to view relevant options.',
  },
  {
    number: '2',
    title: 'Explore options',
    description: 'Compare matching streams, degrees, entrance tests, and career outcomes.',
  },
  {
    number: '3',
    title: 'Get your roadmap',
    description: 'Follow a clear year-by-year timeline with skills, projects, and milestones.',
  },
  {
    number: '4',
    title: 'Decide with confidence',
    description: 'Review verified colleges, transparent fee estimates, and official links.',
  },
];

const FEATURE_TILES = [
  {
    title: 'Career Paths',
    description: 'Job profiles, required skills, and long-term career growth across industries.',
    icon: BriefcaseIcon,
  },
  {
    title: 'Entrance Exams',
    description: 'Eligibility criteria, syllabus patterns, and official portals for national and state tests.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Colleges & Courses',
    description: 'Verified engineering colleges with NIRF rankings, estimated fees, and cutoffs.',
    icon: BuildingLibraryIcon,
  },
  {
    title: 'Government Jobs',
    description: 'Technical and public service recruitment exams with 7th Pay Commission pay bands.',
    icon: ScaleIcon,
  },
  {
    title: 'Skill Guidance',
    description: 'Core programming tools, domain fundamentals, and industry certifications.',
    icon: WrenchIcon,
  },
  {
    title: 'Personalised Guidance',
    description: 'Score-based diagnostics and custom roadmaps tailored to your situation.',
    icon: SparklesIcon,
  },
];

export default function HomePage() {
  return (
    <div className="w-full bg-white text-[#0F172A]">
      {/* 1. HERO SECTION */}
      <section className="border-b border-[#E2E8F0] py-14 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Heading, Text & Primary Action */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0F172A] leading-[1.18]">
                Not sure what to pursue next?
              </h1>
              <p className="mt-4 text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl">
                Pick your current level to get a step-by-step roadmap of courses, entrance exams, colleges, and government jobs.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <a
                  href="#levels"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
                >
                  Choose your level
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center text-base font-semibold text-[#1D4ED8] hover:text-[#1E40AF] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
                >
                  How it works
                </a>
              </div>
            </div>

            {/* Right Column: Clean Screenshot-Style Roadmap Visual */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm p-5 sm:p-6">
                {/* Header preview bar */}
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]" />
                    <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">
                      Roadmap Preview
                    </span>
                  </div>
                  <span className="text-xs text-[#64748B] font-medium">4-Year Progression</span>
                </div>

                <div className="mb-4">
                  <span className="text-xs font-semibold text-[#1D4ED8]">Class 12th PCM Pathway</span>
                  <h2 className="text-base font-bold text-[#0F172A]">B.Tech in Computer Science</h2>
                </div>

                {/* Vertical Step Timeline */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 p-2.5 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="w-6 h-6 rounded-full bg-[#1D4ED8] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-[#0F172A]">Year 1 · Foundation & Entrance</span>
                      <p className="text-[#475569] mt-0.5">Calculus, Programming, and qualifying cutoffs (JEE / KCET).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="w-6 h-6 rounded-full bg-[#1D4ED8] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-[#0F172A]">Years 2–3 · Core Competencies</span>
                      <p className="text-[#475569] mt-0.5">Data Structures, Algorithms, Systems, and Summer Internship.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="w-6 h-6 rounded-full bg-[#1D4ED8] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-[#0F172A]">Year 4 · Placements & GATE</span>
                      <p className="text-[#475569] mt-0.5">Campus recruitment drives, PSU tests, or Postgraduate applications.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="w-6 h-6 rounded-full bg-[#0D9488] text-white flex items-center justify-center shrink-0">
                      <CheckIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-[#0F172A]">Career Outcome</span>
                      <p className="text-[#475569] mt-0.5">Software Development Engineer or PSU Technical Officer.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] text-center">
                  <span className="text-[11px] text-[#64748B]">
                    Verified against official syllabi and 455 real engineering colleges.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "WHERE ARE YOU IN YOUR JOURNEY?" (MAIN SECTION) */}
      <section id="levels" className="py-16 sm:py-20 scroll-mt-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
              Where are you in your journey?
            </h2>
            <p className="mt-2 text-base text-[#475569] leading-relaxed">
              Select your current education level to view verified roadmaps, degrees, entrance tests, and career outcomes.
            </p>
          </div>

          {/* 8 Level Cards Grid: 4x2 desktop, 2 cols tablet, 1 col mobile */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {JOURNEY_LEVELS.map((item) => (
              <LevelCard
                key={item.slug}
                slug={item.slug}
                title={item.title}
                description={item.description}
                icon={item.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. "HOW IT WORKS" (4 STEPS) */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-[#F8FAFC] border-y border-[#E2E8F0] scroll-mt-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
              How it works
            </h2>
            <p className="mt-2 text-base text-[#475569] leading-relaxed">
              Four straightforward steps to find clarity and plan your next educational move.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div
                key={step.number}
                className="p-6 bg-white rounded-[12px] border border-[#E2E8F0] flex flex-col gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#1D4ED8] text-white text-sm font-bold flex items-center justify-center">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">
                  {step.title}
                </h3>
                <p className="text-base text-[#475569] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. "WHAT YOU'LL FIND ON EDUSELECT" (6 FEATURE TILES) */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
              What you&apos;ll find on EduSelect
            </h2>
            <p className="mt-2 text-base text-[#475569] leading-relaxed">
              Practical, verified information organized for Indian students and parents.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURE_TILES.map((tile) => {
              const IconComponent = tile.icon;
              return (
                <div
                  key={tile.title}
                  className="p-6 bg-white rounded-[12px] border border-[#E2E8F0] flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-[8px] bg-blue-50/80 flex items-center justify-center text-[#1D4ED8]">
                    <IconComponent className="w-5 h-5 text-[#1D4ED8]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0F172A]">
                      {tile.title}
                    </h3>
                    <p className="mt-1 text-base text-[#475569] leading-relaxed">
                      {tile.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CAREER QUIZ BANNER */}
      <section className="pb-16 sm:pb-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-10 bg-[#F8FAFC] rounded-[12px] border border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                Not sure which field fits your strengths?
              </h2>
              <p className="mt-1.5 text-base text-[#475569] leading-relaxed">
                Answer a few simple questions to receive personalized suggestions based on your interests and marks.
              </p>
            </div>
            <Link
              href="/careers?step=3"
              className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-base transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
            >
              Take the quiz
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
