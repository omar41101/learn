import { Request } from 'express';
import mongoose from 'mongoose';

export interface JwtPayload {
  userId: string;
  username: string;
}

export interface AuthUser {
  id: string;
  username: string;
  userType: 'student' | 'teacher';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface ExerciseFile {
  diagnosis: ExerciseEntry[];
  levels: ExerciseEntry[];
}

export interface ExerciseEntry {
  id: number;
  level_id: number;
  title: string;
  exercise_type: string;
  question_text: string;
  hint?: string;
  data?: Record<string, unknown>;
  instructions?: string;
  image_url?: string;
}

export interface UserResult {
  user_id: mongoose.Types.ObjectId;
  level_id: number;
  score: number;
  completed: boolean;
  exercise_count: number;
  correct_count: number;
  last_completed: Date | null;
}

export interface ProgressStats {
  totalStudents: number;
  averageScore: number;
  completedExercises: number;
}
