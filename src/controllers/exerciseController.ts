import { Request, Response, NextFunction } from 'express';
import * as exerciseService from '../services/exerciseService.js';

export async function getByLevel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const levelId = parseInt(req.params.levelId as string, 10);
    const isDiagnosis = req.query.diagnosis === 'true';
    const exercises = await exerciseService.getExercisesForLevel(levelId, isDiagnosis);
    res.json(exercises);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exerciseId = parseInt(req.params.exerciseId as string, 10);
    const exercise = await exerciseService.getExerciseById(exerciseId);
    res.json(exercise);
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exercise = await exerciseService.createExercise(req.body);
    res.status(201).json(exercise);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exerciseId = parseInt(req.params.exerciseId as string, 10);
    const exercise = await exerciseService.updateExercise(exerciseId, req.body);
    res.json(exercise);
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exerciseId = parseInt(req.params.exerciseId as string, 10);
    await exerciseService.deleteExercise(exerciseId);
    res.json({ message: 'Exercise deleted successfully' });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}
