import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { SkillAssessment, SubmitAssessmentPayload } from '../lib/personnel/personnel-types';

const KEY = 'skill-assessments';

export function useSkillAssessmentsQuery(personnelId: string | null) {
  return useQuery({
    queryKey: [KEY, personnelId],
    queryFn: () =>
      personnelId ? api.get<SkillAssessment[]>(`/personnel/${personnelId}/assessments`) : [],
    enabled: !!personnelId,
    staleTime: 30_000,
  });
}

export function useSubmitSkillAssessmentMutation(personnelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitAssessmentPayload) =>
      api.post<SkillAssessment>(`/personnel/${personnelId}/assessments`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, personnelId] }),
  });
}
