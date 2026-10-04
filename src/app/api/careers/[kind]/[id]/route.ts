import { NextRequest, NextResponse } from 'next/server';
import { getCareerDetail } from '@/lib/careers/repository';
import { careerKindSchema } from '@/lib/validation/careers';

export const runtime = 'nodejs';
export const revalidate = 86400;

interface RouteProps {
  params: {
    kind: string;
    id: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteProps) {
  try {
    const { kind, id } = params;

    const kindParsed = careerKindSchema.safeParse(kind);
    if (!kindParsed.success) {
      return NextResponse.json(
        { success: false, error: `Invalid career kind: ${kind}` },
        { status: 400 }
      );
    }

    const detail = getCareerDetail(kindParsed.data, id);
    if (!detail) {
      return NextResponse.json(
        { success: false, error: `Career item not found: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: detail,
    });
  } catch (error) {
    console.error(`Error in /api/careers/${params?.kind}/${params?.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
