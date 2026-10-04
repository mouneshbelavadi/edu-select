'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitCallback = searchParams.get('callbackUrl');

  const [email, setEmail] = useState('aarav.sharma@example.com');
  const [password, setPassword] = useState('password123');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setAuthError('');

    // 1. Client-side Zod validation
    const validation = loginSchema.safeParse({ email, password });
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
        setAuthError('Invalid email or password credentials');
        toast.error('Login failed');
      } else {
        toast.success('Successfully logged in!');
        if (explicitCallback) {
          router.push(explicitCallback);
        } else {
          // If profile not yet set, direct to onboarding with later option; otherwise saved dashboard
          const hasProfile = typeof window !== 'undefined' && localStorage.getItem('student_profile');
          router.push(hasProfile ? '/saved' : '/onboarding');
        }
        router.refresh();
      }
    } catch {
      setAuthError('An unexpected error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center">
      <Card className="w-full p-8 flex flex-col gap-6 shadow-lg">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-bold text-surface-900">Welcome Back</h1>
          <p className="text-sm text-surface-500">Sign in to your EduSelect account</p>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 text-center font-medium">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. aarav.sharma@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="mt-2 w-full">
            Log In →
          </Button>
        </form>

        <div className="text-center text-xs text-surface-500 border-t border-surface-100 pt-4 flex flex-col gap-2">
          <span>
            Don't have an account?{' '}
            <Link href="/signup" className="text-brand-600 font-semibold hover:underline">
              Sign Up
            </Link>
          </span>
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-slate-700 text-left text-xs mt-1 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">Demo Credentials:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('aarav.sharma@example.com');
                  setPassword('password123');
                  setAuthError('');
                }}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-md transition-colors cursor-pointer"
              >
                Auto-fill Student
              </button>
            </div>
            <div className="font-mono text-[11px] text-slate-600 flex flex-col gap-0.5">
              <div>
                Email: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-semibold text-slate-800">aarav.sharma@example.com</code>
              </div>
              <div>
                Password: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-semibold text-slate-800">password123</code>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading login form...</div>}>
      <LoginForm />
    </Suspense>
  );
}
