import { NextRequest, NextResponse } from 'next/server';
import { getExam } from '@/lib/careers/repository';

export const runtime = 'nodejs';
export const revalidate = 86400;

interface RouteProps {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = params;
    const exam = getExam(id);

    if (!exam) {
      return NextResponse.json(
        { success: false, error: `Exam not found: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: exam,
    });
  } catch (error) {
    console.error(`Error in /api/exams/${params?.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
