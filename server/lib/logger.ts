// Structured logger using Pino.
// - Production: JSON output (NDJSON), level 'info' default
// - Development: pretty-printed colored output, level 'debug' default
// - Sensitive paths redacted to prevent credential leakage in logs

import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const REDACT_PATHS = [
  'password',
  '*.password',
  'authorization',
  '*.authorization',
  'cookie',
  '*.cookie',
  'jwt',
  '*.jwt',
  'token',
  '*.token',
  'accessToken',
  '*.accessToken',
  'accessTokenEncrypted',
  '*.accessTokenEncrypted',
];

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
    },
  }),
});

/**
 * Create a child logger scoped to a module/component.
 * Use ở mỗi file: `const log = childLogger('lead-sync-cron');`
 */
export function childLogger(moduleName: string) {
  return logger.child({ module: moduleName });
}
