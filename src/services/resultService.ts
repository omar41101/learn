import mongoose from 'mongoose';
import { ExerciseResult } from '../models/ExerciseResult.js';
import { DiagnosisResult } from '../models/DiagnosisResult.js';
import { User } from '../models/User.js';
import { AppError } from '../errors/AppError.js';
import { toObjectId } from '../utils/objectId.js';
import type { ProgressStats } from '../types/index.js';

export async function submitExerciseResult(data: {
  userId: string;
  exerciseId: number;
  levelId: number;
  score?: number;
  isCorrect?: boolean;
  userAnswer?: unknown;
}): Promise<Record<string, unknown>> {
  const userId = data.userId;
  const exerciseId = data.exerciseId;
  const levelId = data.levelId;

   if (!userId || !exerciseId || !levelId) {
     throw new AppError('Missing required fields: user_id, exercise_id, or level_id', 400);
   }

   const parsedUserId = toObjectId(userId, 'user_id');

  const [existing] = await ExerciseResult.find({ userId: parsedUserId, exerciseId })
    .sort({ createdAt: -1 })
    .limit(1)
    .lean();

  const attempts = existing ? existing.attempts + 1 : 1;

  const previousCorrect = await ExerciseResult.findOne({
    userId: parsedUserId,
    exerciseId,
    isCorrect: true,
  }).lean();

  const awardedScore = previousCorrect ? 0 : (data.score || 0);

  const result = await ExerciseResult.create({
    userId: parsedUserId,
    exerciseId,
    levelId,
    score: awardedScore,
    attempts,
    isCorrect: data.isCorrect || false,
    userAnswer: data.userAnswer ?? null,
  });

  return {
    id: result._id.toString(),
    user_id: result.userId.toString(),
    exercise_id: result.exerciseId,
    level_id: result.levelId,
    score: result.score,
    attempts: result.attempts,
    is_correct: result.isCorrect,
    user_answer: result.userAnswer,
    created_at: result.createdAt,
  };
}

export async function getUserResults(userId: string): Promise<Record<string, unknown>[]> {
  const results = await ExerciseResult.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return results.map((r) => ({
    id: r._id.toString(),
    user_id: r.userId.toString(),
    exercise_id: r.exerciseId,
    level_id: r.levelId,
    score: r.score,
    attempts: r.attempts,
    is_correct: r.isCorrect,
    user_answer: r.userAnswer,
    created_at: r.createdAt,
  }));
}

export async function getLevelResults(
  userId: string,
  levelId: number
): Promise<Record<string, unknown>[]> {
  const results = await ExerciseResult.find({ userId, levelId })
    .sort({ createdAt: -1 })
    .lean();

  return results.map((r) => ({
    id: r._id.toString(),
    user_id: r.userId.toString(),
    exercise_id: r.exerciseId,
    level_id: r.levelId,
    score: r.score,
    attempts: r.attempts,
    is_correct: r.isCorrect,
    user_answer: r.userAnswer,
    created_at: r.createdAt,
  }));
}

export async function getAllDiagnosisResults(): Promise<Record<string, unknown>[]> {
  const results = await DiagnosisResult.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        id: { $toString: '$_id' },
        user_id: { $toString: '$userId' },
        diagnosis_group: '$diagnosisGroup',
        score: 1,
        total_time_seconds: '$totalTimeSeconds',
        avg_time_per_question: '$avgTimePerQuestion',
        recommended_level: '$recommendedLevel',
        created_at: '$createdAt',
        full_name: { $ifNull: ['$user.fullName', ''] },
        username: { $ifNull: ['$user.username', 'Unknown'] },
      },
    },
  ]);

  return results;
}

export async function submitDiagnosis(data: {
  userId: string;
  diagnosisGroup?: number;
  score?: number;
  totalTimeSeconds?: number;
  avgTimePerQuestion?: number;
}): Promise<Record<string, unknown>> {
  const userId = data.userId;
  if (!userId) {
    throw new AppError('Invalid or missing user_id', 400);
  }

  const numericScore = typeof data.score === 'number' ? data.score : parseInt(String(data.score || 0), 10) || 0;
  const totalTime = typeof data.totalTimeSeconds === 'number'
    ? data.totalTimeSeconds
    : parseInt(String(data.totalTimeSeconds || 0), 10) || 0;
  const avgTime = typeof data.avgTimePerQuestion === 'number'
    ? data.avgTimePerQuestion
    : parseFloat(String(data.avgTimePerQuestion || 0)) || 0;

  let recommendedLevel = 1;

  if (numericScore >= 75) {
    recommendedLevel = avgTime && avgTime <= 20 ? 4 : 3;
  } else if (numericScore >= 55) {
    recommendedLevel = avgTime && avgTime <= 25 ? 3 : 2;
  } else if (numericScore >= 35) {
    recommendedLevel = 2;
  } else {
    recommendedLevel = 1;
  }

  recommendedLevel = Math.max(1, Math.min(4, recommendedLevel));

  const result = await DiagnosisResult.create({
    userId,
    diagnosisGroup: data.diagnosisGroup || 1,
    score: numericScore,
    totalTimeSeconds: totalTime,
    avgTimePerQuestion: avgTime,
    recommendedLevel,
  });

  return {
    id: result._id.toString(),
    user_id: result.userId.toString(),
    diagnosis_group: result.diagnosisGroup,
    score: result.score,
    total_time_seconds: result.totalTimeSeconds,
    avg_time_per_question: result.avgTimePerQuestion,
    recommended_level: result.recommendedLevel,
    created_at: result.createdAt,
  };
}

export async function getUserDiagnosis(userId: string): Promise<Record<string, unknown> | null> {
  const result = await DiagnosisResult.findOne({ userId })
    .sort({ createdAt: -1 })
    .lean();

  if (!result) return null;

  return {
    id: result._id.toString(),
    user_id: result.userId.toString(),
    diagnosis_group: result.diagnosisGroup,
    score: result.score,
    total_time_seconds: result.totalTimeSeconds,
    avg_time_per_question: result.avgTimePerQuestion,
    recommended_level: result.recommendedLevel,
    created_at: result.createdAt,
  };
}

export async function getStatistics(): Promise<ProgressStats> {
  const [totalStudents] = await User.aggregate([
    { $match: { userType: 'student' } },
    { $count: 'count' },
  ]);

  const [avgScoreResult] = await ExerciseResult.aggregate([
    { $group: { _id: null, avgScore: { $avg: '$score' } } },
  ]);

  const completedUsers = await ExerciseResult.distinct('userId', { isCorrect: true });

  return {
    totalStudents: totalStudents?.count || 0,
    averageScore: avgScoreResult?.avgScore || 0,
    completedExercises: completedUsers.length,
  };
}
