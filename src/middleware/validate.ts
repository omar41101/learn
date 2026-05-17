import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const first = (result.error as ZodError).issues[0];
      const path = first.path.length > 0 ? first.path.join('.') + ': ' : '';
      const message = first?.message || 'Validation error';
      res.status(400).json({ error: `${path}${message}` });
      return;
    }
    req.body = result.data;
    next();
  };
}
