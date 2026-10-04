import { z } from 'zod';

export const qualificationLevelSchema = z.enum([
  'CLASS_10',
  'CLASS_12',
  'ITI',
  'DIPLOMA',
  'UG_ENGG',
  'UG_OTHER',
  'PROFESSIONAL',
  'PG',
]);

export const streamIdSchema = z.enum([
  'PCM',
  'PCB',
  'PCMB',
  'PCMC',
  'COMMERCE_MATHS',
  'COMMERCE_NO_MATHS',
  'ARTS',
  'VOCATIONAL',
  'ANY',
]);

export const riasecSchema = z.enum(['R', 'I', 'A', 'S', 'E', 'C']);
export const outlookSchema = z.enum(['GROWING', 'STABLE', 'DECLINING']);
export const sectorSchema = z.enum(['GOVT', 'PSU', 'PRIVATE', 'SELF', 'ABROAD', 'DEFENCE']);

export const careerKindSchema = z.enum(['pathway', 'branch', 'degree', 'govtJob']);

export const careerSearchQuerySchema = z.object({
  level: qualificationLevelSchema.optional(),
  stream: z.string().optional(),
  branch: z.string().optional(),
  kind: careerKindSchema.optional(),
  q: z.string().max(100).optional(),
  cluster: z.string().optional(),
  riasec: z.union([z.string(), z.array(z.string())]).optional(),
  subjects: z.union([z.string(), z.array(z.string())]).optional(),
  outlook: z.union([z.string(), z.array(z.string())]).optional(),
  sector: z.union([z.string(), z.array(z.string())]).optional(),
  budget: z.string().optional(),
  duration: z.string().optional(),
  salary: z.string().optional(),
  entrance: z.union([z.string(), z.boolean()]).optional(),
  abroad: z.union([z.string(), z.boolean()]).optional(),
  sort: z.enum(['relevance', 'salary_desc', 'cost_asc', 'duration_asc']).default('relevance'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CareerSearchQuery = z.infer<typeof careerSearchQuerySchema>;
