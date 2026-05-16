import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Personnel, Skill, PersonnelPosition, SkillGroup } from '../lib/personnel/personnel-types';

const LIST_KEY = 'personnel';
const SKILLS_KEY = 'skills';

export function useMyPersonnelQuery() {
  return useQuery({
    queryKey: [LIST_KEY, 'me'],
    queryFn: () => api.get<Personnel | null>('/personnel/me'),
    staleTime: 30_000,
  });
}

interface UpdateMyPersonnelPayload {
  birthDate?: string | null;
  birthTime?: string | null;
  birthPlace?: string | null;
}

export function useUpdateMyPersonnelMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMyPersonnelPayload) => {
      const url = '/personnel/me';
      return fetch(`/api${url}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      }).then((r) => {
        if (!r.ok) throw new Error('Failed to update personnel');
        return r.json() as Promise<Personnel>;
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LIST_KEY] });
    },
  });
}

export function usePersonnelListQuery() {
  return useQuery({
    queryKey: [LIST_KEY],
    queryFn: () => api.get<Personnel[]>('/personnel'),
    staleTime: 30_000,
  });
}

export function usePersonnelQuery(id: string | null) {
  return useQuery({
    queryKey: [LIST_KEY, id],
    queryFn: () => (id ? api.get<Personnel>(`/personnel/${id}`) : null),
    enabled: !!id,
    staleTime: 30_000,
  });
}

interface CreatePersonnelPayload {
  userId: string;
  position: PersonnelPosition;
  startDate: string;
  birthDate?: string | null;
  birthTime?: string | null;
  birthPlace?: string | null;
}

export function useCreatePersonnelMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePersonnelPayload) => api.post<Personnel>('/personnel', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LIST_KEY] }),
  });
}

export function useUpdatePersonnelMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<CreatePersonnelPayload> & { id: string }) =>
      api.put<Personnel>(`/personnel/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [LIST_KEY] });
      qc.invalidateQueries({ queryKey: [LIST_KEY, vars.id] });
    },
  });
}

export function useDeletePersonnelMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/personnel/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LIST_KEY] }),
  });
}

export function useSkillsQuery(params: { group?: SkillGroup; position?: PersonnelPosition | 'null' } = {}) {
  const qs = new URLSearchParams();
  if (params.group) qs.set('group', params.group);
  if (params.position) qs.set('position', params.position);
  const query = qs.toString();
  return useQuery({
    queryKey: [SKILLS_KEY, params.group ?? null, params.position ?? null],
    queryFn: () => api.get<Skill[]>(`/skills${query ? `?${query}` : ''}`),
    staleTime: 5 * 60_000,
  });
}
