import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ErrorShape = 'standard' | 'dashboard';

interface ValidateOptions {
  errorShape?: ErrorShape;
}

declare module 'express-serve-static-core' {
  interface Request {
    validatedQuery?: unknown;
  }
}

function formatError(error: ZodError, shape: ErrorShape, kind: 'body' | 'query') {
  if (shape === 'dashboard') {
    return {
      success: false,
      data: null,
      error: error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    };
  }
  const errors = error.issues.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
  return {
    error: kind === 'body' ? 'Validation failed' : 'Invalid query parameters',
    details: errors,
  };
}

export function validate(schema: ZodSchema, opts?: ValidateOptions) {
  const shape = opts?.errorShape ?? 'standard';
  return (req: Request, res: Response, next: NextFunction) => {
    (req as any).rawBody = { ...req.body };
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatError(error, shape, 'body'));
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema, opts?: ValidateOptions) {
  const shape = opts?.errorShape ?? 'standard';
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Express 5: req.query is a getter-only property. Store parsed result on
      // a custom field so handlers can read the validated/coerced shape.
      req.validatedQuery = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatError(error, shape, 'query'));
      }
      next(error);
    }
  };
}
