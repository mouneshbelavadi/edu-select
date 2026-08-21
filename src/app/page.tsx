'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { StateCardImage } from '@/components/features/StateCardImage';
import { CollegeLogoBadge } from '@/components/features/CollegeLogoBadge';
import { ALL_STATE_CONFIGS } from '@/lib/stateConfig';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const POPULAR_BRANCH_TAGS = [
  { label: 'B.Tech CSE', query: 'Computer Science' },
  { label: 'B.Tech Mechanical', query: 'Mechanical' },
  { label: 'B.Tech ECE', query: 'Electronics' },
  { label: 'B.Tech Civil', query: 'Civil' },
  { label: 'AI & ML', query: 'Artificial Intelligence' },
];

export default function EduSelectDashboard() {
  const router = useRouter();
  const stateScrollRef = useRef<HTMLDivElement>(null);
  const collegeScrollRef = useRef<HTMLDivElement>(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  // Fetch real data from API endpoints
  const { data: statesRes } = useSWR('/api/states', fetcher);
  const { data: topCollegesRes } = useSWR('/api/colleges?limit=12&sortBy=rating&sortOrder=desc', fetcher);

  const defaultStatesList = ALL_STATE_CONFIGS.map((s) => ({
    name: s.name,
    collegeCount: s.name === 'Karnataka' ? 175 : 15,
  }));

  const statesList: { name: string; collegeCount: number }[] =
    statesRes?.data && statesRes.data.length > 0 ? statesRes.data : defaultStatesList;

  const popularColleges = topCollegesRes?.data || [];

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const queryParts = [searchTerm.trim(), selectedCourse.trim()].filter(Boolean);
    if (queryParts.length > 0) params.set('search', queryParts.join(' '));
    if (selectedState) params.set('state', selectedState);

    router.push(`/colleges?${params.toString()}`);
  };

  const handleTagClick = (tagQuery: string) => {
    router.push(`/colleges?search=${encodeURIComponent(tagQuery)}`);
  };

  const scrollStates = (direction: 'left' | 'right') => {
    if (stateScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      stateScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollColleges = (direction: 'left' | 'right') => {
    if (collegeScrollRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      collegeScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col gap-12 pb-20 bg-slate-50/50">
      {/* 1. HERO SECTION */}
      <section className="relative w-full bg-gradient-to-b from-blue-50/70 via-indigo-50/40 to-slate-50 pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Hero Copy & Search Bar */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold w-fit">
              <span>Your Future. Our Guidance.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Find the Right <br />
              <span className="text-blue-600">Engineering</span> College
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
              Explore top engineering colleges across India. Compare, shortlist and choose the best path for your future.
            </p>

            {/* Interactive Search Overlay Box */}
            <form
              onSubmit={handleHeroSearch}
              className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2"
            >
              {/* Search Query Input */}
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl w-full">
                <span className="text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search colleges, courses, exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none"
                />
              </div>

              {/* State Dropdown */}
              <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 rounded-xl w-full sm:w-44 border-t sm:border-t-0 border-slate-100">
                <span className="text-slate-400">📍</span>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-transparent text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="">Select State</option>
                  {statesList.map((st) => (
                    <option key={st.name} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Dropdown */}
              <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 rounded-xl w-full sm:w-44 border-t sm:border-t-0 border-slate-100">
                <span className="text-slate-400">📖</span>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-transparent text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="">Select Course</option>
                  <option value="Computer Science">B.Tech CSE</option>
                  <option value="Information Science">B.Tech ISE / IT</option>
                  <option value="Electronics">B.Tech ECE</option>
                  <option value="Electrical">B.Tech EEE</option>
                  <option value="Mechanical">B.Tech Mechanical</option>
                  <option value="Civil">B.Tech Civil</option>
                  <option value="Artificial Intelligence">B.Tech AI & ML</option>
                  <option value="Biotechnology">B.Tech Biotech</option>
                </select>
              </div>

              {/* Search Submit Button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors shrink-0"
              >
                Search
              </button>
            </form>

            {/* Popular Tags Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-500 mr-1">Popular:</span>
              {POPULAR_BRANCH_TAGS.map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => handleTagClick(tag.query)}
                  className="px-3 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-semibold rounded-full shadow-sm transition-all"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/60 bg-gradient-to-tr from-blue-900 to-indigo-950 p-6 sm:p-8 min-h-[380px] flex flex-col justify-between text-white">
              {/* Background Architectural Accent */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 bg-blue-500/30 border border-blue-400/40 rounded-full text-xs font-bold text-blue-200 uppercase tracking-wider">
                  🎓 Authoritative 28-State Data
                </span>
                <span className="text-xl">✨</span>
              </div>

              {/* Floating Glassmorphism Stats Card */}
              <div className="relative z-10 bg-white/95 backdrop-blur-md text-slate-900 rounded-2xl p-5 shadow-xl border border-slate-100 flex flex-col gap-3 my-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                    🏛️
                  </div>
                  <div>
                    <div className="text-lg font-black text-slate-900">580+ Engineering Colleges</div>
                    <div className="text-xs text-slate-500 font-medium">Verified Tuition & Placements</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
                  <div>
                    <span className="font-extrabold text-blue-600 text-base block">28 States</span>
                    <span className="text-slate-500">Covered Nationwide</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-emerald-600 text-base block">50+ Filters</span>
                    <span className="text-slate-500">To Find The Best</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between text-xs text-blue-200">
                <span>Updated Live with KEA & 28-State Datasets</span>
                <Link href="/colleges" className="font-bold text-white hover:underline">
                  Browse All →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR BELOW HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-blue-50/50">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
              🏛️
            </div>
            <div>
              <div className="text-lg font-black text-slate-900">580+</div>
              <div className="text-xs text-slate-500 font-medium">Engineering Colleges</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-emerald-50/50">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
              📍
            </div>
            <div>
              <div className="text-lg font-black text-slate-900">28</div>
              <div className="text-xs text-slate-500 font-medium">States & UTs</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-purple-50/50">
            <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
              📚
            </div>
            <div>
              <div className="text-lg font-black text-slate-900">50+</div>
              <div className="text-xs text-slate-500 font-medium">Courses & Branches</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-amber-50/50">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl font-bold shrink-0">
              👥
            </div>
            <div>
              <div className="text-lg font-black text-slate-900">100K+</div>
              <div className="text-xs text-slate-500 font-medium">Students Trust Us</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPLORE BY STATE SECTION (HORIZONTALLY SCROLLABLE CAROUSEL FOR ALL 28 STATES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Explore by State</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any state to view all registered engineering colleges & cutoff details ({statesList.length} States)
            </p>
          </div>

          {/* Left & Right Smooth Scroll Buttons & View All Link */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollStates('left')}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors font-bold text-base select-none"
              aria-label="Scroll Left"
              title="Scroll Left"
            >
              ‹
            </button>
            <button
              onClick={() => scrollStates('right')}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors font-bold text-base select-none"
              aria-label="Scroll Right"
              title="Scroll Right"
            >
              ›
            </button>
            <Link
              href="/states"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline ml-2 hidden sm:inline-flex"
            >
              View all states →
            </Link>
          </div>
        </div>

        {/* Scrollable State Cards Row */}
        <div
          ref={stateScrollRef}
          className="flex items-stretch gap-4 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 select-none"
          style={{ scrollbarWidth: 'thin' }}
        >
          {statesList.map((st) => (
            <Link
              key={st.name}
              href={`/colleges?state=${encodeURIComponent(st.name)}`}
              className="group shrink-0 w-[145px] sm:w-[155px] bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-500 hover:shadow-md transition-all flex flex-col"
            >
              <StateCardImage stateName={st.name} className="h-24 w-full relative overflow-hidden" />
              <div className="p-3 flex flex-col gap-0.5">
                <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate" title={st.name}>
                  {st.name}
                </h3>
                <span className="text-[10px] text-slate-500 font-medium">
                  {st.collegeCount}+ Colleges
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. POPULAR ENGINEERING COLLEGES (HORIZONTALLY SCROLLABLE CAROUSEL) & QUICK LINKS SIDEBAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main 8-Col Section: Top Popular Colleges Carousel */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Popular Engineering Colleges</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Top engineering institutions ranked by student satisfaction and placements
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollColleges('left')}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors font-bold text-base select-none"
                  aria-label="Scroll Colleges Left"
                  title="Scroll Left"
                >
                  ‹
                </button>
                <button
                  onClick={() => scrollColleges('right')}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors font-bold text-base select-none"
                  aria-label="Scroll Colleges Right"
                  title="Scroll Right"
                >
                  ›
                </button>
                <Link
                  href="/colleges"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline ml-2 hidden sm:inline-flex"
                >
                  View all colleges →
                </Link>
              </div>
            </div>

            {/* Scrollable Popular Colleges Strip */}
            <div
              ref={collegeScrollRef}
              className="flex items-stretch gap-4 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 select-none"
              style={{ scrollbarWidth: 'thin' }}
            >
              {popularColleges.map((college: any) => {
                const numericRating = typeof college.rating === 'number' ? college.rating : 4.5;
                const starCount = Math.round(numericRating);

                return (
                  <div
                    key={college.id}
                    className="shrink-0 w-[240px] sm:w-[260px] bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Top Header: Badge & Type */}
                      <div className="flex items-start justify-between gap-2">
                        <CollegeLogoBadge name={college.name} size="md" />
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                          {college.type || 'ENGINEERING'}
                        </span>
                      </div>

                      {/* College Name & Location */}
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2" title={college.name}>
                          {college.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          📍 {college.city}, {college.state}
                        </p>
                      </div>

                      {/* Star Rating */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-xs font-black text-slate-900">
                          {college.ratingDisplay || `${numericRating.toFixed(1)}/5`}
                        </span>
                        <div className="flex text-amber-400 text-xs">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < starCount ? '★' : '☆'}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer: Fees & Action Button */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500 font-medium">Annual Fees:</span>
                        <span className="font-extrabold text-slate-800">
                          {college.feesDisplay || 'Per State Quota'}
                        </span>
                      </div>

                      <Link
                        href={`/colleges/${encodeURIComponent(college.slug || college.id)}`}
                        className="w-full py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold rounded-xl text-center transition-colors shadow-sm"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar 4-Col Section: Quick Links & Tools */}
          <div className="lg:col-span-4 flex flex-col gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
              Quick Links & Tools
            </h3>

            <div className="flex flex-col gap-3">
              <Link
                href="/kcet-2026-predictor"
                className="p-3.5 bg-blue-50/60 hover:bg-blue-100/80 rounded-xl border border-blue-100 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    🎯
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">
                      College Predictor
                    </h4>
                    <p className="text-[10px] text-slate-500">Predict your best college & branch</p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-blue-700 font-bold text-sm">›</span>
              </Link>

              <Link
                href="/compare"
                className="p-3.5 bg-emerald-50/60 hover:bg-emerald-100/80 rounded-xl border border-emerald-100 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    ⚖️
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Compare Colleges
                    </h4>
                    <p className="text-[10px] text-slate-500">Compare up to 3 colleges side by side</p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-emerald-700 font-bold text-sm">›</span>
              </Link>

              <Link
                href="/states"
                className="p-3.5 bg-amber-50/60 hover:bg-amber-100/80 rounded-xl border border-amber-100 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                    🏛️
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-800 transition-colors">
                      28 States Dataset
                    </h4>
                    <p className="text-[10px] text-slate-500">Browse colleges by Indian state</p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-amber-800 font-bold text-sm">›</span>
              </Link>

              <Link
                href="/saved"
                className="p-3.5 bg-purple-50/60 hover:bg-purple-100/80 rounded-xl border border-purple-100 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                    ♥
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-purple-700 transition-colors">
                      Saved Colleges
                    </h4>
                    <p className="text-[10px] text-slate-500">View favorites & shortlisted colleges</p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-purple-700 font-bold text-sm">›</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VALUE PROPOSITION BAR AT BOTTOM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-base shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">Comprehensive Information</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Get detailed info on colleges, fees, placements, cutoffs and more.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-base shrink-0">
              ⚖️
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">Smart Comparison</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Compare colleges side by side and make the right choice.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-base shrink-0">
              ♥
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">Personalized Experience</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Save favorites, track history and get recommendations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-base shrink-0">
              👥
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">Trusted by Students</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Join thousands of students who trust EduSelect.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
