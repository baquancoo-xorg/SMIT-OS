import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { SkillGroup } from '../lib/personnel/personnel-types';

export interface PulseGroupAverages {
  job: number;
  personal: number;
  general: number;
}

export interface PulseData {
  quarter: string;
  prevQuarter: string;
  current: PulseGroupAverages;
  previous: PulseGroupAverages;
  delta: PulseGroupAverages;
  evaluatedCount: number;
  totalCount: number;
  attentionCount: number;
  atRiskCount: number;
  onboardingCount: number;
}

export interface SkillTrendPoint {
  skillId: string;
  skillKey: string;
  label: string;
  group: SkillGroup;
  scores: Array<number | null>;
}

export interface TopMover {
  skillId: string;
  label: string;
  group: SkillGroup;
  delta: number;
  from: number;
  to: number;
}

export interface SkillMovementData {
  quarters: string[];
  trends: SkillTrendPoint[];
  topUp: TopMover[];
  topDown: TopMover[];
}

export interface PersonnelFlag {
  code: 'skill_regression' | 'low_attendance' | 'kr_at_risk' | 'assessment_overdue';
  message: string;
}

export type PersonnelStatus = 'on_track' | 'needs_attention' | 'at_risk' | 'onboarding';

export interface AttentionItem {
  personnelId: string;
  userId: string;
  fullName: string;
  avatar: string;
  position: string;
  status: PersonnelStatus;
  flags: PersonnelFlag[];
  lastAssessedQuarter: string | null;
}

export interface WorkloadEntry {
  personnelId: string;
  userId: string;
  fullName: string;
  avatar: string;
  submitted: number;
  businessDays: number;
  rate: number;
}

export interface WorkloadData {
  monthLabel: string;
  entries: WorkloadEntry[];
}

export interface PersonnelDashboardData {
  quarter: string;
  pulse: PulseData;
  skillMovement: SkillMovementData;
  attentionItems: AttentionItem[];
  workload: WorkloadData;
  generatedAt: string;
}

export function usePersonnelDashboardQuery(quarter?: string) {
  return useQuery({
    queryKey: ['personnel-dashboard', quarter ?? 'current'],
    queryFn: () =>
      api.get<PersonnelDashboardData>(`/personnel/dashboard${quarter ? `?quarter=${quarter}` : ''}`),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
