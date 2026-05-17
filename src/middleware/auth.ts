import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthenticatedRequest, AuthUser, JwtPayload } from '../types/index.js';

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  const token = header.slice(7);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      userType: 'student',
    } as AuthUser;
  } catch {
    // Token invalid or expired — proceed without user
  }
  next();
}
