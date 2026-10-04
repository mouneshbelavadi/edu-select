import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

import taxonomyData from '@/data/careers/taxonomy.json';
import careerClustersData from '@/data/careers/careerClusters.json';
import pathwaysData from '@/data/careers/pathways.json';
import examsData from '@/data/careers/exams.json';
import engineeringBranchesData from '@/data/careers/engineeringBranches.json';
import graduateCareersData from '@/data/careers/graduateCareers.json';
import govtJobsData from '@/data/careers/govtJobs.json';
import colleges27States from '@/data/colleges/realColleges27States.json';

export const metadata: Metadata = {
  title: 'Data Sources & Methodology — EduSelect',
  description:
    'Complete documentation of EduSelect data integrity, official government sources, NIRF rankings, 7th CPC pay scales, and estimate disclosures.',
};

export default function AboutDataPage() {
  const datasets = [
    {
      name: '28-State Real Colleges Database',
      meta: (colleges27States as any).meta || {
        dataset: 'realColleges27States',
        description: '455 engineering institutions across all 28 Indian states with NIRF 2025 rankings, verified VTU colleges, and state quota admission paths.',
        compiledOn: '2026-10-04',
        sources: [
          { title: 'National Institutional Ranking Framework (NIRF)', url: 'https://www.nirfindia.org' },
          { title: 'Karnataka Examination Authority (KEA / KCET)', url: 'https://cetsonline.karnataka.gov.in/kea/' },
          { title: 'COMEDK Official Examination Authority', url: 'https://www.comedk.org' },
          { title: 'Joint Seat Allocation Authority (JoSAA)', url: 'https://josaa.nic.in' },
        ],
      },
      count: '455 Colleges',
    },
    {
      name: 'Career Pathways & Qualification Matrix',
      meta: (pathwaysData as any).meta,
      count: `${(pathwaysData as any).items?.length || 100} Pathways`,
    },
    {
      name: 'Engineering Branches & Corporate Careers',
      meta: (engineeringBranchesData as any).meta,
      count: `${(engineeringBranchesData as any).items?.length || 29} Engineering Branches`,
    },
    {
      name: 'National Entrance & Professional Exams',
      meta: (examsData as any).meta,
      count: `${(examsData as any).items?.length || 80} Entrance Exams`,
    },
    {
      name: 'Government Jobs & 7th CPC Matrix',
      meta: (govtJobsData as any).meta,
      count: `${(govtJobsData as any).items?.length || 39} Public Cadres`,
    },
    {
      name: 'Graduate Degrees & Non-Engineering Paths',
      meta: (graduateCareersData as any).meta,
      count: `${(graduateCareersData as any).items?.length || 28} Degrees & Fields`,
    },
    {
      name: 'Career Clusters & Work Domains',
      meta: (careerClustersData as any).meta,
      count: `${(careerClustersData as any).items?.length || 19} Clusters`,
    },
    {
      name: 'Educational Taxonomy & Outlook Framework',
      meta: (taxonomyData as any).meta,
      count: 'Rules & Filters',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider w-fit">
            <span>🛡️ Transparency & Methodology</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Data Sources & <span className="text-blue-400">Methodology</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            EduSelect is built on verifiable, official data from central and state government bodies, official examination authorities, and national agencies.
          </p>
          <div className="text-xs text-blue-200 mt-2 font-mono">
            Last compiled and verified: <strong>4 October 2026</strong>
          </div>
        </div>

        {/* Data Honesty Rules */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>⚖️</span> Our Core Data Quality Standards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-amber-200 text-amber-900">
                  Est. Badge
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">Estimated Market Metrics</h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Fees and private-sector CTC projections change across institutions and batches. Whenever a value carries the <span className="font-bold text-amber-800">Est.</span> badge, it reflects market surveys and historical median bands. It is never an official quota guarantee.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-200 text-emerald-900">
                  7th CPC Pay
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">Statutory Government Pay</h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                All government job compensation figures reflect 7th Central Pay Commission basic pay levels. In-hand totals vary by city tier (X, Y, Z classes) due to Dearness Allowance (DA) and House Rent Allowance (HRA).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-blue-200 text-blue-900">
                  NIRF 2025
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">Objective Ranking Metric</h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Rather than arbitrary subjective star ratings, EduSelect sorts colleges by official NIRF 2025 rankings (Engineering category). Colleges not in the top 100/150/200 band are labelled as unranked rather than displaying synthetic scores.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-purple-200 text-purple-900">
                  28 States
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">Authentic State Counts</h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                North-eastern states have between 2 and 4 accredited engineering colleges each. Rather than inventing fake records to hit arbitrary numbers, our database contains 100% genuine institutions.
              </p>
            </div>
          </div>
        </section>

        {/* Datasets Documentation */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Curated Datasets & Primary Sources
            </h2>
            <span className="text-xs text-slate-500 font-medium">8 Core Modules</span>
          </div>

          <div className="flex flex-col gap-4">
            {datasets.map((ds, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{ds.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{ds.meta?.description}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 self-start sm:self-auto shrink-0">
                    {ds.count}
                  </span>
                </div>

                {/* Sources list */}
                {ds.meta?.sources && ds.meta.sources.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-700">Official Citations:</span>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {ds.meta.sources.map((s: any, sIdx: number) => (
                        <li key={sIdx}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                          >
                            {s.title} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Action button */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/colleges"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Explore Colleges
          </Link>
          <Link
            href="/careers"
            className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl transition-colors"
          >
            Explore Careers
          </Link>
        </div>
      </div>
    </div>
  );
}
