import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getSavedComparisonsForUser,
  saveComparisonForUser,
  removeSavedComparisonForUser,
} from '@/lib/savedStore';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const saveComparisonSchema = z.object({
  name: z.string().min(1, 'Comparison name is required'),
  collegeIds: z.array(z.string()).min(2, 'At least 2 colleges required'),
});

const deleteComparisonSchema = z.object({
  id: z.string().min(1, 'Comparison ID is required'),
});

export async function GET() {
  try {
    const session = await getSession();
    const userId = session?.user?.id || 'guest-user-1';

    const comparisons = await getSavedComparisonsForUser(userId);
    return NextResponse.json({ data: comparisons });
  } catch (error) {
    console.error('Error fetching saved comparisons:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch comparisons' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.user?.id || 'guest-user-1';

    const body = await request.json();
    const validationResult = saveComparisonSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: { message: 'Invalid data', details: validationResult.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { name, collegeIds } = validationResult.data;
    const comparison = await saveComparisonForUser(userId, name, collegeIds);

    return NextResponse.json({ data: comparison }, { status: 201 });
  } catch (error) {
    console.error('Error saving comparison:', error);
    return NextResponse.json(
      { error: { message: 'Failed to save comparison' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.user?.id || 'guest-user-1';

    const body = await request.json();
    const validationResult = deleteComparisonSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: { message: 'Comparison ID required' } },
        { status: 400 }
      );
    }

    const { id } = validationResult.data;
    await removeSavedComparisonForUser(userId, id);

    return NextResponse.json({ message: 'Comparison deleted successfully' });
  } catch (error) {
    console.error('Error deleting comparison:', error);
    return NextResponse.json(
      { error: { message: 'Failed to delete comparison' } },
      { status: 500 }
    );
  }
}
