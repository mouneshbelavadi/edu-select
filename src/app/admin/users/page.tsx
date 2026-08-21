'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  lastLoginAt: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // SWR Polling every 3000ms (3 seconds) for real-time live updates
  const { data, error, isLoading, isValidating } = useSWR(
    '/api/admin/users',
    fetcher,
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
    }
  );

  const users: AdminUser[] = data?.data || [];
  const totalUsers = data?.totalUsers || users.length;

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header with Live Sync Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Registered Users</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {totalUsers} Total Accounts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time live synchronization from user records (polling every 3s).
          </p>
        </div>

        {/* Live sync indicator */}
        <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isValidating ? 'bg-amber-500 animate-spin' : 'bg-emerald-500'
            }`}
          />
          <span className="text-slate-700 font-semibold font-mono">
            {isValidating ? 'Syncing new signups...' : 'Live Synced'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Filter users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
        />

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredUsers.length} of {totalUsers} accounts
        </span>
      </div>

      {/* Users Table in Light Theme */}
      <Card className="bg-white border-slate-200 overflow-hidden shadow-sm rounded-2xl">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600 text-sm">
            Failed to load users list. Please check your admin session.
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No registered users found matching "{searchTerm}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          user.role === 'ADMIN'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {user.name[0]?.toUpperCase() || 'U'}
                      </div>
                      <span>{user.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono">
                      {user.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          user.role === 'ADMIN'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {user.lastLoginAt ? (
                        <span className="text-emerald-700 font-bold">
                          {new Date(user.lastLoginAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                          ,{' '}
                          {new Date(user.lastLoginAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Never logged in</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
