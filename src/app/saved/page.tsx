'use client';

import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { CollegeCard, CollegeCardData } from '@/components/features/CollegeCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScaleIcon, HeartIcon } from '@/components/ui/Icons';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SavedComparison {
  id: string;
  name: string;
  collegeIds: string[];
  createdAt: string;
}

export default function SavedDashboardPage() {
  const { data: collegesData, mutate: mutateColleges, isLoading: loadingColleges } = useSWR(
    '/api/saved/colleges',
    fetcher
  );

  const { data: comparisonsData, mutate: mutateComparisons, isLoading: loadingComparisons } = useSWR(
    '/api/saved/comparisons',
    fetcher
  );

  const savedColleges: CollegeCardData[] = collegesData?.data || [];
  const savedComparisons: SavedComparison[] = comparisonsData?.data || [];

  const handleRemoveCollege = async (collegeId: string) => {
    try {
      const res = await fetch('/api/saved/colleges', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId }),
      });

      if (res.ok) {
        toast.success('Removed college from saved list');
        mutateColleges();
      } else {
        toast.error('Failed to remove college');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const handleDeleteComparison = async (id: string) => {
    try {
      const res = await fetch('/api/saved/comparisons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success('Comparison deleted');
        mutateComparisons();
      } else {
        toast.error('Failed to delete comparison');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
      {/* Top Header */}
      <div className="border-b border-surface-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">
            Saved Dashboard
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Manage your bookmarked colleges and saved comparisons
          </p>
        </div>

        <Link href="/colleges">
          <Button variant="outline" size="sm">
            + Discover More Colleges
          </Button>
        </Link>
      </div>

      {/* Section 1: Saved Colleges */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-surface-900 flex items-center gap-2">
            <HeartIcon className="w-5 h-5 text-rose-500 fill-rose-500 shrink-0" />
            <span>Saved Colleges</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
              {savedColleges.length}
            </span>
          </h2>
        </div>

        {loadingColleges ? (
          <div className="p-8 text-center text-surface-400">Loading saved colleges...</div>
        ) : savedColleges.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center text-surface-400">
              <HeartIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-surface-800">No saved colleges yet</h3>
            <p className="text-sm text-surface-500 max-w-sm">
              Click the "Save" button on any college card or detail page to add it to your dashboard.
            </p>
            <Link href="/colleges">
              <Button variant="primary" size="sm">
                Explore Colleges
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedColleges.map((college) => (
              <div key={college.id} className="relative group">
                <CollegeCard college={college} />
                <button
                  onClick={() => handleRemoveCollege(college.id)}
                  className="absolute top-3 right-3 z-20 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow transition-transform group-hover:scale-105"
                  title="Remove from saved list"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Saved Comparisons */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-surface-900 flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <ScaleIcon className="w-5 h-5 text-emerald-600" />
              Saved Comparisons
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
              {savedComparisons.length}
            </span>
          </h2>
        </div>

        {loadingComparisons ? (
          <div className="p-8 text-center text-surface-400">Loading saved comparisons...</div>
        ) : savedComparisons.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center">
              <ScaleIcon className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-bold text-lg text-surface-800">No saved comparisons</h3>
            <p className="text-sm text-surface-500 max-w-sm">
              Compare 2-3 colleges and click "Save This Comparison" to bookmark side-by-side tables.
            </p>
            <Link href="/compare">
              <Button variant="outline" size="sm">
                Go to Compare Tool
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedComparisons.map((comp) => {
              const compareUrl = `/compare?ids=${comp.collegeIds.join(',')}`;
              return (
                <Card
                  key={comp.id}
                  className="p-5 flex items-center justify-between gap-4 hover:border-brand-300 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-base text-surface-900">{comp.name}</h3>
                    <span className="text-xs text-surface-500">
                      Comparing {comp.collegeIds.length} Colleges • Saved on{' '}
                      {new Date(comp.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={compareUrl}>
                      <Button variant="primary" size="sm">
                        View Table →
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComparison(comp.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
