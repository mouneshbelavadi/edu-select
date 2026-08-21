import { NextRequest, NextResponse } from 'next/server';
import { collegeQuerySchema } from '@/lib/validation/college';
import { getColleges } from '@/lib/collegeRepository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const rawParams = {
      search: searchParams.get('search') || undefined,
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      type: searchParams.get('type') || undefined,
      minFees: searchParams.get('minFees') || undefined,
      maxFees: searchParams.get('maxFees') || undefined,
      minRating: searchParams.get('minRating') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const validationResult = collegeQuerySchema.safeParse(rawParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid query parameters',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const result = await getColleges(validationResult.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch colleges' } },
      { status: 500 }
    );
  }
}
