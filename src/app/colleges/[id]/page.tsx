'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCompareStore } from '@/lib/store/useCompareStore';
import toast from 'react-hot-toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { CollegeDetail } from '@/lib/collegeRepository';
import engineeringBranchesData from '@/data/careers/engineeringBranches.json';

const branchCareerMap: Record<string, any> = {};
(engineeringBranchesData as any).items.forEach((b: any) => {
  branchCareerMap[b.code.toUpperCase()] = b;
});

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
          The requested institution could not be found in the database.
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
        toast.success(`Saved ${college.name} to your dashboard!`);
      } else {
        const data = await res.json();
        toast.error(data.error?.message || data.error || 'Failed to save');
      }
    } catch {
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Campus' },
    { id: 'courses', label: `Courses (${college.courses.length})` },
    { id: 'placements', label: 'Placements & Packages' },
    { id: 'reviews', label: 'Student Reviews' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* 1. Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/colleges" className="hover:text-blue-600 transition-colors">Colleges</Link>
          <span>/</span>
          <Link href={`/colleges?state=${encodeURIComponent(college.state)}`} className="hover:text-blue-600 transition-colors">{college.state}</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-[200px]">{college.name}</span>
        </nav>

        {/* 2. Hero Profile Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Campus Photo */}
          <div className="w-full lg:w-96 h-56 sm:h-64 rounded-2xl overflow-hidden shadow-inner shrink-0 relative group">
            <img
              src={college.imageUrl || '/images/college-placeholder.jpg'}
              alt={college.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 text-[11px] font-semibold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md">
              🏛️ {college.state}
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
                </div>

                {/* Subtitle with location and NIRF badge */}
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 flex-wrap">
                  {college.nirfRank2025 ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-lg text-xs">
                      🏆 NIRF 2025 #{college.nirfRank2025}
                    </span>
                  ) : college.nirfBand2025 ? (
                    <span className="inline-flex items-center gap-1 font-bold text-blue-800 bg-blue-50 border border-blue-300 px-2.5 py-0.5 rounded-lg text-xs">
                      NIRF 2025 Band {college.nirfBand2025}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-xs">
                      Not in NIRF 2025 top 100
                    </span>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    📍 {college.city}, {college.state}
                  </span>
                  {college.established && (
                    <>
                      <span>•</span>
                      <span className="text-slate-500">Estd. {college.established}</span>
                    </>
                  )}
                </div>

                {college.nirfNote && (
                  <p className="text-xs text-slate-500 italic mt-0.5">
                    {college.nirfNote}
                  </p>
                )}
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
                  <span>⇄</span> {isCompared ? 'Compared' : 'Compare'}
                </button>
                <Link
                  href="/kcet-2026-predictor"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                >
                  Predict Cutoffs <span>⚡</span>
                </Link>
              </div>
            </div>

            {/* Type Detail Chip & Badges */}
            <div className="flex flex-wrap gap-2 pt-1 items-center">
              {college.typeDetail && (
                <span className="px-3 py-1 bg-indigo-50 text-indigo-800 text-xs font-bold rounded-lg border border-indigo-200">
                  🏛️ {college.typeDetail}
                </span>
              )}
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
                🎓 {college.totalBranchesOffered || college.courses.length} Active Branches
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1">
                💰 Tuition: {college.feesDisplay}
                {college.feesIsEstimate !== false && (
                  <span className="ml-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                    Est.
                  </span>
                )}
              </span>
            </div>

            {/* Admission Routes */}
            {college.admissionRoutes && college.admissionRoutes.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                <span className="font-semibold text-slate-500">Admission Routes:</span>
                {college.admissionRoutes.map((route, i) => (
                  <span key={i} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-200 text-[11px]">
                    {route}
                  </span>
                ))}
                {college.routeNote && (
                  <span className="text-slate-500 text-[11px] italic">({college.routeNote})</span>
                )}
              </div>
            )}

            {/* Overview */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <strong className="text-slate-900 block mb-1">Official Overview:</strong>
              {college.overview}
            </p>
          </div>
        </div>

        {/* Amber Notice for Courses Note */}
        {college.coursesNote && (
          <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
            <span className="text-amber-600 text-base leading-none">⚠️</span>
            <div>
              <strong className="font-bold">Course Verification Notice: </strong>
              <span>{college.coursesNote}</span>
            </div>
          </div>
        )}

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
            {/* Card 1: Courses */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>📚</span> Academic Engineering Programs
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Programs verified as available in the authoritative database
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
                          ✓ Branch
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

                    <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs font-bold">
                      <Link
                        href={`/careers/branch/branch-${course.branchCode.toLowerCase()}`}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>Careers after this branch</span>
                        <span>→</span>
                      </Link>
                      <Link
                        href="/kcet-2026-predictor"
                        className="text-slate-500 hover:text-slate-800 text-[11px]"
                      >
                        Cutoff &gt;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Jobs After This Course Panel */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>💼</span> Jobs & Placements After These Branches
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified industry entry roles and market fresher CTC from the 2026 Career Data
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Est. Fresher CTC
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {college.courses.slice(0, 6).map((course) => {
                  const branchInfo = branchCareerMap[course.branchCode.toUpperCase()];
                  if (!branchInfo) return null;
                  return (
                    <div
                      key={course.id}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between gap-3"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900">{course.branchCode}</span>
                          {branchInfo.salaryLPA?.fresher && (
                            <span className="text-xs font-black text-emerald-700">
                              ₹{branchInfo.salaryLPA.fresher.min}–₹{branchInfo.salaryLPA.fresher.max} LPA
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 line-clamp-1">{branchInfo.name}</span>
                        {branchInfo.roles?.entry && (
                          <div className="text-[11px] text-slate-500">
                            <strong>Top Roles: </strong>
                            {branchInfo.roles.entry.slice(0, 3).join(', ')}
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/careers/branch/branch-${course.branchCode.toLowerCase()}`}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Full Career Pathway & PSUs →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 2: Placement Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>📊</span> Placement & Career Opportunities
                </h2>
                {college.placementStats ? (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    college.placementStats.verified
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {college.placementStats.verified ? '✓ Verified Statistics' : '⚠️ Unverified Aggregator Data'}
                  </span>
                ) : (
                  <a
                    href="https://www.nirfindia.org"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    View Official NIRF Reports ↗
                  </a>
                )}
              </div>

              {college.placementStats ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                      <span className="text-xs text-blue-700 font-semibold block">Median Package</span>
                      <span className="text-xl font-black text-blue-900">
                        {college.placementStats.medianLPA ? `₹${college.placementStats.medianLPA} LPA` : 'N/A'}
                      </span>
                      <span className="text-[10px] text-blue-600 block mt-0.5">Year {college.placementStats.year}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-xs text-emerald-700 font-semibold block">Average Package</span>
                      <span className="text-xl font-black text-emerald-900">
                        {college.placementStats.averageLPA ? `₹${college.placementStats.averageLPA} LPA` : 'NIRF Median basis'}
                      </span>
                      <span className="text-[10px] text-emerald-600 block mt-0.5">Year {college.placementStats.year}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                      <span className="text-xs text-purple-700 font-semibold block">Highest Package</span>
                      <span className="text-xl font-black text-purple-900">
                        {college.placementStats.highestLPA ? `₹${college.placementStats.highestLPA} LPA` : 'Check DCS'}
                      </span>
                      <span className="text-[10px] text-purple-600 block mt-0.5">Year {college.placementStats.year}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center flex-wrap gap-2">
                    <span>Source: {college.placementStats.source}</span>
                    {college.placementStats.sourceUrl && (
                      <a
                        href={college.placementStats.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Verification Source ↗
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-slate-800 text-xs sm:text-sm leading-relaxed">
                  <strong className="text-amber-900 block mb-1.5">Official Placement Record:</strong>
                  <p>{college.placementText || "Official placement statistics are published in the institute's NIRF Data Capturing System (DCS) file."}</p>
                  <a
                    href="https://www.nirfindia.org"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 font-bold text-blue-700 hover:underline"
                  >
                    Check official NIRF Data Capturing System (DCS) reports at nirfindia.org ↗
                  </a>
                </div>
              )}
            </div>

            {/* Card 3: Reviews */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>💬</span> Student Reviews & Feedback
              </h2>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed">
                <strong className="text-slate-900 block mb-1.5">Community & Academic Reviews:</strong>
                "{college.reviewsText}"
              </div>
            </div>
          </div>

          {/* Right Sidebar (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Sidebar Card 1: At a Glance */}
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
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Data Source</span>
                  <span className="font-bold text-slate-900">{college.dataSource}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Last Verified</span>
                  <span className="font-bold text-emerald-600">{college.lastVerified}</span>
                </div>
              </div>
            </div>

            {/* Sidebar Card 2: Entrance Exams & Codes */}
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
                Check eligibility, predict cutoffs, and compare with other colleges in {college.state}.
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

        {/* Footer line */}
        <div className="border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          Data source: {college.dataSource} · Last verified: {college.lastVerified} · Values marked Est. are curated estimates.
        </div>
      </div>
    </div>
  );
}
