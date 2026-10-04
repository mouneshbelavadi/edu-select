'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  SparklesIcon,
  GraduationCapIcon,
  BookOpenIcon,
  CompassIcon,
  CpuIcon,
  WrenchIcon,
  BuildingLibraryIcon,
  CheckIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';
import toast from 'react-hot-toast';

interface OnboardingProfile {
  level: string;
  stream: string;
  subjects: string[];
  primaryGoal: string;
  completedAt: string;
}

const STAGES = [
  {
    id: 'CLASS_10',
    title: 'Class 10th (Matric / SSLC)',
    desc: 'Planning 11th/12th stream, 3-year Polytechnic, or ITI trade',
    icon: BookOpenIcon,
    badge: 'Foundation',
  },
  {
    id: 'CLASS_12',
    title: 'Class 12th / 2nd PU',
    desc: 'Higher secondary, preparing for entrance exams and degree admissions',
    icon: GraduationCapIcon,
    badge: 'Pre-University',
  },
  {
    id: 'DIPLOMA',
    title: 'Polytechnic Diploma',
    desc: 'Technical diploma, lateral 2nd-year B.Tech entry, or Junior Engineer roles',
    icon: CompassIcon,
    badge: 'Technical',
  },
  {
    id: 'ITI',
    title: 'ITI Trade Course',
    desc: 'NCVT craft trades, PSU technician apprenticeships, and direct skills',
    icon: WrenchIcon,
    badge: 'Vocational',
  },
  {
    id: 'UG_ENGG',
    title: 'B.Tech / B.E. Student',
    desc: 'Engineering branch, campus placements, GATE for PSUs, or M.Tech/MS',
    icon: CpuIcon,
    badge: 'Engineering',
  },
  {
    id: 'UG_OTHER',
    title: 'Degree Graduate / Student',
    desc: 'B.Sc, B.Com, BA, BCA, BBA, banking exams, civil services, or MBA',
    icon: BuildingLibraryIcon,
    badge: 'Undergraduate',
  },
];

const STREAM_OPTIONS_BY_STAGE: Record<string, { id: string; label: string; desc: string }[]> = {
  CLASS_10: [
    { id: 'SCIENCE', label: 'Science (11th / PUC)', desc: 'Prepares for medical, engineering, and research' },
    { id: 'DIPLOMA', label: 'Polytechnic Diploma', desc: '3-year technical track with lateral B.Tech entry' },
    { id: 'ITI', label: 'ITI Trade Course', desc: '1–2 year practical job certification for quick employment' },
    { id: 'COMMERCE', label: 'Commerce (11th / PUC)', desc: 'Prepares for finance, accounting, CA, and business' },
    { id: 'ARTS', label: 'Arts / Humanities', desc: 'Prepares for civil services, law, journalism, and literature' },
    { id: 'EXPLORING', label: 'Not Sure / Exploring', desc: 'Show me all eligible paths after 10th' },
  ],
  CLASS_12: [
    { id: 'PCM', label: 'Science — PCM', desc: 'Physics, Chemistry, Maths (Engineering / Tech / Defence)' },
    { id: 'PCB', label: 'Science — PCB', desc: 'Physics, Chemistry, Biology (Medicine / Nursing / Allied Health)' },
    { id: 'PCMB', label: 'Science — PCMB', desc: 'Physics, Chemistry, Maths, Biology (Dual Eligibility)' },
    { id: 'COMMERCE_MATHS', label: 'Commerce + Maths', desc: 'Accounts, Economics, and Maths (B.Com / CA / Finance)' },
    { id: 'COMMERCE_NO_MATHS', label: 'Commerce', desc: 'Business Studies, Accounts, Economics, Statistics' },
    { id: 'ARTS', label: 'Arts / Humanities', desc: 'History, Political Science, Psychology, Law' },
  ],
  DIPLOMA: [
    { id: 'CSE', label: 'Computer Science (CSE)', desc: 'Software, web development, and lateral B.Tech' },
    { id: 'MECH', label: 'Mechanical Engineering', desc: 'Automotive, manufacturing, and design' },
    { id: 'ECE', label: 'Electronics & Comm (ECE)', desc: 'Embedded systems, IoT, and telecom' },
    { id: 'CIVIL', label: 'Civil Engineering', desc: 'Construction, infrastructure, and surveying' },
    { id: 'OTHER', label: 'Other Engineering Branch', desc: 'Automobile, chemical, electrical, etc.' },
  ],
  ITI: [
    { id: 'ELECTRICIAN', label: 'Electrician', desc: 'Wiring, industrial systems, and power utility' },
    { id: 'FITTER', label: 'Fitter', desc: 'Precision machine assembly and benchwork' },
    { id: 'COPA', label: 'COPA', desc: 'Computer Operator & Programming Assistant' },
    { id: 'ELECTRONICS', label: 'Electronics Mechanic', desc: 'Hardware repair and PCB assembly' },
    { id: 'OTHER', label: 'Other Approved Trade', desc: 'Welder, machinist, draughtsman, etc.' },
  ],
  UG_ENGG: [
    { id: 'SOFTWARE', label: 'Software / IT / AI', desc: 'Fullstack, machine learning, data engineering' },
    { id: 'CORE', label: 'Core Engineering / PSUs', desc: 'Mechanical, electrical, civil, GATE preparation' },
    { id: 'HIGHER_STUDIES', label: 'Higher Studies (M.Tech / MS)', desc: 'Research, academia, and global universities' },
    { id: 'MANAGEMENT', label: 'Product & Management (MBA)', desc: 'CAT, consultancy, product management' },
  ],
  UG_OTHER: [
    { id: 'GOVT_EXAMS', label: 'Government & Banking Exams', desc: 'UPSC, SSC CGL, IBPS PO, state PSCs' },
    { id: 'CORPORATE', label: 'Corporate & Finance Roles', desc: 'Analytics, marketing, accounting, operations' },
    { id: 'POST_GRAD', label: 'Postgraduate Degree (M.Sc / MA / MCA)', desc: 'Specialized master’s education' },
    { id: 'MBA', label: 'Management (MBA / PGDM)', desc: 'Business administration and executive roles' },
  ],
};

const SUBJECT_CHIPS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'Economics',
  'Accountancy',
  'Design / Drawing',
  'Law / Civic Studies',
];

const PRIMARY_GOALS = [
  { id: 'careers', title: 'Career Roadmaps', desc: 'Discover year-by-year pathways and salary projections' },
  { id: 'colleges', title: 'Find Verified Colleges', desc: 'Explore NIRF rankings, verified fees, and placements' },
  { id: 'cutoffs', title: 'Check KCET Cutoffs', desc: 'Predict admission odds across Karnataka engineering' },
  { id: 'ai', title: 'AI Counsellor Advice', desc: 'Get diagnostic career guidance powered by official data' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const userName = session?.user?.name ? session.user.name.split(' ')[0] : 'there';

  const [level, setLevel] = useState<string>('CLASS_10');
  const [stream, setStream] = useState<string>('SCIENCE');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState<string>('careers');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Update default stream when level changes
  useEffect(() => {
    const streamOpts = STREAM_OPTIONS_BY_STAGE[level] || [];
    if (streamOpts.length > 0) {
      setStream(streamOpts[0].id);
    }
  }, [level]);

  // Load existing profile if present
  useEffect(() => {
    try {
      const stored = localStorage.getItem('student_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.level) setLevel(parsed.level);
        if (parsed.stream) setStream(parsed.stream);
        if (Array.isArray(parsed.subjects)) setSelectedSubjects(parsed.subjects);
        if (parsed.primaryGoal) setPrimaryGoal(parsed.primaryGoal);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const handleToggleSubject = (subj: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    try {
      const profile: OnboardingProfile = {
        level,
        stream,
        subjects: selectedSubjects,
        primaryGoal,
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem('student_profile', JSON.stringify(profile));
      localStorage.setItem('onboarding_dismissed', 'false');

      toast.success('Profile personalized! Welcome to your dashboard.');

      // Redirect based on goal
      if (primaryGoal === 'careers') {
        const lvlSlug = level === 'CLASS_10' ? '10th' : level === 'CLASS_12' ? '12th' : level.toLowerCase();
        router.push(`/careers?level=${lvlSlug}`);
      } else if (primaryGoal === 'colleges') {
        router.push('/colleges');
      } else if (primaryGoal === 'cutoffs') {
        router.push('/kcet-2026-predictor');
      } else if (primaryGoal === 'ai') {
        const params = new URLSearchParams();
        params.set('level', level);
        if (stream) params.set('stream', stream);
        if (selectedSubjects.length) params.set('subjects', selectedSubjects.join(','));
        router.push(`/ai-counsellor?${params.toString()}`);
      } else {
        router.push('/saved');
      }
    } catch {
      toast.error('Unable to save preferences');
      router.push('/saved');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipLater = () => {
    try {
      localStorage.setItem('onboarding_dismissed', 'true');
    } catch {
      // ignore
    }
    toast('You can customize your profile anytime from the Saved Dashboard.', {
      icon: 'ℹ️',
    });
    router.push('/saved');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-white/10">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold w-fit border border-blue-400/30">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>Step 1 of 1 · Quick Personalization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {userName}! Let’s tailor your journey
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Tell us where you are in your academic journey to unlock personalized college cutoffs, verified career roadmaps, and admissions advice tailored to your goals.
            </p>
          </div>

          {/* Prominent "Later" Skip Option at Header */}
          <button
            type="button"
            onClick={handleSkipLater}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/20 whitespace-nowrap cursor-pointer"
          >
            I’ll do this later →
          </button>
        </div>

        {/* Main Personalization Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-8">
          
          {/* Section 1: Qualification Stage */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">1. Current Stage</span>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Where are you right now?
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Select one</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {STAGES.map((s) => {
                const IconComponent = s.icon;
                const isSelected = level === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setLevel(s.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer group ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.badge}
                      </span>
                    </div>

                    <div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                        {s.title}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug mt-1">
                        {s.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Stream / Focus Area (Adaptive) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">2. Area of Focus</span>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {level === 'CLASS_10'
                    ? 'What direction are you leaning towards after 10th?'
                    : level === 'CLASS_12'
                    ? 'Which 12th / PU stream are you studying?'
                    : 'What is your primary branch or specialization?'}
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Select one</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {(STREAM_OPTIONS_BY_STAGE[level] || []).map((st) => {
                const isSelected = stream === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStream(st.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{st.label}</span>
                      {isSelected && <CheckIcon className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-normal leading-snug">
                      {st.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Subjects & Topics Enjoyed */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">3. Preferences</span>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Subjects and topics you like (Optional)
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Pick any</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {SUBJECT_CHIPS.map((subj) => {
                const isSelected = selectedSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => handleToggleSubject(subj)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {subj}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Primary Goal */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">4. Immediate Goal</span>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  What would you like to explore first?
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Where to land</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRIMARY_GOALS.map((g) => {
                const isSelected = primaryGoal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setPrimaryGoal(g.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{g.title}</div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">{g.desc}</div>
                    </div>
                    {isSelected && <CheckIcon className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer with Dual Options */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleSkipLater}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors order-2 sm:order-1 cursor-pointer py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Skip for now — I’ll explore first →
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveProfile}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2 disabled:opacity-50"
            >
              <span>Save & View My Tailored Dashboard</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
