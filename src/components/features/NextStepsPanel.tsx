'use client';

import React from 'react';
import Link from 'next/link';
import { useStudentProfile } from '@/lib/store/useStudentProfile';
import {
  ArrowRightIcon,
  CheckIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  AlertCircleIcon,
} from '@/components/ui/Icons';

interface NextStepsPanelProps {
  currentPageTitle: string;
}

export default function NextStepsPanel({ currentPageTitle }: NextStepsPanelProps) {
  const { profile, resolution, isLoaded } = useStudentProfile();

  if (!isLoaded) return null;

  return (
    <section className="w-full my-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-800/40">
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide w-fit">
              <SparklesIcon className="w-3.5 h-3.5 text-blue-300" />
              <span>Student Progression Roadmap</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              You are here: <span className="text-blue-400">{currentPageTitle}</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Customized progression guide based on your profile: <span className="text-white font-bold">{resolution.headline}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/ai-counsellor"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md"
            >
              <span>Ask AI Counsellor</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 3-Column Progression Map */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Col 1: What Comes Next */}
          <div className="bg-slate-800/60 border border-indigo-900/40 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-3">
                <CheckIcon className="w-4 h-4 text-emerald-400" />
                <span>What Comes Next</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {resolution.nextProgressionSteps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed flex items-start gap-2">
                    <span className="text-blue-400 font-bold shrink-0">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Col 2: Key Entrance Exams */}
          <div className="bg-slate-800/60 border border-indigo-900/40 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-3">
                <ShieldCheckIcon className="w-4 h-4 text-blue-400" />
                <span>Official Entrance Exams</span>
              </div>
              <div className="space-y-2 text-xs">
                {resolution.entranceExams.slice(0, 3).map((exam, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900/50 border border-indigo-950/60">
                    <div className="flex items-center justify-between font-bold text-white mb-0.5">
                      <span>{exam.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        {exam.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{exam.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Col 3: Data We Have For It */}
          <div className="bg-slate-800/60 border border-indigo-900/40 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-3">
                <BuildingLibraryIcon className="w-4 h-4 text-purple-400" />
                <span>Data We Have For It</span>
              </div>
              <div className="space-y-2">
                {resolution.recommendedTools.map((tool, idx) => (
                  <Link
                    key={idx}
                    href={tool.route}
                    className="block p-2.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/40 transition-colors group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-blue-300">
                      <span>{tool.title}</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{tool.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Honesty Banner if applicable */}
        {resolution.coverageHonestyNotice && (
          <div className="mt-6 p-4 rounded-xl bg-slate-950/70 border border-indigo-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircleIcon className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Data Scope Transparency: </span>
                <span className="text-slate-400">{resolution.coverageHonestyNotice.missingDataNotice}</span>
              </div>
            </div>

            {resolution.coverageHonestyNotice.externalUrl && (
              <a
                href={resolution.coverageHonestyNotice.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 font-medium shrink-0 border border-indigo-900 transition-colors text-[11px]"
              >
                <span>{resolution.coverageHonestyNotice.recommendedExternalPortal}</span>
                <ArrowRightIcon className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
