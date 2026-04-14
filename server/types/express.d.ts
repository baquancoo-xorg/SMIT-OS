import { JWTPayload } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & {
        departments?: string[];
      };
    }
  }
}

export {};
