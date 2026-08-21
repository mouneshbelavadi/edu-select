import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listAllUsers } from '@/lib/userStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Enforce server-side ADMIN role authorization
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: { message: 'Unauthorized. Admin privileges required.' } },
        { status: 403 }
      );
    }

    const users = await listAllUsers();

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      timestamp: new Date().toISOString(),
      data: users,
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch users list' } },
      { status: 500 }
    );
  }
}
