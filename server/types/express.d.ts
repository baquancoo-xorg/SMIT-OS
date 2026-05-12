import { JWTPayload } from '../services/auth.service';

/**
 * Discriminated union for req.user.
 *
 * JWT path sets type 'jwt' (additive — existing userId/role/isAdmin keys preserved).
 * API key path sets type 'api-key' with apiKeyId + scopes.
 *
 * Downstream code MUST check `req.user.type` before accessing type-specific fields.
 * Legacy routes that only use `req.user.isAdmin` work safely on both branches since
 * api-key shape carries `isAdmin: false` explicitly.
 */

type JwtUser = JWTPayload & {
  type?: 'jwt'; // optional for backwards-compat — existing tokens won't carry this field
  departments?: string[];
  fullName?: string;
};

type ApiKeyUser = {
  type: 'api-key';
  apiKeyId: string;
  scopes: string[];
  isAdmin: false;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser | ApiKeyUser;
    }
  }
}

export {};
