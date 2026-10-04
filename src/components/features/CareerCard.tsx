'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CareerCard as CareerCardType } from '@/types/careerData';
import { HeartIcon } from '@/components/ui/Icons';
import toast from 'react-hot-toast';

interface CareerCardComponentProps {
  card: CareerCardType;
  selectedSubjects?: string[];
  selectedInterests?: string[];
}

export function formatCostInLakhs(cost?: { min: number; max: number } | null): string {
  if (!cost || (cost.min === 0 && cost.max === 0)) {
    return 'Varies by college';
  }

  const formatLakh = (val: number) => {
    const inLakhs = val / 100000;
    if (inLakhs >= 1) {
      return `₹${inLakhs % 1 === 0 ? inLakhs.toFixed(0) : inLakhs.toFixed(1)} L`;
    }
    // If under 1 Lakh, express as ₹0.5 L or ₹50,000
    return `₹${(val / 1000).toFixed(0)}k`;
  };

  const minStr = formatLakh(cost.min);
  const maxStr = formatLakh(cost.max);

  if (minStr === maxStr) {
    return minStr;
  }
  return `${minStr} – ${maxStr}`;
}

export const CareerCardComponent: React.FC<CareerCardComponentProps> = ({
  card,
  selectedSubjects = [],
  selectedInterests = [],
}) => {
  const [isSaved, setIsSaved] = useState(false);

  // Check saved state from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('saved_careers') || '[]');
      setIsSaved(saved.includes(card.id));
    } catch {
      // Ignore storage errors
    }
  }, [card.id]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('saved_careers') || '[]');
      let next: string[];
      if (saved.includes(card.id)) {
        next = saved.filter((id) => id !== card.id);
        setIsSaved(false);
        toast.success(`Removed ${card.title} from My Roadmap`);
      } else {
        next = [...saved, card.id];
        setIsSaved(true);
        toast.success(`Saved ${card.title} to My Roadmap`);
      }
      localStorage.setItem('saved_careers', JSON.stringify(next));
    } catch {
      toast.error('Unable to save career item');
    }
  };

  // 1. Category Tag
  const categoryLabel = (() => {
    if (card.clusterName) return card.clusterName;
    if (card.kind === 'branch') return 'Engineering Branch';
    if (card.kind === 'govtJob') return 'Government Job';
    if (card.kind === 'degree') return 'Degree & Career';
    return 'Course & Pathway';
  })();

  // 2. Outlook Tag
  const outlookConfig = {
    GROWING: { label: 'Growing ↑', className: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    STABLE: { label: 'Stable →', className: 'text-slate-700 bg-slate-100 border-slate-200' },
    DECLINING: { label: 'Declining ↓', className: 'text-amber-800 bg-amber-50 border-amber-200' },
  }[card.outlook] || { label: 'Stable →', className: 'text-slate-700 bg-slate-100 border-slate-200' };

  // 3. Match line in teal (only matching subjects user selected)
  const matchingParts = selectedSubjects.filter((subj) => {
    const s = subj.toLowerCase();
    const titleMatch = card.title.toLowerCase().includes(s);
    const subtitleMatch = (card.subtitle || '').toLowerCase().includes(s);
    const subjectListMatch = card.subjectMatches?.some((m) => m.toLowerCase().includes(s));
    return titleMatch || subtitleMatch || subjectListMatch;
  });

  const costFormatted = formatCostInLakhs(card.totalCostINR);
  const detailUrl = `/careers/${card.kind}/${encodeURIComponent(card.id)}`;

  return (
    <div className="group relative bg-white rounded-[12px] border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm transition-all duration-150 flex flex-col justify-between h-full p-5">
      <Link href={detailUrl} className="absolute inset-0 z-10" aria-label={`View roadmap for ${card.title}`} />

      <div className="flex flex-col gap-3">
        {/* Top Row: Category tag, Outlook tag, Special Badges, Save Heart */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-[6px] text-xs font-semibold bg-slate-100 text-[#0F172A] border border-[#E2E8F0]">
              {categoryLabel}
            </span>
            <span className={`px-2 py-0.5 rounded-[6px] text-xs font-semibold border ${outlookConfig.className}`}>
              {outlookConfig.label}
            </span>
            {card.globalShortage && (
              <span className="px-2 py-0.5 rounded-[6px] text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                Global Talent Deficit ⚡
              </span>
            )}
            {card.globalMobility && (
              <span className="px-2 py-0.5 rounded-[6px] text-xs font-semibold bg-blue-50 text-[#1D4ED8] border border-blue-200">
                {card.globalMobility.target_country} Licensure
              </span>
            )}
            {card.industrialLinkage && (
              <span className="px-2 py-0.5 rounded-[6px] text-xs font-semibold bg-teal-50 text-[#0D9488] border border-teal-200">
                Karnataka Skill 2025–32
              </span>
            )}
            {card.ncrfLevel && (
              <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium bg-slate-50 text-slate-600 border border-[#E2E8F0]">
                {card.ncrfLevel.split('(')[0].trim()}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleToggleSave}
            className="relative z-20 p-1.5 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-rose-600 transition-colors focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
            title={isSaved ? 'Remove from My Roadmap' : 'Save to My Roadmap'}
            aria-label={isSaved ? 'Remove from My Roadmap' : 'Save to My Roadmap'}
          >
            <HeartIcon
              className={`w-4 h-4 transition-colors ${
                isSaved ? 'text-rose-600 fill-rose-600' : 'text-[#64748B]'
              }`}
            />
          </button>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors line-clamp-2 leading-snug">
            {card.title}
          </h3>
          <p className="mt-1 text-sm text-[#475569] line-clamp-1 leading-relaxed">
            {card.subtitle}
          </p>
        </div>

        {/* Match Line in Teal (only shown when user selected matching subjects) */}
        {matchingParts.length > 0 && (
          <div className="text-xs font-semibold text-[#0D9488]">
            Matches your {matchingParts.join(', ')}
          </div>
        )}

        {/* Key Competencies for Deep Tech */}
        {card.keyCompetencies && card.keyCompetencies.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] font-medium text-[#64748B]">Skills:</span>
            {card.keyCompetencies.slice(0, 3).map((comp, i) => (
              <span
                key={i}
                className="px-1.5 py-0.2 rounded text-[11px] bg-blue-50/60 text-[#1D4ED8] font-medium border border-blue-100"
              >
                {comp}
              </span>
            ))}
          </div>
        )}

        {/* Two Facts: Duration & Financial Outcome (Cost or CTC or In-hand Pay) */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0] text-sm">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-[#64748B]">
              {card.kind === 'govtJob' ? 'Age / Limit' : 'Duration'}
            </span>
            <span className="font-semibold text-[#0F172A] line-clamp-1">
              {card.durationText || 'Standard'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-[#64748B]">
              {card.estimatedGrossMonthly
                ? 'Estimated Monthly'
                : card.entrySalaryLPA
                ? card.entrySalaryLPA.basis || 'Fresher CTC'
                : 'Estimated Cost'}
            </span>
            <span className="font-semibold text-[#0F172A] line-clamp-1">
              {card.estimatedGrossMonthly
                ? card.estimatedGrossMonthly
                : card.entrySalaryLPA
                ? `₹${card.entrySalaryLPA.min}–₹${card.entrySalaryLPA.max} LPA`
                : costFormatted}
            </span>
          </div>
        </div>

        {/* Entrance Exams as small tags */}
        {card.examNames && card.examNames.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
            <span className="text-[#64748B] font-medium">Exams:</span>
            {card.examNames.slice(0, 3).map((exam, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-[4px] bg-slate-50 border border-[#E2E8F0] text-[#0F172A] font-medium text-[11px]"
              >
                {exam}
              </span>
            ))}
            {card.examNames.length > 3 && (
              <span className="text-[11px] text-[#64748B] font-medium">
                +{card.examNames.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Button & Data Credibility Footnote */}
      <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#64748B]">
          Source: Official Portals · 2025
        </span>
        <span className="font-semibold text-[#1D4ED8] group-hover:underline flex items-center gap-1">
          View roadmap →
        </span>
      </div>
    </div>
  );
};
