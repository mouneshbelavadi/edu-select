import { NextRequest, NextResponse } from 'next/server';
import { getCollegeByIdOrSlug } from '@/lib/collegeRepository';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: { message: 'College ID or slug is required' } },
        { status: 400 }
      );
    }

    const college = await getCollegeByIdOrSlug(id);

    if (!college) {
      return NextResponse.json(
        { error: { message: 'College not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: college });
  } catch (error) {
    console.error('Error fetching college detail:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch college details' } },
      { status: 500 }
    );
  }
}
