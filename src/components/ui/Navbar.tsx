'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { GraduationCapIcon, SparklesIcon } from '@/components/ui/Icons';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isCollegesDropdownOpen, setIsCollegesDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const collegesRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setIsAvatarOpen(false);
      }
      if (collegesRef.current && !collegesRef.current.contains(event.target as Node)) {
        setIsCollegesDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAvatarOpen(false);
    setIsCollegesDropdownOpen(false);
  }, [pathname]);

  // Do not render student Navbar inside the Admin Portal
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Exactly 5 main navigation items per design specification
  const primaryNavItems = [
    { href: '/colleges', label: 'Colleges', hasDropdown: true },
    { href: '/careers', label: 'Careers' },
    { href: '/states', label: 'Exams' },
    { href: '/compare', label: 'Compare' },
    { href: '/ai-counsellor', label: 'AI Counsellor' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] rounded-md"
          aria-label="EduSelect Home"
        >
          <div className="w-8 h-8 rounded-[8px] bg-[#1D4ED8] text-white flex items-center justify-center">
            <GraduationCapIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#0F172A]">
            Edu<span className="text-[#1D4ED8]">Select</span>
          </span>
        </Link>

        {/* Desktop Navigation (Max 5 items) */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
          {primaryNavItems.map((item) => {
            const isActive =
              item.href === '/colleges'
                ? pathname.startsWith('/colleges') || pathname.startsWith('/kcet-2026-predictor')
                : pathname.startsWith(item.href);

            if (item.hasDropdown) {
              return (
                <div key={item.href} className="relative" ref={collegesRef}>
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      className={`px-3 py-2 rounded-[6px] text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                        isActive
                          ? 'text-[#1D4ED8] font-bold'
                          : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsCollegesDropdownOpen(!isCollegesDropdownOpen)}
                      className="p-1 text-[#475569] hover:text-[#0F172A] rounded focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
                      aria-label="Toggle Colleges menu"
                      aria-expanded={isCollegesDropdownOpen}
                    >
                      <svg
                        className={`w-3.5 h-3.5 transition-transform ${isCollegesDropdownOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  {isCollegesDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-56 bg-white rounded-[10px] border border-[#E2E8F0] shadow-sm py-1.5 z-50">
                      <Link
                        href="/colleges"
                        className="block px-4 py-2 text-sm text-[#0F172A] hover:bg-slate-50 font-medium"
                      >
                        Explore 455 Colleges
                      </Link>
                      <Link
                        href="/kcet-2026-predictor"
                        className="block px-4 py-2 text-sm text-[#0F172A] hover:bg-slate-50 font-medium"
                      >
                        KCET 2026 Predictor
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-[6px] text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                  isActive
                    ? 'text-[#1D4ED8] font-bold'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Account Area / Login & Sign Up */}
        <div className="hidden md:flex items-center gap-3">
          {status === 'loading' ? (
            <div className="w-20 h-9 bg-slate-100 rounded-[8px] animate-pulse" />
          ) : session?.user ? (
            <div className="relative" ref={avatarRef}>
              <button
                type="button"
                onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-[8px] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
                aria-label="User account menu"
                aria-expanded={isAvatarOpen}
              >
                <div className="w-7 h-7 rounded-full bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center">
                  {session.user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-semibold text-[#0F172A] max-w-[100px] truncate">
                  {session.user.name?.split(' ')[0] || 'Account'}
                </span>
                <svg className="w-3 h-3 text-[#64748B]" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isAvatarOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-[10px] border border-[#E2E8F0] shadow-sm py-1.5 z-50">
                  <div className="px-3.5 py-2 border-b border-[#E2E8F0]">
                    <p className="text-xs font-bold text-[#0F172A] truncate">{session.user.name}</p>
                    <p className="text-[11px] text-[#64748B] truncate">{session.user.email}</p>
                  </div>
                  <Link
                    href="/pathways"
                    className="block px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                  >
                    My Roadmap
                  </Link>
                  <Link
                    href="/saved"
                    className="block px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                  >
                    Saved Colleges & Bookmarks
                  </Link>
                  <Link
                    href="/kcet-2026-predictor"
                    className="block px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                  >
                    KCET 2026 Predictor
                  </Link>
                  <div className="border-t border-[#E2E8F0] my-1" />
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 text-sm font-semibold text-[#0F172A] hover:text-[#1D4ED8] rounded-[8px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-[8px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-[8px] text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 md:hidden focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E2E8F0] px-4 pt-2 pb-6 flex flex-col gap-2">
          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            {primaryNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2.5 rounded-[8px] text-base font-semibold transition-colors ${
                    isActive ? 'text-[#1D4ED8] bg-blue-50/60 font-bold' : 'text-[#475569] hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/kcet-2026-predictor"
              className="px-3 py-2.5 rounded-[8px] text-base font-semibold text-[#475569] hover:bg-slate-50"
            >
              KCET 2026 Predictor
            </Link>
            {session?.user && (
              <Link
                href="/pathways"
                className="px-3 py-2.5 rounded-[8px] text-base font-semibold text-[#475569] hover:bg-slate-50"
              >
                My Roadmap
              </Link>
            )}
          </nav>

          <div className="border-t border-[#E2E8F0] pt-4 mt-2">
            {session?.user ? (
              <div className="flex flex-col gap-2">
                <div className="px-3 text-xs text-[#64748B]">
                  Logged in as <span className="font-bold text-[#0F172A]">{session.user.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-[8px]"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="py-2.5 text-center text-sm font-semibold text-[#0F172A] border border-[#E2E8F0] rounded-[8px] hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="py-2.5 text-center text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-[8px]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
