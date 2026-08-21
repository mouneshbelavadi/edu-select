import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="flex gap-4 border-b pb-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
