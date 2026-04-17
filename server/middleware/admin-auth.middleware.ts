import type { Request, Response, NextFunction } from 'express';

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey || token !== adminKey) {
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Unauthorized: admin access required',
      timestamp: new Date().toISOString(),
    });
  }
  next();
}
