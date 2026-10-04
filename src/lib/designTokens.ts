/**
 * EduSelect Design Tokens
 * 
 * Strict Design System Guidelines:
 * - Backgrounds: White (#FFFFFF) and very light grey (#F8FAFC)
 * - Primary: Blue #1D4ED8 (Blue-700)
 * - Accent: Teal #0D9488 (Teal-600, used sparingly)
 * - Text: #0F172A (Headings / Slate-900), #475569 (Body / Slate-600), #64748B (Muted / Slate-500)
 * - Borders: #E2E8F0 (Slate-200), Hover: #CBD5E1 (Slate-300)
 * - Cards: 12px border radius, subtle hover shadow
 * - Spacing: 8px grid, max width 1200px
 * - Typography: Inter, body >= 16px, line-height 1.6
 */

export const designTokens = {
  colors: {
    bgPage: '#FFFFFF',
    bgSubtle: '#F8FAFC',
    primary: '#1D4ED8',
    primaryHover: '#1E40AF',
    accent: '#0D9488',
    accentHover: '#0F766E',
    textHeading: '#0F172A',
    textBody: '#475569',
    textMuted: '#64748B',
    border: '#E2E8F0',
    borderHover: '#CBD5E1',
    cardBg: '#FFFFFF',
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    bodyMinSize: '16px',
    bodyLineHeight: '1.6',
    headingWeights: {
      bold: '700',
      extraBold: '800',
    },
  },
  spacing: {
    gridUnit: '8px',
    maxWidth: '1200px',
  },
  radius: {
    card: '12px',
    button: '8px',
    pill: '9999px',
  },
  shadows: {
    cardHover: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
} as const;

export interface JourneyLevel {
  id: string;
  slug: '10th' | '12th' | 'iti' | 'diploma' | 'btech' | 'degree' | 'professional' | 'pg';
  title: string;
  description: string;
  iconName: 'BookOpen' | 'GraduationCap' | 'Wrench' | 'Compass' | 'Cpu' | 'BuildingLibrary' | 'Scale' | 'Microscope';
}

export const JOURNEY_LEVELS: JourneyLevel[] = [
  {
    id: 'after-10th',
    slug: '10th',
    title: 'After 10th',
    description: 'Explore 11th/12th PUC streams, Polytechnic diplomas, and ITI trade certifications.',
    iconName: 'BookOpen',
  },
  {
    id: 'after-12th',
    slug: '12th',
    title: 'After 12th / PUC',
    description: 'Find degree pathways across Science (PCM/PCB), Commerce, and Arts.',
    iconName: 'GraduationCap',
  },
  {
    id: 'iti-graduate',
    slug: 'iti',
    title: 'ITI Graduate',
    description: 'Explore lateral diploma entry, CITS instructor training, and PSU technician roles.',
    iconName: 'Wrench',
  },
  {
    id: 'polytechnic-diploma',
    slug: 'diploma',
    title: 'Polytechnic Diploma',
    description: 'Lateral entry into 2nd year B.Tech, Junior Engineer exams, and technical careers.',
    iconName: 'Compass',
  },
  {
    id: 'btech-be',
    slug: 'btech',
    title: 'B.Tech / B.E.',
    description: 'Core engineering careers, software roles, GATE for PSUs, and master’s programs.',
    iconName: 'Cpu',
  },
  {
    id: 'general-degree',
    slug: 'degree',
    title: 'General Degree',
    description: 'Postgraduate programs, banking exams, civil services, and corporate roles.',
    iconName: 'BuildingLibrary',
  },
  {
    id: 'professional-degree',
    slug: 'professional',
    title: 'Professional Degree',
    description: 'Specialised certifications, industry licensing, and advanced professional practice.',
    iconName: 'Scale',
  },
  {
    id: 'postgraduate',
    slug: 'pg',
    title: 'Postgraduate',
    description: 'Doctoral research, academia, corporate R&D, and executive leadership paths.',
    iconName: 'Microscope',
  },
];
