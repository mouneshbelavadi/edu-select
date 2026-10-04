import { NextResponse } from 'next/server';
import { getTaxonomy } from '@/lib/careers/repository';

export const runtime = 'nodejs';
export const revalidate = 86400;

export async function GET() {
  try {
    const taxonomy = getTaxonomy();
    return NextResponse.json({
      success: true,
      data: taxonomy,
    });
  } catch (error) {
    console.error('Error in /api/careers/taxonomy:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
