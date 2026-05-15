import { z } from 'zod';

const dateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date');

export const staffLevelSchema = z.enum(['INTERN', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD', 'MANAGER']);
export const skillCategorySchema = z.enum(['GENERAL', 'POSITION', 'SPECIAL']);
export const performanceTierSchema = z.enum(['EXCEPTIONAL', 'STRONG', 'DEVELOPING', 'UNDERPERFORM']);

export const skillScoreSchema = z.object({
  axis: z.string().min(1).max(80),
  score: z.number().min(0),
  maxScore: z.number().positive().max(100).default(5),
  note: z.string().max(500).optional(),
});

export const upsertStaffProfileSchema = z.object({
  level: staffLevelSchema.optional(),
  sowJson: z.unknown().optional().nullable(),
  discProfile: z.string().trim().min(1).max(12).optional().nullable(),
  iqScore: z.number().int().min(0).max(200).optional().nullable(),
  eqScore: z.number().int().min(0).max(200).optional().nullable(),
  assessmentExtras: z.unknown().optional().nullable(),
  lifePathNumber: z.number().int().min(1).max(99).optional().nullable(),
  personalityNumber: z.number().int().min(1).max(99).optional().nullable(),
  numerologyNotes: z.string().max(2000).optional().nullable(),
  birthDate: dateString.optional().nullable(),
});

export const patchStaffProfileSchema = upsertStaffProfileSchema.partial();

export const createSkillAssessmentSchema = z.object({
  category: skillCategorySchema,
  scoresJson: z.array(skillScoreSchema).min(1).max(20),
  overallScore: z.number().min(0).max(100).default(0),
  notes: z.string().max(2000).optional().nullable(),
  assessedAt: dateString.optional(),
});

export const upsertPerformanceSnapshotSchema = z.object({
  snapshotDate: dateString,
  outputRate: z.number().min(0).max(100).default(0),
  qualityScore: z.number().min(0).max(100).default(0),
  velocityScore: z.number().min(0).max(100).default(0),
  proactivenessScore: z.number().min(0).max(100).default(0),
  rawPerformance: z.number().min(0).max(100).default(0),
  avgTcs: z.number().min(0).default(0),
  adjustedScore: z.number().min(0).default(0),
  tier: performanceTierSchema.default('DEVELOPING'),
  periodLabel: z.string().min(1).max(40),
  notes: z.string().max(2000).optional().nullable(),
});

export type UpsertStaffProfileInput = z.infer<typeof upsertStaffProfileSchema>;
export type CreateSkillAssessmentInput = z.infer<typeof createSkillAssessmentSchema>;
export type UpsertPerformanceSnapshotInput = z.infer<typeof upsertPerformanceSnapshotSchema>;
