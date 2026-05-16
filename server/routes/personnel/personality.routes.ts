/**
 * Personality tests (Big Five + DISC).
 * Self-only submission. Year uniqueness enforced. Skip if already submitted same year.
 */

import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { handleAsync } from '../../utils/async-handler';
import { createPersonnelAccess } from '../../middleware/personnel-access';
import { scoreBigFive } from '../../lib/bigfive-scoring';
import { scoreDisc } from '../../lib/disc-scoring';
import bigfiveData from '../../data/bigfive-vi.json';
import discData from '../../data/disc-vi.json';

export function createPersonalityRoutes(prisma: PrismaClient) {
  const router = Router({ mergeParams: true });
  const personnelAccess = createPersonnelAccess(prisma);

  // Public-ish: serve questions (auth required for any logged-in user; lightweight)
  router.get('/questions/big-five', handleAsync(async (_req: any, res: any) => {
    res.json(bigfiveData);
  }));

  router.get('/questions/disc', handleAsync(async (_req: any, res: any) => {
    res.json(discData);
  }));

  // History
  router.get('/', personnelAccess, handleAsync(async (req: any, res: any) => {
    const records = await prisma.personalityResult.findMany({
      where: { personnelId: req.params.id, deletedAt: null },
      orderBy: [{ year: 'desc' }, { testType: 'asc' }],
    });
    res.json(records);
  }));

  // Submit Big Five
  router.post('/big-five', personnelAccess, handleAsync(async (req: any, res: any) => {
    const user = req.user;
    if (user.type === 'api-key') return res.status(403).json({ error: 'API key not allowed' });

    const personnel = await prisma.personnel.findUnique({
      where: { id: req.params.id },
      select: { userId: true },
    });
    if (!personnel) return res.status(404).json({ error: 'Personnel not found' });
    if (personnel.userId !== user.userId) {
      return res.status(403).json({ error: 'Chỉ chính chủ mới làm test được' });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers)) return res.status(400).json({ error: 'answers required' });

    let scored;
    try {
      scored = scoreBigFive(answers);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }

    const year = new Date().getFullYear();
    const existing = await prisma.personalityResult.findUnique({
      where: { personnelId_testType_year: { personnelId: req.params.id, testType: 'BIG_FIVE', year } },
    });
    if (existing && !existing.deletedAt) {
      return res.status(409).json({ error: 'Đã làm Big Five trong năm nay', existing });
    }

    const created = await prisma.personalityResult.upsert({
      where: { personnelId_testType_year: { personnelId: req.params.id, testType: 'BIG_FIVE', year } },
      create: {
        personnelId: req.params.id,
        testType: 'BIG_FIVE',
        year,
        results: scored.results,
        summary: scored.summary,
      },
      update: {
        results: scored.results,
        summary: scored.summary,
        deletedAt: null,
        completedAt: new Date(),
      },
    });
    res.status(201).json(created);
  }));

  // Submit DISC
  router.post('/disc', personnelAccess, handleAsync(async (req: any, res: any) => {
    const user = req.user;
    if (user.type === 'api-key') return res.status(403).json({ error: 'API key not allowed' });

    const personnel = await prisma.personnel.findUnique({
      where: { id: req.params.id },
      select: { userId: true },
    });
    if (!personnel) return res.status(404).json({ error: 'Personnel not found' });
    if (personnel.userId !== user.userId) {
      return res.status(403).json({ error: 'Chỉ chính chủ mới làm test được' });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers)) return res.status(400).json({ error: 'answers required' });

    let scored;
    try {
      scored = scoreDisc(answers);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }

    const year = new Date().getFullYear();
    const existing = await prisma.personalityResult.findUnique({
      where: { personnelId_testType_year: { personnelId: req.params.id, testType: 'DISC', year } },
    });
    if (existing && !existing.deletedAt) {
      return res.status(409).json({ error: 'Đã làm DISC trong năm nay', existing });
    }

    const created = await prisma.personalityResult.upsert({
      where: { personnelId_testType_year: { personnelId: req.params.id, testType: 'DISC', year } },
      create: {
        personnelId: req.params.id,
        testType: 'DISC',
        year,
        results: scored.results,
        summary: scored.summary,
      },
      update: {
        results: scored.results,
        summary: scored.summary,
        deletedAt: null,
        completedAt: new Date(),
      },
    });
    res.status(201).json(created);
  }));

  return router;
}
