import { z } from 'zod';

export const updateProgressSchema = z.object({
  score: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});
