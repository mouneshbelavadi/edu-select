'use client';

import React from 'react';

interface CareerChoicesBarProps {
  levelLabel?: string;
  streamLabel?: string;
  interestsLabels?: string[];
  subjectsLabels?: string[];
  onRemoveLevel?: () => void;
  onRemoveStream?: () => void;
  onRemoveInterest?: (interest: string) => void;
  onRemoveSubject?: (subject: string) => void;
  onStartOver: () => void;
}

export const CareerChoicesBar: React.FC<CareerChoicesBarProps> = ({
  levelLabel,
  streamLabel,
  interestsLabels = [],
  subjectsLabels = [],
  onRemoveLevel,
  onRemoveStream,
  onRemoveInterest,
  onRemoveSubject,
  onStartOver,
}) => {
  const hasChoices = Boolean(levelLabel || streamLabel || interestsLabels.length > 0 || subjectsLabels.length > 0);

  if (!hasChoices) {
    return null;
  }

  return (
    <div className="sticky top-16 z-30 w-full bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0] py-2.5 px-4 sm:px-6 shadow-xs">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none text-xs">
          <span className="font-bold text-[#0F172A] shrink-0">Your choices:</span>

          {/* Level Chip */}
          {levelLabel && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-blue-50 text-[#1D4ED8] border border-blue-200 font-semibold shrink-0">
              <span>{levelLabel}</span>
              {onRemoveLevel && (
                <button
                  type="button"
                  onClick={onRemoveLevel}
                  className="hover:text-blue-900 rounded p-0.5"
                  title="Change level"
                  aria-label="Remove level filter"
                >
                  ✕
                </button>
              )}
            </span>
          )}

          {/* Stream / Branch Chip */}
          {streamLabel && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-slate-100 text-[#0F172A] border border-[#E2E8F0] font-semibold shrink-0">
              <span>{streamLabel}</span>
              {onRemoveStream && (
                <button
                  type="button"
                  onClick={onRemoveStream}
                  className="hover:text-[#1D4ED8] rounded p-0.5"
                  title="Change stream or goal"
                  aria-label="Remove stream filter"
                >
                  ✕
                </button>
              )}
            </span>
          )}

          {/* Interests Chips */}
          {interestsLabels.map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-slate-100 text-[#0F172A] border border-[#E2E8F0] font-semibold shrink-0"
            >
              <span>{interest}</span>
              {onRemoveInterest && (
                <button
                  type="button"
                  onClick={() => onRemoveInterest(interest)}
                  className="hover:text-[#1D4ED8] rounded p-0.5"
                  aria-label={`Remove ${interest}`}
                >
                  ✕
                </button>
              )}
            </span>
          ))}

          {/* Subjects Chips */}
          {subjectsLabels.map((subj) => (
            <span
              key={subj}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-teal-50 text-[#0D9488] border border-teal-200 font-semibold shrink-0"
            >
              <span>{subj}</span>
              {onRemoveSubject && (
                <button
                  type="button"
                  onClick={() => onRemoveSubject(subj)}
                  className="hover:text-teal-900 rounded p-0.5"
                  aria-label={`Remove ${subj}`}
                >
                  ✕
                </button>
              )}
            </span>
          ))}
        </div>

        {/* Start Over Button */}
        <button
          type="button"
          onClick={onStartOver}
          className="text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] underline shrink-0 focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
        >
          Start over
        </button>
      </div>
    </div>
  );
};
