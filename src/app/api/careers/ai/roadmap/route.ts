import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCareerDetail } from '@/lib/careers/repository';
import { generateJson, isGeminiConfigured } from '@/lib/ai/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  kind: z.string().optional(),
  id: z.string().optional(),
  itemId: z.string().optional(),
  title: z.string().optional(),
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

function buildGenericRoadmap(title: string): RoadmapResponse {
  return {
    careerTitle: title,
    phases: [
      {
        yearOrPhase: 'Phase 1: Foundation & Entrance (Year 1)',
        focus: 'Core subject fundamentals, qualifying cutoffs, and entrance mastery',
        keyMilestones: [
          'Master fundamental core syllabus and prerequisite concepts',
          'Appear for target entrance exams (e.g. JEE, State CETs, or relevant aptitude tests)',
          'Complete introductory coursework and hands-on lab orientation',
        ],
        skillsOrCertifications: ['Analytical problem solving', 'Domain fundamentals', 'Scientific calculators / CAD basics'],
        tips: 'Focus heavily on first-principles understanding rather than rote memorization.',
      },
      {
        yearOrPhase: 'Phase 2: Core Competencies (Year 2–3)',
        focus: 'Hands-on practical projects, industry certifications, and summer internships',
        keyMilestones: [
          'Complete at least two major industry or academic projects',
          'Participate in hackathons, collegiate symposiums or technical competitions',
          'Build strong peer networks and establish mentor relationships with faculty or alumni',
        ],
        skillsOrCertifications: ['Specialized technical proficiency', 'Version control & collaboration', 'Team delivery'],
        tips: 'Identify one high-demand niche domain to specialize in ahead of final recruitment.',
      },
      {
        yearOrPhase: 'Phase 3: Transition & Launch (Final Year)',
        focus: 'Campus placement drives, public recruitment tests, or higher degree applications',
        keyMilestones: [
          'Appear for on-campus and off-campus placement interviews or GATE / PSU tests',
          'Prepare technical portfolio, live demonstrations, and competitive aptitude',
          'Secure an offer letter or admissions into postgraduate programs (M.Tech / MS / MBA)',
        ],
        skillsOrCertifications: ['Interview presentation', 'Aptitude & quantitative reasoning', 'System architecture basics'],
        tips: 'Target both high-probability institutional offers and ambitious dream opportunities simultaneously.',
      },
      {
        yearOrPhase: 'Phase 4: Professional Trajectory (3–5 Years Post-Entry)',
        focus: 'Leadership, specialized consulting, technical lead roles, or executive growth',
        keyMilestones: [
          'Progress to senior engineer / officer / project lead grade',
          'Take ownership of technical delivery or departmental operations',
          'Mentor junior recruits and expand industry influence through papers or patents',
        ],
        skillsOrCertifications: ['Project governance', 'Cross-functional leadership', 'Domain architecture'],
        tips: 'Continuously upskill as modern technologies and regulatory frameworks evolve.',
      },
    ],
    ultimateGoal: `Become an established, high-impact professional in ${title}.`,
  };
}

function buildFallbackRoadmap(detail: any, titleFallback: string): RoadmapResponse {
  const item = detail.item as any;
  const name = item.name || item.qualification || item.exam || titleFallback;

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
          'Explore early internships or laboratory practice',
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
    const data = parsed.success ? parsed.data : body;

    const rawId = data?.id || data?.itemId || '';
    const rawKind = data?.kind || '';
    const title = data?.title || 'Professional Career';

    // Auto-detect kind from ID prefixes or values
    let effectiveKind: 'pathway' | 'branch' | 'degree' | 'govtJob' | undefined = undefined;
    if (['pathway', 'branch', 'degree', 'govtJob'].includes(rawKind)) {
      effectiveKind = rawKind as any;
    } else if (rawId.startsWith('branch-')) {
      effectiveKind = 'branch';
    } else if (rawId.startsWith('govt-')) {
      effectiveKind = 'govtJob';
    } else if (rawId.startsWith('deg-')) {
      effectiveKind = 'degree';
    } else if (rawId.startsWith('b-') || rawId.startsWith('a-') || rawId.startsWith('p-')) {
      effectiveKind = 'pathway';
    }

    let detail = null;
    if (effectiveKind && rawId) {
      detail = getCareerDetail(effectiveKind, rawId);
    }

    // If detail still null, scan all 4 kinds for rawId
    if (!detail && rawId) {
      for (const k of ['branch', 'pathway', 'degree', 'govtJob'] as const) {
        detail = getCareerDetail(k, rawId);
        if (detail) {
          effectiveKind = k;
          break;
        }
      }
    }
    const rawItem = detail?.item as any;
    const careerTitle = rawItem?.name || rawItem?.qualification || rawItem?.exam || title;
    const fallbackRoadmap = detail ? buildFallbackRoadmap(detail, careerTitle) : buildGenericRoadmap(careerTitle);

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

    const item = detail?.item as any;
    const prompt = `
Create a realistic 4-phase year-by-year progression roadmap for an Indian student entering:
Title: ${careerTitle}
Kind: ${effectiveKind || 'pathway'}
Duration: ${item?.duration || '4 Years'}
Outcomes: ${JSON.stringify(item?.outcomes || item?.roles || item?.posts || ['Core engineering roles', 'Specialized developer / officer', 'Postgraduate studies'])}

Provide JSON:
{
  "careerTitle": "${careerTitle}",
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
      const { data: aiOutput } = await generateJson<RoadmapResponse>({
        systemInstruction: 'You are an educational roadmap planner for Indian students. Create actionable, realistic career roadmaps.',
        contents: prompt,
        maxOutputTokens: 600,
      });

      return NextResponse.json({
        success: true,
        data: {
          fallback: false,
          model: 'counsellor',
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
    // Never fail with 500 without returning a fallback
    return NextResponse.json({
      success: true,
      data: {
        fallback: true,
        model: 'rule-based',
        generatedAt: new Date().toISOString(),
        ...buildGenericRoadmap('Engineering & Professional Career'),
      },
    });
  }
}
