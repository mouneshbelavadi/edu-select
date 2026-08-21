import { z } from 'zod';

export const collegeQuerySchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  type: z.enum(['GOVERNMENT', 'PRIVATE', 'DEEMED']).optional(),
  minFees: z.coerce.number().min(0, 'minFees must be non-negative').optional(),
  maxFees: z.coerce.number().min(0, 'maxFees must be non-negative').optional(),
  minRating: z.coerce.number().min(0).max(5, 'minRating must be between 0 and 5').optional(),
  sortBy: z.enum(['rating', 'fees', 'name']).default('rating'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1, 'page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1).max(500, 'limit cannot exceed 500').default(12),
});

export type CollegeQueryInput = z.infer<typeof collegeQuerySchema>;
