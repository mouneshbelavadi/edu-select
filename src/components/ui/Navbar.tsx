'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Do not render student Navbar inside the Admin Portal
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/colleges', label: 'Colleges' },
    { href: '/careers', label: 'Careers', pill: 'New' },
    { href: '/states', label: 'Exams & States' },
    { href: '/compare', label: 'Compare' },
    { href: '/kcet-2026-predictor', label: 'Predictor', highlight: true },
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
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Logo & Slogan */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              🎓
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Edu<span className="text-blue-600">Select</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-tight">
                Colleges · Careers · Exams
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    link.highlight
                      ? 'text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full font-bold border border-blue-200 hover:bg-blue-100'
                      : isActive
                      ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-0.5'
                      : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.pill && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-600 text-white leading-none">
                      {link.pill}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search, Auth & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Icon Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Search Colleges, Courses, Exams"
              aria-label="Search"
            >
              🔍
            </button>

            {/* Desktop Auth */}
            <div className="hidden sm:flex items-center gap-2">
              {status === 'loading' ? (
                <div className="w-20 h-9 bg-slate-200 animate-pulse rounded-xl" />
              ) : session?.user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/saved"
                    title="My Dashboard"
                    className={`flex items-center gap-2 text-sm text-slate-800 bg-slate-50 hover:bg-blue-50/80 border ${
                      pathname === '/saved'
                        ? 'border-blue-500 bg-blue-50/90 text-blue-700 font-bold ring-2 ring-blue-200'
                        : 'border-slate-200 hover:border-blue-300'
                    } px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs group`}
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600 group-hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {session.user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="font-semibold max-w-[110px] truncate group-hover:text-blue-600 transition-colors">
                      {session.user.name}
                    </span>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs px-2.5 py-1.5"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <button className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
                      Login
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 md:hidden transition-colors"
              aria-label="Toggle Navigation Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 flex flex-col gap-3 shadow-lg">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.pill && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white">
                        {link.pill}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              {session?.user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/saved"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-slate-800 text-sm font-bold"
                  >
                    <span>★ My Dashboard</span>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full text-xs"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 text-center text-xs font-bold text-slate-700 border border-slate-300 rounded-xl"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 text-center text-xs font-bold text-white bg-blue-600 rounded-xl"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>🔍</span> Search EduSelect Database
              </h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Type college name, course (e.g. CSE), or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors"
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
