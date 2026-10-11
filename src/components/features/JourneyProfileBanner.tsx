'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStudentProfile } from '@/lib/store/useStudentProfile';
import { StudentLevel, StudentStream } from '@/types/studentProfile';
import { isMedicalEligible, isEngineeringEligible } from '@/lib/journey/journeyEngine';
import {
  GraduationCapIcon,
  CheckIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  CompassIcon,
} from '@/components/ui/Icons';

interface JourneyProfileBannerProps {
  currentPage?: 'colleges' | 'puc' | 'medical' | 'predictor' | 'careers' | 'pathways';
}

export default function JourneyProfileBanner({ currentPage }: JourneyProfileBannerProps) {
  const { profile, resolution, updateProfile, isLoaded } = useStudentProfile();
  const [isEditing, setIsEditing] = useState(false);

  if (!isLoaded) return null;

  const levelLabels: Record<StudentLevel, string> = {
    '10th': 'After 10th (SSLC)',
    '12th': 'After 12th / PUC',
    iti: 'After ITI',
    diploma: 'After Polytechnic Diploma',
    btech: 'After B.Tech / BE',
    degree: 'After Degree / Graduation',
    professional: 'Professional Licensure',
    pg: 'Postgraduate / Master',
  };

  // Eligibility warnings based on current page
  let alertMessage: string | null = null;
  let alertType: 'warning' | 'info' = 'info';

  if (currentPage === 'medical' && profile.level === '12th' && !isMedicalEligible(profile)) {
    alertMessage =
      'Eligibility Notice: Under NMC guidelines, Biology or Biotechnology is mandatory for NEET-UG and MBBS/BDS admissions. As a PCM student, you are not eligible for medical colleges.';
    alertType = 'warning';
  } else if (currentPage === 'predictor' && profile.level === '12th' && !isEngineeringEligible(profile)) {
    alertMessage =
      'Eligibility Notice: KCET Engineering rank requires Physics, Chemistry, and Mathematics (PCM). Pure PCB students cannot enter engineering rank counselling.';
    alertType = 'warning';
  } else if (currentPage === 'puc' && profile.level !== '10th') {
    alertMessage =
      'You are currently viewing Pre-University (11th & 12th) institutions in Karnataka, which cater to students completing Class 10 (SSLC).';
    alertType = 'info';
  }

  return (
    <div className="w-full bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Active Profile Chip */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              <GraduationCapIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Student Profile:</span>
            </span>

            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-800 font-medium">
              <span className="font-bold text-slate-900">{levelLabels[profile.level] || profile.level}</span>
              {profile.stream && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                    {profile.stream}
                  </span>
                </>
              )}
              {profile.state && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 text-xs">{profile.state}</span>
                </>
              )}
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer ml-1"
            >
              <CompassIcon className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Close' : 'Change Profile'}</span>
            </button>
          </div>

          {/* Quick Level Presets */}
          <div className="hidden lg:flex items-center gap-1 text-xs">
            <span className="text-slate-400 mr-1 text-[11px] uppercase tracking-wider font-semibold">Quick Switch:</span>
            <button
              onClick={() => updateProfile({ level: '10th', stream: 'Other' }, true)}
              className={`px-2 py-1 rounded-md transition-colors ${
                profile.level === '10th'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              10th
            </button>
            <button
              onClick={() => updateProfile({ level: '12th', stream: 'PCM' }, true)}
              className={`px-2 py-1 rounded-md transition-colors ${
                profile.level === '12th' && profile.stream === 'PCM'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              12th PCM
            </button>
            <button
              onClick={() => updateProfile({ level: '12th', stream: 'PCB' }, true)}
              className={`px-2 py-1 rounded-md transition-colors ${
                profile.level === '12th' && profile.stream === 'PCB'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              12th PCB
            </button>
            <button
              onClick={() => updateProfile({ level: 'diploma', stream: 'Other' }, true)}
              className={`px-2 py-1 rounded-md transition-colors ${
                profile.level === 'diploma'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Diploma (DCET)
            </button>
          </div>
        </div>

        {/* Inline Profile Editor Drawer */}
        {isEditing && (
          <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Education Level</label>
              <select
                value={profile.level}
                onChange={(e) => updateProfile({ level: e.target.value as StudentLevel }, true)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 font-medium"
              >
                <option value="10th">After 10th (SSLC)</option>
                <option value="12th">After 12th / PUC</option>
                <option value="diploma">After Polytechnic Diploma</option>
                <option value="iti">After ITI</option>
                <option value="btech">After B.Tech / BE</option>
                <option value="degree">After Degree / Graduation</option>
              </select>
            </div>

            {profile.level === '12th' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">12th / PU Stream</label>
                <select
                  value={profile.stream || 'PCM'}
                  onChange={(e) => updateProfile({ stream: e.target.value as StudentStream }, true)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 font-medium"
                >
                  <option value="PCM">PCM (Engineering, Tech, Architecture)</option>
                  <option value="PCB">PCB (Medicine, BDS, Allied Health)</option>
                  <option value="PCMB">PCMB (Both Engineering & Medicine)</option>
                  <option value="PCMC">PCMC (Computer Science & Engineering)</option>
                  <option value="Commerce">Commerce (CA, CS, Finance, Law)</option>
                  <option value="Arts">Arts (Civil Services, Law, Design)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State Domicile</label>
              <select
                value={profile.state || 'Karnataka'}
                onChange={(e) => updateProfile({ state: e.target.value }, true)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 font-medium"
              >
                <option value="Karnataka">Karnataka (KEA State Quota)</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="All-India">All-India (AIQ / National)</option>
              </select>
            </div>
          </div>
        )}

        {/* Dynamic Contextual Alert */}
        {alertMessage && (
          <div
            className={`mt-2.5 p-2.5 rounded-lg flex items-start gap-2 text-xs leading-relaxed ${
              alertType === 'warning'
                ? 'bg-amber-50 border border-amber-200 text-amber-900'
                : 'bg-blue-50 border border-blue-200 text-blue-900'
            }`}
          >
            <AlertCircleIcon
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                alertType === 'warning' ? 'text-amber-600' : 'text-blue-600'
              }`}
            />
            <div className="flex-1">
              <span>{alertMessage}</span>
              {alertType === 'warning' && currentPage === 'medical' && (
                <div className="mt-1">
                  <Link
                    href="/colleges"
                    className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
                  >
                    <span>Switch to Engineering Colleges (455 Options)</span>
                    <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
