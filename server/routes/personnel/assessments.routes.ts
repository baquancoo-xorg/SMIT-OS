/**
 * Quarterly skill assessments (Likert 1-5).
 * Routes mounted under /api/personnel/:id/assessments.
 */

import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { handleAsync } from '../../utils/async-handler';
import { createPersonnelAccess } from '../../middleware/personnel-access';

const QUARTER_REGEX = /^\d{4}-Q[1-4]$/;
const ASSESSOR_TYPES = ['SELF', 'MANAGER'] as const;

export function createAssessmentsRoutes(prisma: PrismaClient) {
  const router = Router({ mergeParams: true });
  const personnelAccess = createPersonnelAccess(prisma);

  // List history
  router.get('/', personnelAccess, handleAsync(async (req: any, res: any) => {
    const records = await prisma.skillAssessment.findMany({
      where: { personnelId: req.params.id, deletedAt: null },
      include: { scores: true },
      orderBy: [{ quarter: 'desc' }, { assessorType: 'asc' }],
    });
    res.json(records);
  }));

  // Submit
  router.post('/', personnelAccess, handleAsync(async (req: any, res: any) => {
    const user = req.user;
    if (user.type === 'api-key') return res.status(403).json({ error: 'API key not allowed' });

    const { quarter, assessorType, scores } = req.body;
    if (!QUARTER_REGEX.test(quarter)) {
      return res.status(400).json({ error: 'quarter must match YYYY-QN' });
    }
    if (!ASSESSOR_TYPES.includes(assessorType)) {
      return res.status(400).json({ error: 'assessorType invalid' });
    }
    if (!Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({ error: 'scores required' });
    }
    for (const s of scores) {
      if (typeof s.skillId !== 'string' || typeof s.score !== 'number' || s.score < 1 || s.score > 5) {
        return res.status(400).json({ error: 'each score must be {skillId, score 1-5}' });
      }
    }
    if (assessorType === 'MANAGER' && !user.isAdmin) {
      return res.status(403).json({ error: 'Only admin can submit MANAGER assessment' });
    }
    if (assessorType === 'SELF') {
      const personnel = await prisma.personnel.findUnique({
        where: { id: req.params.id },
        select: { userId: true },
      });
      if (!personnel || personnel.userId !== user.userId) {
        return res.status(403).json({ error: 'SELF assessment only for own profile' });
      }
    }

    const personnelId = req.params.id;

    const result = await prisma.$transaction(async (tx) => {
      // Soft-delete any existing for same (personnel, quarter, assessorType) then create
      await tx.skillAssessment.updateMany({
        where: { personnelId, quarter, assessorType, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      const assessment = await tx.skillAssessment.create({
        data: {
          personnelId,
          quarter,
          assessorType,
          assessorId: user.userId,
          scores: {
            create: scores.map((s: { skillId: string; score: number }) => ({
              skillId: s.skillId,
              score: s.score,
            })),
          },
        },
        include: { scores: true },
      });
      return assessment;
    });

    res.status(201).json(result);
  }));

  return router;
}
