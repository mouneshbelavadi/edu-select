import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCareerDetail } from '@/lib/careers/repository';
import { getColleges } from '@/lib/collegeRepository';
import { CollegeCard } from '@/components/features/CollegeCard';
import { AiCounselorDrawer } from '@/components/features/AiCounselorDrawer';
import {
  CompassIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  BriefcaseIcon,
  BanknoteIcon,
  LinkIcon,
} from '@/components/ui/Icons';

// Static datasets for generateStaticParams
import pathwaysData from '@/data/careers/pathways.json';
import engineeringBranchesData from '@/data/careers/engineeringBranches.json';
import graduateCareersData from '@/data/careers/graduateCareers.json';
import govtJobsData from '@/data/careers/govtJobs.json';

interface CareerPageProps {
  params: {
    kind: string;
    id: string;
  };
  searchParams?: {
    fromLevel?: string;
    fromStream?: string;
    fromSubjects?: string;
  };
}

export async function generateStaticParams() {
  const params: { kind: string; id: string }[] = [];

  (pathwaysData as any).items.forEach((p: any) => {
    params.push({ kind: 'pathway', id: p.id });
  });

  (engineeringBranchesData as any).items.forEach((b: any) => {
    params.push({ kind: 'branch', id: b.id });
  });

  (graduateCareersData as any).items.forEach((g: any) => {
    params.push({ kind: 'degree', id: g.id });
  });

  (govtJobsData as any).items.forEach((j: any) => {
    params.push({ kind: 'govtJob', id: j.id });
  });

  return params;
}

export async function generateMetadata({ params }: CareerPageProps): Promise<Metadata> {
  const detail = getCareerDetail(params.kind as any, params.id);
  if (!detail) {
    return { title: 'Career Pathway Not Found — EduSelect' };
  }

  const rawItem = detail.item as any;
  const title =
    params.kind === 'branch'
      ? `B.Tech in ${rawItem.name} — Career, Salary & Colleges`
      : params.kind === 'degree'
      ? `${rawItem.qualification} — Career Pathways & Roles`
      : params.kind === 'govtJob'
      ? `${rawItem.exam} — Syllabus, Age Limit & Pay Scale`
      : `${rawItem.name} — Eligibility, Cost & Outcomes`;

  return {
    title: `${title} | EduSelect Career Explorer`,
    description: `Complete guide to ${title}. Verified syllabus, eligibility, salary projections, entrance exams, and top institutions.`,
  };
}

export default async function CareerDetailPage({ params, searchParams }: CareerPageProps) {
  const { kind, id } = params;
  const detail = getCareerDetail(kind as any, id);

  if (!detail) {
    notFound();
  }

  const item = detail.item as any;
  const { resolvedClusters, sources } = detail;

  const itemTitle = item.name || item.qualification || item.exam || item.title || 'this pathway';
  const itemLevel = searchParams?.fromLevel || item.level || (kind === 'branch' ? 'UG_ENGG' : kind === 'govtJob' ? item.minQualification : 'CLASS_10');
  const itemStream = item.streams?.[0] || searchParams?.fromStream || '';
  const itemSubjects = searchParams?.fromSubjects || (item.keySubjects || item.subjectsLiked || []).slice(0, 4).join(',');

  const counsellorParams = new URLSearchParams();
  if (itemLevel) counsellorParams.set('level', itemLevel);
  if (itemStream) counsellorParams.set('stream', itemStream);
  if (itemSubjects) counsellorParams.set('subjects', itemSubjects);
  counsellorParams.set('career', itemTitle);
  counsellorParams.set('query', `I want to explore ${itemTitle}. What are my next best options, entrance exams, and college pathways?`);
  const counsellorUrl = `/ai-counsellor?${counsellorParams.toString()}`;

  // If engineering branch, fetch colleges offering it
  let branchColleges: any[] = [];
  if (kind === 'branch') {
    try {
      const collegeResult = await getColleges({
        page: 1,
        limit: 6,
        sortBy: 'nirf',
        sortOrder: 'asc',
        branch: item.code,
      });
      branchColleges = collegeResult.data || [];
    } catch (err) {
      console.error('Error fetching colleges for branch:', err);
    }
  }

  const outlookBadgeConfig: Record<string, { label: string; bg: string }> = {
    GROWING: { label: 'Growing Demand ↗', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    STABLE: { label: 'Stable Market →', bg: 'bg-sky-50 text-sky-800 border-sky-200' },
    DECLINING: { label: 'Shifting Demand ↘', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  };

  const outlookConfig = outlookBadgeConfig[item.outlook] || {
    label: item.outlook,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-28">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col gap-5">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-blue-200 font-medium">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/careers" className="hover:underline">Careers</Link>
            <span>/</span>
            <span className="capitalize text-white font-bold">{kind}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {kind === 'branch'
                    ? 'Engineering Branch'
                    : kind === 'degree'
                    ? 'Degree / Higher Study'
                    : kind === 'govtJob'
                    ? 'Government Recruitment'
                    : 'Academic Pathway'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${outlookConfig.bg}`}>
                  {outlookConfig.label}
                </span>
                {item.isEstimate && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Est. Market Data (2026)
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                {kind === 'branch' ? `B.Tech in ${item.name}` : kind === 'degree' ? item.qualification : item.name || item.exam}
              </h1>

              {kind === 'branch' && item.aliases && item.aliases.length > 0 && (
                <p className="text-sm text-blue-200 font-medium">
                  Also known as: {item.aliases.join(' • ')}
                </p>
              )}

              {kind === 'govtJob' && (
                <p className="text-sm text-blue-200 font-medium">
                  Recruiting Body: <span className="text-white font-bold">{item.conductingBody}</span>
                </p>
              )}
            </div>

            {/* Verification Timestamp */}
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-right self-start sm:self-auto shrink-0">
              <span className="text-[10px] text-blue-200 block uppercase font-bold tracking-wider">Data Release</span>
              <span className="text-xs font-extrabold text-white">Compiled 4 Oct 2026</span>
            </div>
          </div>

          {/* Cluster Badges */}
          {resolvedClusters && resolvedClusters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-xs text-blue-300 font-semibold">Career Domains:</span>
              {resolvedClusters.map((c: any) => (
                <span
                  key={c.id}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-white/15 text-white border border-white/20 flex items-center gap-1.5"
                >
                  <SparklesIcon className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span>{c.label}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. MAIN BODY CONTENT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Deep Information Panels */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Roadmap Progress Strip */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <CompassIcon className="w-5 h-5 text-indigo-600" />
              <span>Progression Pathway</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex flex-col">
                <span className="text-[10px] font-bold text-blue-600 uppercase">Stage 1</span>
                <span className="font-extrabold text-xs text-slate-900 mt-1">Starting Point</span>
                <span className="text-[11px] text-slate-500 mt-0.5">{item.eligibility || 'Check Criteria'}</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col">
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Stage 2</span>
                <span className="font-extrabold text-xs text-slate-900 mt-1">Entrance & Prep</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Competitive exam or merit entry</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex flex-col">
                <span className="text-[10px] font-bold text-purple-600 uppercase">Stage 3</span>
                <span className="font-extrabold text-xs text-slate-900 mt-1">First Job / Entry</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Campus hiring or qualifying exam</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Stage 4</span>
                <span className="font-extrabold text-xs text-slate-900 mt-1">At 5 Years</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Senior specialist or officer promotion</span>
              </div>
            </div>
          </section>

          {/* Section: Eligibility & Program Overview */}
          {item.eligibility && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-blue-600" />
                <span>Eligibility & Prerequisites</span>
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {item.eligibility}
              </p>
              {item.duration && (
                <div className="text-xs text-slate-500 pt-1">
                  <strong>Course Duration:</strong> {item.duration}
                </div>
              )}
              {item.ncrf_credit_level && (
                <div className="mt-2 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#1D4ED8] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    NCrF
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">
                      National Credit Framework (NCrF) Accreditation: {item.ncrf_credit_level}
                    </span>
                    <span className="text-[11px] text-[#475569] leading-relaxed block mt-0.5">
                      Enables modular accumulation, credit redemption, and lateral mobility across NSQF/NHEQF levels under NEP 2020.
                    </span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Section: Transnational Licensure & Global Mobility */}
          {item.global_mobility && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1D4ED8] flex items-center justify-center font-bold text-sm">
                    🌐
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#0F172A]">
                      Transnational Licensure & Global Mobility Architecture
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Regulatory pathway, foreign certification requirements, and immigration cost framework
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1D4ED8] border border-blue-200">
                  {item.global_mobility.target_country} Pathway
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Total Capital Outlay */}
                {item.global_mobility.total_estimated_capital_outlay_INR && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-[#E2E8F0] flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-[#64748B] uppercase">Estimated Capital Outlay</span>
                    <span className="text-xl font-black text-[#0F172A]">
                      ₹{(item.global_mobility.total_estimated_capital_outlay_INR[0] / 100000).toFixed(1)}L – ₹
                      {(item.global_mobility.total_estimated_capital_outlay_INR[1] / 100000).toFixed(1)}L
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      Includes exam registration, surcharges, 18% GST, and credential verification
                    </span>
                  </div>
                )}

                {/* Net Monthly Savings (for SSW / migration) */}
                {item.global_mobility.net_monthly_savings_INR ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-emerald-800 uppercase">Estimated Net Savings</span>
                    <span className="text-xl font-black text-emerald-950">
                      ~₹{item.global_mobility.net_monthly_savings_INR.toLocaleString('en-IN')}/month
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Net in-hand savings after social insurance, resident taxes, and dormitory expenses
                    </span>
                  </div>
                ) : item.global_mobility.regulatory_body ? (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-indigo-800 uppercase">Regulatory Governance</span>
                    <span className="text-base font-bold text-indigo-950">
                      {item.global_mobility.regulatory_body}
                    </span>
                    <span className="text-[11px] text-indigo-800">
                      Statutory body overseeing examination standards and licensure verification
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Critical Thresholds & Score Benchmarks */}
              {item.global_mobility.critical_thresholds && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col gap-1">
                  <span className="text-xs font-bold text-amber-900 uppercase">
                    Competitive Examination & Score Thresholds
                  </span>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    {item.global_mobility.critical_thresholds}
                  </p>
                </div>
              )}

              {/* Mandatory Certifications */}
              {item.global_mobility.mandatory_certifications && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#0F172A]">Mandatory Certifications & Approvals:</span>
                  <div className="flex flex-wrap gap-2">
                    {item.global_mobility.mandatory_certifications.map((cert: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-[#1D4ED8] border border-blue-200"
                      >
                        ✓ {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Section: Industrial Corridors & Placement Ecosystems */}
          {item.industrial_linkage && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#0D9488] flex items-center justify-center font-bold text-sm">
                    🏭
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#0F172A]">
                      Industrial Corridors & Direct Placement Ecosystem
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Subsidized vocational push feeding Karnataka manufacturing mega-hubs
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#0D9488] border border-teal-200">
                  Karnataka Skill Policy 2025–32
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-[#E2E8F0] flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#64748B] uppercase">Manufacturing Hub</span>
                  <span className="text-sm font-bold text-[#0F172A]">{item.industrial_linkage.corridor}</span>
                  <span className="text-[11px] text-[#64748B]">{item.industrial_linkage.region}</span>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col gap-1">
                  <span className="text-xs font-bold text-teal-800 uppercase">Policy Allocation</span>
                  <span className="text-sm font-bold text-teal-950">₹4,432.5 Crore State Skilling Budget</span>
                  <span className="text-[11px] text-teal-800">
                    CMKKY 2.0 life-cycle integration with GTTC and KGTTI advanced centers
                  </span>
                </div>
              </div>

              {/* Anchor Employers */}
              {item.industrial_linkage.anchor_corporations && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#0F172A]">Anchor Corporations & Industrial Consumers:</span>
                  <div className="flex flex-wrap gap-2">
                    {item.industrial_linkage.anchor_corporations.map((corp: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-[#0F172A] border border-[#E2E8F0]"
                      >
                        {corp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Immediate Roles */}
              {item.industrial_linkage.immediate_roles && (
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-[#0F172A]">Direct Hiring Entry Roles:</span>
                  <div className="flex flex-wrap gap-2">
                    {item.industrial_linkage.immediate_roles.map((role: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200"
                      >
                        ⚡ {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Section: Deep-Tech & Semiconductor Deficit Competencies */}
          {(item.global_shortage_indicator || (item.key_competencies && item.key_competencies.length > 0)) && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                    ⚡
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#0F172A]">
                      Deep-Tech Deficit & Strategic Competency Framework
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      High-stakes, sovereign-backed sector facing global talent shortage ($1.03T market by 2030)
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  300,000+ Deficit
                </span>
              </div>

              {item.key_competencies && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#0F172A]">Critical Technical Competencies:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {item.key_competencies.map((comp: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center gap-2 text-xs font-semibold text-[#0F172A]"
                      >
                        <span className="text-[#1D4ED8]">✦</span>
                        <span>{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Section: Government Job Specific Rules (Age Limit, Selection Stages, Pay) */}
          {kind === 'govtJob' && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BuildingLibraryIcon className="w-5 h-5 text-indigo-600" />
                <span>Recruitment Specifications & Pay</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age Limit & Relaxations */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Age Criteria</span>
                  <div className="text-sm font-extrabold text-slate-900">
                    {item.ageLimit?.text || `Min ${item.ageLimit?.min || 18} to Max ${item.ageLimit?.max} years`}
                  </div>
                  {detail.ageRelaxation && (
                    <div className="text-[11px] text-slate-600 border-t border-slate-200 pt-2 leading-relaxed">
                      <strong>Age Relaxation:</strong> OBC +{detail.ageRelaxation.OBC} yrs, SC/ST +{detail.ageRelaxation.SC_ST} yrs, PwD +{detail.ageRelaxation.PwD} yrs.
                    </div>
                  )}
                </div>

                {/* 7th CPC Basic Pay & In-hand */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col gap-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase">7th CPC Salary</span>
                  <div className="text-lg font-black text-emerald-950">
                    {item.basicPayINR && item.basicPayINR.length > 0
                      ? `₹${item.basicPayINR[0].toLocaleString('en-IN')} Basic Pay`
                      : 'As per 7th CPC Level'}
                  </div>
                  <div className="text-xs text-emerald-800 font-semibold">
                    Approx. In-Hand: {item.approxInHand || '₹30,000–₹60,000/month (varies by city class)'}
                  </div>
                </div>
              </div>

              {/* Selection Stages */}
              {item.selectionStages && item.selectionStages.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-700">Selection Stages:</span>
                  <div className="flex flex-wrap gap-2">
                    {item.selectionStages.map((stage: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200"
                      >
                        {idx + 1}. {stage}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Physical Requirements for Uniformed Services */}
              {item.physicalRequirements && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col gap-2">
                  <span className="text-xs font-bold text-amber-900 uppercase">
                    Physical Standards & Endurance Benchmarks (PST / ET)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-950 font-medium">
                    {item.physicalRequirements.maleHeightCm && (
                      <div>
                        <strong>Male Standards:</strong> Min Height {item.physicalRequirements.maleHeightCm} cm, {item.physicalRequirements.maleChestExpansionCm} cm chest expansion
                      </div>
                    )}
                    {item.physicalRequirements.femaleHeightCm && (
                      <div>
                        <strong>Female Standards:</strong> Min Height {item.physicalRequirements.femaleHeightCm} cm, Min Weight {item.physicalRequirements.femaleWeightKg} kg
                      </div>
                    )}
                  </div>
                  {item.physicalRequirements.notes && (
                    <span className="text-[11px] text-amber-900 border-t border-amber-200 pt-1">
                      {item.physicalRequirements.notes}
                    </span>
                  )}
                </div>
              )}

              {/* Scientific Officer / Fellow Training Stipend & Bonds */}
              {item.trainingStipendMonthly && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col gap-2">
                  <span className="text-xs font-bold text-indigo-900 uppercase">
                    Scientific Training Stipend & Post-Training Absorption
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-indigo-950 font-medium">
                    <div>
                      <strong>Training Stipend:</strong> ₹{item.trainingStipendMonthly.toLocaleString('en-IN')}/month
                    </div>
                    {item.startingGrossMonthly && (
                      <div>
                        <strong>Starting Absorption Gross:</strong> ~₹{item.startingGrossMonthly.toLocaleString('en-IN')}/month (Mumbai / Bengaluru Level 10)
                      </div>
                    )}
                  </div>
                  {item.indemnityBondINR && (
                    <span className="text-[11px] text-indigo-900 border-t border-indigo-200 pt-1">
                      Indemnity Bond: ₹{(item.indemnityBondINR / 100000).toFixed(2)} Lakhs (Service agreement duration: 3 years)
                    </span>
                  )}
                </div>
              )}

              {/* Target Posts */}
              {item.posts && item.posts.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-700">Cadre & Posts:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.posts.map((post: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                      >
                        {post}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Section: Roles by Experience Level (for Engineering Branches) */}
          {kind === 'branch' && item.roles && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BriefcaseIcon className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Career Roles by Experience</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col gap-2">
                  <span className="text-xs font-extrabold text-blue-700 uppercase">Entry Level (0–2 yrs)</span>
                  <ul className="text-xs text-slate-700 flex flex-col gap-1.5">
                    {item.roles.entry?.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-500">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col gap-2">
                  <span className="text-xs font-extrabold text-indigo-700 uppercase">Mid-Level (3–6 yrs)</span>
                  <ul className="text-xs text-slate-700 flex flex-col gap-1.5">
                    {item.roles.mid?.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-500">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col gap-2">
                  <span className="text-xs font-extrabold text-purple-700 uppercase">Senior Level (7+ yrs)</span>
                  <ul className="text-xs text-slate-700 flex flex-col gap-1.5">
                    {item.roles.senior?.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-purple-500">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Section: Salary Progression Table */}
          {(item.salaryLPA || (kind === 'branch' && item.salaryLPA)) && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BanknoteIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Estimated Compensation Progression</span>
                </h2>
                {item.isEstimate && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Est. Market CTC
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-3 font-bold text-slate-700">Career Phase</th>
                      <th className="p-3 font-bold text-slate-700">Estimated CTC Range</th>
                      <th className="p-3 font-bold text-slate-700">Notes / Criteria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {item.salaryLPA.fresher && (
                      <tr>
                        <td className="p-3 font-extrabold text-slate-900">Fresher / Graduate Entry</td>
                        <td className="p-3 font-black text-emerald-700">
                          ₹{item.salaryLPA.fresher.min}–₹{item.salaryLPA.fresher.max} LPA
                        </td>
                        <td className="p-3 text-slate-500">Tier 1/2 college campus hiring</td>
                      </tr>
                    )}
                    {item.salaryLPA.mid3to5 && (
                      <tr>
                        <td className="p-3 font-extrabold text-slate-900">3–5 Years Experience</td>
                        <td className="p-3 font-black text-indigo-700">
                          ₹{item.salaryLPA.mid3to5.min}–₹{item.salaryLPA.mid3to5.max} LPA
                        </td>
                        <td className="p-3 text-slate-500">Core engineering or tech lead role</td>
                      </tr>
                    )}
                    {item.salaryLPA.senior10plus && (
                      <tr>
                        <td className="p-3 font-extrabold text-slate-900">10+ Years Experience</td>
                        <td className="p-3 font-black text-purple-700">
                          ₹{item.salaryLPA.senior10plus.min}–₹{item.salaryLPA.senior10plus.max} LPA
                        </td>
                        <td className="p-3 text-slate-500">Principal architect / executive lead</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {item.salaryNote && (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {item.salaryNote}
                </p>
              )}
            </section>
          )}

          {/* Section: Entrance & Qualifying Exams */}
          {detail.resolvedEntranceExams && detail.resolvedEntranceExams.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Entrance & Qualifying Exams</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {detail.resolvedEntranceExams.map((exam: any) => (
                  <div key={exam.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {exam.type}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">{exam.frequency}</span>
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-900 mt-1">{exam.name}</h3>
                      <p className="text-xs text-slate-500">{exam.conductingBody}</p>
                    </div>

                    <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-600 line-clamp-1">{exam.purpose}</span>
                      {exam.officialSite && (
                        <a
                          href={exam.officialSite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-blue-600 hover:underline shrink-0"
                        >
                          Official Portal ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Top Recruiters & PSUs via GATE (for Engineering Branches) */}
          {kind === 'branch' && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-5">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BuildingLibraryIcon className="w-5 h-5 text-slate-700 shrink-0" />
                <span>Top Hiring Organizations & PSUs</span>
              </h2>

              {/* Private Recruiters */}
              {item.topRecruiters?.private && item.topRecruiters.private.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-700">Top Corporate / MNC Recruiters:</span>
                  <div className="flex flex-wrap gap-2">
                    {item.topRecruiters.private.map((rec: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-xl text-xs font-medium border border-slate-200">
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* PSUs via GATE */}
              {item.psusViaGate && item.psusViaGate.length > 0 && (
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Public Sector Undertakings (PSUs via GATE):</span>
                    {item.gatePaper && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Paper: {item.gatePaper}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.psusViaGate.map((psu: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold border border-emerald-200">
                        {psu}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Section: Linked Items (Branches or Govt Jobs for Pathways) */}
          {detail.linkedItems && detail.linkedItems.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>Linked Career Specializations ({detail.linkedItems.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {detail.linkedItems.map((li: any) => (
                  <Link
                    key={li.id}
                    href={`/careers/${li.code ? 'branch' : 'govtJob'}/${li.id}`}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/60 transition-all flex flex-col justify-between gap-1 group"
                  >
                    <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">
                      {li.name || li.exam}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {li.code ? `Branch Code: ${li.code}` : `Body: ${li.conductingBody}`}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Section: Colleges Offering This Branch */}
          {kind === 'branch' && branchColleges.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <BuildingLibraryIcon className="w-5 h-5 text-blue-600" />
                    <span>Top Colleges Offering {item.name}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ranked by verified NIRF 2025 ranking and state counseling cutoffs
                  </p>
                </div>
                <Link
                  href={`/colleges?branch=${item.code}`}
                  className="text-xs font-bold text-blue-600 hover:underline shrink-0"
                >
                  View All Colleges →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {branchColleges.map((college) => (
                  <CollegeCard key={college.id} college={college} />
                ))}
              </div>
            </section>
          )}

          {/* Section: Sources & Citations */}
          {sources && sources.length > 0 && (
            <footer className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200 text-xs text-slate-500 flex flex-col gap-2">
              <div className="font-bold text-slate-700">Official Datasets & Information Sources:</div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {sources.map((src: any) => (
                  <li key={src.id}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {src.title} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </footer>
          )}
        </div>

        {/* Right Column: Quick Facts & Actions Card */}
        <aside className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5">
            <h3 className="font-black text-base text-slate-900 border-b border-slate-100 pb-3">
              Fast Facts Overview
            </h3>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Outlook</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${outlookConfig.bg}`}>
                  {outlookConfig.label}
                </span>
              </div>

              {item.duration && (
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-semibold">Duration</span>
                  <span className="font-bold text-slate-900">{item.duration}</span>
                </div>
              )}

              {item.abroadFriendly !== undefined && (
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-semibold">Global Recognition</span>
                  <span className="font-bold text-emerald-700">
                    {item.abroadFriendly ? 'High (Abroad Friendly)' : 'India / Regional'}
                  </span>
                </div>
              )}

              {kind === 'branch' && item.code && (
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-semibold">Branch Code</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{item.code}</span>
                </div>
              )}

              {item.officialSite && (
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-semibold">Official Portal</span>
                  <a
                    href={item.officialSite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Open Link ↗
                  </a>
                </div>
              )}
            </div>

            {/* Call to action */}
            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                href={counsellorUrl}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl text-center shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>Ask AI Counsellor About This Path</span>
              </Link>
              <AiCounselorDrawer
                initialLevel={itemLevel}
                initialStream={itemStream}
                initialInterests={item.riasec}
                initialSubjects={itemSubjects ? itemSubjects.split(',') : (item.keySubjects || item.subjectsLiked)}
                initialQuestion={`I want to explore ${itemTitle}. What are my next best options and preparation steps?`}
              />
              {(() => {
                const isPuStream =
                  item.category?.includes('PU stream') ||
                  item.category?.includes('Class 11-12') ||
                  item.level === 'CLASS_10' ||
                  id.startsWith('a-pcm') ||
                  id.startsWith('a-pcb') ||
                  id.startsWith('a-comm') ||
                  id.startsWith('a-arts');

                const isMedical =
                  item.clusterIds?.includes('medicine-healthcare') ||
                  id.includes('mbbs') ||
                  id.includes('bds') ||
                  id.includes('nursing') ||
                  id.includes('pharmacy') ||
                  (item.name || '').toLowerCase().includes('medical');

                if (isPuStream) {
                  const pucStreamParam =
                    (item.name || '').toLowerCase().includes('commerce') || id.startsWith('a-comm')
                      ? 'Commerce'
                      : (item.name || '').toLowerCase().includes('arts') || id.startsWith('a-arts')
                      ? 'Arts'
                      : 'Science';

                  return (
                    <>
                      <Link
                        href={`/puc-colleges?stream=${pucStreamParam}`}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl text-center shadow-md transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>🏛️</span>
                        <span>Explore 6,400+ PU Colleges ({pucStreamParam})</span>
                      </Link>
                      <Link
                        href="/pathways"
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl text-center transition-colors"
                      >
                        View Karnataka Polytechnic Pathways
                      </Link>
                    </>
                  );
                }

                if (isMedical) {
                  return (
                    <>
                      <Link
                        href="/medical-allied-health"
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl text-center shadow-md transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>🩺</span>
                        <span>Explore 788 Medical & Allied Seats</span>
                      </Link>
                      <Link
                        href="/kcet-2026-predictor"
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl text-center transition-colors"
                      >
                        Check KCET Cutoff Predictor
                      </Link>
                    </>
                  );
                }

                return (
                  <>
                    <Link
                      href="/colleges"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl text-center shadow-md transition-colors"
                    >
                      Find Matching Engineering Colleges
                    </Link>
                    <Link
                      href="/kcet-2026-predictor"
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl text-center transition-colors"
                    >
                      Check Cutoff Predictor
                    </Link>
                  </>
                );
              })()}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
