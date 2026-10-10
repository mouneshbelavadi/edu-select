'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCapIcon,
  BookOpenIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  WrenchIcon,
  CpuIcon,
  ScaleIcon,
  ArrowRightIcon,
  BuildingLibraryIcon,
} from '@/components/ui/Icons';
import pathwaysData from '@/data/careers/pathways.json';
import branchesData from '@/data/careers/engineeringBranches.json';
import govtData from '@/data/careers/govtJobs.json';
import karnatakaPathwaysData from '@/data/careers/karnatakaPathways.json';

const STAGES = [
  { id: '10th', label: 'After Class 10th', subtitle: 'Streams, Polytechnic & ITI Trades', icon: BookOpenIcon },
  { id: 'karnataka', label: 'Karnataka Pathways', subtitle: 'DTE Polytechnic, DCET & Health', icon: ShieldCheckIcon },
  { id: '12th', label: 'After Class 12th / PU', subtitle: 'Engineering, Medicine, Finance & Law', icon: GraduationCapIcon },
  { id: 'iti', label: 'After ITI', subtitle: 'Apprenticeships, Lateral Entry & PSUs', icon: WrenchIcon },
  { id: 'diploma', label: 'After Diploma', subtitle: 'Lateral B.Tech & Junior Engineer (JE)', icon: CpuIcon },
  { id: 'btech', label: 'After B.Tech / BE', subtitle: '29 Branches, PSUs via GATE & Tech', icon: BriefcaseIcon },
];

export default function PathwaysDashboardPage() {
  const [activeStage, setActiveStage] = useState<string>('10th');
  const [streamFilter, setStreamFilter] = useState<string>('ALL');

  const allPathways = pathwaysData.items as any[];
  const allBranches = branchesData.items as any[];
  const allGovt = govtData.items as any[];

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-24 text-slate-800">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide w-fit">
              <BookOpenIcon className="w-3.5 h-3.5 text-blue-300" />
              <span>Stage-by-Stage Higher Education Roadmap</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Educational Pathways <span className="text-blue-400">& Progression Dashboard</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore step-by-step academic and vocational trajectories from Class 10 to postgraduate careers.
              Compare lateral entry routes, entrance examinations, salary bands, and public sector opportunities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <Link
              href="/ai-counsellor"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md"
            >
              <GraduationCapIcon className="w-4 h-4" />
              <span>Ask AI Counsellor</span>
            </Link>
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/20"
            >
              <BuildingLibraryIcon className="w-4 h-4" />
              <span>Verified Colleges</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stage Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-md grid grid-cols-2 sm:grid-cols-5 gap-2">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            const isSelected = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`p-3 rounded-xl text-left flex items-start gap-3 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                <div>
                  <div className="text-xs font-extrabold">{stage.label}</div>
                  <div className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {stage.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 flex flex-col gap-10">

        {/* 1. AFTER 10TH DASHBOARD */}
        {activeStage === '10th' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-200">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Foundation Stage</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">Four Pathways After Class 10 (SSLC / Matriculation)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose between continuing in traditional senior secondary, joining technical polytechnics, learning vocational trades, or early defence entry.
              </p>
            </div>

            {/* 4 Vector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  title: 'Class 11–12 / PU',
                  badge: 'Academic Stream',
                  desc: 'Science (PCM/PCB), Commerce, or Arts leading to 3 to 5-year bachelor degrees.',
                  duration: '2 Years',
                  link: '/careers?level=CLASS_10&cluster=science-research',
                },
                {
                  title: 'Polytechnic Diploma',
                  badge: 'Technical Route',
                  desc: 'Practical engineering diploma with direct lateral entry into 2nd year B.Tech.',
                  duration: '3 Years',
                  link: '/careers?level=CLASS_10&q=diploma',
                },
                {
                  title: '20 ITI Trades',
                  badge: 'Vocational CTS',
                  desc: 'Electrician, Fitter, Welder, Machinist with national NCVT certification.',
                  duration: '1–2 Years',
                  link: '/careers?level=CLASS_10&q=iti',
                },
                {
                  title: 'Defence & Govt Entry',
                  badge: 'Uniformed / Govt',
                  desc: 'Army Soldier GD, Navy MR, Coast Guard Navik, and SSC MTS examinations.',
                  duration: 'Direct Post',
                  link: '/careers?level=CLASS_10&cluster=defence-uniformed',
                },
              ].map((v, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 w-fit">
                      {v.badge}
                    </span>
                    <h3 className="text-base font-black text-slate-900">{v.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <span className="font-semibold text-slate-500">{v.duration}</span>
                    <Link href={v.link} className="font-bold text-blue-600 hover:text-blue-800">
                      Explore Options →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pathways List for 10th */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
              <h3 className="text-lg font-black text-slate-900">Curated Options for Class 10 Students</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allPathways.filter((p) => p.level === 'CLASS_10').slice(0, 12).map((item) => (
                  <Link
                    key={item.id}
                    href={`/careers/pathway/${item.id}`}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between gap-2 group"
                  >
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">{item.category}</div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 mt-0.5">{item.name}</div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                      <span>{item.duration}</span>
                      <span className="text-blue-600 font-bold group-hover:underline">View Roadmap →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* KARNATAKA STATE SPECIFIC PATHWAYS */}
        {activeStage === 'karnataka' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-200">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Karnataka Technical & Higher Education</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Karnataka State Pathways & Lateral Entry Vectors</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Official DTE C-25 Polytechnic Diplomas, KEA DCET Lateral Entry into 2nd year B.Tech, PMB Paramedical, and Health Sciences degrees.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Link
                  href="/puc-colleges"
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-all"
                >
                  Explore 6,400+ PU Colleges →
                </Link>
                <Link
                  href="/medical-allied-health"
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all"
                >
                  Medical & Allied Seats (788) →
                </Link>
              </div>
            </div>

            {/* 1. DTE 3-Year Polytechnic Diplomas */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">1. DTE 3-Year Polytechnic Diplomas & DCET Lateral Progression</h3>
                  <p className="text-xs text-slate-500">
                    Admission after Class 10th via DTE online merit. Qualifies for direct 2nd-year B.E./B.Tech via KEA DCET.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(karnatakaPathwaysData.polytechnicDiplomas || []).map((dip: any) => (
                  <div
                    key={dip.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4 hover:border-blue-400 transition-all"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">
                          DTE: {dip.code}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ₹{dip.salaryLPA?.fresher?.min}–₹{dip.salaryLPA?.fresher?.max} LPA
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 mt-1 leading-snug">{dip.name}</h4>
                      <p className="text-xs text-slate-500">{dip.duration} • {dip.entryEligibility}</p>

                      {dip.lateralEntryRoute && (
                        <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex flex-col gap-1">
                          <span className="font-bold text-blue-700">🚀 {dip.lateralEntryRoute.exam}</span>
                          <span className="text-slate-600 text-[11px] leading-relaxed">
                            {dip.lateralEntryRoute.progression}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                      <div className="text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">Top Recruiters: </span>
                        {(dip.karnatakaEmployers || []).slice(0, 4).join(', ')}
                      </div>
                      <Link
                        href="/kcet-2026-predictor"
                        className="text-xs font-bold text-blue-600 hover:text-blue-800"
                      >
                        Predict Engineering Colleges →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Post-PUC Professional & Health Sciences */}
            <div className="flex flex-col gap-4 pt-4 border-t border-slate-200">
              <div>
                <h3 className="text-lg font-black text-slate-900">2. Post-PUC Professional Degrees & KEA Counselling</h3>
                <p className="text-xs text-slate-500">
                  Medical, Dental, Pharmacy, B.Sc Nursing, and Agricultural Sciences pathways via NEET UG & KCET.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(karnatakaPathwaysData.postPUCDegreePathways || []).map((deg: any) => (
                  <div
                    key={deg.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4 hover:border-rose-300 transition-all"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono">
                          {deg.degree}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          ₹{deg.salaryLPA?.fresher?.min}–₹{deg.salaryLPA?.fresher?.max} LPA
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 mt-1 leading-snug">{deg.name}</h4>
                      <p className="text-xs text-slate-500">{deg.duration} • Exam: {deg.admissionExam}</p>
                      <p className="text-xs text-slate-600 bg-surface-50 p-2.5 rounded-xl border border-surface-200/60 leading-relaxed">
                        {deg.collegesInState}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href="/medical-allied-health"
                        className="text-xs font-bold text-rose-600 hover:text-rose-800"
                      >
                        View KEA Seat Matrix →
                      </Link>
                      <span className="text-[11px] text-slate-400 font-medium">{deg.degree}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Paramedical Diplomas */}
            <div className="flex flex-col gap-4 pt-4 border-t border-slate-200">
              <div>
                <h3 className="text-lg font-black text-slate-900">3. Paramedical Board (PMB) Karnataka Diplomas</h3>
                <p className="text-xs text-slate-500">
                  Short-cycle 3-year paramedical programmes after SSLC / PUC leading to clinical technologist roles.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {(karnatakaPathwaysData.paramedicalDiplomas || []).map((pm: any) => (
                  <div
                    key={pm.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded w-fit">
                        {pm.code}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">{pm.name}</h4>
                      <p className="text-xs text-slate-500">{pm.duration} • {pm.board}</p>
                      <div className="text-xs text-slate-700 font-bold mt-1">
                        Salary: ₹{pm.salaryLPA?.fresher?.min}–₹{pm.salaryLPA?.fresher?.max} LPA (Fresher)
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                      Associated Teaching Hospitals: {(pm.hospitals || []).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. AFTER 12TH DASHBOARD */}
        {activeStage === '12th' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-200">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Higher Secondary Transition</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Undergraduate Pathways by Stream</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'PCM', 'PCB', 'COMMERCE_MATHS', 'ARTS'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStreamFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      streamFilter === st
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'ALL' ? 'All Streams' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allPathways
                .filter((p) => p.level === 'CLASS_12')
                .filter((p) => streamFilter === 'ALL' || p.streams?.includes(streamFilter as any) || p.streams?.includes('ANY'))
                .slice(0, 18)
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4 hover:border-blue-400 transition-all"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">{item.duration}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">{item.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{item.eligibility}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <Link
                        href={`/careers/pathway/${item.id}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800"
                      >
                        Explore Pathway →
                      </Link>
                      <Link
                        href="/ai-counsellor"
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-900"
                      >
                        Ask AI Fits
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 3. AFTER ITI DASHBOARD */}
        {activeStage === 'iti' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-200">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Vocational Advancement</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">Progression Routes After ITI (Craftsmen Training)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: 'Apprenticeship (NAPS)',
                  desc: '1–2 years industry on-the-job training leading to the National Apprenticeship Certificate (NAC). Essential for Railway and Defence jobs.',
                  duration: '1–2 Years',
                },
                {
                  title: 'Lateral Entry to Polytechnic',
                  desc: 'Direct admission into the 2nd year (3rd semester) of 3-year diploma engineering programs.',
                  duration: '2 Years',
                },
                {
                  title: 'Technician & Loco Pilot (RRB/PSU)',
                  desc: 'Direct eligibility for Railway Assistant Loco Pilot (ALP), Technician Grade III, DRDO, ISRO, and State Electricity Boards.',
                  duration: 'Direct Employment',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-black text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="text-xs font-bold text-blue-600 border-t border-slate-100 pt-3">
                    Duration: {item.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. AFTER DIPLOMA DASHBOARD */}
        {activeStage === 'diploma' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-200">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Polytechnic Advancement</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">Career Vectors After Polytechnic Diploma</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col gap-4">
                <span className="text-xs font-extrabold text-blue-600 uppercase">Degree Route</span>
                <h3 className="text-lg font-black text-slate-900">B.E. / B.Tech Lateral Entry (2nd Year Direct)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Join B.E. / B.Tech directly in the 3rd semester through state entrance exams like DCET (Karnataka), ECET (Andhra/Telangana), JELET (West Bengal), or LEET (Haryana/Punjab). Graduate with a full engineering degree in 3 years.
                </p>
                <Link
                  href="/colleges"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  <span>Explore Engineering Colleges →</span>
                </Link>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col gap-4">
                <span className="text-xs font-extrabold text-emerald-600 uppercase">Government Employment</span>
                <h3 className="text-lg font-black text-slate-900">Junior Engineer (JE) in Central & State Govt</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Appear for SSC JE, RRB JE, State PWD, Irrigation, and Electricity Discom JE exams. Pay Level 6 with starting gross compensation of ₹55,000–₹65,000/month under 7th CPC.
                </p>
                <Link
                  href="/careers?cluster=government-civil"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  <span>View Government JE Exams →</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 5. AFTER ENGINEERING (29 BRANCHES) DASHBOARD */}
        {activeStage === 'btech' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-200">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Engineering Graduates</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">29 Engineering Branches & Post-Graduation Career Profiles</h2>
              <p className="text-xs text-slate-500 mt-1">
                Explore placement compensation, core vs IT roles, GATE PSU eligibility, and higher studies by branch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allBranches.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4 hover:border-blue-400 transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {b.code}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        ₹{b.salaryLPA?.fresher?.min}–₹{b.salaryLPA?.fresher?.max} LPA
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900 mt-1">{b.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      Roles: {(b.roles?.entry || []).slice(0, 3).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <Link
                      href={`/careers/branch/${b.id}`}
                      className="font-bold text-blue-600 hover:text-blue-800"
                    >
                      Branch Roadmap →
                    </Link>
                    <Link
                      href={`/colleges?search=${encodeURIComponent(b.name)}`}
                      className="font-semibold text-slate-500 hover:text-slate-800"
                    >
                      View Colleges
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
