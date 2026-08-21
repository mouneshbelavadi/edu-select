'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCompareStore } from '@/lib/store/useCompareStore';
import toast from 'react-hot-toast';

export interface CollegeCardData {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: 'GOVERNMENT' | 'PRIVATE' | 'DEEMED';
  establishedYear: number;
  fees: number;
  rating: number;
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
        toast.error(data.error?.message || 'Failed to save college');
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

  const formattedFees = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(college.fees);

  return (
    <Card hoverable className="flex flex-col h-full overflow-hidden group">
      {/* Header Banner / Image Link */}
      <Link href={detailLink} className="block relative h-40 w-full bg-gradient-to-r from-brand-900 via-brand-800 to-surface-800 p-4 text-white overflow-hidden cursor-pointer">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-200">
            Estd. {college.establishedYear}
          </span>
          <h3 className="font-bold text-lg text-white line-clamp-2 leading-tight group-hover:text-brand-300 transition-colors">
            {college.name}
          </h3>
          <span className="text-xs text-surface-300">
            📍 {college.city}, {college.state}
          </span>
        </div>
      </Link>

      {/* Body Info */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Badge variant={badgeVariant}>{college.type}</Badge>
            <div className="flex items-center gap-1 text-sm font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <span>★</span>
              <span>{college.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between border-t border-surface-100 pt-3">
            <span className="text-xs text-surface-500 font-medium">Avg Annual Fee</span>
            <span className="text-base font-bold text-surface-900">{formattedFees}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-surface-100">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={isCompared ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleCompareClick}
              className="w-full text-xs"
            >
              {isCompared ? '✓ Compared' : '+ Compare'}
            </Button>
            <Button
              variant={isSaved ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleSaveClick}
              isLoading={isSaving}
              className={`w-full text-xs ${isSaved ? 'text-brand-700 font-bold' : ''}`}
            >
              {isSaved ? '♥ Saved' : '♥ Save'}
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
