import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {

  console.error(`[ERROR] ${req.method} ${req.path}`, err);

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}