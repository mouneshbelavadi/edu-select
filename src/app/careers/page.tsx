'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { CareerCardComponent } from '@/components/features/CareerCard';
import { AiCounselorDrawer } from '@/components/features/AiCounselorDrawer';
import { CareerCard, CareerCluster, Taxonomy } from '@/types/careerData';
import { Button } from '@/components/ui/Button';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const QUALIFICATION_LEVELS = [
  { id: 'CLASS_10', shortLabel: 'Class 10th', label: 'Completed 10th Standard', icon: '🎒', desc: 'Diploma, ITI, polytechnic, defence & 11th-12th streams' },
  { id: 'CLASS_12', shortLabel: 'Class 12th / PU', label: '12th / PUC / Intermediate', icon: '📘', desc: 'Degrees, engineering, medical, law, NDA & commerce' },
  { id: 'ITI', shortLabel: 'ITI Graduate', label: 'ITI Certified', icon: '🔧', desc: 'Technical trades, CITS, apprentice, railway & PSU technician' },
  { id: 'DIPLOMA', shortLabel: 'Polytechnic Diploma', label: 'Engineering Diploma', icon: '📐', desc: 'Lateral entry B.Tech, junior engineer & technical PSUs' },
  { id: 'UG_ENGG', shortLabel: 'B.Tech / B.E.', label: 'Engineering Graduate', icon: '💻', desc: 'Software, core engineering, GATE, PSUs, IES & MS abroad' },
  { id: 'UG_OTHER', shortLabel: 'General Degree', label: 'B.Sc / B.Com / B.A. / BBA / BCA', icon: '🎓', desc: 'Corporate jobs, banking, civil services, MBA & MCA' },
  { id: 'PROFESSIONAL', shortLabel: 'Professional Degree', label: 'MBBS / LLB / B.Arch / CA', icon: '⚖️', desc: 'Specialized practice, judiciary, hospital administration' },
  { id: 'PG', shortLabel: 'Postgraduate', label: 'M.Tech / M.Sc / MBA / Ph.D', icon: '🔬', desc: 'R&D, university teaching, senior executive & specialist' },
];

const STREAM_OPTIONS = [
  { id: 'PCM', label: 'Science — PCM', desc: 'Physics, Chemistry, Maths' },
  { id: 'PCB', label: 'Science — PCB', desc: 'Physics, Chemistry, Biology' },
  { id: 'PCMB', label: 'Science — PCMB', desc: 'Physics, Chem, Maths, Bio' },
  { id: 'PCMC', label: 'Science — PCMC', desc: 'Physics, Chem, Maths, CS' },
  { id: 'COMMERCE_MATHS', label: 'Commerce + Maths', desc: 'Accounts, Eco, Business, Maths' },
  { id: 'COMMERCE_NO_MATHS', label: 'Commerce (No Maths)', desc: 'Accounts, Eco, Business' },
  { id: 'ARTS', label: 'Humanities / Arts', desc: 'History, Pol Sci, Psychology' },
  { id: 'VOCATIONAL', label: 'Vocational / Other', desc: 'Skill-based streams' },
];

const RIASEC_OPTIONS = [
  { code: 'R', label: 'Realistic (Doers)', icon: '🛠️', desc: 'Hands-on, machines, tools, practical work' },
  { code: 'I', label: 'Investigative (Thinkers)', icon: '🔬', desc: 'Research, analysis, science, problem-solving' },
  { code: 'A', label: 'Artistic (Creators)', icon: '🎨', desc: 'Design, writing, innovation, self-expression' },
  { code: 'S', label: 'Social (Helpers)', icon: '🤝', desc: 'Teaching, counselling, healthcare, community' },
  { code: 'E', label: 'Enterprising (Persuaders)', icon: '🚀', desc: 'Leadership, business, startups, management' },
  { code: 'C', label: 'Conventional (Organizers)', icon: '📊', desc: 'Data, finance, systems, compliance, planning' },
];

const POPULAR_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Electronics', 'Economics', 'Accountancy', 'English', 'Business Studies',
  'Mechanical', 'Civil', 'Design'
];

function CareersExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state reading
  const currentLevel = searchParams.get('level') || '';
  const currentStream = searchParams.get('stream') || '';
  const currentBranch = searchParams.get('branch') || '';
  const currentKind = searchParams.get('kind') || '';
  const currentSearch = searchParams.get('q') || '';
  const currentCluster = searchParams.get('cluster') || '';
  const currentRiasec = searchParams.get('riasec')?.split(',').filter(Boolean) || [];
  const currentSubjects = searchParams.get('subjects')?.split(',').filter(Boolean) || [];
  const currentOutlook = searchParams.get('outlook')?.split(',').filter(Boolean) || [];
  const currentSector = searchParams.get('sector')?.split(',').filter(Boolean) || [];
  const currentBudget = searchParams.get('budget') || '';
  const currentDuration = searchParams.get('duration') || '';
  const currentSalary = searchParams.get('salary') || '';
  const currentEntrance = searchParams.get('entrance') || '';
  const currentAbroad = searchParams.get('abroad') || '';
  const currentSort = searchParams.get('sort') || 'relevance';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Local state for mobile filter drawer
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Fetch Taxonomy and Clusters
  const { data: taxonomyRes } = useSWR('/api/careers/taxonomy', fetcher);
  const taxonomy: Taxonomy | undefined = taxonomyRes?.data;

  // Build query string for API
  const apiQueryString = useMemo(() => {
    const params = new URLSearchParams();
    if (currentLevel) params.set('level', currentLevel);
    if (currentStream) params.set('stream', currentStream);
    if (currentBranch) params.set('branch', currentBranch);
    if (currentKind) params.set('kind', currentKind);
    if (currentSearch) params.set('q', currentSearch);
    if (currentCluster) params.set('cluster', currentCluster);
    if (currentRiasec.length) params.set('riasec', currentRiasec.join(','));
    if (currentSubjects.length) params.set('subjects', currentSubjects.join(','));
    if (currentOutlook.length) params.set('outlook', currentOutlook.join(','));
    if (currentSector.length) params.set('sector', currentSector.join(','));
    if (currentBudget) params.set('budget', currentBudget);
    if (currentDuration) params.set('duration', currentDuration);
    if (currentSalary) params.set('salary', currentSalary);
    if (currentEntrance) params.set('entrance', currentEntrance);
    if (currentAbroad) params.set('abroad', currentAbroad);
    params.set('sort', currentSort);
    params.set('page', currentPage.toString());
    params.set('limit', '18');
    return params.toString();
  }, [
    currentLevel, currentStream, currentBranch, currentKind, currentSearch,
    currentCluster, currentRiasec, currentSubjects, currentOutlook, currentSector,
    currentBudget, currentDuration, currentSalary, currentEntrance, currentAbroad,
    currentSort, currentPage
  ]);

  // Fetch filtered careers
  const { data: careersRes, isValidating } = useSWR(`/api/careers?${apiQueryString}`, fetcher);
  const careersData = careersRes?.data;
  const items: CareerCard[] = careersData?.items || [];
  const totalItems: number = careersData?.total || 0;
  const totalPages: number = careersData?.totalPages || 1;

  // Update query params helper
  const updateParams = (updates: Record<string, string | null | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, val);
      }
    });
    // Reset page to 1 whenever filters change (unless updating page itself)
    if (!('page' in updates)) {
      newParams.delete('page');
    }
    router.push(`/careers?${newParams.toString()}`, { scroll: false });
  };

  const handleLevelSelect = (levelId: string) => {
    if (currentLevel === levelId) {
      updateParams({ level: null, stream: null, branch: null });
    } else {
      updateParams({ level: levelId, stream: null, branch: null });
    }
  };

  const handleStreamSelect = (streamId: string) => {
    updateParams({ stream: currentStream === streamId ? null : streamId });
  };

  const handleRiasecToggle = (code: string) => {
    const next = currentRiasec.includes(code)
      ? currentRiasec.filter((c) => c !== code)
      : [...currentRiasec, code];
    updateParams({ riasec: next.length ? next.join(',') : null });
  };

  const handleSubjectToggle = (subj: string) => {
    const next = currentSubjects.includes(subj)
      ? currentSubjects.filter((s) => s !== subj)
      : [...currentSubjects, subj];
    updateParams({ subjects: next.length ? next.join(',') : null });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() || null });
  };

  const handleClearAll = () => {
    setSearchInput('');
    router.push('/careers');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-24">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider w-fit">
              <span>🧭 India Career & Pathway Explorer</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              What Can I Become? <br className="hidden sm:inline" />
              <span className="text-blue-400">Explore Careers & Courses</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Discover verified pathways after Class 10th, 12th/PUC, ITI, Diploma, Engineering, or any graduate degree.
              Filter by real salary, fees, entrance exams, 7th CPC government posts, and job outlook.
            </p>
          </div>

          <div className="shrink-0">
            <AiCounselorDrawer
              initialLevel={currentLevel}
              initialStream={currentStream}
              initialInterests={currentRiasec}
              initialSubjects={currentSubjects}
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col gap-10">
        {/* 2. STEP 1: WHERE ARE YOU NOW? (8 LARGE CARDS) */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Step 1 of 3</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Where are you right now?</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Select your current or highest qualification</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {QUALIFICATION_LEVELS.map((lvl) => {
              const isSelected = currentLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => handleLevelSelect(lvl.id)}
                  aria-pressed={isSelected}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl">{lvl.icon}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-black text-sm ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                      {lvl.shortLabel}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {lvl.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. STEP 2: STREAM OR BRANCH (CONDITIONAL) */}
        {currentLevel === 'CLASS_12' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-4 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Step 2: Stream</span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Which 12th/PUC stream are you studying?</h2>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {STREAM_OPTIONS.map((st) => {
                const isSelected = currentStream === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleStreamSelect(st.id)}
                    aria-pressed={isSelected}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-white'
                    }`}
                  >
                    <span>{st.label}</span>
                    <span className={`block text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {st.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. STEP 3: RIASEC & INTERESTS (OPTIONAL) */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Step 3 (Optional)</span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">What work styles and subjects do you enjoy?</h2>
            </div>
            <span className="text-xs text-slate-500">Pick any to refine career matching</span>
          </div>

          {/* RIASEC Chips */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-700">Holland RIASEC Interest Types:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {RIASEC_OPTIONS.map((r) => {
                const isSelected = currentRiasec.includes(r.code);
                return (
                  <button
                    key={r.code}
                    onClick={() => handleRiasecToggle(r.code)}
                    aria-pressed={isSelected}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold'
                        : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-lg">{r.icon}</span>
                    <div>
                      <div className="text-xs font-extrabold">{r.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">{r.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subjects Liked */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700">Subjects I like:</span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SUBJECTS.map((subj) => {
                const isSelected = currentSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    onClick={() => handleSubjectToggle(subj)}
                    aria-pressed={isSelected}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                    }`}
                  >
                    {isSelected ? `✓ ${subj}` : `+ ${subj}`}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. SEARCH & RESULTS SECTION */}
        <section className="flex flex-col gap-6">
          {/* Top Bar: Tabs, Search Box, Sort */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Kind Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0" style={{ scrollbarWidth: 'none' }}>
              {[
                { id: '', label: 'All Pathways' },
                { id: 'pathway', label: 'Courses & Paths' },
                { id: 'branch', label: 'Engineering Branches' },
                { id: 'degree', label: 'Degrees & Roles' },
                { id: 'govtJob', label: 'Government Jobs' },
              ].map((tab) => {
                const isSelected = currentKind === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => updateParams({ kind: tab.id || null })}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input & Filter Toggle */}
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearchSubmit} className="flex-1 sm:w-64 flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-200">
                <span className="text-slate-400 text-xs mr-2">🔍</span>
                <input
                  type="text"
                  placeholder="Search roles, degrees..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
                />
              </form>

              {/* Sort Selector */}
              <select
                value={currentSort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="bg-slate-100 text-xs font-bold text-slate-700 rounded-xl px-3 py-2.5 border border-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="relevance">Best Match</option>
                <option value="salary_desc">Highest Salary</option>
                <option value="cost_asc">Lowest Cost</option>
                <option value="duration_asc">Shortest Duration</option>
              </select>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold"
              >
                Filters
              </button>
            </div>
          </div>

          {/* Main Grid: Sidebar + Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Filter Sidebar (Desktop) */}
            <aside className={`lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 ${
              isFilterDrawerOpen ? 'fixed inset-0 z-50 overflow-y-auto p-6 bg-white' : 'hidden lg:flex'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900">Filter Careers</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearAll}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Clear All
                  </button>
                  {isFilterDrawerOpen && (
                    <button
                      onClick={() => setIsFilterDrawerOpen(false)}
                      className="lg:hidden text-slate-400 hover:text-slate-700 text-sm font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Outlook Filter */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-700">Market Outlook</span>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: 'GROWING', label: 'Growing Demand ↗' },
                    { id: 'STABLE', label: 'Stable Outlook →' },
                    { id: 'DECLINING', label: 'Shifting / Declining ↘' },
                  ].map((o) => {
                    const isChecked = currentOutlook.includes(o.id);
                    return (
                      <label key={o.id} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const next = isChecked
                              ? currentOutlook.filter((x) => x !== o.id)
                              : [...currentOutlook, o.id];
                            updateParams({ outlook: next.length ? next.join(',') : null });
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{o.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Budget Filter */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-700">Total Program Budget</span>
                <select
                  value={currentBudget}
                  onChange={(e) => updateParams({ budget: e.target.value || null })}
                  className="bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-700 focus:outline-none"
                >
                  <option value="">Any Budget</option>
                  <option value="under-50k">Under ₹50,000</option>
                  <option value="50k-2l">₹50,000 to ₹2 Lakh</option>
                  <option value="2l-10l">₹2 Lakh to ₹10 Lakh</option>
                  <option value="10l-plus">₹10 Lakh+</option>
                </select>
              </div>

              {/* Salary Filter */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-700">Entry Salary (Fresher)</span>
                <select
                  value={currentSalary}
                  onChange={(e) => updateParams({ salary: e.target.value || null })}
                  className="bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-700 focus:outline-none"
                >
                  <option value="">Any Salary</option>
                  <option value="under-3l">Under ₹3 LPA</option>
                  <option value="3l-6l">₹3 to ₹6 LPA</option>
                  <option value="6l-12l">₹6 to ₹12 LPA</option>
                  <option value="12l-plus">₹12 LPA+</option>
                </select>
              </div>

              {/* Abroad Friendly */}
              <div className="flex items-center justify-between text-xs text-slate-700 pt-2 border-t border-slate-100">
                <span className="font-semibold">Abroad Friendly</span>
                <input
                  type="checkbox"
                  checked={currentAbroad === 'true'}
                  onChange={(e) => updateParams({ abroad: e.target.checked ? 'true' : null })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              {/* Entrance Required */}
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span className="font-semibold">Entrance Exam Required</span>
                <input
                  type="checkbox"
                  checked={currentEntrance === 'true'}
                  onChange={(e) => updateParams({ entrance: e.target.checked ? 'true' : null })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              {isFilterDrawerOpen && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="w-full mt-4"
                >
                  Apply Filters
                </Button>
              )}
            </aside>

            {/* Results Grid */}
            <main className="lg:col-span-9 flex flex-col gap-6">
              {/* Results Count Header */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800">
                  Showing {items.length} of {totalItems} career options
                </span>
                {isValidating && <span className="text-blue-600 animate-pulse font-semibold">Updating...</span>}
              </div>

              {/* Loading Skeletons */}
              {!careersRes ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 p-5 animate-pulse flex flex-col justify-between" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 flex flex-col items-center gap-4">
                  <span className="text-4xl">🔍</span>
                  <h3 className="font-extrabold text-slate-900 text-lg">No career options match your filters</h3>
                  <p className="text-xs text-slate-500 max-w-md">
                    Try broadening your selection by resetting budget, interest or stream criteria.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleClearAll}>
                    Reset All Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((card) => (
                    <CareerCardComponent key={`${card.kind}-${card.id}`} card={card} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => updateParams({ page: (currentPage - 1).toString() })}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  >
                    ← Previous
                  </button>
                  <span className="text-xs font-semibold text-slate-600 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => updateParams({ page: (currentPage + 1).toString() })}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </main>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function CareersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CareersExplorerContent />
    </Suspense>
  );
}
