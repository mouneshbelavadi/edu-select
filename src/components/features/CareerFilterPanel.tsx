'use client';

import React from 'react';

interface CareerFilterPanelProps {
  outlook: string;
  onOutlookChange: (val: string) => void;
  budget: string;
  onBudgetChange: (val: string) => void;
  abroad: boolean;
  onAbroadChange: (val: boolean) => void;
  entrance: string;
  onEntranceChange: (val: string) => void;
  onClearAll: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const CareerFilterPanel: React.FC<CareerFilterPanelProps> = ({
  outlook,
  onOutlookChange,
  budget,
  onBudgetChange,
  abroad,
  onAbroadChange,
  entrance,
  onEntranceChange,
  onClearAll,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const content = (
    <div className="flex flex-col gap-6 text-sm text-[#0F172A]">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <h3 className="font-bold text-base text-[#0F172A]">Filters</h3>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold text-[#1D4ED8] hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* 1. Job Outlook */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Job Outlook
        </label>
        <div className="flex flex-col gap-1.5">
          {[
            { id: '', label: 'All Outlooks' },
            { id: 'GROWING', label: 'Growing Demand' },
            { id: 'STABLE', label: 'Stable' },
            { id: 'DECLINING', label: 'Declining / Shifting' },
          ].map((item) => (
            <label key={item.id} className="flex items-center gap-2 cursor-pointer text-sm text-[#475569] hover:text-[#0F172A]">
              <input
                type="radio"
                name="outlook"
                checked={outlook === item.id}
                onChange={() => onOutlookChange(item.id)}
                className="w-4 h-4 text-[#1D4ED8] border-[#E2E8F0] focus:ring-[#1D4ED8]"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 2. Total Budget */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Total Budget
        </label>
        <div className="flex flex-col gap-1.5">
          {[
            { id: '', label: 'All Budgets' },
            { id: 'under_2l', label: 'Under ₹2 Lakhs' },
            { id: '2l_5l', label: '₹2 Lakhs – ₹5 Lakhs' },
            { id: '5l_15l', label: '₹5 Lakhs – ₹15 Lakhs' },
            { id: 'above_15l', label: 'Above ₹15 Lakhs' },
          ].map((item) => (
            <label key={item.id} className="flex items-center gap-2 cursor-pointer text-sm text-[#475569] hover:text-[#0F172A]">
              <input
                type="radio"
                name="budget"
                checked={budget === item.id}
                onChange={() => onBudgetChange(item.id)}
                className="w-4 h-4 text-[#1D4ED8] border-[#E2E8F0] focus:ring-[#1D4ED8]"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Entrance Exam Required */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Entrance Exam
        </label>
        <div className="flex flex-col gap-1.5">
          {[
            { id: '', label: 'All Options' },
            { id: 'true', label: 'Exam Required' },
            { id: 'false', label: 'Direct / Merit Admission' },
          ].map((item) => (
            <label key={item.id} className="flex items-center gap-2 cursor-pointer text-sm text-[#475569] hover:text-[#0F172A]">
              <input
                type="radio"
                name="entrance"
                checked={entrance === item.id}
                onChange={() => onEntranceChange(item.id)}
                className="w-4 h-4 text-[#1D4ED8] border-[#E2E8F0] focus:ring-[#1D4ED8]"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 4. Abroad Friendly */}
      <div className="pt-2 border-t border-[#E2E8F0]">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#0F172A]">
          <input
            type="checkbox"
            checked={abroad}
            onChange={(e) => onAbroadChange(e.target.checked)}
            className="w-4 h-4 rounded text-[#1D4ED8] border-[#E2E8F0] focus:ring-[#1D4ED8]"
          />
          <span>Abroad Friendly</span>
        </label>
        <p className="text-xs text-[#64748B] mt-1 pl-6">
          Degrees and courses with widespread international accreditation.
        </p>
      </div>
    </div>
  );

  if (isMobileDrawer) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
        <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
              <span className="font-bold text-lg text-[#0F172A]">Filter Options</span>
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="text-xl font-bold text-[#64748B] hover:text-[#0F172A] p-1"
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>
            {content}
          </div>

          <button
            type="button"
            onClick={onCloseMobileDrawer}
            className="w-full py-3 mt-6 bg-[#1D4ED8] text-white font-semibold rounded-[8px] hover:bg-[#1E40AF] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-full bg-white rounded-[12px] border border-[#E2E8F0] p-5 shadow-xs">
      {content}
    </aside>
  );
};
