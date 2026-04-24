import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface KeyResult {
  id: string;
  objectiveId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string | null;
  progressPercentage: number;
}

export interface Objective {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  department: string | null;
  ownerId: string | null;
  parentId: string | null;
  progressPercentage: number;
  keyResults: KeyResult[];
  children?: Objective[];
  owner?: { id: string; fullName: string; avatar: string } | null;
}

async function fetchObjectives(): Promise<Objective[]> {
  const res = await fetch('/api/objectives');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useObjectives() {
  return useQuery({
    queryKey: ['objectives'],
    queryFn: fetchObjectives,
  });
}

export function useObjectiveMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['objectives'] });

  const createObjective = useMutation({
    mutationFn: async (data: Partial<Objective>) => {
      const res = await fetch('/api/objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    onSuccess: invalidate,
  });

  const updateObjective = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Objective> }) => {
      const res = await fetch(`/api/objectives/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    onSuccess: invalidate,
  });

  const deleteObjective = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/objectives/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    },
    onSuccess: invalidate,
  });

  return { createObjective, updateObjective, deleteObjective };
}
