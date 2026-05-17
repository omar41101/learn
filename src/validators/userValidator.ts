import { z } from 'zod';

function normalizeUserBody(input: unknown): unknown {
  if (!input || typeof input !== 'object') return input;
  const obj = input as Record<string, unknown>;
  const out: Record<string, unknown> = { ...obj };

  if (out.fullName === undefined && typeof out.full_name === 'string') {
    out.fullName = out.full_name;
  }
  if (out.userType === undefined && typeof out.user_type === 'string') {
    out.userType = out.user_type;
  }

  return out;
}

export const registerSchema = z.preprocess(normalizeUserBody, z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password too long'),
  userType: z.enum(['student', 'teacher']).optional().default('student'),
  fullName: z.string().trim().max(100).optional().default(''),
}));

export const loginSchema = z.object({
  username: z
    .string({ required_error: 'Username or email is required' })
    .trim()
    .min(1, 'Username or email is required'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
  role: z.string().optional(),
});

export const quickRegisterSchema = z.preprocess(normalizeUserBody, z.object({
  fullName: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name is required')
    .max(100),
}));

export const updateProfileSchema = z.preprocess(normalizeUserBody, z.object({
  fullName: z.string().trim().max(100).optional(),
  email: z.string().email('Invalid email format').trim().toLowerCase().optional(),
}));

export const createStudentSchema = z.preprocess(normalizeUserBody, z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(50),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(128),
  fullName: z.string().trim().max(100).optional().default(''),
}));
