/**
 * use-social-channels.ts — TanStack Query hooks for SocialChannel CRUD.
 * Backend: /api/social-channels (Phase 04)
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type MediaPlatform =
  | 'FACEBOOK_PAGE'
  | 'FACEBOOK_GROUP'
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'YOUTUBE'
  | 'THREADS';

export interface SocialChannel {
  id: string;
  platform: MediaPlatform;
  externalId: string;
  name: string;
  tokenExpiresAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChannelInput {
  platform: MediaPlatform;
  externalId: string;
  name: string;
  accessToken: string;
  tokenExpiresAt?: string;
}

export interface UpdateChannelInput {
  name?: string;
  accessToken?: string;
  tokenExpiresAt?: string;
}

interface TestResult {
  ok: boolean;
  pageName?: string;
  error?: string;
}

const QUERY_KEY = ['social-channels'] as const;

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...init });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? `Request failed: ${res.status}`);
  }
  return json.data as T;
}

export function useSocialChannelsList() {
  return useQuery<SocialChannel[]>({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch<SocialChannel[]>('/api/social-channels'),
  });
}

export function useSocialChannelCreate() {
  const qc = useQueryClient();
  return useMutation<SocialChannel, Error, CreateChannelInput>({
    mutationFn: (input) =>
      apiFetch<SocialChannel>('/api/social-channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useSocialChannelUpdate() {
  const qc = useQueryClient();
  return useMutation<SocialChannel, Error, { id: string } & UpdateChannelInput>({
    mutationFn: ({ id, ...input }) =>
      apiFetch<SocialChannel>(`/api/social-channels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useSocialChannelDeactivate() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      apiFetch<void>(`/api/social-channels/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useSocialChannelTest() {
  return useMutation<TestResult, Error, string>({
    mutationFn: (id) =>
      apiFetch<TestResult>(`/api/social-channels/${id}/test`, { method: 'POST' }),
  });
}
