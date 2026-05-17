import { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/aiService.js';

export async function generate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { topic, type, level } = req.body;
    if (!topic || !type || !level) {
      res.status(400).json({ error: 'Missing topic, type, or level' });
      return;
    }
    const exercise = await aiService.generateExercise(topic, type, level);
    res.json(exercise);
  } catch (err: any) {
    console.error('AI Generation Error:', err);
    const msg = err.message || '';
    if (msg === 'API_KEY_MISSING') {
      res.status(400).json({ error: 'Invalid or missing API Key. Please check your .env file.' });
      return;
    }
    if (msg === 'ALL_QUOTAS_EXHAUSTED' || err.status === 429) {
      res.status(429).json({ error: 'All free AI models are quota-limited right now. Please try again in a few minutes or tomorrow.' });
      return;
    }
    res.status(500).json({ error: 'Failed to generate exercise with AI', details: msg });
  }
}

export async function hint(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { question, context } = req.body;
    const result = await aiService.generateHint(question, context);
    res.json(result);
  } catch (err: any) {
    console.error('AI Hint Error:', err);
    if (err.status === 429 || (err.message || '').includes('quota')) {
      res.status(429).json({ error: 'AI Quota Exceeded. Please try again in a few minutes.' });
      return;
    }
    res.status(500).json({ error: 'AI Hint failed', details: err.message });
  }
}

export async function explain(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { question, studentAnswer, correctAnswer } = req.body;
    const result = await aiService.generateExplanation(question, studentAnswer, correctAnswer);
    res.json(result);
  } catch (err: any) {
    console.error('AI Explanation Error:', err);
    if (err.status === 429 || (err.message || '').includes('quota')) {
      res.status(429).json({ error: 'AI Quota Exceeded. Please try again later.' });
      return;
    }
    res.status(500).json({ error: 'AI Explanation failed', details: err.message });
  }
}
