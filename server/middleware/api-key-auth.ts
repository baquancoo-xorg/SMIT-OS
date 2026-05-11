/**
 * API Key authentication middleware.
 * Reads X-API-Key header, validates format, looks up by prefix, bcrypt-compares.
 * If header absent → next() (fall through to JWT middleware).
 * If header present but invalid → 401 (don't fall through — mask brute-force).
 * On success → sets req.user as api-key shape, fires lastUsedAt update async,
 * and attaches res.on('finish') listener to write ApiKeyAuditLog.
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { PrismaClient } from '@prisma/client';
import { extractPrefix, isValidKeyFormat, compareKey } from '../lib/api-key-helpers';
import type { ApiKeyAuditService } from '../services/api-key-audit.service';

const log = (msg: string) => console.error(`[api-key-auth] ${msg}`);

/**
 * Derive source IP using Cloudflare header first, then x-forwarded-for, then req.ip.
 */
function deriveSourceIp(req: Request): string | undefined {
  const cf = req.headers['cf-connecting-ip'];
  if (cf) return Array.isArray(cf) ? cf[0] : cf;

  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    const first = (Array.isArray(xff) ? xff[0] : xff).split(',')[0]?.trim();
    if (first) return first;
  }

  return req.ip;
}

export function createApiKeyAuthMiddleware(
  prisma: PrismaClient,
  auditService?: ApiKeyAuditService,
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const rawKey = req.headers['x-api-key'];

    // No header → let JWT middleware handle
    if (!rawKey) {
      return next();
    }

    // Header must be a plain string
    const keyStr = Array.isArray(rawKey) ? rawKey[0] : rawKey;

    // Validate format: smk_ + 32 hex chars
    if (!isValidKeyFormat(keyStr)) {
      return res.status(401).json({ error: 'Invalid API key format' });
    }

    const prefix = extractPrefix(keyStr);

    // Look up by prefix (indexed). Fetch at most a handful (collision rate negligible).
    let candidates;
    try {
      candidates = await prisma.apiKey.findMany({
        where: { prefix },
        take: 5,
      });
    } catch (err) {
      log(`DB lookup failed: ${(err as Error).message}`);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (candidates.length === 0) {
      return res.status(401).json({ error: 'Invalid or revoked API key' });
    }

    // Find first non-revoked candidate whose hash matches
    let matched = null;
    for (const candidate of candidates) {
      if (candidate.revokedAt !== null) continue;

      const valid = await compareKey(keyStr, candidate.keyHash);
      if (valid) {
        matched = candidate;
        break;
      }
    }

    if (!matched) {
      return res.status(401).json({ error: 'Invalid or revoked API key' });
    }

    // Set req.user — api-key shape (discriminated union)
    req.user = {
      type: 'api-key',
      apiKeyId: matched.id,
      scopes: matched.scopes,
      isAdmin: false,
    };

    // Fire-and-forget lastUsedAt update — non-blocking, failure is acceptable
    setImmediate(() => {
      prisma.apiKey
        .update({ where: { id: matched!.id }, data: { lastUsedAt: new Date() } })
        .catch((err: Error) => log(`lastUsedAt update failed: ${err.message}`));
    });

    // Attach audit log on response finish (non-blocking)
    if (auditService) {
      const apiKeyId = matched.id;
      res.on('finish', () => {
        const responseSize = Number(res.getHeader('content-length')) || 0;
        auditService.logUsage(
          apiKeyId,
          req.originalUrl,
          req.method,
          res.statusCode,
          responseSize,
          req.headers['user-agent'],
          deriveSourceIp(req),
        );
      });
    }

    return next();
  };
}
