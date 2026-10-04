'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useCompareStore } from '@/lib/store/useCompareStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  ScaleIcon,
  GraduationCapIcon,
  LightningIcon,
  StarIcon,
  TrophyIcon,
  MapPinIcon,
} from '@/components/ui/Icons';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CompareCourse {
  id: string;
  name: string;
  branchCode: string;
  duration: string;
  feesDisplay: string;
}

interface CompareCollege {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  typeDetail?: string;
  institutionCategory?: string;
  rating: number | null;
  ratingDisplay: string;
  nirfRank2025?: number | null;
  nirfBand2025?: string | null;
  fees: number;
  feesDisplay: string;
  feesIsEstimate?: boolean;
  admissionRoutes?: string[];
  overview: string;
  placementText: string;
  reviewsText: string;
  totalBranchesOffered: number;
  affiliation: string;
  approval: string;
  dataSource: string;
  lastVerified: string;
  entranceExams?: { exam: string; code: string }[];
  placementStats?: {
    medianPackageLpa?: number;
    medianLPA?: number;
    averageLPA?: number;
    highestLPA?: number;
    year?: number;
    source?: string;
  };
  courses: CompareCourse[];
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { selectedColleges, removeCollege, setSelectedColleges, addCollege } = useCompareStore();

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [comparisonName, setComparisonName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync store with URL parameter ?ids=
  const idsFromUrl = searchParams.get('ids');

  useEffect(() => {
    if (idsFromUrl) {
      const idsArray = idsFromUrl.split(',').map((id) => id.trim()).filter(Boolean);
      if (idsArray.length > 0) {
        const synced = idsArray.map((id) => {
          const existing = selectedColleges.find((c) => c.id === id);
          return { id, name: existing?.name || id };
        });
        setSelectedColleges(synced);
      }
    } else if (selectedColleges.length >= 2) {
      const urlIds = selectedColleges.map((c) => c.id).join(',');
      router.replace(`/compare?ids=${encodeURIComponent(urlIds)}`);
    }
  }, [idsFromUrl]);

  const activeIds = selectedColleges.map((c) => c.id).join(',');
  const apiUrl = activeIds.length > 0 ? `/api/colleges/compare?ids=${encodeURIComponent(activeIds)}` : null;

  const { data, error, isLoading } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
  });

  const colleges: CompareCollege[] = data?.data || [];

  // Update store names once full data is fetched
  useEffect(() => {
    if (colleges.length > 0) {
      setSelectedColleges(colleges.map((c) => ({ id: c.id, name: c.name })));
    }
  }, [data]);

  const handleRemove = (id: string) => {
    removeCollege(id);
    const remaining = selectedColleges.filter((c) => c.id !== id);
    if (remaining.length > 0) {
      router.push(`/compare?ids=${encodeURIComponent(remaining.map((c) => c.id).join(','))}`);
    } else {
      router.push('/compare');
    }
  };

  const handleSaveComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comparisonName.trim()) {
      toast.error('Please enter a comparison name');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/saved/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: comparisonName,
          collegeIds: selectedColleges.map((c) => c.id),
        }),
      });

      if (res.ok) {
        toast.success('Comparison saved to your dashboard!');
        setIsSaveModalOpen(false);
        setComparisonName('');
      } else {
        const errData = await res.json();
        toast.error(errData.error?.message || 'Failed to save comparison');
      }
    } catch {
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  if (selectedColleges.length < 2) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-5">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100">
          <ScaleIcon className="w-10 h-10 text-indigo-600" />
        </div>
        <div className="flex flex-col gap-2 max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Compare Engineering Colleges</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Select 2 or 3 colleges to compare tuition fees, active branches, ratings, placement policies, and state counseling codes side-by-side.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Link href="/colleges">
            <Button variant="primary" size="md">
              Browse Colleges Catalog →
            </Button>
          </Link>
          <Link href="/states">
            <Button variant="outline" size="md">
              Explore 28 States
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 pb-24">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Side-by-Side Comparison</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {colleges.length || selectedColleges.length} Colleges
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Authoritative data comparison from the 28-State Engineering College Database
          </p>
        </div>

        <div className="flex items-center gap-3">
          {session && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSaveModalOpen(true)}
              className="text-xs flex items-center gap-1.5"
            >
              <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Save Comparison</span>
            </Button>
          )}
          <Link href="/colleges">
            <Button variant="ghost" size="sm" className="text-xs">
              + Add More Colleges
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-500 text-sm flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading verified comparison data...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 text-red-700 rounded-2xl border border-red-200 flex flex-col items-center gap-3">
          <span>Failed to load comparison data. Please check selected colleges.</span>
          <Button variant="outline" size="sm" onClick={() => router.push('/colleges')}>
            Browse Catalog
          </Button>
        </div>
      ) : colleges.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          No college data found for the selected IDs.
        </div>
      ) : (
        /* Comparison Table */
        <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-5 w-1/4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100/60">
                  Metric / Feature
                </th>
                {colleges.map((col) => (
                  <th key={col.id} className="p-5 text-center align-top border-l border-slate-200">
                    <div className="flex flex-col items-center gap-2.5">
                      <span className="font-black text-base text-slate-900 line-clamp-2 leading-snug">
                        {col.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/colleges/${col.slug || col.id}`}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          View Full Profile →
                        </Link>
                        <span className="text-slate-300">•</span>
                        <button
                          onClick={() => handleRemove(col.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {/* Row 1: NIRF Rank */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900 bg-slate-50/50">NIRF 2025 Ranking</td>
                {colleges.map((col) => (
                  <td key={col.id} className="p-4 text-center border-l border-slate-200">
                    {col.nirfRank2025 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <TrophyIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>NIRF #{col.nirfRank2025}</span>
                      </span>
                    ) : col.nirfBand2025 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        NIRF {col.nirfBand2025} Band
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Unranked</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 2: Location */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Location</td>
                {colleges.map((col) => (
                  <td key={col.id} className="p-4 text-center border-l border-slate-200 font-medium">
                    <span className="inline-flex items-center justify-center gap-1">
                      <MapPinIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{col.city}, {col.state}</span>
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 3: Institution Category & Type */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Institution Category</td>
                {colleges.map((col) => (
                  <td key={col.id} className="p-4 text-center border-l border-slate-200">
                    <span className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                      {col.typeDetail || col.institutionCategory || col.type || 'Engineering'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 4: Student Rating */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Student Rating</td>
                {colleges.map((col) => (
                  <td key={col.id} className="p-4 text-center border-l border-slate-200">
                    {col.rating !== null && col.rating !== undefined ? (
                      <span className="inline-flex items-center gap-1 font-black text-sm text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        <span>{col.ratingDisplay || `${Number(col.rating).toFixed(1)}/5`}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium italic">Not Rated</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 5: Annual Fees */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Annual Tuition Fee</td>
                {colleges.map((col) => (
                  <td key={col.id} className="p-4 text-center border-l border-slate-200 font-black text-indigo-700 text-sm">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <span>{col.feesDisplay || 'As per State Quota'}</span>
                      {col.feesIsEstimate && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Est.
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 6: Admission Routes & Exams */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Accepted Exams / Routes</td>
                {colleges.map((col) => (
                  <td key={col.id} className="p-4 text-center border-l border-slate-200">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {(col.admissionRoutes && col.admissionRoutes.length > 0) ? (
                        col.admissionRoutes.map((route, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                          >
                            {route}
                          </span>
                        ))
                      ) : col.entranceExams && col.entranceExams.length > 0 ? (
                        col.entranceExams.map((ex, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                          >
                            {ex.exam}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 font-medium">State / Direct Quota</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 7: Total Verified Branches */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Active Branches</td>
                {colleges.map((col) => (
                  <td key={col.id} className="p-4 text-center border-l border-slate-200 font-bold text-slate-900">
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <GraduationCapIcon className="w-4 h-4 text-blue-600" />
                      <span>{col.totalBranchesOffered || col.courses?.length || 0} Programs Offered</span>
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 8: Affiliation */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Affiliated University</td>
                {colleges.map((col) => (
                  <td key={col.id} className="p-4 text-center border-l border-slate-200 text-slate-600 font-medium">
                    {col.affiliation || `${col.state} Technical Board`}
                  </td>
                ))}
              </tr>

              {/* Row 9: Placement Record */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Placement Record</td>
                {colleges.map((col) => (
                  <td key={col.id} className="p-4 border-l border-slate-200 leading-relaxed text-slate-700 text-[11px]">
                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                      {(col.placementStats?.medianPackageLpa || col.placementStats?.medianLPA) ? (
                        <div className="font-bold text-amber-900 mb-1">
                          NIRF Median: ₹{col.placementStats.medianPackageLpa || col.placementStats.medianLPA} LPA ({col.placementStats.year})
                        </div>
                      ) : null}
                      "{col.placementText || 'Campus placement cell active.'}"
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 10: Student Reviews */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Student Feedback</td>
                {colleges.map((col) => (
                  <td key={col.id} className="p-4 border-l border-slate-200 leading-relaxed text-slate-700 text-[11px]">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      "{col.reviewsText || 'Positive academic feedback.'}"
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 11: Verified Branches List */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Offered Branches</td>
                {colleges.map((col) => (
                  <td key={col.id} className="p-4 border-l border-slate-200 text-[11px]">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {col.courses?.slice(0, 10).map((c) => (
                        <span
                           key={c.id}
                           className="px-2 py-0.5 bg-indigo-50 text-indigo-800 font-medium rounded border border-indigo-100"
                        >
                          {c.name.replace('B.E. / B.Tech ', '').replace('B.Tech ', '')}
                        </span>
                      ))}
                      {(col.courses?.length || 0) > 10 && (
                        <span className="text-[10px] text-slate-400 font-bold self-center">
                          +{col.courses!.length - 10} more
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 12: Entrance Exams & Cutoff Predictor */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Admissions & Predictor</td>
                {colleges.map((col) => (
                  <td key={col.id} className="p-4 text-center border-l border-slate-200">
                    <Link
                      href="/kcet-2026-predictor"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors"
                    >
                      <LightningIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Cutoff Predictor &gt;</span>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Save Comparison Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900">Save This Comparison</h3>
            <p className="text-xs text-slate-500">
              Give a memorable name to this comparison so you can reference it later in your dashboard.
            </p>
            <form onSubmit={handleSaveComparison} className="flex flex-col gap-4">
              <Input
                label="Comparison Name"
                placeholder="e.g. Top Karnataka CSE Colleges"
                value={comparisonName}
                onChange={(e) => setComparisonName(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSaveModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                  Save Comparison
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-slate-500">Loading comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}
