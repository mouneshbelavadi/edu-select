'use client';

import React from 'react';
import { BuildingLibraryIcon } from '@/components/ui/Icons';

interface CollegeLogoBadgeProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

function getCollegeAcronym(name: string): string {
  const clean = name
    .replace(/\(.*?\)/g, '')
    .replace(/["']/g, '')
    .trim();

  // Known prestigious acronyms
  if (/ramaiah|msrit/i.test(clean)) return 'MSRIT';
  if (/r\.?\s*v\.?|rvce/i.test(clean)) return 'RVCE';
  if (/b\.?\s*m\.?\s*s\.?|bmsce/i.test(clean)) return 'BMSCE';
  if (/pes\s*university|pesit/i.test(clean)) return 'PES';
  if (/university\s*visvesvaraya|uvce/i.test(clean)) return 'UVCE';
  if (/national\s*institute\s*of\s*engineering|nie/i.test(clean)) return 'NIE';
  if (/siddaganga|sit\b/i.test(clean)) return 'SIT';
  if (/dayananda\s*sagar/i.test(clean)) return 'DSCE';
  if (/bangalore\s*institute\s*of\s*technology/i.test(clean)) return 'BIT';
  if (/iit\s*bombay/i.test(clean)) return 'IITB';
  if (/iit\s*delhi/i.test(clean)) return 'IITD';
  if (/iit\s*madras/i.test(clean)) return 'IITM';
  if (/nit\s*karnataka|nitk/i.test(clean)) return 'NITK';
  if (/bits\s*pilani/i.test(clean)) return 'BITS';
  if (/vit\s*vellore|vellore\s*institute/i.test(clean)) return 'VIT';
  if (/anna\s*university/i.test(clean)) return 'AU';

  // Generate 2-4 letter acronym from capital words
  const words = clean.split(/[\s,-]+/).filter((w) => w.length > 0 && !/^(of|and|the|in|for|at|&)$/i.test(w));
  if (words.length >= 3) {
    return words.slice(0, 3).map((w) => w[0].toUpperCase()).join('');
  }
  if (words.length === 2) {
    return words.map((w) => w.slice(0, 2).toUpperCase()).join('');
  }
  return clean.slice(0, 3).toUpperCase();
}

function getBadgeColors(name: string): { bg: string; text: string; border: string } {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorSchemes = [
    { bg: 'bg-blue-900', text: 'text-blue-100', border: 'border-blue-700' },
    { bg: 'bg-indigo-900', text: 'text-indigo-100', border: 'border-indigo-700' },
    { bg: 'bg-slate-900', text: 'text-amber-300', border: 'border-amber-500/40' },
    { bg: 'bg-emerald-900', text: 'text-emerald-100', border: 'border-emerald-700' },
    { bg: 'bg-purple-900', text: 'text-purple-100', border: 'border-purple-700' },
    { bg: 'bg-rose-900', text: 'text-rose-100', border: 'border-rose-700' },
    { bg: 'bg-cyan-900', text: 'text-cyan-100', border: 'border-cyan-700' },
  ];
  return colorSchemes[hash % colorSchemes.length];
}

export const CollegeLogoBadge: React.FC<CollegeLogoBadgeProps> = ({ name, size = 'md' }) => {
  const acronym = getCollegeAcronym(name);
  const colors = getBadgeColors(name);

  const sizeClasses = {
    sm: 'w-10 h-10 text-[10px]',
    md: 'w-14 h-14 text-xs',
    lg: 'w-16 h-16 text-sm',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colors.bg} ${colors.text} ${colors.border} rounded-2xl border-2 flex flex-col items-center justify-center font-black shadow-md shrink-0 relative overflow-hidden select-none`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      <BuildingLibraryIcon className="w-3.5 h-3.5 opacity-80 mb-0.5" />
      <span className="font-extrabold tracking-wider leading-tight text-center truncate max-w-[90%]">
        {acronym}
      </span>
    </div>
  );
};
