/**
 * Personnel feature client types. Mirrors server/types/personnel.types.ts.
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

export interface Personnel {
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

export interface Skill {
  id: string;
  group: SkillGroup;
  position: PersonnelPosition | null;
  key: string;
  label: string;
  order: number;
}

export interface SkillScore {
  skillId: string;
  score: number;
}

export interface SkillAssessment {
  id: string;
  personnelId: string;
  quarter: string;
  assessorType: AssessorType;
  assessorId: string;
  submittedAt: string;
  scores: SkillScore[];
}

export interface SubmitAssessmentPayload {
  quarter: string;
  assessorType: AssessorType;
  scores: SkillScore[];
}

export const POSITION_LABEL: Record<PersonnelPosition, string> = {
  MARKETING: 'Marketing',
  MEDIA: 'Media',
  ACCOUNT: 'Account',
};

export const GROUP_LABEL: Record<SkillGroup, string> = {
  JOB: 'Job Skills',
  GENERAL: 'General Skills',
  PERSONAL: 'Personal Skills',
};
