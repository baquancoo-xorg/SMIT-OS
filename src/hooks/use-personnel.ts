import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../lib/api-client';

// ── Types ────────────────────────────────────────────────────────────────────

export type StaffLevel = 'INTERN' | 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD' | 'MANAGER';
export type PerformanceTier = 'EXCEPTIONAL' | 'STRONG' | 'DEVELOPING' | 'UNDERPERFORM';
export type SkillCategory = 'GENERAL' | 'POSITION' | 'SPECIAL';

export interface SkillScore {
  axis: string;
  score: number;
  maxScore: number;
  note?: string;
}

export interface SkillAssessment {
  id: string;
  staffProfileId: string;
  assessedAt: string;
  assessedBy: string | null;
  category: SkillCategory;
  scoresJson: SkillScore[];
  overallScore: number;
  notes: string | null;
}

export interface PerformanceSnapshot {
  id: string;
  snapshotDate: string;
  outputRate: number;
  qualityScore: number;
  velocityScore: number;
  proactivenessScore: number;
  rawPerformance: number;
  avgTcs: number;
  adjustedScore: number;
  tier: PerformanceTier;
  periodLabel: string;
  notes: string | null;
}

export interface StaffProfileSummary {
  id: string;
  level: StaffLevel;
  discProfile: string | null;
  lifePathNumber: number | null;
  skillAssessments: Array<{
    overallScore: number;
    assessedAt: string;
    category: SkillCategory;
  }>;
  performanceSnapshots: Array<{
    adjustedScore: number;
    tier: PerformanceTier;
    periodLabel: string;
  }>;
}

export interface PersonnelListItem {
  id: string;
  fullName: string;
  scope: string | null;
  departments: string[];
  avatar: string;
  birthDate: string | null;
  staffProfile: StaffProfileSummary | null;
}

export interface StaffProfileDetail {
  id: string;
  level: StaffLevel;
  sowJson: unknown | null;
  discProfile: string | null;
  iqScore: number | null;
  eqScore: number | null;
  assessmentExtras: unknown | null;
  lifePathNumber: number | null;
  personalityNumber: number | null;
  numerologyNotes: string | null;
  skillAssessments: SkillAssessment[];
  performanceSnapshots: PerformanceSnapshot[];
}

export interface PersonnelDetail {
  id: string;
  fullName: string;
  scope: string | null;
  departments: string[];
  avatar: string;
  birthDate: string | null;
  staffProfile: StaffProfileDetail | null;
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function usePersonnelList() {
  return useQuery<PersonnelListItem[]>({
    queryKey: ['personnel', 'list'],
    queryFn: () => apiGet('/api/personnel'),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function usePersonnelDetail(userId: string | null) {
  return useQuery<PersonnelDetail>({
    queryKey: ['personnel', 'detail', userId],
    queryFn: () => apiGet(`/api/personnel/${userId}`),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpsertStaffProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Record<string, unknown> }) =>
      apiPost(`/api/personnel/${userId}/profile`, data),
    onSuccess: (_res, { userId }) => {
      qc.invalidateQueries({ queryKey: ['personnel'] });
      qc.invalidateQueries({ queryKey: ['personnel', 'detail', userId] });
    },
  });
}

export function useAddSkillAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Record<string, unknown> }) =>
      apiPost(`/api/personnel/${userId}/assessments`, data),
    onSuccess: (_res, { userId }) => {
      qc.invalidateQueries({ queryKey: ['personnel', 'detail', userId] });
      qc.invalidateQueries({ queryKey: ['personnel', 'list'] });
    },
  });
}
