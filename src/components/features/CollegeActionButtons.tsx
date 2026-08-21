'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCompareStore } from '@/lib/store/useCompareStore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
      >
        {isCompared ? '✓ Added to Compare' : '+ Add to Compare'}
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={handleSaveClick}
        isLoading={isSaving}
      >
        ♥ Save College
      </Button>
    </div>
  );
};
