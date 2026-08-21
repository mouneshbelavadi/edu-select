import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getSavedCollegesForUser,
  saveCollegeForUser,
  removeSavedCollegeForUser,
} from '@/lib/savedStore';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const savedCollegeSchema = z.object({
  collegeId: z.string().min(1, 'College ID is required'),
});

// GET: Return all colleges saved by the current user
export async function GET() {
  try {
    const session = await getSession();
    const userId = session?.user?.id || 'guest-user-1';

    const colleges = await getSavedCollegesForUser(userId);
    return NextResponse.json({ data: colleges });
  } catch (error) {
    console.error('Error fetching saved colleges:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch saved colleges' } },
      { status: 500 }
    );
  }
}

// POST: Save a college for the current user
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.user?.id || 'guest-user-1';

    const body = await request.json();
    const validationResult = savedCollegeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: { message: 'Invalid request body', details: validationResult.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { collegeId } = validationResult.data;
    const result = await saveCollegeForUser(userId, collegeId);

    return NextResponse.json({ data: result, message: 'College saved successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error saving college:', error);
    return NextResponse.json(
      { error: { message: error.message || 'Failed to save college' } },
      { status: 400 }
    );
  }
}

// DELETE: Remove a saved college record for the current user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.user?.id || 'guest-user-1';

    const body = await request.json();
    const validationResult = savedCollegeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: { message: 'Invalid request body', details: validationResult.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { collegeId } = validationResult.data;
    await removeSavedCollegeForUser(userId, collegeId);

    return NextResponse.json({ message: 'College removed from saved list' });
  } catch (error) {
    console.error('Error deleting saved college:', error);
    return NextResponse.json(
      { error: { message: 'Failed to remove saved college' } },
      { status: 500 }
    );
  }
}
