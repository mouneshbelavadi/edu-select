'use client';

import React, { useState, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ShieldCheckIcon } from '@/components/ui/Icons';
import toast from 'react-hot-toast';
import { z } from 'zod';

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setAuthError('');

    const validation = adminLoginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    try {
      setIsLoading(true);
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setAuthError('Invalid administrator credentials');
        toast.error('Admin authentication failed');
      } else {
        toast.success('Admin authentication verified!');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setAuthError('An unexpected error occurred during admin authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-16 text-slate-100">
      <div className="max-w-md w-full flex flex-col gap-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ShieldCheckIcon className="w-6 h-6 text-slate-950" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            College<span className="text-amber-400">Discovery</span> <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">ADMIN</span>
          </span>
        </div>

        <Card className="w-full p-8 flex flex-col gap-6 bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-black text-white">Admin Console Login</h1>
            <p className="text-xs text-slate-400">Restricted portal for verified administrators only</p>
          </div>

          {authError && (
            <div className="p-3 bg-red-950/60 text-red-300 text-xs rounded-lg border border-red-800 text-center font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                placeholder="admin@collegediscovery.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="mt-3 w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-0"
            >
              Verify Admin Credentials →
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 border-t border-slate-800 pt-4 flex flex-col gap-2">
            <div className="p-3 bg-slate-950/80 rounded-lg text-slate-400 text-left font-mono text-[11px] border border-slate-800/80">
              <strong className="text-amber-400">Default Admin Credentials:</strong>
              <br />
              Email: <code className="text-slate-200">admin@collegediscovery.com</code>
              <br />
              Password: <code className="text-slate-200">Admin@123456</code>
            </div>

            <Link href="/" className="text-slate-400 hover:text-white mt-1">
              ← Return to Student Website
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-8 text-center">Loading Admin Portal...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
