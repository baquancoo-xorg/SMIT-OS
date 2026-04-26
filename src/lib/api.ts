type FetchOptions = RequestInit & {
  skipAuth?: boolean;
};

type LeadSyncStatus = {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  status: string;
  subscribersScanned: number;
  leadsCreated: number;
  leadsUpdated: number;
  errors: Array<{ crmSubscriberId: string; message: string }> | null;
  triggerType: string;
};

class ApiClient {
  private baseUrl = '/api';

  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { skipAuth, ...fetchOptions } = options;

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (res.status === 401 && !skipAuth) {
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json();
  }

  get<T>(endpoint: string) {
    return this.fetch<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown) {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data: unknown) {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint: string) {
    return this.fetch(endpoint, { method: 'DELETE' });
  }

  getLeads(params?: Record<string, string>) {
    const qs = params ? `?${new URLSearchParams(params)}` : '';
    return this.get<import('../types').Lead[]>(`/leads${qs}`);
  }

  createLead(data: unknown) { return this.post<import('../types').Lead>('/leads', data); }

  updateLead(id: string, data: unknown) { return this.put<import('../types').Lead>(`/leads/${id}`, data); }

  deleteLead(id: string) { return this.delete(`/leads/${id}`); }

  requestLeadDelete(id: string, reason?: string) { return this.post<import('../types').Lead>(`/leads/${id}/delete-request`, { reason }); }

  cancelLeadDeleteRequest(id: string) { return this.delete(`/leads/${id}/delete-request`); }

  approveLeadDeleteRequest(id: string) { return this.post<void>(`/leads/${id}/delete-request/approve`, {}); }

  rejectLeadDeleteRequest(id: string) { return this.post<import('../types').Lead>(`/leads/${id}/delete-request/reject`, {}); }

  getLeadDailyStats(params?: Record<string, string>) {
    const qs = params ? `?${new URLSearchParams(params)}` : '';
    return this.get<import('../types').LeadDailyStat[]>(`/leads/daily-stats${qs}`);
  }

  getLeadAeList() { return this.get<{ id: string; fullName: string }[]>('/leads/ae-list'); }

  getLeadAuditLogs(id: string) { return this.get<import('../types').LeadAuditLog[]>(`/leads/${id}/audit`); }

  triggerLeadSyncNow() { return this.post<{ accepted: boolean; mode: string }>('/leads/sync-now', {}); }

  getLeadSyncStatus() { return this.get<LeadSyncStatus | null>('/leads/sync-status'); }
}

export const api = new ApiClient();
