'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  // If not logged in as Admin, show ONLY children (the centered login view)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        {children}
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: '📊 Dashboard Overview', exact: true },
    { href: '/admin/users', label: '👥 Registered Users (Live)', exact: false },
    { href: '/admin/states', label: '📍 28 States Dataset', exact: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      {/* Light Theme Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="p-5 flex flex-col gap-6">
          {/* Logo & Admin Badge */}
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
              🎓
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-slate-900 leading-tight">Admin Console</span>
              <span className="text-[10px] text-blue-700 font-mono tracking-wider uppercase font-bold">
                EduSelect v2.0
              </span>
            </div>
          </Link>

          {/* Real-Time Live Sync Status Indicator */}
          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Live DB Sync (3s Polling)</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin User Footer & Signout */}
        <div className="p-5 border-t border-slate-200 flex flex-col gap-3 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center border border-blue-200">
              {session?.user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-slate-900 truncate">
                {session?.user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono truncate">
                {session?.user?.email || 'admin@collegediscovery.com'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
            <Link href="/" className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline">
              Student View →
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin' })}
              className="text-xs text-red-600 hover:text-red-700 font-bold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-slate-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
