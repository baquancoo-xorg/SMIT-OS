import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

interface SprintStats {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
  blocked: number;
  progress: number;
}

interface ActiveSprintData {
  sprint: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  stats: SprintStats | null;
  daysLeft: number | null;
}

interface SprintContextValue {
  activeSprint: ActiveSprintData | null;
  isLoading: boolean;
  refetch: () => void;
}

const SprintContext = createContext<SprintContextValue | null>(null);

export function SprintProvider({ children }: { children: ReactNode }) {
  const query = useQuery<ActiveSprintData>({
    queryKey: ['sprint', 'active'],
    queryFn: async () => {
      const res = await fetch('/api/sprints/active', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    staleTime: 60_000,
  });

  return (
    <SprintContext.Provider
      value={{
        activeSprint: query.data ?? null,
        isLoading: query.isLoading,
        refetch: query.refetch,
      }}
    >
      {children}
    </SprintContext.Provider>
  );
}

export function useSprintContext(): SprintContextValue {
  const ctx = useContext(SprintContext);
  if (!ctx) throw new Error('useSprintContext must be used within SprintProvider');
  return ctx;
}
