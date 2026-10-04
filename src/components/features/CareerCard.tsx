import React from 'react';
import Link from 'next/link';
import { CareerCard as CareerCardType } from '@/types/careerData';

interface CareerCardProps {
  card: CareerCardType;
}

export const CareerCardComponent: React.FC<CareerCardProps> = ({ card }) => {
  const kindBadgeConfig = {
    pathway: { label: 'Course / Pathway', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    branch: { label: 'Engineering Branch', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    degree: { label: 'Degree / Career', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    govtJob: { label: 'Government Job', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  }[card.kind];

  const outlookBadgeConfig = {
    GROWING: { label: 'Growing Demand', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: '↗' },
    STABLE: { label: 'Stable Outlook', bg: 'bg-sky-50 text-sky-800 border-sky-200', icon: '→' },
    DECLINING: { label: 'Declining / Shifting', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: '↘' },
  }[card.outlook] || { label: card.outlook, bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: '•' };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
      <div className="flex flex-col gap-3">
        {/* Top Header: Kind & Outlook */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${kindBadgeConfig.bg}`}>
            {kindBadgeConfig.label}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${outlookBadgeConfig.bg}`}
            title="Market outlook based on WEF and national employment trends"
          >
            <span>{outlookBadgeConfig.icon}</span>
            <span>{outlookBadgeConfig.label}</span>
          </span>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
            {card.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {card.subtitle}
          </p>
        </div>

        {/* Metric Badges: Duration, Cost, Salary */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Duration */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Duration / Age</span>
            <span className="font-bold text-slate-800 text-xs">{card.durationText}</span>
          </div>

          {/* Salary or Cost */}
          {card.entrySalaryLPA ? (
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                Entry Pay
                {card.isEstimate && (
                  <span className="px-1 py-0.2 rounded text-[9px] bg-amber-100 text-amber-800 font-bold">
                    Est.
                  </span>
                )}
              </span>
              <span className="font-extrabold text-emerald-700 text-xs">
                ₹{card.entrySalaryLPA.min}–₹{card.entrySalaryLPA.max} LPA
              </span>
            </div>
          ) : card.totalCostINR ? (
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                Total Est. Cost
                {card.isEstimate && (
                  <span className="px-1 py-0.2 rounded text-[9px] bg-amber-100 text-amber-800 font-bold">
                    Est.
                  </span>
                )}
              </span>
              <span className="font-extrabold text-indigo-700 text-xs">
                ₹{(card.totalCostINR.min / 1000).toFixed(0)}k–₹{(card.totalCostINR.max / 100000).toFixed(1)}L
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Cost Structure</span>
              <span className="font-medium text-slate-500 text-xs">Standard State Quota</span>
            </div>
          )}
        </div>

        {/* Exams chips */}
        {card.examNames && card.examNames.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] text-slate-400 font-semibold">Exams:</span>
            {card.examNames.slice(0, 3).map((exam, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
              >
                {exam}
              </span>
            ))}
            {card.examNames.length > 3 && (
              <span className="text-[10px] text-slate-400 font-semibold">
                +{card.examNames.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Button */}
      <div className="pt-2 border-t border-slate-100">
        <Link
          href={`/careers/${card.kind}/${card.id}`}
          className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1 shadow-xs"
        >
          <span>Explore Career Pathway</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
};
