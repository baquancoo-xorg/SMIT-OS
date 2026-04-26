import { useQuery } from '@tanstack/react-query';

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  department: string;
}

async function fetchSprints(): Promise<Sprint[]> {
  const res = await fetch('/api/sprints', { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useSprints() {
  return useQuery({
    queryKey: ['sprints'],
    queryFn: fetchSprints,
  });
}
