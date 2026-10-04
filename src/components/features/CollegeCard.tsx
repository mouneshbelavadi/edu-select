'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCompareStore } from '@/lib/store/useCompareStore';
import {
  BuildingLibraryIcon,
  TrophyIcon,
  MapPinIcon,
  CheckIcon,
  HeartIcon,
} from '@/components/ui/Icons';
import toast from 'react-hot-toast';

export interface CollegeCardData {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  typeDetail?: string;
  establishedYear?: number;
  established?: number | null;
  fees: number;
  feesDisplay?: string;
  feesIsEstimate?: boolean;
  rating: number | null;
  ratingDisplay?: string;
  nirfRank2025?: number | null;
  nirfBand2025?: string | null;
  imageUrl?: string | null;
}

export const CollegeCard: React.FC<{ college: CollegeCardData }> = ({ college }) => {
  const { addCollege, selectedColleges } = useCompareStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isCompared = selectedColleges.some((c) => c.id === college.id);
  const detailLink = `/colleges/${college.slug || college.id}`;

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCompared) {
      toast('Already added to comparison bar');
      return;
    }
    const success = addCollege({ id: college.id, name: college.name });
    if (success) {
      toast.success(`Added ${college.name} to comparison`);
    } else {
      toast.error('Maximum 3 colleges allowed for comparison');
    }
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch('/api/saved/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId: college.id }),
      });

      if (res.ok) {
        setIsSaved(true);
        toast.success(`Saved ${college.name} to dashboard!`);
      } else {
        const data = await res.json();
        toast.error(data.error?.message || data.error || 'Failed to save college');
      }
    } catch {
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const badgeVariant =
    college.type === 'GOVERNMENT'
      ? 'government'
      : college.type === 'PRIVATE'
      ? 'private'
      : 'deemed';

  const formattedFees =
    college.feesDisplay ||
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(college.fees);

  const nirfBadge = college.nirfRank2025 ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-300">
      <TrophyIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      <span>NIRF #{college.nirfRank2025}</span>
    </span>
  ) : college.nirfBand2025 ? (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-300">
      NIRF {college.nirfBand2025}
    </span>
  ) : (
    <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
      Not NIRF-ranked
    </span>
  );

  return (
    <Card hoverable className="flex flex-col h-full overflow-hidden group">
      {/* Header Banner / Image Link */}
      <Link href={detailLink} className="block relative h-40 w-full bg-gradient-to-r from-brand-900 via-brand-800 to-surface-800 p-4 text-white overflow-hidden cursor-pointer">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-200">
            Estd. {college.established || college.establishedYear || 'N/A'}
          </span>
          <h3 className="font-bold text-lg text-white line-clamp-2 leading-tight group-hover:text-brand-300 transition-colors">
            {college.name}
          </h3>
          <span className="text-xs text-surface-300 flex items-center justify-center gap-1">
            <MapPinIcon className="w-3.5 h-3.5 text-surface-300 shrink-0" />
            <span>{college.city}, {college.state}</span>
          </span>
        </div>
      </Link>

      {/* Body Info */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Badge variant={badgeVariant}>{college.type}</Badge>
            {nirfBadge}
          </div>

          {college.typeDetail && (
            <div className="text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/70 flex items-center gap-1.5" title={college.typeDetail}>
              <BuildingLibraryIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{college.typeDetail}</span>
            </div>
          )}

          <div className="flex items-baseline justify-between border-t border-surface-100 pt-3">
            <span className="text-xs text-surface-500 font-medium">Avg Annual Fee</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-surface-900">{formattedFees}</span>
              {college.feesIsEstimate !== false && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Est.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-surface-100">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={isCompared ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleCompareClick}
              className="w-full text-xs flex items-center justify-center gap-1"
            >
              {isCompared && <CheckIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              <span>{isCompared ? 'Compared' : '+ Compare'}</span>
            </Button>
            <Button
              variant={isSaved ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleSaveClick}
              isLoading={isSaving}
              className={`w-full text-xs flex items-center justify-center gap-1 ${isSaved ? 'text-brand-700 font-bold' : ''}`}
            >
              <HeartIcon className={`w-3.5 h-3.5 ${isSaved ? 'text-rose-600 fill-rose-600' : 'text-slate-500'}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </Button>
          </div>

          <Link href={detailLink} className="w-full">
            <Button variant="primary" size="sm" className="w-full">
              View Details →
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
