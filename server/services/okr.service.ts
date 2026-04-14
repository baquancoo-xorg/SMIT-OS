import { PrismaClient } from '@prisma/client';

const OWNER_SELECT = {
  id: true,
  fullName: true,
  username: true,
  avatar: true,
  department: true,
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

      const updates = objectives.map((obj) => {
        let progress = 0;

        if (obj.parentId) {
          if (obj.keyResults.length > 0) {
            progress =
              obj.keyResults.reduce((sum, kr) => sum + kr.progressPercentage, 0) /
              obj.keyResults.length;
          }
        } else {
          if (obj.children.length > 0) {
            const childProgress = obj.children.map((child) => {
              if (child.keyResults.length === 0) return 0;
              return (
                child.keyResults.reduce((sum, kr) => sum + kr.progressPercentage, 0) /
                child.keyResults.length
              );
            });
            progress = childProgress.reduce((a, b) => a + b, 0) / obj.children.length;
          }
        }

        return prisma.objective.update({
          where: { id: obj.id },
          data: { progressPercentage: Math.round(progress * 100) / 100 },
        });
      });

      await prisma.$transaction(updates);
    },
  };
}

export type OKRService = ReturnType<typeof createOKRService>;
