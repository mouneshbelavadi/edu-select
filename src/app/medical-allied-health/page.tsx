'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  ScaleIcon,
  GraduationCapIcon,
} from '@/components/ui/Icons';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DISCIPLINES = [
  { id: 'All', label: 'All Health Sciences' },
  { id: 'Medical', label: 'MBBS Medical (67)' },
  { id: 'Dental', label: 'BDS Dental (28)' },
  { id: 'Pharmacy', label: 'Pharmacy (43)' },
  { id: 'Nursing', label: 'B.Sc Nursing (650)' },
];

const MANAGEMENT_TYPES = [
  { id: 'All', label: 'All Types' },
  { id: 'Government', label: 'Government' },
  { id: 'Private Unaided', label: 'Private Unaided' },
  { id: 'Deemed', label: 'Deemed / Private Univ' },
];

const CITIES = [
  'All',
  'Bengaluru',
  'Mysuru',
  'Mangaluru',
  'Belagavi',
  'Hubballi',
  'Kalaburagi',
  'Ballari',
  'Davangere',
  'Shivamogga',
  'Tumakuru',
];

function MedicalSeatsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState(searchParams?.get('discipline') || 'All');
  const [selectedManagement, setSelectedManagement] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedForCompare, setSelectedForCompare] = useState<any[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const limit = 30;

  // Load saved comparison list from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('eduselect_medical_compare');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedForCompare(parsed);
        }
      }
    } catch {}
  }, []);

  // Lock scroll when modal is open and handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCompareModalOpen(false);
    };
    if (isCompareModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCompareModalOpen]);

  const isCollegeSelected = (id: string) => {
    return selectedForCompare.some((c) => c.id === id);
  };

  const toggleCompare = (college: any) => {
    if (isCollegeSelected(college.id)) {
      const updated = selectedForCompare.filter((c) => c.id !== college.id);
      setSelectedForCompare(updated);
      try {
        localStorage.setItem('eduselect_medical_compare', JSON.stringify(updated));
      } catch {}
      toast.success(`Removed ${college.name.slice(0, 24)}... from compare`);
    } else {
      if (selectedForCompare.length >= 4) {
        toast.error('You can compare a maximum of 4 medical colleges at a time.');
        return;
      }
      const updated = [...selectedForCompare, college];
      setSelectedForCompare(updated);
      try {
        localStorage.setItem('eduselect_medical_compare', JSON.stringify(updated));
      } catch {}
      toast.success(`Added ${college.name.slice(0, 24)}... to comparison board (${updated.length}/4)`);
    }
  };

  const removeCompare = (id: string) => {
    const updated = selectedForCompare.filter((c) => c.id !== id);
    setSelectedForCompare(updated);
    try {
      localStorage.setItem('eduselect_medical_compare', JSON.stringify(updated));
    } catch {}
    if (updated.length < 2 && isCompareModalOpen) {
      setIsCompareModalOpen(false);
    }
  };

  const clearCompare = () => {
    setSelectedForCompare([]);
    try {
      localStorage.removeItem('eduselect_medical_compare');
    } catch {}
    setIsCompareModalOpen(false);
    toast.success('Cleared medical comparison list');
  };

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) queryParams.set('search', search);
  if (selectedDiscipline !== 'All') queryParams.set('discipline', selectedDiscipline);
  if (selectedManagement !== 'All') queryParams.set('management', selectedManagement);
  if (selectedCity !== 'All') queryParams.set('city', selectedCity);

  const { data, isLoading } = useSWR(
    `/api/medical-colleges?${queryParams.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  const colleges = data?.data || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 1 };
  const metadata = data?.metadata || {
    totalInstitutes: 788,
    disciplineCounts: { Medical: 67, Dental: 28, Pharmacy: 43, Nursing: 650 },
  };

  const handleDisciplineChange = (d: string) => {
    setSelectedDiscipline(d);
    setPage(1);
  };

  const handleManagementChange = (m: string) => {
    setSelectedManagement(m);
    setPage(1);
  };

  const handleCityChange = (c: string) => {
    setSelectedCity(c);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-surface-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-400/20 border border-rose-300/30 text-rose-200 text-xs font-semibold uppercase tracking-wider w-fit">
              <GraduationCapIcon className="w-3.5 h-3.5 text-rose-200" />
              <span>Official KEA Seat Matrix • NEET UG & KCET 2025–2026</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Karnataka <span className="text-rose-300">Medical & Allied Health</span> Seats
            </h1>
            <p className="text-surface-200 text-sm sm:text-base leading-relaxed">
              Explore <strong>788 Health Sciences Colleges</strong> across Karnataka. Check verified KEA seat matrices, Government vs Private quota seats, approved intake, and entrance exam requirements for MBBS, BDS, Pharmacy, and B.Sc Nursing.
            </p>
            <div className="flex flex-wrap gap-3 pt-2 text-xs text-rose-200 font-medium">
              <span className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                🩺 <strong>{metadata.disciplineCounts?.Medical || 67}</strong> MBBS Colleges
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                🦷 <strong>{metadata.disciplineCounts?.Dental || 28}</strong> Dental (BDS) Colleges
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                💊 <strong>{metadata.disciplineCounts?.Pharmacy || 43}</strong> Pharmacy Institutes
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                💉 <strong>{metadata.disciplineCounts?.Nursing || 650}</strong> Nursing Colleges
              </span>
            </div>
          </div>
        </div>

        {/* NEET & Career Pathways Link Banner */}
        <div className="bg-gradient-to-r from-emerald-900/90 via-teal-900/80 to-slate-900 text-white rounded-2xl p-5 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Planning for Medical, Dental, or Pharmacy Careers?
              </div>
              <p className="text-sm text-surface-200">
                Explore NEET UG scoring criteria, duration, mandatory internships, and post-graduation options (MD/MS/MDS/Pharm.D).
              </p>
            </div>
          </div>
          <Link
            href="/careers"
            className="shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all shadow"
          >
            Explore Health Pathways →
          </Link>
        </div>

        {/* Discipline Filter Tabs */}
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-surface-200 shadow-sm">
          {DISCIPLINES.map((d) => (
            <button
              key={d.id}
              onClick={() => handleDisciplineChange(d.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                selectedDiscipline === d.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-surface-600 hover:bg-surface-100'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by college name, code (e.g. M001), city or course..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-medium"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-surface-400 hover:text-surface-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <select
                value={selectedManagement}
                onChange={(e) => handleManagementChange(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-surface-50 border border-surface-200 rounded-xl text-surface-800 focus:ring-2 focus:ring-rose-500"
              >
                {MANAGEMENT_TYPES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-surface-50 border border-surface-200 rounded-xl text-surface-800 focus:ring-2 focus:ring-rose-500"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Cities' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count & Meta */}
        <div className="flex items-center justify-between text-xs text-surface-500 px-1 font-medium">
          <div>
            Showing{' '}
            <strong className="text-surface-900">
              {pagination.total > 0 ? (page - 1) * limit + 1 : 0}–
              {Math.min(page * limit, pagination.total)}
            </strong>{' '}
            of <strong className="text-surface-900">{pagination.total.toLocaleString()}</strong> Colleges
            {selectedDiscipline !== 'All' && ` in ${selectedDiscipline}`}
          </div>
          <div>
            Page <strong>{page}</strong> of <strong>{pagination.totalPages || 1}</strong>
          </div>
        </div>

        {/* Colleges Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-44 bg-surface-100 rounded-2xl animate-pulse border border-surface-200"
              />
            ))}
          </div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-surface-300">
            <p className="text-base text-surface-600 font-semibold">
              No health sciences colleges found matching your criteria.
            </p>
            <p className="text-xs text-surface-400 mt-1">
              Try clearing your search query or selecting a different discipline.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedDiscipline('All');
                setSelectedManagement('All');
                setSelectedCity('All');
                setPage(1);
              }}
              className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colleges.map((col: any) => (
              <div
                key={col.id}
                className="p-5 rounded-2xl border border-surface-200 hover:border-rose-300 transition-all bg-white hover:shadow-md flex flex-col justify-between gap-3"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded">
                      KEA: {col.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        col.managementType.includes('Government')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : col.managementType.includes('Deemed')
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {col.managementType}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-surface-900 leading-snug line-clamp-2">
                      {col.name}
                    </h3>
                    <p className="text-xs text-surface-500 mt-0.5 flex items-center gap-1">
                      <span>📍</span>
                      <span className="truncate">{col.city}, Karnataka</span>
                    </p>
                  </div>
                </div>

                {/* Seat Matrix Breakdown */}
                <div className="pt-3 border-t border-surface-100 flex flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2 bg-surface-50 p-2.5 rounded-xl text-center">
                    <div>
                      <span className="text-[10px] text-surface-400 block font-medium">Course</span>
                      <span className="text-xs font-bold text-surface-800">{col.course}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-surface-400 block font-medium">Total Seats</span>
                      <span className="text-xs font-bold text-rose-600">{col.totalApprovedSeats}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-surface-400 block font-medium">Gov Quota</span>
                      <span className="text-xs font-bold text-emerald-600">{col.govQuotaSeats}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-surface-500">
                    <span>Exam: <strong className="text-surface-700">{col.entranceExam}</strong></span>
                    <button
                      type="button"
                      onClick={() => toggleCompare(col)}
                      className={`font-semibold inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all ${
                        isCollegeSelected(col.id)
                          ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300 font-bold'
                          : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200'
                      }`}
                      title={isCollegeSelected(col.id) ? 'Remove from medical comparison' : 'Add to medical compare board'}
                    >
                      <ScaleIcon className={`w-3.5 h-3.5 ${isCollegeSelected(col.id) ? 'text-white' : 'text-rose-600'}`} />
                      <span>{isCollegeSelected(col.id) ? '✓ Comparing' : '+ Compare'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-surface-200 bg-white text-surface-700 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-xs font-semibold text-surface-600 px-3">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-surface-200 bg-white text-surface-700 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}

        {/* Medical Comparison Floating Board (Dock) */}
        {selectedForCompare.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 text-white shadow-2xl border-t border-rose-500/30 py-3.5 px-4 backdrop-blur-md animate-in slide-in-from-bottom duration-300">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Badges / Chips of Selected Medical Colleges */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-thin">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300 mr-1 whitespace-nowrap flex items-center gap-1.5">
                  <ScaleIcon className="w-4 h-4 text-rose-400" />
                  <span>Compare Medical ({selectedForCompare.length}/4):</span>
                </span>
                {selectedForCompare.map((college) => (
                  <div
                    key={college.id}
                    className="inline-flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 hover:border-rose-400 text-slate-100 text-xs px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm transition-colors"
                  >
                    <span className="text-[10px] font-mono font-bold text-rose-400">{college.code}</span>
                    <span className="max-w-[150px] truncate font-medium">{college.name}</span>
                    <button
                      type="button"
                      onClick={() => removeCompare(college.id)}
                      className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-full w-4 h-4 flex items-center justify-center transition-colors ml-0.5"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions: Clear All & Compare Now */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={clearCompare}
                  className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedForCompare.length >= 2) {
                      setIsCompareModalOpen(true);
                    } else {
                      toast('Please select at least 2 medical colleges to compare.', { icon: 'ℹ️' });
                    }
                  }}
                  disabled={selectedForCompare.length < 2}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                    selectedForCompare.length >= 2
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-rose-600/30 ring-2 ring-rose-400/40 cursor-pointer animate-pulse'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <ScaleIcon className="w-3.5 h-3.5" />
                  <span>
                    {selectedForCompare.length >= 2
                      ? `Compare Now (${selectedForCompare.length} Colleges)`
                      : 'Select 2+ to Compare'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Medical College Side-by-Side Comparison Modal */}
        {isCompareModalOpen && selectedForCompare.length >= 2 && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            onClick={() => setIsCompareModalOpen(false)}
          >
            <div
              className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-surface-200 overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 text-white p-6 sm:p-7 flex items-start justify-between gap-4 border-b border-rose-800/40 shrink-0">
                <div className="flex flex-col gap-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-rose-400/20 border border-rose-300/30 text-rose-200 text-xs font-semibold uppercase tracking-wider w-fit">
                    <ScaleIcon className="w-3.5 h-3.5 text-rose-200" />
                    <span>Official KEA Seat Matrix Comparison • NEET UG 2025–2026</span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black tracking-tight">
                    Medical & Allied Health Colleges Comparison
                  </h2>
                  <p className="text-surface-200 text-xs sm:text-sm">
                    Comparing <strong>{selectedForCompare.length} institutions</strong> across verified approved intake, Government vs Private quota seats, and admission details.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="hidden sm:inline-flex px-3 py-1.5 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                  >
                    🖨️ Print / Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCompareModalOpen(false)}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-base font-bold transition-colors"
                    title="Close modal"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Scrollable Table Area */}
              <div className="overflow-x-auto p-4 sm:p-6 flex-1 scrollbar-thin">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="p-3 font-bold text-surface-400 uppercase text-[11px] w-48 bg-surface-50/80 sticky left-0 z-10">
                        College Name & Code
                      </th>
                      {selectedForCompare.map((col) => (
                        <th key={col.id} className="p-4 align-top min-w-[240px] max-w-[300px]">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded">
                                KEA: {col.code}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeCompare(col.id)}
                                className="text-surface-400 hover:text-rose-600 text-xs font-semibold"
                                title="Remove this college"
                              >
                                Remove ✕
                              </button>
                            </div>
                            <h3 className="font-bold text-surface-900 leading-snug line-clamp-2">
                              {col.name}
                            </h3>
                            <p className="text-xs text-surface-500 flex items-center gap-1">
                              <span>📍</span>
                              <span>{col.city}, Karnataka</span>
                            </p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {/* Discipline & Course */}
                    <tr>
                      <td className="p-3 font-semibold text-surface-600 bg-surface-50/80 sticky left-0 z-10">
                        Course & Discipline
                      </td>
                      {selectedForCompare.map((col) => (
                        <td key={col.id} className="p-4">
                          <span className="font-bold text-surface-900">{col.course}</span>{' '}
                          <span className="text-surface-500">({col.discipline})</span>
                        </td>
                      ))}
                    </tr>

                    {/* Management Type */}
                    <tr>
                      <td className="p-3 font-semibold text-surface-600 bg-surface-50/80 sticky left-0 z-10">
                        Management Type
                      </td>
                      {selectedForCompare.map((col) => (
                        <td key={col.id} className="p-4">
                          <span
                            className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              col.managementType.includes('Government')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : col.managementType.includes('Deemed')
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {col.managementType}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Total Approved Seats */}
                    <tr>
                      <td className="p-3 font-semibold text-surface-600 bg-surface-50/80 sticky left-0 z-10">
                        Total Approved Intake
                      </td>
                      {selectedForCompare.map((col) => (
                        <td key={col.id} className="p-4">
                          <span className="text-base font-black text-rose-600">
                            {col.totalApprovedSeats} Seats
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Government Quota Seats */}
                    <tr>
                      <td className="p-3 font-semibold text-surface-600 bg-surface-50/80 sticky left-0 z-10">
                        Government Quota Seats
                      </td>
                      {selectedForCompare.map((col) => (
                        <td key={col.id} className="p-4">
                          <span className="text-base font-black text-emerald-600">
                            {col.govQuotaSeats} Seats
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Private / Institutional Quota Seats */}
                    <tr>
                      <td className="p-3 font-semibold text-surface-600 bg-surface-50/80 sticky left-0 z-10">
                        Private / Mgmt Quota Seats
                      </td>
                      {selectedForCompare.map((col) => (
                        <td key={col.id} className="p-4">
                          <span className="font-bold text-surface-700">
                            {Math.max(0, col.totalApprovedSeats - col.govQuotaSeats)} Seats
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Gov Quota Share */}
                    <tr>
                      <td className="p-3 font-semibold text-surface-600 bg-surface-50/80 sticky left-0 z-10">
                        State Quota Ratio
                      </td>
                      {selectedForCompare.map((col) => {
                        const pct =
                          col.totalApprovedSeats > 0
                            ? ((col.govQuotaSeats / col.totalApprovedSeats) * 100).toFixed(1)
                            : '0.0';
                        return (
                          <td key={col.id} className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-surface-800">{pct}% Government Quota</span>
                              <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-1.5 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Entrance Exam */}
                    <tr>
                      <td className="p-3 font-semibold text-surface-600 bg-surface-50/80 sticky left-0 z-10">
                        Required Entrance Exam
                      </td>
                      {selectedForCompare.map((col) => (
                        <td key={col.id} className="p-4">
                          <span className="font-bold text-surface-900 bg-surface-100 px-2 py-0.5 rounded">
                            {col.entranceExam}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Counselling Authority */}
                    <tr>
                      <td className="p-3 font-semibold text-surface-600 bg-surface-50/80 sticky left-0 z-10">
                        Counselling Authorities
                      </td>
                      {selectedForCompare.map((col) => (
                        <td key={col.id} className="p-4 text-xs text-surface-600 leading-relaxed">
                          <div>• <strong>KEA:</strong> 85% State Quota</div>
                          <div>• <strong>MCC:</strong> 15% All India Quota</div>
                        </td>
                      ))}
                    </tr>

                    {/* Fee Classification Guide */}
                    <tr>
                      <td className="p-3 font-semibold text-surface-600 bg-surface-50/80 sticky left-0 z-10">
                        Fee Structure Guide
                      </td>
                      {selectedForCompare.map((col) => (
                        <td key={col.id} className="p-4 text-xs text-surface-600 leading-relaxed">
                          {col.managementType.includes('Government') ? (
                            <span className="text-emerald-700 font-semibold">
                              Subsidized State Govt Fees (~₹60,000/year for MBBS)
                            </span>
                          ) : col.managementType.includes('Deemed') ? (
                            <span className="text-purple-700 font-semibold">
                              Deemed University Tuition (~₹18L–₹25L/year)
                            </span>
                          ) : (
                            <span className="text-amber-800 font-semibold">
                              Govt Quota: ~₹1.4L/yr · Private Quota: ~₹11L–₹14L/yr
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Full Address */}
                    <tr>
                      <td className="p-3 font-semibold text-surface-600 bg-surface-50/80 sticky left-0 z-10">
                        Campus Location
                      </td>
                      {selectedForCompare.map((col) => (
                        <td key={col.id} className="p-4 text-xs text-surface-600">
                          {col.address}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="bg-surface-50 p-4 sm:p-5 border-t border-surface-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <span className="text-xs text-surface-500 font-medium">
                  Official seat matrices sourced from Karnataka Examination Authority (KEA).
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearCompare}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Clear Selection
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCompareModalOpen(false)}
                    className="px-5 py-2 bg-surface-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                  >
                    Close Comparison
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MedicalSeatsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-50 p-10 text-center text-surface-500">Loading Karnataka Medical Colleges...</div>}>
      <MedicalSeatsContent />
    </Suspense>
  );
}
