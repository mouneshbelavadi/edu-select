'use client';

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import {
  GraduationCapIcon,
  SparklesIcon,
  BookOpenIcon,
  LightningIcon,
} from '@/components/ui/Icons';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const TOP_DISTRICTS = [
  'All',
  'Bengaluru South',
  'Bengaluru North',
  'Bengaluru Central',
  'Bengaluru Rural',
  'Mysuru',
  'Belagavi',
  'Dakshina Kannada',
  'Dharwad',
  'Kalaburagi',
  'Shivamogga',
  'Tumakuru',
  'Ballari',
  'Udupi',
  'Hassan',
  'Vijayapura',
];

const MANAGEMENT_OPTIONS = [
  { id: 'All', label: 'All Types' },
  { id: 'Government', label: 'Government' },
  { id: 'Private Aided', label: 'Private Aided' },
  { id: 'Private Unaided', label: 'Private Unaided' },
  { id: 'Residential', label: 'Residential (KREIS/Morarji)' },
];

const STREAM_OPTIONS = [
  { id: 'All', label: 'All Streams' },
  { id: 'Science', label: 'Science (PCMB/PCMC)' },
  { id: 'Commerce', label: 'Commerce (EBAC/HEBA)' },
  { id: 'Arts', label: 'Arts (HEPS/HESP)' },
];

function PUCDirectoryContent() {
  const searchParams = useSearchParams();
  const paramStream = searchParams.get('stream') || 'All';
  const paramDistrict = searchParams.get('district') || 'All';
  const paramManagement = searchParams.get('management') || 'All';
  const paramSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(paramSearch);
  const [selectedDistrict, setSelectedDistrict] = useState(paramDistrict);
  const [selectedManagement, setSelectedManagement] = useState(paramManagement);
  const [selectedStream, setSelectedStream] = useState(paramStream);
  const [page, setPage] = useState(1);
  const limit = 30;

  useEffect(() => {
    const s = searchParams.get('stream');
    if (s && s !== selectedStream) {
      setSelectedStream(s);
      setPage(1);
    }
    const d = searchParams.get('district');
    if (d && d !== selectedDistrict) {
      setSelectedDistrict(d);
      setPage(1);
    }
    const q = searchParams.get('search');
    if (q && q !== search) {
      setSearch(q);
      setPage(1);
    }
  }, [searchParams]);

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) queryParams.set('search', search);
  if (selectedDistrict !== 'All') queryParams.set('district', selectedDistrict);
  if (selectedManagement !== 'All') queryParams.set('management', selectedManagement);
  if (selectedStream !== 'All') queryParams.set('stream', selectedStream);

  const { data, isLoading } = useSWR(
    `/api/puc-colleges?${queryParams.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  const colleges = data?.data || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 1 };
  const metadata = data?.metadata || { totalColleges: 6417, districtsCount: 32 };

  const handleDistrictChange = (d: string) => {
    setSelectedDistrict(d);
    setPage(1);
  };

  const handleManagementChange = (m: string) => {
    setSelectedManagement(m);
    setPage(1);
  };

  const handleStreamChange = (s: string) => {
    setSelectedStream(s);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-surface-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/20 border border-blue-300/30 text-blue-200 text-xs font-semibold uppercase tracking-wider w-fit">
              <GraduationCapIcon className="w-3.5 h-3.5 text-blue-200" />
              <span>Official DPUE Directory • Academic Year 2025–2026</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Karnataka <span className="text-blue-300">PUC (+2) Colleges Directory</span>
            </h1>
            <p className="text-surface-200 text-sm sm:text-base leading-relaxed">
              Explore <strong>6,417 Pre-University Colleges</strong> across all 32 educational districts of Karnataka. Discover Government, Private Aided, and Unaided institutions for Science (PCMB/PCMC), Commerce, and Arts after Class 10 SSLC.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-blue-200 font-medium">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                🏛️ <strong>{metadata.totalColleges.toLocaleString()}</strong> PU Colleges
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                📍 <strong>{metadata.districtsCount}</strong> Districts Covered
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                ⚡ Science • Commerce • Arts Streams
              </span>
            </div>
          </div>
        </div>

        {/* Pathways Navigation Banner */}
        <div className="bg-gradient-to-r from-indigo-900/90 via-blue-900/80 to-slate-900 text-white rounded-2xl p-5 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Unsure Which Stream to Choose After 10th?
              </div>
              <p className="text-sm text-surface-200">
                Explore our comprehensive Class 10 career pathways comparing PCMB vs PCMC, Polytechnic Diplomas, and Commerce tracks.
              </p>
            </div>
          </div>
          <Link
            href="/careers"
            className="shrink-0 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-all shadow"
          >
            Explore After-10th Pathways →
          </Link>
        </div>

        {/* Search & Filter Bar */}
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
                placeholder="Search by college name, code (e.g. EB0006), city or address..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
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
                className="px-3 py-2 text-xs font-semibold bg-surface-50 border border-surface-200 rounded-xl text-surface-800 focus:ring-2 focus:ring-brand-500"
              >
                {MANAGEMENT_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedStream}
                onChange={(e) => handleStreamChange(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-surface-50 border border-surface-200 rounded-xl text-surface-800 focus:ring-2 focus:ring-brand-500"
              >
                {STREAM_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick District Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-surface-400 font-semibold shrink-0">District:</span>
            {TOP_DISTRICTS.map((d) => (
              <button
                key={d}
                onClick={() => handleDistrictChange(d)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                  selectedDistrict === d
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Active Stream Banner if arrived from Career Explorer */}
        {selectedStream !== 'All' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-950 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🏛️</span>
              <span>
                Filtered for <strong>{selectedStream} Stream</strong> colleges across Karnataka (DPUE 2025–2026).
              </span>
            </div>
            <button
              onClick={() => handleStreamChange('All')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-xs"
            >
              Clear Stream Filter (View All)
            </button>
          </div>
        )}

        {/* Results Count & Meta */}
        <div className="flex items-center justify-between text-xs text-surface-500 px-1 font-medium">
          <div>
            Showing{' '}
            <strong className="text-surface-900">
              {pagination.total > 0 ? (page - 1) * limit + 1 : 0}–
              {Math.min(page * limit, pagination.total)}
            </strong>{' '}
            of <strong className="text-surface-900">{pagination.total.toLocaleString()}</strong> PU Colleges
            {selectedDistrict !== 'All' && ` in ${selectedDistrict}`}
            {selectedStream !== 'All' && ` offering ${selectedStream}`}
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
              No PU colleges found matching your criteria.
            </p>
            <p className="text-xs text-surface-400 mt-1">
              Try clearing some filters or searching with a different term.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedDistrict('All');
                setSelectedManagement('All');
                setSelectedStream('All');
                setPage(1);
              }}
              className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colleges.map((col: any) => (
              <div
                key={col.id}
                className="p-5 rounded-2xl border border-surface-200 hover:border-blue-300 transition-all bg-white hover:shadow-md flex flex-col justify-between gap-3"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
                      Code: {col.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        col.management.includes('Government')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : col.management.includes('Aided')
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {col.management}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-surface-900 leading-snug line-clamp-2">
                      {col.name}
                    </h3>
                    <p className="text-xs text-surface-500 mt-0.5 flex items-center gap-1">
                      <span>📍</span>
                      <span className="truncate">{col.address} • {col.district}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-surface-400 font-medium">Streams Offered</span>
                    <div className="flex gap-1">
                      {col.streams.map((st: string) => (
                        <span
                          key={st}
                          className="px-1.5 py-0.5 bg-surface-100 text-surface-700 font-semibold rounded text-[10px]"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  {col.year && (
                    <div className="text-[10px] text-surface-400">
                      Est: {col.year}
                    </div>
                  )}
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
      </div>
    </div>
  );
}

export default function PUCDirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-50 p-10 text-center text-surface-500">Loading Karnataka PUC Colleges...</div>}>
      <PUCDirectoryContent />
    </Suspense>
  );
}
