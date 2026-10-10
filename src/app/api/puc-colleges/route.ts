import { NextRequest, NextResponse } from 'next/server';
import pucData from '@/data/pucColleges.json';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const district = (searchParams.get('district') || '').trim();
    const management = (searchParams.get('management') || '').trim();
    const stream = (searchParams.get('stream') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '30', 10)));

    let filtered = pucData.colleges;

    if (district && district !== 'All') {
      filtered = filtered.filter(
        (c) => c.district.toLowerCase() === district.toLowerCase()
      );
    }

    if (management && management !== 'All') {
      filtered = filtered.filter((c) =>
        c.management.toLowerCase().includes(management.toLowerCase())
      );
    }

    if (stream && stream !== 'All') {
      filtered = filtered.filter((c) =>
        c.streams.some((s) => s.toLowerCase() === stream.toLowerCase())
      );
    }

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.code.toLowerCase().includes(search) ||
          c.address.toLowerCase().includes(search) ||
          c.district.toLowerCase().includes(search)
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const items = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      metadata: pucData.metadata,
    });
  } catch (error) {
    console.error('Error fetching PUC colleges:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch PUC colleges' } },
      { status: 500 }
    );
  }
}
