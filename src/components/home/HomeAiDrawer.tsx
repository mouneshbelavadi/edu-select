'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SparklesIcon } from '@/components/ui/Icons';

import Link from 'next/link';

export function openHomeAiDrawer(question = '') {
  if (typeof window !== 'undefined') {
    window.location.href = `/ai-counsellor${question ? `?q=${encodeURIComponent(question)}` : ''}`;
  }
}

export const HomeAiDrawer: React.FC = () => {
  const pathname = usePathname();

  // Do not show the floating agent on admin portal or when already on AI counsellor page
  if (pathname && (pathname.startsWith('/admin') || pathname === '/ai-counsellor')) {
    return null;
  }

  return (
    <>
      {/* Floating Agent Button at Bottom-Right - Direct Link to AI Counsellor Page */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center group">
        <Link
          href="/ai-counsellor"
          aria-label="Open AI Career Counsellor"
          title="Ask EduSelect AI Agent"
          className="relative flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_12px_36px_rgba(15,23,42,0.45)] border-2 border-white/40 bg-gradient-to-r from-[#0F172A] via-[#1E2A78] to-[#2563EB] text-white hover:from-[#1E2A78] hover:to-[#1D4ED8]"
        >
          {/* Subtle outer pulse effect */}
          <span className="absolute -inset-1 rounded-full bg-blue-500/30 animate-pulse pointer-events-none" />

          {/* Online green indicator badge */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>

          <div className="flex items-center gap-2.5">
            {/* Robot Icon Container */}
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M12 4v4" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <circle cx="9" cy="13" r="1" fill="currentColor" />
                <circle cx="15" cy="13" r="1" fill="currentColor" />
                <path d="M9 17h6" />
              </svg>
            </div>

            {/* Bold Visible Label */}
            <div className="flex flex-col text-left">
              <span className="text-xs font-black tracking-wide text-white leading-tight flex items-center gap-1">
                Ask AI Agent
                <SparklesIcon className="w-3 h-3 text-amber-300 animate-pulse" />
              </span>
              <span className="text-[10px] text-blue-200 font-medium leading-tight hidden sm:inline">
                Career Counsellor
              </span>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export const OpenAiDrawerButton: React.FC<{
  question?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ question = '', className = '', children }) => {
  return (
    <button
      type="button"
      onClick={() => openHomeAiDrawer(question)}
      className={className}
    >
      {children}
    </button>
  );
};
