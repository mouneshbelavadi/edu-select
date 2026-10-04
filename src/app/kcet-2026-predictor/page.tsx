'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  LightningIcon,
  AlertCircleIcon,
  ScaleIcon,
  BookOpenIcon,
  SparklesIcon,
  StarIcon,
} from '@/components/ui/Icons';
import {
  calculateKCET2026Prediction,
  KCETInput,
  PredictionResult,
} from '@/lib/kcetPredictor';

export default function KCET2026PredictorPage() {
  const [formData, setFormData] = useState<KCETInput>({
    physicsKCET: 45,
    chemistryKCET: 48,
    mathsKCET: 52,
    physicsBoard: 92,
    chemistryBoard: 95,
    mathsBoard: 96,
    category: 'GM',
    quota: 'general',
  });

  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
  const [selectedChanceFilter, setSelectedChanceFilter] = useState<string>('ALL');

  // Compute prediction live on any input change
  const prediction: PredictionResult = useMemo(() => {
    return calculateKCET2026Prediction(formData);
  }, [formData]);

  const totalKCETMarks = formData.physicsKCET + formData.chemistryKCET + formData.mathsKCET;
  const totalBoardMarks = formData.physicsBoard + formData.chemistryBoard + formData.mathsBoard;

  const handleInputChange = (field: keyof KCETInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Filter recommendations based on active tabs
  const filteredRecommendations = useMemo(() => {
    return prediction.recommendations.filter((rec) => {
      const matchesBranch =
        selectedBranchFilter === 'ALL' ||
        (selectedBranchFilter === 'CSE_IT' &&
          ['CSE', 'AIML', 'ISE', 'AIDS'].includes(rec.college.branchCode)) ||
        (selectedBranchFilter === 'ECE_EEE' &&
          ['ECE', 'EEE'].includes(rec.college.branchCode)) ||
        (selectedBranchFilter === 'MECH_CIVIL' &&
          ['ME', 'CIVIL'].includes(rec.college.branchCode));

      const matchesChance =
        selectedChanceFilter === 'ALL' ||
        (selectedChanceFilter === 'HIGH' && rec.chance === 'High Chance') ||
        (selectedChanceFilter === 'MODERATE' && rec.chance === 'Moderate Chance') ||
        (selectedChanceFilter === 'DREAM' && rec.chance === 'Dream / Ambitious');

      return matchesBranch && matchesChance;
    });
  }, [prediction.recommendations, selectedBranchFilter, selectedChanceFilter]);

  return (
    <div className="min-h-screen bg-surface-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-400/20 border border-brand-300/30 text-brand-200 text-xs font-semibold uppercase tracking-wider w-fit">
              <LightningIcon className="w-3.5 h-3.5 text-brand-200" />
              <span>Official KEA 50:50 Normalization Model</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              KCET 2026 <span className="text-brand-300">Rank & College Predictor</span>
            </h1>
            <p className="text-surface-200 text-sm sm:text-base leading-relaxed">
              Calculate your exact Karnataka CET 2026 estimated rank based on 50% KCET marks and 50% Class 12th / 2nd PUC Board PCM marks. Discover colleges and branches you qualify for with zero login required.
            </p>
          </div>
        </div>

        {/* Post-Engineering Careers Banner */}
        <div className="bg-gradient-to-r from-emerald-900/90 via-teal-900/80 to-slate-900 text-white rounded-2xl p-5 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Planning Ahead for After B.Tech?
              </div>
              <p className="text-sm text-surface-200">
                Explore placement packages, PSU eligibility through GATE, master's pathways, and job profiles across 29 engineering branches.
              </p>
            </div>
          </div>
          <Link
            href="/careers?level=UG_ENGG"
            className="inline-flex items-center whitespace-nowrap gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shrink-0"
          >
            Explore Careers After Engineering →
          </Link>
        </div>

        {/* Main Grid: Inputs (Left) & Results (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-surface-100 pb-4">
                <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5 text-brand-600 shrink-0" />
                  <span>Enter Your Marks</span>
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      physicsKCET: 50,
                      chemistryKCET: 52,
                      mathsKCET: 55,
                      physicsBoard: 95,
                      chemistryBoard: 96,
                      mathsBoard: 98,
                      category: 'GM',
                      quota: 'general',
                    })
                  }
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
                >
                  Load Top Ranker Sample
                </button>
              </div>

              {/* KCET Marks Group (out of 180) */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-surface-800">
                    1. KCET Marks (Total: {totalKCETMarks} / 180)
                  </label>
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    {((totalKCETMarks / 180) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-xs text-surface-500 font-medium">Physics (/60)</span>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={formData.physicsKCET}
                      onChange={(e) =>
                        handleInputChange('physicsKCET', Math.min(60, Math.max(0, Number(e.target.value))))
                      }
                      className="mt-1 w-full px-3 py-2 border border-surface-300 rounded-lg text-center font-bold text-surface-900 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-surface-500 font-medium">Chemistry (/60)</span>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={formData.chemistryKCET}
                      onChange={(e) =>
                        handleInputChange('chemistryKCET', Math.min(60, Math.max(0, Number(e.target.value))))
                      }
                      className="mt-1 w-full px-3 py-2 border border-surface-300 rounded-lg text-center font-bold text-surface-900 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-surface-500 font-medium">Maths (/60)</span>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={formData.mathsKCET}
                      onChange={(e) =>
                        handleInputChange('mathsKCET', Math.min(60, Math.max(0, Number(e.target.value))))
                      }
                      className="mt-1 w-full px-3 py-2 border border-surface-300 rounded-lg text-center font-bold text-surface-900 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Board PCM Marks Group (out of 300) */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-surface-800">
                    2. Class 12 / 2nd PUC Board Marks (Total: {totalBoardMarks} / 300)
                  </label>
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    {((totalBoardMarks / 300) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-xs text-surface-500 font-medium">Physics (/100)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.physicsBoard}
                      onChange={(e) =>
                        handleInputChange('physicsBoard', Math.min(100, Math.max(0, Number(e.target.value))))
                      }
                      className="mt-1 w-full px-3 py-2 border border-surface-300 rounded-lg text-center font-bold text-surface-900 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-surface-500 font-medium">Chemistry (/100)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.chemistryBoard}
                      onChange={(e) =>
                        handleInputChange('chemistryBoard', Math.min(100, Math.max(0, Number(e.target.value))))
                      }
                      className="mt-1 w-full px-3 py-2 border border-surface-300 rounded-lg text-center font-bold text-surface-900 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-surface-500 font-medium">Maths (/100)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.mathsBoard}
                      onChange={(e) =>
                        handleInputChange('mathsBoard', Math.min(100, Math.max(0, Number(e.target.value))))
                      }
                      className="mt-1 w-full px-3 py-2 border border-surface-300 rounded-lg text-center font-bold text-surface-900 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Reservation Category */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-surface-800">
                  3. Reservation Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['GM', '2A', '2B', '3A', '3B', 'SC', 'ST'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleInputChange('category', cat)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        formData.category === cat
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-surface-50 text-surface-700 border-surface-200 hover:bg-surface-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Quota */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-surface-800">
                  4. Special Quota / Reservation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'general', label: 'None (General)' },
                    { id: 'rural', label: 'Rural Quota' },
                    { id: 'kannada', label: 'Kannada Medium' },
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleInputChange('quota', q.id)}
                      className={`py-2 px-1 text-xs font-medium rounded-lg border text-center transition-all ${
                        formData.quota === q.id
                          ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold'
                          : 'bg-surface-50 text-surface-600 border-surface-200 hover:bg-surface-100'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* KEA Normalization Formula Information Card */}
            <div className="p-5 bg-brand-50/60 border border-brand-100 rounded-2xl flex flex-col gap-2 text-xs text-brand-900 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-brand-800">
                <AlertCircleIcon className="w-4 h-4 text-brand-700 shrink-0" />
                <span>How KEA Calculates Your Rank:</span>
              </div>
              <p>
                <strong>Composite Score = (KCET % × 0.50) + (Board PCM % × 0.50)</strong>. KEA ranks all candidates strictly based on this combined score out of 100.
              </p>
            </div>
          </div>

          {/* Right Column: Prediction Results & College Matches (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Rank Card */}
            <div className="bg-white rounded-2xl border-2 border-brand-500/20 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-100 pb-6">
                <div>
                  <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Predicted KCET 2026 Rank
                  </span>
                  <div className="text-3xl sm:text-5xl font-black text-brand-600 mt-1">
                    ~{prediction.predictedRankMedian.toLocaleString()}
                  </div>
                  <div className="text-xs text-surface-500 mt-1">
                    Expected Bracket: <strong>{prediction.estimatedRankMin.toLocaleString()}</strong> to{' '}
                    <strong>{prediction.estimatedRankMax.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="flex flex-col items-end bg-surface-50 p-4 rounded-xl border border-surface-200">
                  <span className="text-xs text-surface-500 font-medium">KEA Composite Score</span>
                  <span className="text-2xl font-black text-surface-900">
                    {prediction.compositeScore} <span className="text-sm font-normal text-surface-400">/ 100</span>
                  </span>
                  <span className="text-[11px] text-brand-700 font-semibold mt-0.5">
                    Category: {prediction.category}
                  </span>
                </div>
              </div>

              {/* Filter Tabs for College Recommendations */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="flex flex-wrap gap-1.5 bg-surface-100 p-1 rounded-xl">
                  {[
                    { id: 'ALL', label: 'All Branches' },
                    { id: 'CSE_IT', label: 'CSE & AI/IT' },
                    { id: 'ECE_EEE', label: 'ECE & EEE' },
                    { id: 'MECH_CIVIL', label: 'Mech / Civil' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedBranchFilter(tab.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        selectedBranchFilter === tab.id
                          ? 'bg-white text-surface-900 shadow-sm'
                          : 'text-surface-600 hover:text-surface-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5 text-xs">
                  <button
                    onClick={() => setSelectedChanceFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md border font-medium ${
                      selectedChanceFilter === 'ALL'
                        ? 'bg-surface-800 text-white border-surface-800'
                        : 'bg-white text-surface-600 border-surface-200'
                    }`}
                  >
                    All ({prediction.recommendations.length})
                  </button>
                  <button
                    onClick={() => setSelectedChanceFilter('HIGH')}
                    className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 ${
                      selectedChanceFilter === 'HIGH'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-emerald-700 border-emerald-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>High</span>
                  </button>
                  <button
                    onClick={() => setSelectedChanceFilter('MODERATE')}
                    className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 ${
                      selectedChanceFilter === 'MODERATE'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-amber-700 border-amber-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    <span>Moderate</span>
                  </button>
                  <button
                    onClick={() => setSelectedChanceFilter('DREAM')}
                    className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 ${
                      selectedChanceFilter === 'DREAM'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-purple-700 border-purple-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                    <span>Dream</span>
                  </button>
                </div>
              </div>

              {/* College Recommendations List */}
              <div className="flex flex-col gap-4">
                {filteredRecommendations.length === 0 ? (
                  <div className="text-center py-12 bg-surface-50 rounded-xl border border-dashed border-surface-300">
                    <p className="text-sm text-surface-500 font-medium">
                      No colleges match the selected filter combination.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedBranchFilter('ALL');
                        setSelectedChanceFilter('ALL');
                      }}
                      className="mt-2 text-xs text-brand-600 font-bold hover:underline"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  filteredRecommendations.map((item, index) => (
                    <div
                      key={`${item.college.collegeSlug}-${item.college.branchCode}-${index}`}
                      className="p-5 rounded-xl border border-surface-200 hover:border-brand-300 transition-all bg-white hover:shadow-md flex flex-col gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-surface-900 hover:text-brand-600 transition-colors">
                              <Link href={`/colleges`}>
                                {item.college.collegeName}
                              </Link>
                            </h3>
                            <span className="text-xs text-surface-500 flex items-center gap-1">
                              <StarIcon className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                              <span>{item.college.rating}</span>
                            </span>
                          </div>
                          <p className="text-xs text-surface-500">{item.college.location}</p>
                        </div>

                        {/* Chance Pill */}
                        <span
                          className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                            item.chance === 'High Chance'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.chance === 'Moderate Chance'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.chance === 'High Chance'
                                ? 'bg-emerald-500'
                                : item.chance === 'Moderate Chance'
                                ? 'bg-amber-500'
                                : 'bg-purple-500'
                            }`}
                          />
                          <span>
                            {item.chance === 'High Chance'
                              ? 'High Chance'
                              : item.chance === 'Moderate Chance'
                              ? 'Moderate Chance'
                              : 'Dream / Ambitious'}
                          </span>
                        </span>
                      </div>

                      {/* Branch & Metrics Banner */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-50 p-3 rounded-lg text-xs">
                        <div>
                          <span className="text-surface-400 block text-[11px]">Branch</span>
                          <span className="font-bold text-surface-800">{item.college.branch}</span>
                        </div>
                        <div>
                          <span className="text-surface-400 block text-[11px]">
                            {prediction.category} Cutoff Rank
                          </span>
                          <span className="font-bold text-brand-600">
                            {item.cutoff.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-surface-400 block text-[11px]">Avg Package</span>
                          <span className="font-bold text-surface-800">
                            ₹{item.college.avgPackageLPA} LPA
                          </span>
                        </div>
                        <div>
                          <span className="text-surface-400 block text-[11px]">Annual Fees</span>
                          <span className="font-bold text-surface-800">
                            ₹{(item.college.feesPerYear / 100000).toFixed(2)} Lakh
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-surface-600">{item.matchReason}</p>

                      {/* Action Links */}
                      <div className="flex items-center justify-between pt-1 border-t border-surface-100">
                        <Link
                          href={`/colleges`}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700"
                        >
                          View Full College Profile →
                        </Link>
                        <Link
                          href={`/compare`}
                          className="text-xs text-surface-500 hover:text-surface-800 font-medium inline-flex items-center gap-1"
                        >
                          <ScaleIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span>Compare College</span>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
