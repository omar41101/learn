import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern || {})[0] || 'field';
    res.status(409).json({ error: `Duplicate ${field}` });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }

  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
}
