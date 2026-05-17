import { z } from 'zod';

export const submitResultSchema = z.object({
  user_id: z.union([z.string({ required_error: 'user_id is required' }), z.number({ required_error: 'user_id is required' })]),
  exercise_id: z.union([z.string({ required_error: 'exercise_id is required' }), z.number({ required_error: 'exercise_id is required' })]),
  level_id: z.union([z.string({ required_error: 'level_id is required' }), z.number({ required_error: 'level_id is required' })]),
  score: z.number().int().min(0).optional().default(0),
  is_correct: z.boolean().optional().default(false),
  user_answer: z.unknown().optional().default(null),
});

export const submitDiagnosisSchema = z.object({
  user_id: z.union([z.string({ required_error: 'user_id is required' }), z.number({ required_error: 'user_id is required' })]),
  diagnosis_group: z.union([z.string(), z.number()]).optional(),
  score: z.union([z.string(), z.number()]).optional().default(0),
  total_time_seconds: z.union([z.string(), z.number()]).optional().default(0),
  avg_time_per_question: z.union([z.string(), z.number()]).optional().default(0),
});
