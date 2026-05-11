/**
 * Canonical scope enum for API key authorization.
 * Shared between admin routes (create/validate) and Phase 03 whitelist routes.
 */

export const API_KEY_SCOPES = [
  'read:reports',
  'read:crm',
  'read:ads',
  'read:okr',
  'read:dashboard',
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];
