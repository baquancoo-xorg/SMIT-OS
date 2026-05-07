import axios, { AxiosInstance, AxiosError } from 'axios';

const host = process.env.POSTHOG_HOST;
const projectId = process.env.POSTHOG_PROJECT_ID;
const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;

if (!host || !projectId || !apiKey) {
  console.warn('[posthog-client] Missing POSTHOG_* env vars - PostHog features disabled');
}

export const posthogClient: AxiosInstance = axios.create({
  baseURL: `${host}/api/projects/${projectId}`,
  headers: { Authorization: `Bearer ${apiKey}` },
  timeout: 15_000,
});

export class PostHogError extends Error {
  constructor(
    public code: 'POSTHOG_UNAVAILABLE' | 'POSTHOG_SCHEMA_DRIFT' | 'POSTHOG_RATE_LIMIT',
    message: string
  ) {
    super(message);
    this.name = 'PostHogError';
  }
}

export async function hogql<T>(query: string): Promise<T> {
  try {
    const { data } = await posthogClient.post('/query/', {
      query: { kind: 'HogQLQuery', query },
    });
    return data.results as T;
  } catch (err) {
    const axiosErr = err as AxiosError;
    if (axiosErr.response?.status === 429) {
      throw new PostHogError('POSTHOG_RATE_LIMIT', 'PostHog rate limit exceeded');
    }
    if (axiosErr.response && axiosErr.response.status >= 500) {
      throw new PostHogError('POSTHOG_UNAVAILABLE', 'PostHog service unavailable');
    }
    throw err;
  }
}

export function isPostHogConfigured(): boolean {
  return !!(host && projectId && apiKey);
}
