import { NextRequest, NextResponse } from 'next/server';
import { searchEngine } from '@/lib/search/searchEngine';
import { SearchDomain } from '@/lib/search/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = (searchParams.get('q') || searchParams.get('search') || '').trim();
    const domain = (searchParams.get('domain') || 'all') as SearchDomain;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const result = searchEngine.search(query, {
      domain,
      limit,
      page,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal search engine failure', details: error.message },
      { status: 500 }
    );
  }
}
