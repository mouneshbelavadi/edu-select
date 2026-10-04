'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AlertCircleIcon } from '@/components/ui/Icons';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center flex flex-col items-center gap-6">
      <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
        <AlertCircleIcon className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-surface-900">Something went wrong!</h1>
      <p className="text-sm text-surface-600 max-w-md">
        An unexpected error occurred while processing your request. Please try again or return to the home page.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="primary" size="md" onClick={() => reset()}>
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" size="md">
            Go to Home Page
          </Button>
        </Link>
      </div>
    </div>
  );
}
