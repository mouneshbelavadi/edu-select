'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import {
  ShieldCheckIcon,
  UsersIcon,
  MapPinIcon,
  LightningIcon,
  CompassIcon,
} from '@/components/ui/Icons';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [email, setEmail] = useState('admin@collegediscovery.com');
  const [password, setPassword] = useState('Admin@123456');
  const [isLoading, setIsLoading] = useState(false);

  const { data: usersData } = useSWR(
    isAdmin ? '/api/admin/users' : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error('Invalid admin email or password');
      } else {
        toast.success('Admin authenticated successfully!');
        window.location.reload();
      }
    } catch {
      toast.error('An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  // If not logged in as Admin, show dedicated Admin Sign In directly on http://localhost:3000/admin
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 flex flex-col gap-6">
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
            <ShieldCheckIcon className="w-6 h-6 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Administrator Portal</h1>
          <p className="text-xs text-slate-500">
            Sign in to access platform management and real-time user activity
          </p>
        </div>

        <Card className="p-6 bg-white border-slate-200 shadow-xl rounded-2xl flex flex-col gap-4">
          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-md mt-2 cursor-pointer"
            >
              Sign In to Admin Dashboard →
            </Button>
          </form>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
            <div>
              <span className="font-bold block mb-0.5">Default Admin Credentials:</span>
              <span className="font-mono">admin@collegediscovery.com / Admin@123456</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@collegediscovery.com');
                setPassword('Admin@123456');
              }}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] transition-colors cursor-pointer shrink-0 ml-2 shadow-xs"
            >
              Auto-fill
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Admin Dashboard Content when authenticated
  const totalUsers = usersData?.totalUsers || 0;
  const recentUsers = (usersData?.data || []).slice(0, 5);

  const stats = [
    {
      title: 'Registered Users',
      value: totalUsers.toString(),
      subtext: 'Active accounts in database',
      icon: UsersIcon,
      href: '/admin/users',
      badge: 'Live Sync',
    },
    {
      title: '28 States Dataset',
      value: '28 States / 580 Colleges',
      subtext: 'Authoritative Ingested Data',
      icon: MapPinIcon,
      href: '/admin/states',
      badge: 'Browse & Edit',
    },
    {
      title: 'KCET 2026 Engine',
      value: 'Online',
      subtext: 'KEA 50:50 Composite Model',
      icon: LightningIcon,
      href: '/kcet-2026-predictor',
      badge: 'Active',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Admin Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Active Console
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time monitoring, 28-state database, and college editing center.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/states"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <MapPinIcon className="w-3.5 h-3.5" />
            <span>28 States Dataset →</span>
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Manage Users (Live) →
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="p-5 bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col gap-3 group rounded-2xl h-full justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{stat.title}</span>
                  <StatIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {stat.value}
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-slate-500">{stat.subtext}</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {stat.badge}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Featured 28 States Dataset Banner */}
      <Link href="/admin/states" className="group">
        <Card className="p-6 bg-gradient-to-r from-indigo-50/80 via-white to-amber-50/50 border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <CompassIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Full Nationwide Database & Editor
              </span>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors mt-0.5 flex items-center gap-1.5">
                <MapPinIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>28 States Dataset & College Management</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1 max-w-xl">
                Click to explore all 28 Indian states. Select any state (e.g. Karnataka, Maharashtra, Tamil Nadu) to view all its colleges, search branches, and edit records in real time.
              </p>
            </div>
          </div>
          <span className="px-5 py-2.5 bg-indigo-600 group-hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition-colors shrink-0">
            Open 28 States →
          </span>
        </Card>
      </Link>

      {/* Recent Users Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <LightningIcon className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Recent User Registrations (3s Live Sync)</span>
          </h2>
          <Link href="/admin/users" className="text-xs font-bold text-indigo-600 hover:underline">
            View All Users ({totalUsers}) →
          </Link>
        </div>

        <Card className="bg-white border-slate-200 divide-y divide-slate-100 overflow-hidden rounded-2xl shadow-sm">
          {recentUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading user activity...</div>
          ) : (
            recentUsers.map((u: any) => (
              <div
                key={u.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      u.role === 'ADMIN' ? 'bg-amber-500 text-slate-950' : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {u.name[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{u.name}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{u.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                    }`}
                  >
                    {u.role}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Joined {new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
