import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center flex flex-col items-center gap-6">
      <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-4xl font-extrabold">
        404
      </div>
      <h1 className="text-3xl font-extrabold text-surface-900">Page Not Found</h1>
      <p className="text-sm text-surface-600 max-w-md">
        The page or college you are looking for does not exist or may have been moved.
      </p>
      <Link href="/colleges">
        <Button variant="primary" size="md">
          ← Back to College Search
        </Button>
      </Link>
    </div>
  );
}
