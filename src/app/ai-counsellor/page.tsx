'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  SparklesIcon,
  GraduationCapIcon,
  BookOpenIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  PrinterIcon,
  ArrowRightIcon,
  CheckIcon,
  ScaleIcon,
} from '@/components/ui/Icons';

interface Recommendation {
  itemId: string;
  kind: string;
  title: string;
  whyItFits: string;
  firstSteps: string[];
  examsToPrepare: string[];
  timeline: string;
}

interface AiResponseData {
  fallback: boolean;
  model: string;
  generatedAt: string;
  summary: string;
  recommendations: Recommendation[];
  questionsToAskCounsellor: string[];
  caution: string;
}

interface RoadmapPhase {
  yearOrPhase: string;
  focus: string;
  keyMilestones: string[];
  skillsOrCertifications: string[];
  tips: string;
}

interface RoadmapData {
  careerTitle: string;
  phases: RoadmapPhase[];
  ultimateGoal: string;
}

const PRESET_SCENARIOS = [
  {
    title: 'After 10th Dilemma',
    desc: 'Scored 75–85% in 10th: Should I pick Science (PCM/PCB), a 3-Year Polytechnic Diploma, or an ITI Trade?',
    level: 'CLASS_10',
    marks: '80%',
    question: 'I just finished 10th with 80%. I enjoy practical hands-on work and machines. Should I take 11th Science, a Polytechnic Diploma, or an ITI trade for early employment?',
  },
  {
    title: '12th PCM: CSE vs ECE vs AI',
    desc: 'Confused between Computer Science, Electronics & Communication, and AI & Data Science branches.',
    level: 'CLASS_12',
    stream: 'PCM',
    marks: '86%',
    question: 'I have 86% in 12th PCM. I like programming and mathematics. Which engineering branch offers the highest career versatility between CSE, ECE, and AI/DS?',
  },
  {
    title: 'Post-B.Tech: Core vs IT vs PSUs',
    desc: 'Engineering graduate exploring PSU recruitment through GATE versus Private Tech placements.',
    level: 'UG_ENGG',
    branchCode: 'ME',
    question: 'I am studying Mechanical Engineering. What are my chances in central PSUs (IOCL, BHEL, ISRO) through GATE versus transitioning to software/analytics?',
  },
  {
    title: 'Government Job Pathways',
    desc: 'Seeking secure public sector roles with 7th Pay Commission salary bands.',
    level: 'CLASS_12',
    question: 'What are the best central and state government jobs I can prepare for with attractive starting pay and clear promotion ladders?',
  },
];

function AiCounsellorDashboard() {
  const searchParams = useSearchParams();

  const urlLevel = searchParams.get('level') || searchParams.get('fromLevel');
  const urlStream = searchParams.get('stream') || searchParams.get('fromStream');
  const urlSubjects = searchParams.get('subjects') || searchParams.get('fromSubjects');
  const urlCareer = searchParams.get('career');
  const urlQuery = searchParams.get('query') || searchParams.get('q');
  const urlMarks10 = searchParams.get('marks10th') || searchParams.get('marks10');
  const urlMarks12 = searchParams.get('marks12th') || searchParams.get('marks12');
  const urlScore = searchParams.get('score') || searchParams.get('rank');

  const normalizedLevel = useMemo(() => {
    if (!urlLevel) return 'CLASS_10';
    const l = urlLevel.toLowerCase().trim();
    if (['10th', '10', 'class_10', 'class-10', 'sslc', 'matric'].includes(l)) return 'CLASS_10';
    if (['12th', '12', 'class_12', 'class-12', 'puc', 'inter', 'intermediate'].includes(l)) return 'CLASS_12';
    if (['iti'].includes(l)) return 'ITI';
    if (['diploma', 'polytechnic'].includes(l)) return 'DIPLOMA';
    if (['btech', 'be', 'engineering', 'ug_engg'].includes(l)) return 'UG_ENGG';
    if (['degree', 'graduate', 'ug_other', 'bsc', 'bcom', 'ba'].includes(l)) return 'UG_OTHER';
    if (['CLASS_10', 'CLASS_12', 'ITI', 'DIPLOMA', 'UG_ENGG', 'UG_OTHER', 'PROFESSIONAL', 'PG'].includes(urlLevel)) return urlLevel;
    return 'CLASS_10';
  }, [urlLevel]);

  const normalizedStream = useMemo(() => {
    const raw = (urlStream || '').toLowerCase().trim();
    if (raw === 'pcb' || urlCareer?.toLowerCase().includes('pcb')) return 'PCB';
    if (raw === 'pcm' || urlCareer?.toLowerCase().includes('pcm')) return 'PCM';
    if (raw === 'pcmb' || urlCareer?.toLowerCase().includes('pcmb')) return 'PCMB';
    if (raw.includes('commerce') && raw.includes('math')) return 'COMMERCE_MATHS';
    if (raw.includes('commerce')) return 'COMMERCE_NO_MATHS';
    if (raw.includes('art') || raw.includes('humanities')) return 'ARTS';
    if (urlStream) return urlStream.toUpperCase();
    return normalizedLevel === 'CLASS_12' ? 'PCM' : '';
  }, [urlStream, urlCareer, normalizedLevel]);

  // Input State: initialized with actual URL/user parameters or clean empty defaults (no fake mock numbers)
  const [level, setLevel] = useState<string>(normalizedLevel);
  const [stream, setStream] = useState<string>(normalizedStream);
  const [marks10th, setMarks10th] = useState<string>(urlMarks10 || '');
  const [marks12th, setMarks12th] = useState<string>(urlMarks12 || '');
  const [examScore, setExamScore] = useState<string>(urlScore || '');
  const [category, setCategory] = useState<string>('General');
  const [budget, setBudget] = useState<string>('moderate');

  const initialSubjects = useMemo(() => {
    if (!urlSubjects) return [];
    return urlSubjects.split(',').map((s) => s.trim()).filter(Boolean);
  }, [urlSubjects]);

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialSubjects);

  const availableSubjectOptions = useMemo(() => {
    const defaults = [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Computer Science',
      'English',
      'Economics',
      'Accountancy',
      'Design / Drawing',
      'Law / Civic Studies',
    ];
    const extras = selectedSubjects.filter(
      (s) => !defaults.some((d) => d.toLowerCase() === s.toLowerCase())
    );
    return [...defaults, ...extras];
  }, [selectedSubjects]);

  const initialQuestion = useMemo(() => {
    if (urlQuery) return urlQuery;
    if (urlCareer) return `I want to explore ${urlCareer}. What are my next best academic options, entrance exams, and future career pathways?`;
    return '';
  }, [urlQuery, urlCareer]);

  const [userQuestion, setUserQuestion] = useState<string>(initialQuestion);

  // Sync state if URL search parameters update
  useEffect(() => {
    setLevel(normalizedLevel);
    if (normalizedStream) setStream(normalizedStream);
    if (urlSubjects) setSelectedSubjects(urlSubjects.split(',').map((s) => s.trim()).filter(Boolean));
    if (urlQuery) setUserQuestion(urlQuery);
    else if (urlCareer) setUserQuestion(`I want to explore ${urlCareer}. What are my next best academic options, entrance exams, and future career pathways?`);
    if (urlMarks10) setMarks10th(urlMarks10);
    if (urlMarks12) setMarks12th(urlMarks12);
    if (urlScore) setExamScore(urlScore);
  }, [normalizedLevel, normalizedStream, urlSubjects, urlQuery, urlCareer, urlMarks10, urlMarks12, urlScore]);

  // Execution State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiResponseData | null>(null);

  // Roadmap State per item
  const [roadmapsByItem, setRoadmapsByItem] = useState<Record<string, RoadmapData>>({});
  const [expandedRoadmapIds, setExpandedRoadmapIds] = useState<Record<string, boolean>>({});
  const [loadingRoadmapId, setLoadingRoadmapId] = useState<string | null>(null);
  const [roadmapError, setRoadmapError] = useState<Record<string, string>>({});

  const handleSubjectToggle = (subj: string) => {
    setSelectedSubjects((prev) => {
      const exists = prev.some((p) => p.toLowerCase() === subj.toLowerCase());
      if (exists) {
        return prev.filter((p) => p.toLowerCase() !== subj.toLowerCase());
      }
      return [...prev, subj];
    });
  };

  const handleApplyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setLevel(preset.level);
    if (preset.stream) {
      setStream(preset.stream);
    } else {
      setStream('');
    }
    if (preset.marks) {
      if (preset.level === 'CLASS_10') {
        setMarks10th(preset.marks.replace('%', ''));
        setMarks12th('');
      } else {
        setMarks12th(preset.marks.replace('%', ''));
      }
    }
    setUserQuestion(preset.question);
  };

  const handleExecutePlan = async (overrides?: {
    execLevel?: string;
    execStream?: string;
    execMarks10?: string;
    execMarks12?: string;
    execScore?: string;
    execCategory?: string;
    execBudget?: string;
    execSubjects?: string[];
    execQuestion?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setRoadmapsByItem({});
    setExpandedRoadmapIds({});
    setRoadmapError({});

    const activeLevel = overrides?.execLevel ?? level;
    const activeStream = overrides?.execStream ?? stream;
    const activeMarks10 = overrides?.execMarks10 ?? marks10th;
    const activeMarks12 = overrides?.execMarks12 ?? marks12th;
    const activeScore = overrides?.execScore ?? examScore;
    const activeCategory = overrides?.execCategory ?? category;
    const activeBudget = overrides?.execBudget ?? budget;
    const activeSubjects = overrides?.execSubjects ?? selectedSubjects;
    const activeQuestion = overrides?.execQuestion ?? userQuestion;

    try {
      const profileParts: string[] = [
        `Student Profile:`,
        `Current Qualification Level: ${activeLevel}`,
      ];
      if (activeLevel === 'CLASS_12' && activeStream) {
        profileParts.push(`12th / PU Stream: ${activeStream}`);
      }
      if (activeMarks10.trim()) {
        profileParts.push(`10th Board Marks: ${activeMarks10.trim()}%`);
      }
      if (activeLevel !== 'CLASS_10' && activeMarks12.trim()) {
        profileParts.push(`12th / Diploma Marks: ${activeMarks12.trim()}%`);
      }
      if (activeScore.trim()) {
        profileParts.push(`Competitive Exam Score/Rank: ${activeScore.trim()}`);
      }
      if (activeCategory) {
        profileParts.push(`Category: ${activeCategory}`);
      }
      if (activeBudget) {
        profileParts.push(`Budget Preference: ${activeBudget}`);
      }
      if (activeSubjects.length > 0) {
        profileParts.push(`Subjects of Interest: ${activeSubjects.join(', ')}`);
      }

      const dilemma = activeQuestion.trim() || `What are the best career and education pathways for my profile?`;
      profileParts.push(`\nStudent Dilemma & Goal:\n"${dilemma}"`);

      const fullPrompt = profileParts.join('\n');

      const res = await fetch('/api/careers/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: activeLevel,
          stream: activeLevel === 'CLASS_12' ? activeStream : undefined,
          subjects: activeSubjects.length ? activeSubjects : undefined,
          budget: activeBudget,
          question: fullPrompt,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to generate career counselling recommendations');
      }

      setResult(json.data);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to AI Counsellor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await handleExecutePlan();
  };

  const handleRunSampleProfile = () => {
    const sampleLevel = 'CLASS_12';
    const sampleStream = 'PCM';
    const sample10 = '84';
    const sample12 = '86';
    const sampleScore = 'KCET 15200';
    const sampleCat = 'General';
    const sampleSubj = ['Mathematics', 'Computer Science', 'Physics'];
    const sampleQ = 'I scored 86% in 12th PCM and like mathematics and coding. Suggest my best engineering and career pathways with good placement and higher study options.';

    setLevel(sampleLevel);
    setStream(sampleStream);
    setMarks10th(sample10);
    setMarks12th(sample12);
    setExamScore(sampleScore);
    setCategory(sampleCat);
    setSelectedSubjects(sampleSubj);
    setUserQuestion(sampleQ);

    handleExecutePlan({
      execLevel: sampleLevel,
      execStream: sampleStream,
      execMarks10: sample10,
      execMarks12: sample12,
      execScore: sampleScore,
      execCategory: sampleCat,
      execBudget: budget,
      execSubjects: sampleSubj,
      execQuestion: sampleQ,
    });
  };

  const handleToggleRoadmap = async (item: Recommendation) => {
    const id = item.itemId;

    // If currently open, toggle collapse
    if (expandedRoadmapIds[id]) {
      setExpandedRoadmapIds((prev) => ({ ...prev, [id]: false }));
      return;
    }

    // If already generated, toggle open immediately
    if (roadmapsByItem[id]) {
      setExpandedRoadmapIds((prev) => ({ ...prev, [id]: true }));
      return;
    }

    // Otherwise fetch from server
    setLoadingRoadmapId(id);
    setRoadmapError((prev) => ({ ...prev, [id]: '' }));

    try {
      const res = await fetch('/api/careers/ai/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: item.kind,
          id: item.itemId,
          itemId: item.itemId,
          title: item.title,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setRoadmapsByItem((prev) => ({ ...prev, [id]: json.data }));
        setExpandedRoadmapIds((prev) => ({ ...prev, [id]: true }));
      } else {
        throw new Error(json.error || 'Failed to generate roadmap');
      }
    } catch (err: any) {
      console.error('Failed to generate roadmap:', err);
      setRoadmapError((prev) => ({
        ...prev,
        [id]: err.message || 'Unable to generate roadmap right now. Please try again.',
      }));
    } finally {
      setLoadingRoadmapId(null);
    }
  };

  function getRecommendationCollegeAction(item: Recommendation): { href: string; label: string } {
    const kind = (item.kind || '').toLowerCase();
    const id = (item.itemId || '').toLowerCase();
    const title = item.title || '';
    const lowerTitle = title.toLowerCase();

    // Government Jobs / Civil Services
    if (
      kind === 'govtjob' ||
      id.startsWith('govt-') ||
      lowerTitle.includes('upsc') ||
      lowerTitle.includes('isro') ||
      lowerTitle.includes('railway') ||
      lowerTitle.includes('civil services') ||
      lowerTitle.includes('ssc cgl')
    ) {
      return {
        href: `/careers?q=${encodeURIComponent(title)}`,
        label: 'View Exam & Eligibility Details →',
      };
    }

    // General B.E. / B.Tech / Engineering Degree
    if (
      lowerTitle === 'b.e. / b.tech (engineering)' ||
      lowerTitle === 'bachelor of engineering' ||
      lowerTitle === 'bachelor of technology' ||
      id === 'b-btech' ||
      id === 'deg-btech'
    ) {
      return {
        href: '/colleges',
        label: 'Explore 455 Engineering Colleges →',
      };
    }

    // Branch matching
    if (lowerTitle.includes('computer') || lowerTitle.includes('cse') || id.includes('cse')) {
      return {
        href: '/colleges?branch=CSE',
        label: 'View Colleges Offering CSE →',
      };
    }
    if (lowerTitle.includes('information tech') || lowerTitle.includes('it') || id.includes('it')) {
      return {
        href: '/colleges?branch=IT',
        label: 'View Colleges Offering IT →',
      };
    }
    if (lowerTitle.includes('electronics') || lowerTitle.includes('ece') || id.includes('ece')) {
      return {
        href: '/colleges?branch=ECE',
        label: 'View Colleges Offering ECE →',
      };
    }
    if (lowerTitle.includes('mechanical') || lowerTitle.includes('mech') || id.includes('mech')) {
      return {
        href: '/colleges?branch=MECH',
        label: 'View Colleges Offering Mechanical →',
      };
    }
    if (lowerTitle.includes('civil') || id.includes('civil')) {
      return {
        href: '/colleges?branch=CIVIL',
        label: 'View Colleges Offering Civil →',
      };
    }
    if (lowerTitle.includes('electrical') || lowerTitle.includes('eee') || id.includes('eee')) {
      return {
        href: '/colleges?branch=EEE',
        label: 'View Colleges Offering Electrical →',
      };
    }
    if (
      lowerTitle.includes('artificial intelligence') ||
      lowerTitle.includes('data science') ||
      lowerTitle.includes('ai & ds') ||
      lowerTitle.includes('ai/ds') ||
      id.includes('ai')
    ) {
      return {
        href: '/colleges?branch=AI',
        label: 'View Colleges Offering AI & DS →',
      };
    }

    // Clean title for search
    const cleanTitle = title
      .replace(/^b\.tech\s*(in)?/i, '')
      .replace(/^b\.e\.\s*(in)?/i, '')
      .replace(/\(.*?\)/g, '')
      .trim();

    return {
      href: `/colleges?search=${encodeURIComponent(cleanTitle || title)}`,
      label: 'View Colleges Offering This →',
    };
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/70 pb-24 text-slate-800">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide w-fit">
              <SparklesIcon className="w-3.5 h-3.5 text-blue-300" />
              <span>EduSelect AI Guidance Engine</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              AI Career & College <span className="text-blue-400">Counsellor Dashboard</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Personalized academic diagnostics, score-based branch matching, and year-by-year career roadmaps.
              Enter your marks, questions, or goals to receive verified guidance aligned with 455 Indian colleges and NIRF 2025 rankings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/20"
            >
              <BookOpenIcon className="w-4 h-4" />
              <span>Browse All Careers</span>
            </Link>
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md"
            >
              <GraduationCapIcon className="w-4 h-4" />
              <span>Explore 455 Colleges</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Student Profile & Input Form (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Quick Presets */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Student Dilemmas</span>
              <span className="text-[11px] text-blue-600 font-medium">Click to load</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_SCENARIOS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="p-3 text-left rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/70 hover:border-blue-300 transition-all group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">{p.title}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleGeneratePlan} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                <span>Your Academic Profile & Situation</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill in what you know; leave optional fields blank if not decided.
              </p>
            </div>

            {/* Target Career Banner if navigated from a pathway */}
            {urlCareer && (
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-900 font-bold">
                  <SparklesIcon className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Target Pathway: {urlCareer}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserQuestion('');
                    window.history.replaceState({}, '', '/ai-counsellor');
                  }}
                  className="text-[11px] text-blue-600 hover:text-blue-900 font-semibold"
                >
                  Clear
                </button>
              </div>
            )}

            {/* 1. Current Qualification Level */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Where are you right now?</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CLASS_10">Class 10th (Matric / SSLC)</option>
                <option value="CLASS_12">Class 12th / 2nd PU (Higher Secondary)</option>
                <option value="ITI">ITI Trade Student / Passout</option>
                <option value="DIPLOMA">Polytechnic Diploma Student / Passout</option>
                <option value="UG_ENGG">B.E. / B.Tech Engineering Student / Graduate</option>
                <option value="UG_OTHER">Other Graduate (B.Sc, B.Com, BA, BCA, BBA)</option>
              </select>
            </div>

            {/* 2. Stream (only applicable for Class 12) */}
            {level === 'CLASS_12' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">12th / PU Stream</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'PCM', label: 'Science — PCM' },
                    { id: 'PCB', label: 'Science — PCB' },
                    { id: 'PCMB', label: 'Science — PCMB' },
                    { id: 'COMMERCE_MATHS', label: 'Commerce + Maths' },
                    { id: 'COMMERCE_NO_MATHS', label: 'Commerce' },
                    { id: 'ARTS', label: 'Arts / Humanities' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStream(s.id)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all text-center ${
                        stream === s.id
                          ? 'border-blue-600 bg-blue-50 text-blue-800'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Academic Marks (adapted to qualification stage) */}
            {level === 'CLASS_10' ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">10th Board Marks (%) (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave blank if awaiting results or not decided"
                  value={marks10th}
                  onChange={(e) => setMarks10th(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">10th Board Marks (%) (Optional)</label>
                  <input
                    type="text"
                    placeholder="Leave blank if not applicable"
                    value={marks10th}
                    onChange={(e) => setMarks10th(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {level === 'DIPLOMA' || level === 'ITI'
                      ? 'Diploma / ITI (%) (Optional)'
                      : level === 'UG_ENGG' || level === 'UG_OTHER'
                      ? 'Degree Aggregate / CGPA (Optional)'
                      : '12th / Diploma (%) (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="Leave blank if not decided"
                    value={marks12th}
                    onChange={(e) => setMarks12th(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* 4. Entrance Score & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {level === 'CLASS_10' ? 'Target Board / Exam (Optional)' : 'Exam Rank / Percentile (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={level === 'CLASS_10' ? 'e.g. CBSE / State Board (Optional)' : 'e.g. KCET / JEE Rank (Optional)'}
                  value={examScore}
                  onChange={(e) => setExamScore(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Category / Reservation</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="General">General / GM</option>
                  <option value="OBC">OBC (Non-Creamy Layer)</option>
                  <option value="EWS">Economically Weaker Section (EWS)</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                </select>
              </div>
            </div>

            {/* 5. Subjects Liked */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Subjects & Topics You Enjoy</label>
              <div className="flex flex-wrap gap-1.5">
                {availableSubjectOptions.map((s) => {
                  const isChecked = selectedSubjects.some((p) => p.toLowerCase() === s.toLowerCase());
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSubjectToggle(s)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors border ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Describe Your Situation / Dilemma */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Describe your situation, doubt, or goal in your own words:
              </label>
              <textarea
                rows={4}
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder={
                  level === 'CLASS_10'
                    ? 'e.g. What are my best options after 10th? Should I take Science PCM/PCB, a 3-Year Polytechnic Diploma, or an ITI trade?'
                    : 'e.g. Compare engineering branches vs degree programs with good placement and government job options.'
                }
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Profile with EduSelect AI...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  <span>Generate Career & College Recommendations</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: AI Analysis & Actionable Results (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              <strong>Notice:</strong> {error}
            </div>
          )}

          {!result && !isLoading && (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <SparklesIcon className="w-8 h-8" />
              </div>
              <div className="max-w-md flex flex-col gap-2">
                <h3 className="text-xl font-black text-slate-900">Your Personalized Guidance Workspace</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your qualifications, marks, and dilemma on the left, or pick one of the quick scenarios above.
                  Our AI Counsellor cross-references 455 verified colleges, 29 engineering branches, and 80 entrance exams to deliver your customized action plan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRunSampleProfile()}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Run Demonstration with Sample Profile</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isLoading && (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm flex flex-col items-center text-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <div className="flex flex-col gap-1 max-w-sm">
                <h3 className="font-extrabold text-base text-slate-900">Evaluating Higher Education Matrix...</h3>
                <p className="text-xs text-slate-500">
                  Matching your marks and preferences against cutoff archives, engineering branches, and PSU recruitment patterns.
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              
              {/* Executive Summary Card */}
              <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                      Executive Diagnostic
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors"
                  >
                    <PrinterIcon className="w-3.5 h-3.5" />
                    <span>Print Action Plan</span>
                  </button>
                </div>
                <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
                  {result.summary}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300 pt-1">
                  <span>Engine: Verified Indian Higher Education Data</span>
                  <span>•</span>
                  <span>Verified 2025–2026 Academic Standards</span>
                </div>
              </div>

              {/* Recommended Options Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Recommended Pathways ({result.recommendations.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Curated options matching your profile with verified colleges & recruitment data
                  </p>
                </div>
              </div>

              {/* Recommendation Cards */}
              <div className="flex flex-col gap-4">
                {result.recommendations.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-400 transition-all flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-extrabold uppercase">
                          <span>Option {idx + 1}</span>
                          <span>•</span>
                          <span>{item.kind.toUpperCase()}</span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 mt-1">{item.title}</h4>
                      </div>

                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                        {item.timeline}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <strong>Why this fits you:</strong> {item.whyItFits}
                    </p>

                    {/* Entrance Exams Required */}
                    {item.examsToPrepare && item.examsToPrepare.length > 0 && (
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          Entrance Examinations:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.examsToPrepare.map((exam, eIdx) => (
                            <span
                              key={eIdx}
                              className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-[11px]"
                            >
                              {exam}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Practical Steps */}
                    {item.firstSteps && item.firstSteps.length > 0 && (
                      <div className="flex flex-col gap-1.5 text-xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          Recommended Action Steps:
                        </span>
                        <ul className="flex flex-col gap-1">
                          {item.firstSteps.map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-2 text-slate-700 text-xs">
                              <span className="text-emerald-600 font-bold shrink-0">✓</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Links & Inline Roadmap */}
                    {(() => {
                      const collegeAction = getRecommendationCollegeAction(item);
                      const isExpanded = Boolean(expandedRoadmapIds[item.itemId]);
                      const isLoadingRoadmap = loadingRoadmapId === item.itemId;
                      const hasRoadmap = Boolean(roadmapsByItem[item.itemId]);

                      return (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                            <Link
                              href={collegeAction.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <BuildingLibraryIcon className="w-3.5 h-3.5 shrink-0" />
                              <span>{collegeAction.label}</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleToggleRoadmap(item)}
                              disabled={isLoadingRoadmap}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                                isExpanded
                                  ? 'bg-blue-100 text-blue-900 border border-blue-300 hover:bg-blue-200'
                                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                              }`}
                            >
                              {isLoadingRoadmap ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  <span>Building Roadmap...</span>
                                </>
                              ) : isExpanded ? (
                                <>
                                  <span>Hide 4-Year Roadmap ✕</span>
                                </>
                              ) : hasRoadmap ? (
                                <>
                                  <SparklesIcon className="w-3.5 h-3.5 text-blue-400" />
                                  <span>View 4-Year Roadmap →</span>
                                </>
                              ) : (
                                <>
                                  <SparklesIcon className="w-3.5 h-3.5 text-blue-400" />
                                  <span>Generate 4-Year Roadmap</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Inline Roadmap Section (Unfolds smoothly inside this card) */}
                          {isExpanded && roadmapsByItem[item.itemId] && (
                            <div className="mt-2 pt-4 border-t border-blue-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="flex items-center justify-between bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-2">
                                  <SparklesIcon className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span className="text-xs font-black text-blue-950">
                                    4-Phase Progression Plan: {roadmapsByItem[item.itemId].careerTitle}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedRoadmapIds((prev) => ({ ...prev, [item.itemId]: false }))
                                  }
                                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded hover:bg-white transition-colors"
                                >
                                  Hide ✕
                                </button>
                              </div>

                              {roadmapsByItem[item.itemId].ultimateGoal && (
                                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs font-medium text-indigo-900">
                                  <strong className="text-indigo-950">Career Culmination:</strong>{' '}
                                  {roadmapsByItem[item.itemId].ultimateGoal}
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {roadmapsByItem[item.itemId].phases.map((phase, pIdx) => (
                                  <div
                                    key={pIdx}
                                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col gap-2 hover:border-blue-300 transition-colors"
                                  >
                                    <div className="text-[11px] font-black text-blue-700 uppercase tracking-wide">
                                      {phase.yearOrPhase}
                                    </div>
                                    <div className="text-xs font-bold text-slate-900">{phase.focus}</div>

                                    <div className="flex flex-col gap-1 mt-1 text-[11px]">
                                      <span className="font-bold text-slate-500 uppercase text-[10px]">
                                        Milestones:
                                      </span>
                                      <ul className="flex flex-col gap-1 text-slate-600">
                                        {phase.keyMilestones.map((m, mIdx) => (
                                          <li key={mIdx} className="flex items-start gap-1.5">
                                            <span className="text-blue-500 font-bold shrink-0">▸</span>
                                            <span>{m}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {phase.skillsOrCertifications && phase.skillsOrCertifications.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {phase.skillsOrCertifications.map((s, sIdx) => (
                                          <span
                                            key={sIdx}
                                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium text-[10px]"
                                          >
                                            {s}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {phase.tips && (
                                      <div className="mt-auto pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 italic">
                                        <strong>Strategy:</strong> {phase.tips}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {roadmapError[item.itemId] && (
                            <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                              {roadmapError[item.itemId]}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ))}
              </div>

              {/* Strategic Questions for Parents & Human Counselors */}
              {result.questionsToAskCounsellor && result.questionsToAskCounsellor.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <ScaleIcon className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Strategic Questions to Ask Colleges & Parents
                    </h4>
                  </div>
                  <ul className="flex flex-col gap-2 text-xs text-slate-700">
                    {result.questionsToAskCounsellor.map((q, qIdx) => (
                      <li key={qIdx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-blue-600 shrink-0">Q{qIdx + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Caution & Institutional Disclaimer */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex flex-col gap-1">
                <span className="font-bold">Official Verification Advisory:</span>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  {result.caution ||
                    'Cutoffs, seat reservations, and tuition fees are updated annually by state examination authorities (KEA, JoSAA, NTA). Always verify current year guidelines against official notifications.'}
                </p>
              </div>

            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default function AiCounsellorPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-semibold">Loading AI Counsellor Workspace...</span>
          </div>
        </div>
      }
    >
      <AiCounsellorDashboard />
    </Suspense>
  );
}
