'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCapIcon } from '@/components/ui/Icons';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide footer on /admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="w-full bg-[#F8FAFC] border-t border-[#E2E8F0] py-12 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#E2E8F0]">
          {/* Brand & Mission */}
          <div className="flex flex-col gap-2 max-w-md">
            <Link href="/" className="flex items-center gap-2.5" aria-label="EduSelect Home">
              <div className="w-7 h-7 rounded-[6px] bg-[#1D4ED8] text-white flex items-center justify-center">
                <GraduationCapIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-[#0F172A]">
                Edu<span className="text-[#1D4ED8]">Select</span>
              </span>
            </Link>
            <p className="text-sm text-[#475569] leading-relaxed">
              A free career-guidance platform for Indian students. Discover step-by-step roadmaps, entrance exams, and verified colleges.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-[#475569]" aria-label="Footer Navigation">
            <Link href="/about-data" className="hover:text-[#1D4ED8] transition-colors">
              About
            </Link>
            <Link href="/about-data#sources" className="hover:text-[#1D4ED8] transition-colors">
              Data Sources
            </Link>
            <Link href="/about-data#contact" className="hover:text-[#1D4ED8] transition-colors">
              Contact
            </Link>
            <Link href="/about-data#privacy" className="hover:text-[#1D4ED8] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about-data#terms" className="hover:text-[#1D4ED8] transition-colors">
              Terms of Use
            </Link>
          </nav>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#64748B]">
          <p className="leading-relaxed">
            Information is collected from official websites. Always verify on the official site before applying.
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <span>© {new Date().getFullYear()} EduSelect. All rights reserved.</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0F172A] transition-colors"
              aria-label="GitHub"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
