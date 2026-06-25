import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError.js';

export function validateRequiredFields(fields: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const body = req.body ?? {};
    const missing = fields.filter((field) => {
      const value = body[field];
      if (value === null || value === undefined) return true;
      if (typeof value === 'string' && !value.trim()) return true;
      return false;
    });

    if (missing.length > 0) {
      next(new HttpError(400, `Missing required fields: ${missing.join(', ')}`));
      return;
    }

    next();
  };
}
