'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CollegeCard, CollegeCardData } from '@/components/features/CollegeCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ScaleIcon,
  HeartIcon,
  SparklesIcon,
  GraduationCapIcon,
  CompassIcon,
  CpuIcon,
  BookOpenIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@/components/ui/Icons';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SavedComparison {
  id: string;
  name: string;
  collegeIds: string[];
  createdAt: string;
}

interface StudentProfile {
  level: string;
  stream: string;
  subjects: string[];
  primaryGoal?: string;
  completedAt?: string;
}

export default function SavedDashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name ? session.user.name.split(' ')[0] : 'there';

  const { data: collegesData, mutate: mutateColleges, isLoading: loadingColleges } = useSWR(
    '/api/saved/colleges',
    fetcher
  );

  const { data: comparisonsData, mutate: mutateComparisons, isLoading: loadingComparisons } = useSWR(
    '/api/saved/comparisons',
    fetcher
  );

  const savedColleges: CollegeCardData[] = collegesData?.data || [];
  const savedComparisons: SavedComparison[] = comparisonsData?.data || [];

  // Student Profile State from localStorage
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('student_profile');
      if (stored) {
        setProfile(JSON.parse(stored));
      }
      const dismissed = localStorage.getItem('onboarding_dismissed');
      if (dismissed === 'true') {
        setIsBannerDismissed(true);
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    try {
      localStorage.setItem('onboarding_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleRemoveCollege = async (collegeId: string) => {
    try {
      const res = await fetch('/api/saved/colleges', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId }),
      });

      if (res.ok) {
        toast.success('Removed college from saved list');
        mutateColleges();
      } else {
        toast.error('Failed to remove college');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const handleDeleteComparison = async (id: string) => {
    try {
      const res = await fetch('/api/saved/comparisons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success('Comparison deleted');
        mutateComparisons();
      } else {
        toast.error('Failed to delete comparison');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  // Compute profile labels
  const stageLabels: Record<string, string> = {
    CLASS_10: 'Class 10th (Matric / SSLC)',
    CLASS_12: 'Class 12th / 2nd PU',
    DIPLOMA: 'Polytechnic Diploma',
    ITI: 'ITI Trade Student',
    UG_ENGG: 'B.Tech / B.E.',
    UG_OTHER: 'Degree Graduate',
  };

  const streamLabels: Record<string, string> = {
    SCIENCE: 'Science (11th/PUC)',
    PCM: 'Science — PCM',
    PCB: 'Science — PCB',
    PCMB: 'Science — PCMB',
    COMMERCE: 'Commerce',
    COMMERCE_MATHS: 'Commerce + Maths',
    COMMERCE_NO_MATHS: 'Commerce',
    ARTS: 'Arts / Humanities',
    CSE: 'Computer Science',
    MECH: 'Mechanical',
    ECE: 'Electronics',
    CIVIL: 'Civil',
  };

  const counsellorUrl = profile
    ? `/ai-counsellor?level=${profile.level}&stream=${encodeURIComponent(profile.stream)}${
        profile.subjects?.length ? `&subjects=${encodeURIComponent(profile.subjects.join(','))}` : ''
      }`
    : '/ai-counsellor';

  const careersUrl = profile
    ? `/careers?level=${profile.level === 'CLASS_10' ? '10th' : profile.level === 'CLASS_12' ? '12th' : profile.level.toLowerCase()}`
    : '/careers';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
      
      {/* 1. TOP HEADER & GREETING */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Your personal educational workspace, bookmarked institutions, and verified career roadmaps.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/onboarding">
            <Button variant="outline" size="sm" className="gap-1.5 font-bold text-xs">
              <SparklesIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>{profile ? 'Edit Profile Details' : 'Personalize Profile'}</span>
            </Button>
          </Link>
          <Link href="/colleges">
            <Button variant="primary" size="sm" className="font-bold text-xs">
              + Discover Colleges
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. PERSONALIZATION HERO BANNER (If not completed or dismissed) */}
      {!profile && !isBannerDismissed && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-white/10">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold w-fit border border-blue-400/30">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>Tailor Your Experience</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Personalize Your Academic & Career Journey
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Tell us where you are right now (Class 10th, 12th, Diploma, or Degree) to unlock verified cutoff chances, personalized college suggestions, and year-by-year career roadmaps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDismissBanner}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/20 text-center cursor-pointer"
            >
              Later / Dismiss
            </button>
            <Link
              href="/onboarding"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Personalize in 1 Min</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. ACTIVE STUDENT PROFILE CARD (If profile was filled) */}
      {profile && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckIcon className="w-4 h-4 text-emerald-600" />
                <span>Your Customized Profile</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold">
                {stageLabels[profile.level] || profile.level}
              </span>
              {profile.stream && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200">
                  {streamLabels[profile.stream] || profile.stream}
                </span>
              )}
            </div>

            {profile.subjects && profile.subjects.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-600">
                <span className="font-semibold text-slate-500">Liked Subjects:</span>
                {profile.subjects.map((subj) => (
                  <span key={subj} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium text-[11px]">
                    {subj}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href={counsellorUrl}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask AI Counsellor</span>
            </Link>
            <Link
              href={careersUrl}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 transition-colors"
            >
              Matching Careers →
            </Link>
            <Link
              href="/onboarding"
              className="px-3 py-2 text-xs font-semibold text-blue-600 hover:underline"
            >
              Edit
            </Link>
          </div>
        </div>
      )}

      {/* 4. EXPLORATION LAUNCHPADS (Never leave the user in a boring empty state) */}
      <section className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <CompassIcon className="w-5 h-5 text-blue-600" />
            <span>Interactive Guidance Tools</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Quick Launchpads</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: AI Counsellor */}
          <Link
            href={counsellorUrl}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                AI Powered
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                AI Career Counsellor
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Diagnostic recommendations and year-by-year roadmaps using verified data.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:underline">
              Launch Counsellor →
            </span>
          </Link>

          {/* Card 2: Careers Catalogue */}
          <Link
            href={careersUrl}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <BookOpenIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                8 Journeys
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                Career Roadmaps
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Step-by-step pathways across Class 10th, 12th, Diploma, ITI, and Engineering.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:underline">
              Explore Roadmaps →
            </span>
          </Link>

          {/* Card 3: Cutoff Predictor */}
          <Link
            href="/kcet-2026-predictor"
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <CpuIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                KCET 2026
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                Cutoff Predictor
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Rank-based branch matching across 455 Karnataka engineering colleges.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:underline">
              Check Cutoffs →
            </span>
          </Link>

          {/* Card 4: Verified Colleges */}
          <Link
            href="/colleges"
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <GraduationCapIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                455 Verified
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                College Directory
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Official government fees, seat matrices, campus placements, and rankings.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:underline">
              Browse Directory →
            </span>
          </Link>
        </div>
      </section>

      {/* 5. SECTION: SAVED COLLEGES */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <HeartIcon className="w-5 h-5 text-rose-500 fill-rose-500 shrink-0" />
            <span>Saved Colleges</span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {savedColleges.length}
            </span>
          </h2>
          <Link href="/colleges" className="text-xs font-bold text-blue-600 hover:underline">
            Browse All Colleges →
          </Link>
        </div>

        {loadingColleges ? (
          <div className="p-8 text-center text-slate-400">Loading saved colleges...</div>
        ) : savedColleges.length === 0 ? (
          <Card className="p-8 sm:p-10 text-center flex flex-col items-center gap-4 bg-white border border-slate-200 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
              <HeartIcon className="w-6 h-6" />
            </div>
            <div className="max-w-md">
              <h3 className="font-bold text-base text-slate-900">No saved colleges yet</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bookmark top colleges while exploring to build your personal comparison shortlist and compare cutoffs side-by-side.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
              <Link href="/colleges">
                <Button variant="primary" size="sm" className="font-bold text-xs">
                  Explore 455 Colleges
                </Button>
              </Link>
              <Link href="/careers">
                <Button variant="outline" size="sm" className="font-bold text-xs">
                  Explore Career Pathways
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedColleges.map((college) => (
              <div key={college.id} className="relative group">
                <CollegeCard college={college} />
                <button
                  onClick={() => handleRemoveCollege(college.id)}
                  className="absolute top-3 right-3 z-20 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow transition-transform group-hover:scale-105 cursor-pointer"
                  title="Remove from saved list"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. SECTION: SAVED COMPARISONS */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ScaleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Saved Comparisons</span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {savedComparisons.length}
            </span>
          </h2>
          <Link href="/compare" className="text-xs font-bold text-blue-600 hover:underline">
            Launch Compare Tool →
          </Link>
        </div>

        {loadingComparisons ? (
          <div className="p-8 text-center text-slate-400">Loading saved comparisons...</div>
        ) : savedComparisons.length === 0 ? (
          <Card className="p-8 sm:p-10 text-center flex flex-col items-center gap-4 bg-white border border-slate-200 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ScaleIcon className="w-6 h-6" />
            </div>
            <div className="max-w-md">
              <h3 className="font-bold text-base text-slate-900">No saved comparisons</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Compare 2–3 colleges side-by-side on KCET cutoffs, annual tuition fees, and campus placement packages.
              </p>
            </div>
            <Link href="/compare">
              <Button variant="outline" size="sm" className="font-bold text-xs">
                Compare Colleges Side-by-Side
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedComparisons.map((comp) => {
              const compareUrl = `/compare?ids=${comp.collegeIds.join(',')}`;
              return (
                <Card
                  key={comp.id}
                  className="p-5 flex items-center justify-between gap-4 hover:border-blue-300 transition-colors bg-white rounded-2xl border border-slate-200"
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-base text-slate-900">{comp.name}</h3>
                    <span className="text-xs text-slate-500">
                      Comparing {comp.collegeIds.length} Colleges • Saved on{' '}
                      {new Date(comp.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={compareUrl}>
                      <Button variant="primary" size="sm" className="font-bold text-xs">
                        View Table →
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComparison(comp.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
