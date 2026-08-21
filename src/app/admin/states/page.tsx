'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StateItem {
  name: string;
  collegeCount: number;
}

export default function AdminStatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, error, isLoading } = useSWR('/api/states', fetcher);

  const states: StateItem[] = data?.data || [];

  const filteredStates = states.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">28 States Engineering Database</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
              28 States / 580 Colleges
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Select any state below to view, search, and edit its colleges directly.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Filter Indian states (e.g. Karnataka, Maharashtra, Tamil Nadu)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredStates.length} of 28 States
        </span>
      </div>

      {/* States Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 text-center text-red-600 text-sm">Failed to load states dataset.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStates.map((state) => (
            <Link
              key={state.name}
              href={`/admin/states/${encodeURIComponent(state.name)}`}
              className="group"
            >
              <Card className="p-5 bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all rounded-2xl flex flex-col justify-between h-full gap-3">
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-100">
                    📍
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {state.collegeCount} Colleges
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {state.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Authoritative Database Sheet
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold group-hover:underline">
                  <span>View & Edit Colleges</span>
                  <span>→</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
