'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCompareStore } from '@/lib/store/useCompareStore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CheckIcon, HeartIcon } from '@/components/ui/Icons';

export interface CollegeActionButtonsProps {
  collegeId: string;
  collegeName: string;
}

export const CollegeActionButtons: React.FC<CollegeActionButtonsProps> = ({
  collegeId,
  collegeName,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { addCollege, selectedColleges } = useCompareStore();
  const [isSaving, setIsSaving] = useState(false);

  const isCompared = selectedColleges.some((c) => c.id === collegeId);

  const handleCompareClick = () => {
    if (isCompared) {
      toast('Already added to comparison');
      return;
    }
    const success = addCollege({ id: collegeId, name: collegeName });
    if (success) {
      toast.success(`Added ${collegeName} to comparison`);
    } else {
      toast.error('Maximum 3 colleges allowed for comparison');
    }
  };

  const handleSaveClick = async () => {
    if (!session) {
      toast.error('Please log in to save colleges');
      router.push('/login');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/saved/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId }),
      });

      if (res.ok) {
        toast.success('College saved to your dashboard!');
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

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={isCompared ? 'secondary' : 'outline'}
        size="md"
        onClick={handleCompareClick}
        className="flex items-center gap-1.5"
      >
        {isCompared && <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />}
        <span>{isCompared ? 'Added to Compare' : '+ Add to Compare'}</span>
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={handleSaveClick}
        isLoading={isSaving}
        className="flex items-center gap-1.5"
      >
        <HeartIcon className="w-4 h-4 fill-white shrink-0" />
        <span>Save College</span>
      </Button>
    </div>
  );
};
