import { Request, Response, NextFunction } from 'express';
import * as progressService from '../services/progressService.js';

export async function getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const levelId = parseInt(req.params.levelId as string, 10);
    const progress = await progressService.getUserLevelProgress(userId, levelId);
    res.json(progress);
  } catch (err) {
    next(err);
  }
}

export async function getAllProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;
    if (!userId) {
      res.status(400).json({ error: 'Invalid userId' });
      return;
    }
    const progress = await progressService.getAllUserProgress(userId);
    res.json(progress);
  } catch (err) {
    next(err);
  }
}

export async function updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const levelId = parseInt(req.params.levelId as string, 10);
    const { score, completed } = req.body;
    const progress = await progressService.updateUserProgress(userId, levelId, score, completed);
    res.json({ message: 'Progress updated successfully', progress });
  } catch (err) {
    next(err);
  }
}

export async function completeLevel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const levelId = parseInt(req.params.levelId as string, 10);
    const progress = await progressService.completeUserLevel(userId, levelId);
    res.json({ message: 'Level completed', progress });
  } catch (err) {
    next(err);
  }
}

export async function getTotalScore(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const totalScore = await progressService.getUserTotalScore(userId);
    res.json({ totalScore });
  } catch (err) {
    next(err);
  }
}
