import { NextRequest, NextResponse } from 'next/server';
import { getCollegeByIdOrSlug, CollegeDetail } from '@/lib/collegeRepository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const idsParam = request.nextUrl.searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ data: [] });
    }

    const ids = idsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    const colleges: CollegeDetail[] = [];
    for (const id of ids.slice(0, 4)) {
      const college = await getCollegeByIdOrSlug(id);
      if (college && !colleges.some((c) => c.id === college.id)) {
        colleges.push(college);
      }
    }

    return NextResponse.json({ data: colleges });
  } catch (error) {
    console.error('Error comparing colleges:', error);
    return NextResponse.json(
      { error: { message: 'Failed to compare colleges' } },
      { status: 500 }
    );
  }
}
