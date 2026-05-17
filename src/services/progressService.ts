import mongoose from 'mongoose';
import { UserProgress } from '../models/UserProgress.js';
import { ExerciseResult } from '../models/ExerciseResult.js';
import { AppError } from '../errors/AppError.js';
import { toObjectId } from '../utils/objectId.js';
import type { UserResult } from '../types/index.js';

export async function getUserLevelProgress(
  userId: string,
  levelId: number
): Promise<Record<string, unknown>> {
  let progress = await UserProgress.findOne({ userId, levelId }).lean();

  if (!progress) {
    const created = await UserProgress.create({ userId, levelId, score: 0 });
    return {
      id: created._id.toString(),
      userId: created.userId.toString(),
      levelId: created.levelId,
      score: created.score,
      completed: created.completed,
      completedAt: created.completedAt,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  return {
    id: progress._id.toString(),
    userId: progress.userId.toString(),
    levelId: progress.levelId,
    score: progress.score,
    completed: progress.completed,
    completedAt: progress.completedAt,
    createdAt: progress.createdAt,
    updatedAt: progress.updatedAt,
  };
}

export async function getAllUserProgress(userId: string): Promise<UserResult[]> {
  const results = await ExerciseResult.aggregate<UserResult>([
    { $match: { userId: toObjectId(userId, 'user_id') } },
    {
      $group: {
        _id: '$levelId',
        exercise_count: { $sum: 1 },
        correct_count: {
          $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] },
        },
        score: { $sum: '$score' },
        last_completed: { $max: '$createdAt' },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
         level_id: '$_id',
         user_id: toObjectId(userId, 'user_id'),
        score: { $ifNull: ['$score', 0] },
        completed: { $gt: ['$correct_count', 0] },
        exercise_count: 1,
        correct_count: 1,
        last_completed: 1,
      },
    },
  ]);

  return results;
}

export async function updateUserProgress(
  userId: string,
  levelId: number,
  score?: number,
  completed?: boolean
): Promise<Record<string, unknown>> {
  const updateData: Record<string, unknown> = {};
  if (score !== undefined) updateData.score = score;
  if (completed !== undefined) updateData.completed = completed;

  const progress = await UserProgress.findOneAndUpdate(
    { userId, levelId },
    { $set: updateData },
    { upsert: true, new: true }
  );

  return {
    id: progress._id.toString(),
    userId: progress.userId.toString(),
    levelId: progress.levelId,
    score: progress.score,
    completed: progress.completed,
    completedAt: progress.completedAt,
  };
}

export async function completeUserLevel(
  userId: string,
  levelId: number
): Promise<Record<string, unknown>> {
  const progress = await UserProgress.findOneAndUpdate(
    { userId, levelId },
    { $set: { completed: true, completedAt: new Date() } },
    { upsert: true, new: true }
  );

  return {
    id: progress._id.toString(),
    userId: progress.userId.toString(),
    levelId: progress.levelId,
    score: progress.score,
    completed: progress.completed,
    completedAt: progress.completedAt,
  };
}

export async function getUserTotalScore(userId: string): Promise<number> {
  const result = await UserProgress.aggregate([
    { $match: { userId: toObjectId(userId, 'user_id') } },
    { $group: { _id: null, total: { $sum: '$score' } } },
  ]);

  return result.length > 0 ? result[0].total : 0;
}
