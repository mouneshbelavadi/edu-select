'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { GraduationCapIcon, SearchIcon, SparklesIcon, ScaleIcon } from '@/components/ui/Icons';
import { useCompareStore } from '@/lib/store/useCompareStore';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { selectedColleges } = useCompareStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close mobile menu on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowSearchModal(false);
    setIsExploreOpen(false);
  }, [pathname]);

  // Handle outside click and escape key to close dropdown cleanly
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setIsExploreOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExploreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleExploreMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsExploreOpen(true);
  };

  const handleExploreMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsExploreOpen(false);
    }, 180);
  };

  const handleExploreToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsExploreOpen((prev) => !prev);
  };

  // Do not render student Navbar inside the Admin Portal
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const isExploreActive = pathname.startsWith('/careers') || pathname.startsWith('/pathways') || pathname.startsWith('/states');

  // Complete, fully-featured navigation links
  const mobileNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/colleges', label: 'Colleges' },
    { href: '/careers', label: 'Careers' },
    { href: '/pathways', label: 'Pathways' },
    { href: '/states', label: 'Exams' },
    { href: '/compare', label: 'Compare', count: selectedColleges.length },
    { href: '/kcet-2026-predictor', label: 'KCET Predictor', highlight: true },
    { href: '/ai-counsellor', label: 'AI Counsellor', pill: 'AI' },
    { href: '/telegram', label: 'Telegram Bot', pill: 'Bot' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/colleges?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchModal(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E2A78] rounded-md shrink-0 mr-2"
            aria-label="EduSelect Home"
          >
            <div className="w-8 h-8 rounded-[8px] bg-ink text-white flex items-center justify-center shadow-xs">
              <GraduationCapIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#0F172A]">
              Edu<span className="text-ink">Select</span>
            </span>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ink ${
                pathname === '/'
                  ? 'text-ink font-bold bg-blue-50/60'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-50'
              }`}
            >
              Home
            </Link>

            <Link
              href="/colleges"
              className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ink ${
                pathname.startsWith('/colleges')
                  ? 'text-ink font-bold bg-blue-50/60'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-50'
              }`}
            >
              Colleges
            </Link>

            {/* Explore Grouped Dropdown */}
            <div
              ref={exploreRef}
              className="relative"
              onMouseEnter={handleExploreMouseEnter}
              onMouseLeave={handleExploreMouseLeave}
            >
              <button
                type="button"
                onClick={handleExploreToggle}
                aria-expanded={isExploreOpen}
                aria-haspopup="true"
                className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-ink cursor-pointer ${
                  isExploreActive || isExploreOpen
                    ? 'text-ink font-bold bg-blue-50/60'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-50'
                }`}
              >
                <span>Explore</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isExploreOpen ? 'rotate-180 text-ink' : 'text-slate-400'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExploreOpen && (
                <div className="absolute top-full left-0 pt-1.5 w-48 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-lg shadow-blue-950/10 py-1.5 overflow-hidden">
                    <Link
                      href="/careers"
                      onClick={() => setIsExploreOpen(false)}
                      className={`block px-3.5 py-2 text-xs font-medium transition-colors ${
                        pathname.startsWith('/careers')
                          ? 'text-ink font-bold bg-blue-50/60'
                          : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-50'
                      }`}
                    >
                      Careers
                    </Link>
                    <Link
                      href="/pathways"
                      onClick={() => setIsExploreOpen(false)}
                      className={`block px-3.5 py-2 text-xs font-medium transition-colors ${
                        pathname.startsWith('/pathways')
                          ? 'text-ink font-bold bg-blue-50/60'
                          : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-50'
                      }`}
                    >
                      Pathways
                    </Link>
                    <Link
                      href="/states"
                      onClick={() => setIsExploreOpen(false)}
                      className={`block px-3.5 py-2 text-xs font-medium transition-colors ${
                        pathname.startsWith('/states')
                          ? 'text-ink font-bold bg-blue-50/60'
                          : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-50'
                      }`}
                    >
                      Entrance Exams
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/compare"
              className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-ink ${
                pathname.startsWith('/compare')
                  ? 'text-ink font-bold bg-blue-50/60'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-50'
              }`}
            >
              <span>Compare</span>
              {selectedColleges.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-ink text-white leading-none">
                  {selectedColleges.length}
                </span>
              )}
            </Link>

            <Link
              href="/kcet-2026-predictor"
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 border ${
                pathname === '/kcet-2026-predictor'
                  ? 'bg-ink text-white border-ink'
                  : 'bg-blue-50 text-ink border-blue-200 hover:bg-blue-100 hover:border-blue-300'
              }`}
            >
              <span>KCET Predictor</span>
            </Link>

            <Link
              href="/ai-counsellor"
              className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-ink ${
                pathname.startsWith('/ai-counsellor')
                  ? 'text-ink font-bold bg-blue-50/60'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-50'
              }`}
            >
              <span>AI Counsellor</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-marigold/20 text-[#B26E00] leading-none">
                AI
              </span>
            </Link>

            <Link
              href="/telegram"
              className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-ink ${
                pathname.startsWith('/telegram')
                  ? 'text-ink font-bold bg-blue-50/60'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-50'
              }`}
            >
              <svg className="w-3.5 h-3.5 text-[#24A1DE]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z" />
              </svg>
              <span>Telegram</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#24A1DE]/15 text-[#0088cc] leading-none">
                Bot
              </span>
            </Link>
          </nav>

          {/* Right: Search, Auth & Mobile Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Search Button */}
            <button
              type="button"
              onClick={() => setShowSearchModal(true)}
              className="p-2 rounded-[8px] text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
              title="Search Colleges, Courses, Exams"
              aria-label="Search"
            >
              <SearchIcon className="w-4 h-4 text-[#475569]" />
            </button>

            {/* Desktop Auth */}
            <div className="hidden sm:flex items-center gap-2">
              {status === 'loading' ? (
                <div className="w-16 h-8 bg-slate-100 rounded-[8px] animate-pulse" />
              ) : session?.user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/saved"
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-[8px] border transition-colors ${
                      pathname === '/saved'
                        ? 'border-[#1D4ED8] text-[#1D4ED8] bg-blue-50/50'
                        : 'border-[#E2E8F0] text-[#0F172A] hover:border-slate-300'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#1D4ED8] text-white font-bold text-[10px] flex items-center justify-center">
                      {session.user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="max-w-[80px] truncate">{session.user.name?.split(' ')[0]}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-2.5 py-1.5 rounded-[8px] border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:text-[#1D4ED8] rounded-[8px] transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-[8px] transition-colors shadow-xs"
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
              className="p-2 rounded-[8px] text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 lg:hidden focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E2E8F0] px-4 pt-2 pb-6 flex flex-col gap-2">
            <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
              {mobileNavLinks.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-[8px] text-sm font-semibold transition-colors flex items-center justify-between ${
                      isActive ? 'text-[#1D4ED8] bg-blue-50/60 font-bold' : 'text-[#475569] hover:bg-slate-50'
                    }`}
                  >
                    <span>{link.label}</span>
                    {typeof link.count === 'number' && link.count > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#1D4ED8] text-white">
                        {link.count}
                      </span>
                    )}
                    {link.pill && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#1D4ED8]">
                        {link.pill}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[#E2E8F0] pt-4 mt-2">
              {session?.user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/saved"
                    className="px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 rounded-[8px] flex items-center justify-between"
                  >
                    <span>My Dashboard & Saved Colleges</span>
                  </Link>
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

      {/* Quick Database Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-[12px] p-6 w-full max-w-xl shadow-xl border border-[#E2E8F0] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-[#0F172A] text-base flex items-center gap-2">
                <SearchIcon className="w-5 h-5 text-[#1D4ED8]" />
                <span>Search EduSelect Database</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] text-lg font-bold p-1"
                aria-label="Close search"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Search college name, course (e.g. CSE), or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-[8px] text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm rounded-[8px] transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
