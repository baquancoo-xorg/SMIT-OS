/**
 * API client for admin API key management endpoints.
 * All calls include credentials (cookie-based session).
 */

export interface ApiKeyListItem {
  id: string;
  prefix: string;
  name: string;
  scopes: string[];
  createdBy: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface CreatedApiKey {
  id: string;
  prefix: string;
  name: string;
  scopes: string[];
  createdBy: string;
  createdAt: string;
  rawKey: string; // returned ONCE — caller must store before closing modal
}

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return body.data as T;
}

export async function listApiKeys(): Promise<ApiKeyListItem[]> {
  const res = await fetch('/api/admin/api-keys', { credentials: 'include' });
  return handleResponse<ApiKeyListItem[]>(res);
}

export async function createApiKey(name: string, scopes: string[]): Promise<CreatedApiKey> {
  const res = await fetch('/api/admin/api-keys', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, scopes }),
  });
  return handleResponse<CreatedApiKey>(res);
}

export async function revokeApiKey(id: string): Promise<void> {
  const res = await fetch(`/api/admin/api-keys/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
}
