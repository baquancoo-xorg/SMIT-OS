import { useQuery } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns';

type OkrCycle = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type ColorBand = 'green' | 'amber' | 'red';

function bandFor(daysLeft: number): ColorBand {
  if (daysLeft > 30) return 'green';
  if (daysLeft >= 7) return 'amber';
  return 'red';
}

export function useActiveOkrCycle() {
  const query = useQuery({
    queryKey: ['active-okr-cycle'],
    queryFn: async (): Promise<OkrCycle | null> => {
      const res = await fetch('/api/okr-cycles/active', { credentials: 'include' });
      if (!res.ok) throw new Error(`failed: ${res.status}`);
      const cycle = await res.json();
      return cycle && cycle.isActive ? cycle : null;
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const cycle = query.data ?? null;
  const daysLeft = cycle ? differenceInDays(new Date(cycle.endDate), new Date()) : null;
  const color = daysLeft == null ? null : bandFor(daysLeft);

  return {
    cycle,
    daysLeft,
    color,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
