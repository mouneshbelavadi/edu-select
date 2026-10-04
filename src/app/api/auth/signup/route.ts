import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';
import { createUser } from '@/lib/userStore';

export const dynamic = 'force-dynamic';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 20, 10 * 60 * 1000); // 20 attempts per 10 mins

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: { message: 'Too many signup requests. Please try again later.' } },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 1. Validate input payload
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            message: 'Validation failed',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    // 2. Create user (with duplicate validation & bcrypt hashing)
    try {
      const user = await createUser({
        name,
        email,
        password,
        role: 'USER',
      });

      return NextResponse.json(
        {
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
        },
        { status: 201 }
      );
    } catch (err: any) {
      if (err.message === 'Database not configured' || err.statusCode === 503) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
      }
      if (err.message.includes('already exists')) {
        return NextResponse.json(
          { error: { message: 'An account with this email address already exists' } },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error('Error in signup API:', error);
    return NextResponse.json(
      { error: { message: 'Failed to create account' } },
      { status: 500 }
    );
  }
}
