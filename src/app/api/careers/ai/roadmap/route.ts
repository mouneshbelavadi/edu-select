import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCareerDetail } from '@/lib/careers/repository';
import { generateJson, isGeminiConfigured } from '@/lib/ai/gemini';
import { careerKindSchema } from '@/lib/validation/careers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  kind: careerKindSchema,
  id: z.string(),
});

interface RoadmapStep {
  yearOrPhase: string;
  focus: string;
  keyMilestones: string[];
  skillsOrCertifications: string[];
  tips: string;
}

interface RoadmapResponse {
  careerTitle: string;
  phases: RoadmapStep[];
  ultimateGoal: string;
}

function buildFallbackRoadmap(detail: any): RoadmapResponse {
  const item = detail.item as any;
  const name = item.name || item.qualification || item.exam;

  return {
    careerTitle: name,
    phases: [
      {
        yearOrPhase: 'Phase 1: Foundation & Entrance (Year 1)',
        focus: 'Core subject mastery and qualifying examinations',
        keyMilestones: [
          'Master fundamental syllabus and prerequisite concepts',
          detail.resolvedEntranceExams?.length
            ? `Prepare target entrance exam: ${detail.resolvedEntranceExams[0]?.name}`
            : 'Maintain minimum cutoff percentage in qualifying exams',
          'Explore early internships or lab practice',
        ],
        skillsOrCertifications: ['Basic problem solving', 'Domain fundamentals'],
        tips: 'Focus heavily on first-principles understanding rather than rote memorization.',
      },
      {
        yearOrPhase: 'Phase 2: Core Competencies (Year 2–3)',
        focus: 'Hands-on projects, industry certifications, and internships',
        keyMilestones: [
          'Complete at least two major industry or academic projects',
          'Participate in hackathons, symposiums or state competitive trials',
          'Build strong peer networks and mentor relationships',
        ],
        skillsOrCertifications: ['Technical proficiency', 'Communication & team delivery'],
        tips: 'Identify one niche domain to specialize in ahead of final placements.',
      },
      {
        yearOrPhase: 'Phase 3: Transition & Launch (Final Year)',
        focus: 'Campus placement drives, government exams, or higher degree applications',
        keyMilestones: [
          'Appear for campus placement interviews or public recruitment tests',
          'Prepare technical portfolio and competitive aptitude',
          'Secure offer letter or postgraduate admission',
        ],
        skillsOrCertifications: ['Interview presentation', 'Aptitude & reasoning'],
        tips: 'Target both high-probability offers and dream opportunities simultaneously.',
      },
      {
        yearOrPhase: 'Phase 4: Senior Trajectory (In 5 Years)',
        focus: 'Leadership, specialized consulting, or executive growth',
        keyMilestones: [
          'Reach senior engineer / officer / associate grade',
          'Lead technical delivery or regional departmental operations',
          'Mentor junior inductees and expand industry influence',
        ],
        skillsOrCertifications: ['Project governance', 'Cross-functional leadership'],
        tips: 'Continuously upskill as market technologies and governmental frameworks evolve.',
      },
    ],
    ultimateGoal: `Become an established and accomplished professional in ${name}.`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input parameters', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { kind, id } = parsed.data;
    const detail = getCareerDetail(kind, id);
    if (!detail) {
      return NextResponse.json({ success: false, error: 'Career item not found' }, { status: 404 });
    }

    const fallbackRoadmap = buildFallbackRoadmap(detail);

    if (!isGeminiConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          fallback: true,
          model: 'rule-based',
          generatedAt: new Date().toISOString(),
          ...fallbackRoadmap,
        },
      });
    }

    const item = detail.item as any;
    const prompt = `
Create a realistic 4-phase year-by-year progression roadmap for an Indian student entering:
Title: ${item.name || item.qualification || item.exam}
Kind: ${kind}
Duration: ${item.duration || 'Standard'}
Outcomes: ${JSON.stringify(item.outcomes || item.roles || item.posts || [])}

Provide JSON:
{
  "careerTitle": "${item.name || item.qualification || item.exam}",
  "phases": [
    {
      "yearOrPhase": "Phase label e.g. Year 1",
      "focus": "Key focus area",
      "keyMilestones": ["3 specific milestones"],
      "skillsOrCertifications": ["2 relevant skills"],
      "tips": "Practical tip for Indian context"
    }
  ],
  "ultimateGoal": "One sentence career culmination"
}`;

    try {
      const { data: aiOutput, model } = await generateJson<RoadmapResponse>({
        systemInstruction: 'You are an educational roadmap planner for Indian students. Create actionable, realistic career roadmaps.',
        contents: prompt,
      });

      return NextResponse.json({
        success: true,
        data: {
          fallback: false,
          model,
          generatedAt: new Date().toISOString(),
          ...aiOutput,
        },
      });
    } catch (aiErr) {
      return NextResponse.json({
        success: true,
        data: {
          fallback: true,
          model: 'rule-based',
          generatedAt: new Date().toISOString(),
          ...fallbackRoadmap,
        },
      });
    }
  } catch (error) {
    console.error('Error in /api/careers/ai/roadmap:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
