/**
 * Shared types for Personnel feature (FE + BE).
 */

export type PersonnelPosition = 'MARKETING' | 'MEDIA' | 'ACCOUNT';
export type SkillGroup = 'JOB' | 'GENERAL' | 'PERSONAL';
export type AssessorType = 'SELF' | 'MANAGER';
export type PersonnelStatus = 'on_track' | 'needs_attention' | 'at_risk';

export interface NumerologyData {
  lifePath: number;
  expression: number;
  soulUrge: number;
  birthday: number;
  meanings: {
    lifePath: { title: string; description: string };
    expression: { title: string; description: string };
    soulUrge: { title: string; description: string };
    birthday: { title: string; description: string };
  };
}

export interface BaziData {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string | null;
  element: string;
  dayMaster: string;
  pillarsWuxing: { year: string[]; month: string[]; day: string[]; hour: string[] };
  hourKnown: boolean;
}

export interface PersonnelDto {
  id: string;
  userId: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    avatar: string;
    role: string;
    isAdmin: boolean;
  };
  position: PersonnelPosition;
  startDate: string;
  birthDate: string | null;
  birthTime: string | null;
  birthPlace: string | null;
  numerologyData: NumerologyData | null;
  baziData: BaziData | null;
  createdAt: string;
  updatedAt: string;
}

export interface SkillDto {
  id: string;
  group: SkillGroup;
  position: PersonnelPosition | null;
  key: string;
  label: string;
  order: number;
}

export interface SkillAssessmentDto {
  id: string;
  personnelId: string;
  quarter: string;
  assessorType: AssessorType;
  assessorId: string;
  submittedAt: string;
  scores: Array<{ skillId: string; score: number }>;
}

export interface SubmitAssessmentPayload {
  quarter: string;
  assessorType: AssessorType;
  scores: Array<{ skillId: string; score: number }>;
}
