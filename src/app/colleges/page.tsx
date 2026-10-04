'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { CollegeCard, CollegeCardData } from '@/components/features/CollegeCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { ALL_INDIAN_STATES } from '@/lib/constants';
import engineeringBranchesData from '@/data/careers/engineeringBranches.json';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CATEGORIES = [
  'IIT',
  'NIT',
  'IIIT',
  'Central',
  'State Govt',
  'Private',
  'Deemed',
];

const POPULAR_EXAMS = [
  'JEE Main',
  'JEE Advanced',
  'KCET',
  'COMEDK',
  'WBJEE',
  'MHT CET',
  'GATE',
];

const POPULAR_BRANCHES = [
  { label: 'Computer Science (CSE)', code: 'CSE' },
  { label: 'Information Technology (IT)', code: 'IT' },
  { label: 'Electronics & Comm (ECE)', code: 'ECE' },
  { label: 'Mechanical Engg (MECH)', code: 'MECH' },
  { label: 'Electrical Engg (EEE)', code: 'EEE' },
  { label: 'Civil Engg (CIVIL)', code: 'CIVIL' },
  { label: 'AI & Data Science (AI)', code: 'AI' },
];

function CollegeListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. URL search params as source of truth
  const paramSearch = searchParams.get('search') || '';
  const paramState = searchParams.get('state') || '';
  const paramType = searchParams.get('type') || '';
  const paramCategory = searchParams.get('category') || '';
  const paramExam = searchParams.get('exam') || '';
  const paramBranch = searchParams.get('branch') || '';
  const paramMinFees = searchParams.get('minFees') || '';
  const paramMaxFees = searchParams.get('maxFees') || '';
  const paramMinRating = searchParams.get('minRating') || '';
  const paramSortBy = searchParams.get('sortBy') || 'nirf';
  const paramSortOrder = searchParams.get('sortOrder') || (paramSortBy === 'nirf' ? 'asc' : 'desc');
  const paramPage = parseInt(searchParams.get('page') || '1', 10);

  // Match search or branch filter to engineering branches
  const matchedBranch = useMemo(() => {
    const query = (paramBranch || paramSearch || '').trim().toUpperCase();
    if (!query) return null;
    return (engineeringBranchesData as any).items.find(
      (b: any) =>
        b.code.toUpperCase() === query ||
        b.name.toUpperCase().includes(query) ||
        b.aliases?.some((a: string) => a.toUpperCase().includes(query))
    );
  }, [paramBranch, paramSearch]);

  // Search input state + debounce
  const [searchInput, setSearchInput] = useState(paramSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync debounced search input to URL
  useEffect(() => {
    if (debouncedSearch !== paramSearch) {
      updateUrl({ search: debouncedSearch, page: '1' });
    }
  }, [debouncedSearch]);

  // Helper to update URL query string
  const updateUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    router.push(`/colleges?${params.toString()}`);
  };

  // Build SWR API request URL
  const apiUrl = `/api/colleges?${searchParams.toString()}`;
  const { data, error, isLoading } = useSWR(apiUrl, fetcher, {
    keepPreviousData: true,
  });

  const colleges: CollegeCardData[] = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 };

  const handleClearFilters = () => {
    setSearchInput('');
    router.push('/colleges');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-surface-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">
            Explore Colleges
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Search, filter, and compare {pagination.total > 0 ? `${pagination.total} ` : ''}verified engineering institutions across India
          </p>
        </div>

        <div className="w-full md:w-80">
          <Input
            placeholder="Search by college, city, branch, exam..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Layout (Sidebar Filters + College Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filter Panel */}
        <aside className="lg:col-span-1 flex flex-col gap-6 bg-white p-5 rounded-xl border border-surface-200 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-surface-100 pb-3">
            <h2 className="font-bold text-base text-surface-900">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-brand-600 hover:text-brand-700"
            >
              Clear All
            </Button>
          </div>

          {/* State Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              State
            </label>
            <select
              value={paramState}
              onChange={(e) => updateUrl({ state: e.target.value, page: '1' })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All States</option>
              {ALL_INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              Category
            </label>
            <select
              value={paramCategory}
              onChange={(e) => updateUrl({ category: e.target.value, page: '1' })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Accepted Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              Exam Accepted
            </label>
            <select
              value={paramExam}
              onChange={(e) => updateUrl({ exam: e.target.value, page: '1' })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Entrance Exams</option>
              {POPULAR_EXAMS.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              Engineering Branch
            </label>
            <select
              value={paramBranch}
              onChange={(e) => updateUrl({ branch: e.target.value, page: '1' })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Branches</option>
              {POPULAR_BRANCHES.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* College Type Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              College Type
            </label>
            <div className="flex flex-col gap-1.5 text-sm text-surface-700">
              {['GOVERNMENT', 'PRIVATE', 'DEEMED'].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="collegeType"
                    checked={paramType === t}
                    onChange={() => updateUrl({ type: t, page: '1' })}
                    className="accent-brand-600"
                  />
                  <span>{t}</span>
                </label>
              ))}
              {paramType && (
                <button
                  onClick={() => updateUrl({ type: '', page: '1' })}
                  className="text-xs text-left text-brand-600 hover:underline mt-1"
                >
                  Reset Type
                </button>
              )}
            </div>
          </div>

          {/* Fee Range Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              Annual Fees (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min Fees"
                value={paramMinFees}
                onChange={(e) => updateUrl({ minFees: e.target.value, page: '1' })}
              />
              <Input
                type="number"
                placeholder="Max Fees"
                value={paramMaxFees}
                onChange={(e) => updateUrl({ maxFees: e.target.value, page: '1' })}
              />
            </div>
          </div>

          {/* Minimum Rating Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              Min Rating (Ranked Only)
            </label>
            <select
              value={paramMinRating}
              onChange={(e) => updateUrl({ minRating: e.target.value, page: '1' })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3.0">3.0+ Stars</option>
            </select>
          </div>
        </aside>

        {/* College Grid Area */}
        <main className="lg:col-span-3 flex flex-col gap-6">
          {/* Matched Branch Career Banner */}
          {matchedBranch && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🧭</span>
                <span className="text-slate-800 font-medium">
                  Looking into <strong>{matchedBranch.name}</strong>? Explore verified industry roles, CTC ranges, and GATE PSUs.
                </span>
              </div>
              <Link
                href={`/careers/branch/branch-${matchedBranch.code.toLowerCase()}`}
                className="font-bold text-blue-700 hover:text-white hover:bg-blue-600 bg-white px-3.5 py-1.5 rounded-xl border border-blue-300 shrink-0 transition-all text-center"
              >
                Explore careers after {matchedBranch.code} →
              </Link>
            </div>
          )}

          {/* Controls Bar (Result Count & Sort Dropdown) */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-surface-200 text-sm flex-wrap gap-2">
            <span className="text-surface-600 font-medium">
              Showing <span className="font-bold text-surface-900">{colleges.length}</span> of{' '}
              <span className="font-bold text-surface-900">{pagination.total}</span> colleges
            </span>

            <div className="flex items-center gap-2">
              <span className="text-surface-500 text-xs font-semibold uppercase">Sort By:</span>
              <select
                value={`${paramSortBy}-${paramSortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  updateUrl({ sortBy, sortOrder, page: '1' });
                }}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-surface-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="nirf-asc">Best NIRF Rank</option>
                <option value="rating-desc">Rating: High to Low</option>
                <option value="fees-asc">Fees: Low to High</option>
                <option value="fees-desc">Fees: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Loading Skeletons */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 p-4 bg-white rounded-xl border">
                  <Skeleton className="h-36 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center bg-red-50 text-red-700 rounded-xl border border-red-200">
              Failed to load colleges. Please try refreshing.
            </div>
          ) : colleges.length === 0 ? (
            /* Empty State */
            <div className="p-16 text-center bg-white rounded-xl border border-surface-200 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center text-2xl">
                🔍
              </div>
              <h3 className="text-xl font-bold text-surface-800">No colleges match your filters</h3>
              <p className="text-sm text-surface-500 max-w-md">
                Try widening your search terms or clearing specific filters to see more results.
              </p>
              <Button variant="primary" size="md" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            /* Results Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => updateUrl({ page: page.toString() })}
          />
        </main>
      </div>
    </div>
  );
}

export default function CollegeListingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading colleges...</div>}>
      <CollegeListingContent />
    </Suspense>
  );
}
