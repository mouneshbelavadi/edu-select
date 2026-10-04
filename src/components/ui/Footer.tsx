'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide footer on /admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
              🎓
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Edu<span className="text-blue-500">Select</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Find Your Best Engineering College across 28 Indian States. Authentic data, cutoff predictions, real placement stats, and smart side-by-side comparisons.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-8 text-xs text-slate-400 font-medium">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/colleges" className="hover:text-white transition-colors">
            Engineering Colleges
          </Link>
          <Link href="/careers" className="hover:text-white transition-colors">
            Career Explorer
          </Link>
          <Link href="/kcet-2026-predictor" className="hover:text-white transition-colors">
            KCET 2026 Predictor
          </Link>
          <Link href="/states" className="hover:text-white transition-colors">
            28 States Dataset
          </Link>
          <Link href="/compare" className="hover:text-white transition-colors">
            Compare Colleges
          </Link>
          <Link href="/about-data" className="hover:text-white transition-colors">
            Data Sources & Methodology
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <span>© {new Date().getFullYear()} EduSelect. All Rights Reserved. Data compiled from official public notifications & NIRF 2025.</span>
        <span>All fees, compensation and cutoffs are compiled from public notifications and represent estimates.</span>
      </div>
    </footer>
  );
};
