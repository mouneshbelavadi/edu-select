'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { MapPinIcon, StarIcon, WrenchIcon } from '@/components/ui/Icons';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminStateCollegesPage() {
  const params = useParams();
  const rawState = params?.stateName as string;
  const stateName = decodeURIComponent(rawState || '');

  const [searchTerm, setSearchTerm] = useState('');

  const { data, error, isLoading } = useSWR(
    stateName ? `/api/colleges?state=${encodeURIComponent(stateName)}&limit=300` : null,
    fetcher
  );

  const colleges = data?.data || [];

  const filtered = colleges.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/admin" className="hover:text-indigo-600 font-medium">
          Dashboard
        </Link>
        <span>&gt;</span>
        <Link href="/admin/states" className="hover:text-indigo-600 font-medium">
          28 States Dataset
        </Link>
        <span>&gt;</span>
        <span className="font-bold text-slate-900">{stateName}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{stateName} Colleges</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
              {colleges.length} Colleges
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and edit colleges located in {stateName} from the 28-State Database.
          </p>
        </div>

        <Link
          href="/admin/states"
          className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          ← Choose Another State
        </Link>
      </div>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder={`Search ${stateName} colleges by name or city...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />

        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} of {colleges.length} colleges in {stateName}
        </span>
      </div>

      {/* College Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 text-center text-red-600 text-sm">Failed to load colleges.</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
          No colleges found matching "{searchTerm}" in {stateName}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((college: any) => (
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
                    <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    <span>{college.ratingDisplay || `${college.rating}/5`}</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 leading-snug line-clamp-2">
                  {college.name}
                </h3>

                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{college.city}, {college.state}</span>
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
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl text-center shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <WrenchIcon className="w-3.5 h-3.5" />
                  <span>Edit College</span>
                </Link>
                <Link
                  href={`/colleges/${encodeURIComponent(college.slug || college.id)}`}
                  target="_blank"
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl text-center transition-colors"
                >
                  View Profile ↗
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
