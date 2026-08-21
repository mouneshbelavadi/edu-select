'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCompareStore } from '@/lib/store/useCompareStore';
import toast from 'react-hot-toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { CollegeDetail } from '@/lib/collegeRepository';

export default function CollegeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data: session } = useSession();
  const { addCollege, selectedColleges } = useCompareStore();

  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/colleges/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then((data) => {
        setCollege(data.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <Skeleton className="h-6 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <Skeleton className="md:col-span-4 h-64 w-full rounded-2xl" />
          <Skeleton className="md:col-span-8 h-64 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="md:col-span-2 h-96 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="text-4xl">🏛️</div>
        <h1 className="text-2xl font-bold text-surface-900">College Not Found</h1>
        <p className="text-sm text-surface-500">
          The requested institution could not be found in the 28-state database.
        </p>
        <Link
          href="/colleges"
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          ← Browse All Colleges
        </Link>
      </div>
    );
  }

  const isCompared = selectedColleges.some((c) => c.id === college.id);

  const handleCompare = () => {
    if (isCompared) {
      toast('Already added to comparison bar');
      return;
    }
    const success = addCollege({ id: college.id, name: college.name });
    if (success) {
      toast.success(`Added ${college.name} to comparison!`);
    } else {
      toast.error('Maximum 3 colleges allowed for comparison');
    }
  };

  const handleSave = async () => {
    if (!session) {
      toast.error('Please log in to save colleges');
      router.push(`/login?callbackUrl=/colleges/${encodeURIComponent(college.slug || college.id)}`);
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/saved/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId: college.id }),
      });

      if (res.ok) {
        toast.success('College saved to your dashboard!');
      } else {
        const data = await res.json();
        toast.error(data.error?.message || 'Failed to save college');
      }
    } catch {
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: `Offered Branches (${college.courses.length})` },
    { id: 'admissions', label: 'Fees & Admissions' },
    { id: 'placements', label: 'Placement Information' },
    { id: 'reviews', label: 'Student Reviews' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* 1. Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <Link href={`/colleges?state=${encodeURIComponent(college.state)}`} className="hover:text-brand-600 transition-colors">
            {college.state}
          </Link>
          <span>&gt;</span>
          <Link href={`/colleges?city=${encodeURIComponent(college.city)}`} className="hover:text-brand-600 transition-colors">
            {college.city}
          </Link>
          <span>&gt;</span>
          <span className="font-semibold text-slate-800 truncate max-w-md">{college.name}</span>
        </nav>

        {/* 2. Top Header Section matching the Reference Image */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Campus Photo */}
          <div className="w-full lg:w-96 h-56 sm:h-64 rounded-2xl overflow-hidden shadow-inner shrink-0 relative group">
            <img
              src={college.imageUrl}
              alt={college.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 text-[11px] font-semibold text-white bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md">
              🏛️ {college.state} Engineering Catalog
            </span>
          </div>

          {/* Right: Info & Actions */}
          <div className="flex-1 flex flex-col justify-between gap-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                    {college.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    <span>✓</span> Verified in 28-State Database
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 flex-wrap">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <span>★</span>
                    <span className="text-slate-900">{college.ratingDisplay || `${college.rating}/5`}</span>
                  </div>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    📍 {college.city}, {college.state}
                  </span>
                </div>
              </div>

              {/* Action Buttons Top Right */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:bg-slate-50"
                >
                  <span>♡</span> Save
                </button>
                <button
                  onClick={handleCompare}
                  className={`px-3.5 py-2 rounded-xl border font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                    isCompared
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span>⇄</span> Compare
                </button>
                <Link
                  href={`/kcet-2026-predictor`}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                >
                  Predict Cutoffs <span>⚡</span>
                </Link>
              </div>
            </div>

            {/* Accreditation & Metadata Badges Row */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1.5">
                🏛️ {college.type} Institution
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1.5">
                🎓 {college.totalBranchesOffered} Active Branches
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1.5">
                💰 Fees: {college.feesDisplay}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1.5">
                📍 {college.state}
              </span>
            </div>

            {/* Real Overview Text from Excel */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <strong className="text-slate-900 block mb-1">Official Overview:</strong>
              {college.overview}
            </p>
          </div>
        </div>

        {/* 3. Horizontal Tab Navigation Bar */}
        <div className="bg-white rounded-2xl px-3 border border-slate-200/80 shadow-sm flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4. Main Two-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (Main 8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Card 1: Real Excel Highlights */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6">
              <h2 className="text-lg font-black text-slate-900">
                Verified Institutional Highlights
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex flex-col items-center text-center">
                  <span className="text-2xl">🎓</span>
                  <span className="font-black text-base text-indigo-900 mt-1">{college.totalBranchesOffered}</span>
                  <span className="text-[11px] text-indigo-600 font-medium">Verified Branches</span>
                </div>
                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex flex-col items-center text-center">
                  <span className="text-2xl">💰</span>
                  <span className="font-black text-xs text-indigo-900 mt-1">{college.feesDisplay}</span>
                  <span className="text-[11px] text-indigo-600 font-medium">Annual Fee Range</span>
                </div>
                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex flex-col items-center text-center">
                  <span className="text-2xl">⭐</span>
                  <span className="font-black text-base text-indigo-900 mt-1">{college.ratingDisplay}</span>
                  <span className="text-[11px] text-indigo-600 font-medium">Institutional Rating</span>
                </div>
                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex flex-col items-center text-center">
                  <span className="text-2xl">📍</span>
                  <span className="font-black text-xs text-indigo-900 mt-1">{college.city}</span>
                  <span className="text-[11px] text-indigo-600 font-medium">{college.state}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Verified Engineering Branches (Extracted from Excel 'Yes' columns) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Verified Branches Offered</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Programs verified as available in the authoritative 28-state database
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  {college.courses.length} Programs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {college.courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-white transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                          ✓ Verified Branch
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {course.branchCode}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {course.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2 text-slate-600">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                          <span className="font-bold text-slate-800">{course.duration}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Annual Fees</span>
                          <span className="font-bold text-indigo-700">
                            {course.feesDisplay}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/kcet-2026-predictor`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 border-t border-slate-100 pt-2"
                    >
                      Check 2026 Cutoff for this Branch →
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Real Placement Information from Excel */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>📊</span> Placement & Career Opportunities
              </h2>
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-slate-800 text-xs sm:text-sm leading-relaxed">
                <strong className="text-amber-900 block mb-1.5">Official Placement Record:</strong>
                "{college.placementText}"
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Active Internship Support</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Campus Placement Cell</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Annual Recruiter Drives</span>
                </div>
              </div>
            </div>

            {/* Card 4: Real Student Reviews from Excel */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>💬</span> Student Reviews & Feedback
                </h2>
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full font-bold text-xs">
                  <span>★</span>
                  <span>{college.ratingDisplay}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed">
                <strong className="text-slate-900 block mb-1.5">Community & Academic Reviews:</strong>
                "{college.reviewsText}"
              </div>
            </div>
          </div>

          {/* Right Sidebar (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Sidebar Card 1: At a Glance (Real Excel Metadata) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                At a Glance
              </h3>
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">State</span>
                  <span className="font-bold text-slate-900">{college.state}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">City / Location</span>
                  <span className="font-bold text-slate-900">{college.city}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Institution Type</span>
                  <span className="font-bold text-slate-900">{college.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Total Active Branches</span>
                  <span className="font-bold text-indigo-700">{college.totalBranchesOffered} Branches</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Tuition Fees</span>
                  <span className="font-bold text-slate-900">{college.feesDisplay}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Affiliation</span>
                  <span className="font-bold text-slate-900 text-right max-w-[180px]">{college.affiliation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Data Source</span>
                  <span className="font-bold text-slate-900">{college.dataSource}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Verification Status</span>
                  <span className="font-bold text-emerald-600">✓ {college.lastVerified}</span>
                </div>
              </div>
            </div>

            {/* Sidebar Card 2: Entrance Exams & Codes from Excel */}
            {college.entranceExams && college.entranceExams.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-4">
                <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                  Entrance Exams & Codes
                </h3>
                <div className="flex flex-col gap-2.5 text-xs">
                  {college.entranceExams.map((ex, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700">{ex.exam}</span>
                      <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-200">
                        {ex.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sidebar Card 3: Quick Action Tools */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-base font-black text-white">
                Admissions Tools
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Check eligibility, predict KCET rank, and compare with other colleges in {college.state}.
              </p>

              <div className="flex flex-col gap-2.5 pt-2">
                <Link
                  href="/kcet-2026-predictor"
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl text-center shadow transition-colors"
                >
                  ⚡ Launch KCET 2026 Predictor
                </Link>
                <Link
                  href="/compare"
                  className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl text-center border border-white/20 transition-colors"
                >
                  ⚖️ Compare with other Colleges
                </Link>
                <Link
                  href={`/colleges?state=${encodeURIComponent(college.state)}`}
                  className="text-xs text-center text-slate-400 hover:text-white underline pt-1"
                >
                  View more colleges in {college.state} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
