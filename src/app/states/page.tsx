'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ALL_INDIAN_STATES } from '@/lib/constants';
import { StateCardImage } from '@/components/features/StateCardImage';

export default function ExploreStatesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const stateHighlights: Record<string, { topCities: string[]; icon: string; highlight: string }> = {
    Karnataka: { topCities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'], icon: '🏛️', highlight: 'Tech & Innovation Capital (RVCE, BMSCE, UVCE)' },
    Maharashtra: { topCities: ['Mumbai', 'Pune', 'Nagpur'], icon: '🏢', highlight: 'Financial Hub & Premier Research (COEP, VJTI)' },
    'Tamil Nadu': { topCities: ['Chennai', 'Coimbatore', 'Trichy'], icon: '🎓', highlight: 'Engineering Excellence (Anna University, PSG)' },
    Telangana: { topCities: ['Hyderabad', 'Warangal'], icon: '💻', highlight: 'Cyberabad & Premier Institutes (JNTU, CBIT)' },
    'Uttar Pradesh': { topCities: ['Noida', 'Lucknow', 'Kanpur'], icon: '🏭', highlight: 'Expanding Engineering Ecosystem' },
    Gujarat: { topCities: ['Ahmedabad', 'Surat', 'Vadodara'], icon: '⚡', highlight: 'Industrial & Technological Powerhouse' },
    Kerala: { topCities: ['Thiruvananthapuram', 'Kochi', 'Calicut'], icon: '🌴', highlight: 'High Literacy & Quality Engineering' },
    Rajasthan: { topCities: ['Jaipur', 'Kota', 'Jodhpur'], icon: '🏰', highlight: 'Coaching Hub & Top Universities' },
    'West Bengal': { topCities: ['Kolkata', 'Durgapur'], icon: '📖', highlight: 'Heritage Institutions & Premier Tech' },
  };

  const filteredStates = ALL_INDIAN_STATES.filter((state) =>
    state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider w-fit">
            📍 Explore Across India
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Explore Engineering Colleges <span className="text-blue-400">by State</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
            Browse engineering institutions across all 28 Indian states. Filter by regional counseling, state cutoffs, and premier tech universities.
          </p>

          {/* State Search Bar */}
          <div className="mt-4 max-w-md">
            <input
              type="text"
              placeholder="Search Indian states (e.g., Karnataka, Maharashtra)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 text-white placeholder-slate-400 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* States Grid (All 28 States) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              All 28 Indian States ({filteredStates.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Click any state to explore colleges & cutoffs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredStates.map((state) => {
              const meta = stateHighlights[state] || {
                topCities: ['State Capital'],
                icon: '📍',
                highlight: 'Government & Private Engineering Colleges',
              };

              return (
                <Link
                  key={state}
                  href={`/colleges?state=${encodeURIComponent(state)}`}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <StateCardImage stateName={state} className="h-28 w-full relative overflow-hidden" />
                  
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        {meta.icon}
                      </span>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        Explore →
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                      {state}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {meta.highlight}
                    </p>
                  </div>

                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Key Hubs: {meta.topCities.slice(0, 2).join(', ')}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
