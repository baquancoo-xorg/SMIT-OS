/**
 * API Key audit log service.
 * Writes usage records to ApiKeyAuditLog in a fire-and-forget manner.
 * Never throws — audit failures are logged but do not affect response.
 */

import type { PrismaClient } from '@prisma/client';
import { childLogger } from '../lib/logger';

const log = childLogger('api-key-audit');

export interface ApiKeyAuditService {
  logUsage(
    apiKeyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseSize: number,
    userAgent: string | undefined,
    sourceIp: string | undefined,
  ): void;
}

export function createApiKeyAuditService(prisma: PrismaClient): ApiKeyAuditService {
  return {
    logUsage(apiKeyId, endpoint, method, statusCode, responseSize, userAgent, sourceIp) {
      setImmediate(() => {
        prisma.apiKeyAuditLog
          .create({
            data: {
              apiKeyId,
              endpoint,
              method,
              statusCode,
              responseSize,
              userAgent: userAgent?.slice(0, 255),
              sourceIp: sourceIp ?? null,
            },
          })
          .catch((err: Error) => log.error({ err }, 'audit log write failed'));
      });
    },
  };
}
