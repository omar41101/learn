import { z } from 'zod';

export const createExerciseSchema = z.object({
  level_id: z.number().int().min(1).max(10),
  exercise_type: z.string().trim().min(1),
  title: z.string().trim().optional().default(''),
  question_text: z.string().trim().min(1, 'Question text is required'),
  hint: z.string().optional().default(''),
  instructions: z.string().optional().default(''),
  image_url: z.string().optional().nullable().default(null),
  data: z.record(z.unknown()).optional().default({}),
  is_diagnosis: z.boolean().optional().default(false),
});

export const updateExerciseSchema = z.object({
  title: z.string().trim().optional(),
  question_text: z.string().trim().optional(),
  hint: z.string().optional(),
  instructions: z.string().optional(),
  image_url: z.string().optional().nullable(),
  data: z.record(z.unknown()).optional(),
});
