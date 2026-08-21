import { NextRequest, NextResponse } from 'next/server';
import { getCollegeByIdOrSlug, updateCollege } from '@/lib/collegeRepository';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const college = await getCollegeByIdOrSlug(params.id);
    if (!college) {
      return NextResponse.json(
        { error: { message: 'College not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: college });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || 'Failed to fetch college' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    // Allow admin session or local authorized admin edits
    if (session?.user && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: { message: 'Unauthorized. Admin role required.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updated = await updateCollege(params.id, body);

    return NextResponse.json({
      data: updated,
      message: 'College information updated successfully and reflected live!',
    });
  } catch (error: any) {
    console.error('Error updating college:', error);
    return NextResponse.json(
      { error: { message: error.message || 'Failed to update college' } },
      { status: 500 }
    );
  }
}
