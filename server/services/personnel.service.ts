import { Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type {
  CreateSkillAssessmentInput,
  UpsertPerformanceSnapshotInput,
  UpsertStaffProfileInput,
} from '../schemas/personnel.schema';

function nullableJson(value: unknown) {
  if (value === undefined) return undefined;
  return value === null ? Prisma.JsonNull : value as Prisma.InputJsonValue;
}

function profileData(data: UpsertStaffProfileInput) {
  return {
    ...(data.level !== undefined && { level: data.level }),
    ...(data.sowJson !== undefined && { sowJson: nullableJson(data.sowJson) }),
    ...(data.discProfile !== undefined && { discProfile: data.discProfile }),
    ...(data.iqScore !== undefined && { iqScore: data.iqScore }),
    ...(data.eqScore !== undefined && { eqScore: data.eqScore }),
    ...(data.assessmentExtras !== undefined && { assessmentExtras: nullableJson(data.assessmentExtras) }),
    ...(data.lifePathNumber !== undefined && { lifePathNumber: data.lifePathNumber }),
    ...(data.personalityNumber !== undefined && { personalityNumber: data.personalityNumber }),
    ...(data.numerologyNotes !== undefined && { numerologyNotes: data.numerologyNotes }),
  };
}

export function createPersonnelService(prisma: PrismaClient) {
  async function listPersonnel() {
    return prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        scope: true,
        departments: true,
        avatar: true,
        birthDate: true,
        staffProfile: {
          select: {
            id: true,
            level: true,
            discProfile: true,
            lifePathNumber: true,
            skillAssessments: {
              orderBy: { assessedAt: 'desc' },
              take: 1,
              select: { overallScore: true, assessedAt: true, category: true },
            },
            performanceSnapshots: {
              orderBy: { snapshotDate: 'desc' },
              take: 1,
              select: { adjustedScore: true, tier: true, periodLabel: true },
            },
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async function getPersonnel(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        scope: true,
        departments: true,
        avatar: true,
        birthDate: true,
        staffProfile: {
          include: {
            skillAssessments: { orderBy: { assessedAt: 'desc' } },
            performanceSnapshots: { orderBy: { snapshotDate: 'desc' } },
          },
        },
      },
    });
  }

  async function upsertProfile(userId: string, data: UpsertStaffProfileInput) {
    if (data.birthDate !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { birthDate: data.birthDate ? new Date(data.birthDate) : null },
      });
    }

    const dataWithoutBirthDate = profileData(data);
    return prisma.staffProfile.upsert({
      where: { userId },
      create: { userId, level: data.level ?? 'JUNIOR', ...dataWithoutBirthDate },
      update: dataWithoutBirthDate,
    });
  }

  async function patchProfile(userId: string, data: UpsertStaffProfileInput) {
    const existing = await prisma.staffProfile.findUnique({ where: { userId } });
    if (!existing) return null;

    if (data.birthDate !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { birthDate: data.birthDate ? new Date(data.birthDate) : null },
      });
    }

    const dataWithoutBirthDate = profileData(data);
    return prisma.staffProfile.update({ where: { userId }, data: dataWithoutBirthDate });
  }

  async function addAssessment(userId: string, data: CreateSkillAssessmentInput, assessedBy?: string) {
    const profile = await prisma.staffProfile.findUnique({ where: { userId } });
    if (!profile) return null;

    return prisma.skillAssessment.create({
      data: {
        staffProfileId: profile.id,
        category: data.category,
        scoresJson: data.scoresJson as unknown as Prisma.InputJsonValue,
        overallScore: data.overallScore,
        notes: data.notes ?? undefined,
        assessedBy,
        ...(data.assessedAt && { assessedAt: new Date(data.assessedAt) }),
      },
    });
  }

  async function upsertSnapshot(userId: string, data: UpsertPerformanceSnapshotInput) {
    const profile = await prisma.staffProfile.findUnique({ where: { userId } });
    if (!profile) return null;

    const snapshotDate = new Date(data.snapshotDate);
    return prisma.performanceSnapshot.upsert({
      where: { staffProfileId_snapshotDate: { staffProfileId: profile.id, snapshotDate } },
      create: { ...data, staffProfileId: profile.id, snapshotDate },
      update: { ...data, snapshotDate },
    });
  }

  return { listPersonnel, getPersonnel, upsertProfile, patchProfile, addAssessment, upsertSnapshot };
}
