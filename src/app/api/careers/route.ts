import { NextRequest, NextResponse } from 'next/server';
import { searchCareers } from '@/lib/careers/repository';
import { careerSearchQuerySchema } from '@/lib/validation/careers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract all search params
    const rawParams: Record<string, any> = {};
    searchParams.forEach((val, key) => {
      // Handle comma-separated arrays or multi-keys
      if (['riasec', 'subjects', 'outlook', 'sector'].includes(key)) {
        rawParams[key] = val.includes(',') ? val.split(',').map((s) => s.trim()) : val;
      } else {
        rawParams[key] = val;
      }
    });

    // Normalize friendly level slugs to schema IDs
    const LEVEL_SLUG_MAP: Record<string, string> = {
      '10th': 'CLASS_10',
      '12th': 'CLASS_12',
      'iti': 'ITI',
      'diploma': 'DIPLOMA',
      'btech': 'UG_ENGG',
      'degree': 'UG_OTHER',
      'professional': 'PROFESSIONAL',
      'pg': 'PG',
    };
    if (rawParams.level && LEVEL_SLUG_MAP[rawParams.level.toLowerCase()]) {
      rawParams.level = LEVEL_SLUG_MAP[rawParams.level.toLowerCase()];
    }

    const parsed = careerSearchQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = searchCareers(parsed.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in /api/careers:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
