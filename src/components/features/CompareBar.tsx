'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCompareStore } from '@/lib/store/useCompareStore';
import { Button } from '@/components/ui/Button';

export const CompareBar: React.FC = () => {
  const pathname = usePathname();
  const { selectedColleges, removeCollege, clearColleges } = useCompareStore();

  if (pathname.startsWith('/admin') || selectedColleges.length === 0) return null;

  const compareUrl = `/compare?ids=${selectedColleges.map((c) => c.id).join(',')}`;
  const canCompare = selectedColleges.length >= 2;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-900 text-white shadow-2xl border-t border-surface-700 py-3 px-4 transition-all animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <span className="text-xs font-bold uppercase tracking-wider text-surface-400 mr-2 whitespace-nowrap">
            Compare ({selectedColleges.length}/3):
          </span>
          {selectedColleges.map((college) => (
            <div
              key={college.id}
              className="inline-flex items-center gap-1.5 bg-surface-800 border border-surface-700 text-surface-200 text-xs px-2.5 py-1 rounded-full whitespace-nowrap"
            >
              <span className="max-w-[140px] truncate">{college.name}</span>
              <button
                onClick={() => removeCollege(college.id)}
                className="text-surface-400 hover:text-white transition-colors"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearColleges}
            className="text-xs text-surface-400 hover:text-white transition-colors px-2 py-1"
          >
            Clear All
          </button>
          <Link href={canCompare ? compareUrl : '#'}>
            <Button
              variant="primary"
              size="sm"
              disabled={!canCompare}
              className="shadow-md"
            >
              Compare Now {canCompare ? `(${selectedColleges.length})` : '(Select 2+)'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
