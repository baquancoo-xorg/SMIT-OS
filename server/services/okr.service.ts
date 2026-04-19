import { PrismaClient } from '@prisma/client';

const OWNER_SELECT = {
  id: true,
  fullName: true,
  username: true,
  avatar: true,
  departments: true,
};

export function createOKRService(prisma: PrismaClient) {
  return {
    async getAllObjectives() {
      return prisma.objective.findMany({
        include: {
          keyResults: true,
          owner: { select: OWNER_SELECT },
          parent: true,
          children: {
            include: {
              keyResults: true,
              owner: { select: OWNER_SELECT },
            },
          },
        },
      });
    },

    async createObjective(data: any) {
      const { keyResults, children, ...objectiveData } = data;
      return prisma.objective.create({
        data: {
          ...objectiveData,
          keyResults: keyResults?.length ? { create: keyResults } : undefined,
        },
        include: { keyResults: true, parent: true, children: true },
      });
    },

    async updateObjective(id: string, data: Record<string, unknown>) {
      const { keyResults, children, ...objectiveData } = data;
      return prisma.objective.update({
        where: { id },
        data: objectiveData as object,
        include: {
          keyResults: true,
          parent: true,
          children: {
            include: {
              keyResults: true,
              owner: { select: OWNER_SELECT },
            },
          },
        },
      });
    },

    async deleteObjective(id: string) {
      await prisma.objective.delete({ where: { id } });
    },

    async syncOKRProgress(report: { krProgress?: string | null }) {
      if (!report.krProgress) return;

      const krProgressData = JSON.parse(report.krProgress);
      const krIds = krProgressData.map((kr: { krId: string }) => kr.krId);

      const keyResults = await prisma.keyResult.findMany({
        where: { id: { in: krIds } },
        include: { objective: true },
      });

      const krMap = new Map(keyResults.map((kr) => [kr.id, kr]));

      const updates = krProgressData
        .map((kr: { krId: string; currentValue?: number; progressPct: number }) => {
          const keyResult = krMap.get(kr.krId);
          if (!keyResult) return null;

          let progressPct = kr.progressPct;
          if (kr.currentValue !== undefined && keyResult.targetValue > 0) {
            progressPct = (kr.currentValue / keyResult.targetValue) * 100;
          }

          return prisma.keyResult.update({
            where: { id: kr.krId },
            data: {
              currentValue: kr.currentValue ?? keyResult.currentValue,
              progressPercentage: Math.min(progressPct, 100),
            },
          });
        })
        .filter(Boolean);

      await prisma.$transaction(updates);
      await this.recalculateObjectiveProgress();
    },

    async recalculateObjectiveProgress() {
      const objectives = await prisma.objective.findMany({
        include: {
          keyResults: true,
          children: { include: { keyResults: true } },
        },
      });

      // First pass: update L2 (children with parentId)
      const l2Updates = objectives
        .filter((obj) => obj.parentId)
        .map((obj) => {
          const progress =
            obj.keyResults.length > 0
              ? obj.keyResults.reduce((sum, kr) => sum + kr.progressPercentage, 0) /
                obj.keyResults.length
              : 0;
          return prisma.objective.update({
            where: { id: obj.id },
            data: { progressPercentage: Math.round(progress * 100) / 100 },
          });
        });

      await prisma.$transaction(l2Updates);

      // Reload L2 progress after first pass, then compute L1
      const l2Map = new Map(
        (await prisma.objective.findMany({ where: { parentId: { not: null } }, select: { id: true, progressPercentage: true } }))
          .map((o) => [o.id, o.progressPercentage])
      );

      // Second pass: update L1 (root objectives without parentId)
      const l1Updates = objectives
        .filter((obj) => !obj.parentId)
        .map((obj) => {
          let progress = 0;
          if (obj.children.length > 0) {
            // Roll up from L2 children's stored progressPercentage
            const childProgressValues = obj.children.map((child) => l2Map.get(child.id) ?? 0);
            progress = childProgressValues.reduce((a, b) => a + b, 0) / obj.children.length;
          } else if (obj.keyResults.length > 0) {
            // L1 with own KRs (no children)
            progress =
              obj.keyResults.reduce((sum, kr) => sum + kr.progressPercentage, 0) /
              obj.keyResults.length;
          }
          return prisma.objective.update({
            where: { id: obj.id },
            data: { progressPercentage: Math.round(progress * 100) / 100 },
          });
        });

      await prisma.$transaction(l1Updates);
    },
  };
}

export type OKRService = ReturnType<typeof createOKRService>;
