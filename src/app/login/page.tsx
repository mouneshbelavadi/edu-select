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
  const callbackUrl = searchParams.get('callbackUrl') || '/saved';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        router.push(callbackUrl);
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
          <div className="p-2 bg-surface-50 rounded text-surface-600 text-left font-mono text-[11px] mt-1">
            <strong>Demo Credentials:</strong>
            <br />
            Email: <code className="bg-surface-200 px-1 py-0.5 rounded">aarav.sharma@example.com</code>
            <br />
            Password: <code className="bg-surface-200 px-1 py-0.5 rounded">password123</code>
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
