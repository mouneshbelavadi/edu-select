'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AiCounselorDrawer } from '@/components/features/AiCounselorDrawer';
import { SparklesIcon } from '@/components/ui/Icons';

export function openHomeAiDrawer(question = '') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-home-ai-drawer', { detail: { question } }));
  }
}

export const HomeAiDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ question?: string }>;
      setQuestion(customEvent.detail?.question || '');
      setIsOpen(true);
    };

    window.addEventListener('open-home-ai-drawer', handleOpen);
    return () => window.removeEventListener('open-home-ai-drawer', handleOpen);
  }, []);

  // Do not show the floating agent on the admin portal
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Floating Circular Agent Button at Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group">
        {/* Hover Tooltip on Desktop */}
        <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-ink-900 text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-medium whitespace-nowrap border border-white/10">
          Ask AI Agent
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isOpen) {
              setQuestion('');
            }
            setIsOpen(!isOpen);
          }}
          aria-label={isOpen ? 'Close AI Counsellor' : 'Open AI Counsellor'}
          title="Ask EduSelect AI Agent"
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-ink-900 via-ink to-blue-700 hover:from-ink hover:to-indigo-700 text-white shadow-2xl hover:shadow-soft-ink flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-white/30 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {/* Subtle pulse ring animation when closed */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-blue-500/25 animate-ping pointer-events-none" />
          )}

          {/* Active status indicator dot */}
          {!isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-marigold border-2 border-ink shadow-xs" />
          )}

          {isOpen ? (
            <svg
              className="w-6 h-6 text-white transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="relative flex items-center justify-center">
              {/* Agent Robot Face SVG */}
              <svg
                className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200"
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
              {/* Gold sparkle badge */}
              <SparklesIcon className="w-3.5 h-3.5 text-marigold absolute -top-2.5 -right-2.5 animate-pulse" />
            </div>
          )}
        </button>
      </div>

      {/* Drawer */}
      <AiCounselorDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialQuestion={question}
        hideTrigger
      />
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
