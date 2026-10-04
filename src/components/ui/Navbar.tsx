'use client';

import React, { useState, useEffect } from 'react';
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

  // Close mobile menu on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowSearchModal(false);
  }, [pathname]);

  // Do not render student Navbar inside the Admin Portal
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Complete, fully-featured navigation links
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/colleges', label: 'Colleges' },
    { href: '/careers', label: 'Careers' },
    { href: '/pathways', label: 'Pathways' },
    { href: '/states', label: 'Exams' },
    { href: '/compare', label: 'Compare', count: selectedColleges.length },
    { href: '/kcet-2026-predictor', label: 'KCET Predictor', highlight: true },
    { href: '/ai-counsellor', label: 'AI Counsellor', pill: 'AI' },
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
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Left: Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] rounded-md shrink-0 mr-2"
            aria-label="EduSelect Home"
          >
            <div className="w-8 h-8 rounded-[8px] bg-[#1D4ED8] text-white flex items-center justify-center shadow-xs">
              <GraduationCapIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#0F172A]">
              Edu<span className="text-[#1D4ED8]">Select</span>
            </span>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

              if (link.highlight) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 border ${
                      isActive
                        ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                        : 'bg-blue-50 text-[#1D4ED8] border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 rounded-[6px] text-xs font-semibold transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#1D4ED8] ${
                    isActive
                      ? 'text-[#1D4ED8] font-bold bg-blue-50/50'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {typeof link.count === 'number' && link.count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#1D4ED8] text-white leading-none">
                      {link.count}
                    </span>
                  )}
                  {link.pill && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-[#1D4ED8] leading-none">
                      {link.pill}
                    </span>
                  )}
                </Link>
              );
            })}
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
              {navLinks.map((link) => {
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
