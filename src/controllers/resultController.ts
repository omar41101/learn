import { Request, Response, NextFunction } from 'express';
import * as resultService from '../services/resultService.js';

export async function submit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id, exercise_id, level_id, score, is_correct, user_answer } = req.body;
    const result = await resultService.submitExerciseResult({
      userId: String(user_id),
      exerciseId: Number(exercise_id),
      levelId: Number(level_id),
      score,
      isCorrect: is_correct,
      userAnswer: user_answer,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getUserResults(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const results = await resultService.getUserResults(userId);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

export async function getLevelResults(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const levelId = parseInt(req.params.levelId as string, 10);
    const results = await resultService.getLevelResults(userId, levelId);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

export async function getAllDiagnosis(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const results = await resultService.getAllDiagnosisResults();
    res.json(results);
  } catch (err) {
    next(err);
  }
}

export async function submitDiagnosis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id, diagnosis_group, score, total_time_seconds, avg_time_per_question } = req.body;
    const result = await resultService.submitDiagnosis({
      userId: String(user_id),
      diagnosisGroup: diagnosis_group,
      score,
      totalTimeSeconds: total_time_seconds,
      avgTimePerQuestion: avg_time_per_question,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getUserDiagnosis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const result = await resultService.getUserDiagnosis(userId);
    if (!result) {
      res.json({ message: 'No diagnosis results' });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getStatistics(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await resultService.getStatistics();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
