'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminCollegesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '15',
    ...(searchTerm && { search: searchTerm }),
    ...(selectedState && { state: selectedState }),
  }).toString();

  const { data, error, isLoading } = useSWR(`/api/colleges?${queryParams}`, fetcher);
  const { data: statesData } = useSWR('/api/states', fetcher);

  const colleges = data?.data || [];
  const pagination = data?.pagination || { total: 580, totalPages: 39 };
  const states: { name: string }[] = statesData?.data || [];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Colleges Catalog & Editor</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {pagination.total} Colleges
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, manage, and edit details for any college in the 28-State Database.
          </p>
        </div>

        <Link
          href="/admin/states"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          📍 Browse by 28 States →
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          placeholder="Search colleges by name, city, or state..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="flex-1 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
        />

        <select
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-56 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
        >
          <option value="">All 28 States</option>
          {states.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Colleges List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 text-center text-red-600 text-sm">Failed to load colleges.</div>
      ) : colleges.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
          No colleges found matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {colleges.map((college: any) => (
            <Card
              key={college.id}
              className="p-5 bg-white border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between gap-4 hover:border-indigo-300 transition-all"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    {college.type}
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    ★ {college.ratingDisplay || `${college.rating}/5`}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 leading-snug line-clamp-2">
                  {college.name}
                </h3>

                <span className="text-xs text-slate-500">
                  📍 {college.city}, {college.state}
                </span>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs mt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Annual Fees</span>
                    <span className="font-bold text-slate-800">{college.feesDisplay || 'Per State Quota'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Branches</span>
                    <span className="font-bold text-indigo-700">{college.totalBranchesOffered || college.courses?.length || 'Available'} Active</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Link
                  href={`/admin/colleges/${encodeURIComponent(college.slug || college.id)}/edit`}
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl text-center shadow-sm transition-colors flex items-center justify-center gap-1"
                >
                  <span>✏️</span> Edit College
                </Link>
                <Link
                  href={`/colleges/${encodeURIComponent(college.slug || college.id)}`}
                  target="_blank"
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl text-center transition-colors"
                >
                  View ↗
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-600">
          <span>
            Page {page} of {pagination.totalPages} ({pagination.total} Total Colleges)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 disabled:opacity-40 font-bold hover:bg-slate-50 transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 disabled:opacity-40 font-bold hover:bg-slate-50 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
