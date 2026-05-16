import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  BigFiveQuestionData,
  DiscQuestionData,
  PersonalityResult,
  DiscType,
} from '../lib/personnel/personnel-types';

const KEY = 'personality';

export function usePersonalityResultsQuery(personnelId: string | null) {
  return useQuery({
    queryKey: [KEY, personnelId],
    queryFn: () =>
      personnelId ? api.get<PersonalityResult[]>(`/personnel/${personnelId}/personality`) : [],
    enabled: !!personnelId,
    staleTime: 60_000,
  });
}

export function useBigFiveQuestionsQuery(enabled: boolean) {
  return useQuery({
    queryKey: [KEY, 'questions', 'big-five'],
    queryFn: () => api.get<BigFiveQuestionData>('/personnel/personality-questions/big-five'),
    enabled,
    staleTime: 60 * 60_000,
  });
}

export function useDiscQuestionsQuery(enabled: boolean) {
  return useQuery({
    queryKey: [KEY, 'questions', 'disc'],
    queryFn: () => api.get<DiscQuestionData>('/personnel/personality-questions/disc'),
    enabled,
    staleTime: 60 * 60_000,
  });
}

interface BigFiveAnswer { itemId: number; value: number; }
interface DiscAnswer { itemId: number; most: DiscType; least: DiscType; }

export function useSubmitBigFiveMutation(personnelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answers: BigFiveAnswer[]) =>
      api.post<PersonalityResult>(`/personnel/${personnelId}/personality/big-five`, { answers }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, personnelId] }),
  });
}

export function useSubmitDiscMutation(personnelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answers: DiscAnswer[]) =>
      api.post<PersonalityResult>(`/personnel/${personnelId}/personality/disc`, { answers }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, personnelId] }),
  });
}
