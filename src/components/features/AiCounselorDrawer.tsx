'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SparklesIcon, LightningIcon, AlertCircleIcon } from '@/components/ui/Icons';

interface AiCounselorDrawerProps {
  initialLevel?: string;
  initialStream?: string;
  initialInterests?: string[];
  initialSubjects?: string[];
  isOpen?: boolean;
  onClose?: () => void;
  initialQuestion?: string;
  hideTrigger?: boolean;
}

const LEVEL_OPTIONS = [
  { id: '10th', label: '10th Pass' },
  { id: '12th', label: '12th / PUC' },
  { id: 'diploma', label: 'Polytechnic / Diploma' },
  { id: 'iti', label: 'ITI' },
  { id: 'btech', label: 'B.Tech / Engg' },
  { id: 'degree', label: 'Degree / Graduate' },
];

function normalizeDrawerLevel(lvl?: string | null): string | null {
  if (!lvl) return null;
  const l = lvl.toLowerCase().trim();
  if (['10th', '10', 'class_10', 'class-10', 'sslc', 'matric'].includes(l)) return '10th';
  if (['12th', '12', 'class_12', 'class-12', 'puc', 'inter'].includes(l)) return '12th';
  if (['iti'].includes(l)) return 'iti';
  if (['diploma', 'polytechnic'].includes(l)) return 'diploma';
  if (['btech', 'be', 'engineering', 'ug_engg'].includes(l)) return 'btech';
  if (['degree', 'graduate', 'ug_other'].includes(l)) return 'degree';
  return l;
}

export const AiCounselorDrawer: React.FC<AiCounselorDrawerProps> = ({
  initialLevel,
  initialStream,
  initialInterests = [],
  initialSubjects = [],
  isOpen: controlledIsOpen,
  onClose,
  initialQuestion = '',
  hideTrigger = false,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof controlledIsOpen === 'boolean';
  const open = isControlled ? controlledIsOpen : internalIsOpen;

  const setOpen = (val: boolean) => {
    if (isControlled) {
      if (!val && onClose) onClose();
    } else {
      setInternalIsOpen(val);
    }
  };

  const [question, setQuestion] = useState(initialQuestion);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(normalizeDrawerLevel(initialLevel));

  React.useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
    }
  }, [initialQuestion]);

  React.useEffect(() => {
    if (initialLevel) {
      setSelectedLevel(normalizeDrawerLevel(initialLevel));
    }
  }, [initialLevel]);

  const detectedLevel = React.useMemo(() => {
    if (!question) return null;
    const lower = question.toLowerCase();
    if (/\b(10th|class\s*10|tenth|10\s*th|sslc|matric|matriculation)\b/.test(lower)) return '10th';
    if (/\b(12th|class\s*12|twelfth|12\s*th|puc|2nd\s*puc|\+2|plus\s*two|intermediate)\b/.test(lower)) return '12th';
    if (/\b(iti)\b/.test(lower)) return 'iti';
    if (/\b(polytechnic|diploma)\b/.test(lower)) return 'diploma';
    if (/\b(b\.?tech|b\.?e\b|engineering)\b/.test(lower)) return 'btech';
    if (/\b(degree|graduation|graduate|b\.?sc|b\.?com|b\.?a\b)\b/.test(lower)) return 'degree';
    if (/\b(pg|post\s*grad|mba|mca|mtech|msc)\b/.test(lower)) return 'pg';
    return null;
  }, [question]);

  const effectiveLevel = selectedLevel || detectedLevel || initialLevel || null;

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const [roadmapItem, setRoadmapItem] = useState<any | null>(null);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setRoadmapItem(null);

    try {
      const res = await fetch('/api/careers/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: effectiveLevel || undefined,
          stream: initialStream || undefined,
          interests: initialInterests.length ? initialInterests : undefined,
          subjects: initialSubjects.length ? initialSubjects : undefined,
          question: question.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to get counselling recommendations');
      }

      setResponse(json.data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuildRoadmap = async (kind: string, id: string) => {
    setIsLoadingRoadmap(true);
    try {
      const res = await fetch('/api/careers/ai/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, id }),
      });
      const json = await res.json();
      if (res.ok) {
        setRoadmapItem(json.data);
      }
    } catch (err) {
      console.error('Error fetching roadmap:', err);
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  return (
    <>
      {/* Floating or Inline Trigger Button */}
      {!hideTrigger && (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-102 cursor-pointer"
        >
          <SparklesIcon className="w-4 h-4 text-amber-300" />
          <span>Ask EduSelect AI</span>
        </button>
      )}

      {/* Drawer Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full sm:max-w-xl h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-lg border border-blue-400/30">
                  <SparklesIcon className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">EduSelect AI Counsellor</h3>
                  <span className="text-[11px] text-blue-300">Curated guidance powered by verified data</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-colors"
                aria-label="Close Drawer"
              >
                ✕
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-6">
              {/* Context Chips & Interactive Level Selector */}
              <div className="flex flex-col gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Your Current Context:</span>
                  {effectiveLevel && !initialLevel && (
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {detectedLevel && !selectedLevel ? 'Auto-detected from question' : 'Selected'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {effectiveLevel && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center gap-1.5">
                      <span>Level: {LEVEL_OPTIONS.find((o) => o.id === effectiveLevel)?.label || effectiveLevel}</span>
                      {selectedLevel && (
                        <button
                          type="button"
                          onClick={() => setSelectedLevel(null)}
                          className="hover:text-blue-950 font-black cursor-pointer leading-none text-xs ml-0.5"
                          title="Clear level filter"
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  )}
                  {initialStream && (
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-[11px]">
                      Stream: {initialStream}
                    </span>
                  )}
                  {initialInterests.map((r) => (
                    <span key={r} className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 font-bold text-[10px]">
                      RIASEC: {r}
                    </span>
                  ))}
                  {!effectiveLevel && !initialStream && initialInterests.length === 0 && (
                    <span className="text-slate-400 italic">No level selected — choose below or type in question</span>
                  )}
                </div>

                {/* Level Quick Chips if no initialLevel */}
                {!initialLevel && (
                  <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Choose your current qualification:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {LEVEL_OPTIONS.map((opt) => {
                        const isSelected = effectiveLevel === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSelectedLevel(selectedLevel === opt.id ? null : opt.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Question Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Ask a Specific Question (Optional):</span>
                  <span className="text-[10px] text-slate-400">{question.length}/500</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="e.g. Should I choose a PSU via GATE or private corporate hiring? What are my job prospects with PCB if I don't clear NEET?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analysing Career Options...</span>
                    </>
                  ) : (
                    <>
                      <span>Get My Career Recommendations</span>
                      <span>→</span>
                    </>
                  )}
                </Button>
              </form>

              {/* Error Notice */}
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {error}
                </div>
              )}

              {/* Loading Skeleton */}
              {isLoading && (
                <div className="flex flex-col gap-4 animate-pulse pt-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-28 bg-slate-100 rounded-2xl" />
                  <div className="h-28 bg-slate-100 rounded-2xl" />
                </div>
              )}

              {/* Response Section */}
              {response && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200 pt-2">
                  {/* Fallback Banner if applicable */}
                  {response.fallback && (
                    <div className="p-3.5 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-200 font-medium flex items-center gap-2">
                      <LightningIcon className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>AI is busy — showing hand-curated smart matches from verified data instead.</span>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 text-xs text-slate-800 font-medium leading-relaxed">
                    {response.summary}
                  </div>

                  {/* Recommendations Cards */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Recommended Next Steps ({response.recommendations?.length || 0})
                    </span>

                    {response.recommendations?.map((rec: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white shadow-xs flex flex-col gap-3 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {rec.kind}
                            </span>
                            <h4 className="font-black text-sm text-slate-900 mt-1">{rec.title}</h4>
                          </div>
                          {rec.timeline && (
                            <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                              {rec.timeline}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {rec.whyItFits}
                        </p>

                        {/* First Steps */}
                        {rec.firstSteps && rec.firstSteps.length > 0 && (
                          <div className="flex flex-col gap-1 text-[11px] text-slate-700">
                            <span className="font-bold text-slate-800">Action Steps:</span>
                            <ul className="flex flex-col gap-1 pl-1">
                              {rec.firstSteps.map((step: string, i: number) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-blue-500 font-bold">•</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <Link
                            href={`/careers/${rec.kind}/${rec.itemId}`}
                            onClick={() => setOpen(false)}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            View Full Pathway Details →
                          </Link>

                          <button
                            onClick={() => handleBuildRoadmap(rec.kind, rec.itemId)}
                            className="text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-lg border border-purple-200 transition-colors"
                          >
                            Build Roadmap ↗
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expanded Roadmap Preview */}
                  {isLoadingRoadmap && (
                    <div className="p-4 text-center text-xs text-purple-700 bg-purple-50 rounded-2xl border border-purple-200 animate-pulse">
                      Generating structured 4-phase timeline...
                    </div>
                  )}

                  {roadmapItem && (
                    <div className="p-5 rounded-3xl bg-purple-50/70 border border-purple-200 flex flex-col gap-4 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-xs uppercase tracking-wider text-purple-900">
                          4-Phase Roadmap for {roadmapItem.careerTitle}
                        </h4>
                        <button
                          onClick={() => setRoadmapItem(null)}
                          className="text-[11px] font-bold text-purple-600 hover:text-purple-800"
                        >
                          ✕ Close
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        {roadmapItem.phases?.map((phase: any, pIdx: number) => (
                          <div key={pIdx} className="bg-white p-3.5 rounded-xl border border-purple-100 flex flex-col gap-1.5 text-xs">
                            <span className="font-extrabold text-purple-800">{phase.yearOrPhase}</span>
                            <p className="text-slate-600">{phase.focus}</p>
                            <ul className="text-[11px] text-slate-500 pl-2">
                              {phase.keyMilestones?.map((m: string, mIdx: number) => (
                                <li key={mIdx}>• {m}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Questions to Ask Human Counsellor */}
                  {response.questionsToAskCounsellor && response.questionsToAskCounsellor.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
                      <span className="font-bold text-xs text-slate-800">Questions to Discuss with Mentors or Parents:</span>
                      <ul className="text-xs text-slate-600 flex flex-col gap-1.5 pl-1">
                        {response.questionsToAskCounsellor.map((q: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-indigo-600 font-bold">?</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Caution advice */}
                  {response.caution && (
                    <div className="text-[11px] text-amber-800 bg-amber-50/80 p-3 rounded-xl border border-amber-200 font-medium flex items-start gap-2">
                      <AlertCircleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{response.caution}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer Disclaimer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center shrink-0">
              <p className="text-[10px] text-slate-500 leading-tight">
                AI suggestions use EduSelect's curated data. Always confirm dates and cutoffs with the official notification.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
