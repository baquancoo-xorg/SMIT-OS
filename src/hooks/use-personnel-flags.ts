import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface PersonnelFlag {
  code: 'skill_regression' | 'low_attendance' | 'kr_at_risk' | 'assessment_overdue';
  message: string;
}

export interface PersonnelFlagsData {
  flags: PersonnelFlag[];
  status: 'on_track' | 'needs_attention' | 'at_risk' | 'onboarding';
  generatedAt: string;
}

export function usePersonnelFlagsQuery(personnelId: string | null) {
  return useQuery({
    queryKey: ['personnel-flags', personnelId],
    queryFn: () =>
      personnelId ? api.get<PersonnelFlagsData>(`/personnel/${personnelId}/flags`) : null,
    enabled: !!personnelId,
    staleTime: 60_000,
  });
}
