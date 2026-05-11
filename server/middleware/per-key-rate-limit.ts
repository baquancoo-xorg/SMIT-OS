/**
 * Per-API-key rate limiter.
 * Keys by apiKeyId for API key requests; falls back to IP for JWT browser sessions.
 * windowMs: 60s, max: 100 requests.
 * Mounted globally on /api AFTER apiKeyAuth (so req.user is set when keyGenerator runs).
 */

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request, Response } from 'express';
// ipKeyGenerator(ip: string): handles IPv6 subnet normalization per ERR_ERL_KEY_GEN_IPV6

export const perKeyRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  keyGenerator: (req: Request): string => {
    if (req.user?.type === 'api-key') {
      return `apikey:${req.user.apiKeyId}`;
    }
    // Normalise IPv6 per express-rate-limit ERR_ERL_KEY_GEN_IPV6 guidance
    return `ip:${ipKeyGenerator(req.ip ?? '127.0.0.1')}`;
  },
  handler: (_req: Request, res: Response) => {
    const retryAfter = Math.ceil(60_000 / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({ error: 'Rate limit exceeded', retryAfter });
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip in test environment when TEST_SKIP_RATE_LIMIT env is set
  skip: (_req: Request) => process.env.TEST_SKIP_RATE_LIMIT === 'true',
});
