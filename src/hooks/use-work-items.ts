import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { WorkItem } from '../types';

async function fetchWorkItems(): Promise<WorkItem[]> {
  const res = await fetch('/api/work-items');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useWorkItems() {
  return useQuery({
    queryKey: ['work-items'],
    queryFn: fetchWorkItems,
  });
}

export function useWorkItemMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['work-items'] });

  const createItem = useMutation({
    mutationFn: async (data: Partial<WorkItem>) => {
      const res = await fetch('/api/work-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    onSuccess: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkItem> }) => {
      const res = await fetch(`/api/work-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    onSuccess: invalidate,
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/work-items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    },
    onSuccess: invalidate,
  });

  return { createItem, updateItem, deleteItem };
}
