import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ALL_INDIAN_STATES } from '@/lib/constants';
import collegesData from '@/data/colleges28States.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stateCounts = await db.college.groupBy({
      by: ['state'],
      _count: {
        id: true,
      },
    });

    if (stateCounts.length > 0) {
      const countsMap = new Map<string, number>();
      stateCounts.forEach((item) => {
        countsMap.set(item.state.toLowerCase(), item._count.id);
      });

      const statesWithCounts = ALL_INDIAN_STATES.map((state) => {
        const count = countsMap.get(state.toLowerCase()) || 0;
        return {
          name: state,
          collegeCount: count,
          slug: encodeURIComponent(state),
        };
      });

      return NextResponse.json({
        success: true,
        totalStates: ALL_INDIAN_STATES.length,
        data: statesWithCounts,
      });
    }
  } catch (error) {
    console.warn('DB state counts query failed, using 28-state Excel dataset counts');
  }

  // Authoritative counts directly from 28-state Excel dataset
  const countsMap = new Map<string, number>();
  (collegesData as any[]).forEach((c) => {
    const key = c.state.toLowerCase();
    countsMap.set(key, (countsMap.get(key) || 0) + 1);
  });

  const states = ALL_INDIAN_STATES.map((state) => ({
    name: state,
    collegeCount: countsMap.get(state.toLowerCase()) || 0,
    slug: encodeURIComponent(state),
  }));

  return NextResponse.json({
    success: true,
    totalStates: ALL_INDIAN_STATES.length,
    data: states,
  });
}
