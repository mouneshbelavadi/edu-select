import { NextRequest, NextResponse } from 'next/server';
import medicalData from '@/data/karnatakaMedicalSeats.json';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const discipline = (searchParams.get('discipline') || '').trim();
    const management = (searchParams.get('management') || '').trim();
    const city = (searchParams.get('city') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '30', 10)));

    let filtered = medicalData.institutes;

    if (discipline && discipline !== 'All') {
      filtered = filtered.filter(
        (c) => c.discipline.toLowerCase() === discipline.toLowerCase()
      );
    }

    if (management && management !== 'All') {
      filtered = filtered.filter((c) =>
        c.managementType.toLowerCase().includes(management.toLowerCase())
      );
    }

    if (city && city !== 'All') {
      filtered = filtered.filter((c) =>
        c.city.toLowerCase() === city.toLowerCase()
      );
    }

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.code.toLowerCase().includes(search) ||
          c.city.toLowerCase().includes(search) ||
          c.course.toLowerCase().includes(search)
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
      metadata: medicalData.metadata,
    });
  } catch (error) {
    console.error('Error fetching medical colleges:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch medical colleges' } },
      { status: 500 }
    );
  }
}
