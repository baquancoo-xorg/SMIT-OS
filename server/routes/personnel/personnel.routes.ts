/**
 * Personnel CRUD. Auto-computes numerology + bát tự on birthDate save.
 */

import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { handleAsync } from '../../utils/async-handler';
import { computeNumerology } from '../../lib/numerology-calc';
import { computeBazi } from '../../lib/bazi-calc';
import { createPersonnelAccess, adminOnly } from '../../middleware/personnel-access';

const POSITIONS = ['MARKETING', 'MEDIA', 'ACCOUNT'] as const;

function isPosition(v: unknown): v is (typeof POSITIONS)[number] {
  return typeof v === 'string' && (POSITIONS as readonly string[]).includes(v);
}

function recomputeInnate(fullName: string, birthDate: Date | null, birthTime: string | null) {
  if (!birthDate) return { numerologyData: null, baziData: null };
  return {
    numerologyData: computeNumerology(fullName, birthDate) as object,
    baziData: computeBazi(birthDate, birthTime) as object,
  };
}

export function createPersonnelRoutes(prisma: PrismaClient) {
  const router = Router();
  const personnelAccess = createPersonnelAccess(prisma);

  // Current user's personnel (or null if none)
  router.get('/me', handleAsync(async (req: any, res: any) => {
    const user = req.user;
    if (!user || user.type === 'api-key') return res.status(401).json({ error: 'Not authenticated' });
    const record = await prisma.personnel.findUnique({
      where: { userId: user.userId },
      include: { user: { select: { id: true, fullName: true, username: true, avatar: true, role: true, isAdmin: true } } },
    });
    res.json(record);
  }));

  // Self-update for current user's personnel (birthDate/Time/Place; recompute innate)
  router.patch('/me', handleAsync(async (req: any, res: any) => {
    const user = req.user;
    if (!user || user.type === 'api-key') return res.status(401).json({ error: 'Not authenticated' });
    const existing = await prisma.personnel.findUnique({
      where: { userId: user.userId },
      include: { user: { select: { fullName: true } } },
    });
    if (!existing) return res.status(404).json({ error: 'Personnel hồ sơ chưa được khởi tạo' });

    const { birthDate, birthTime, birthPlace } = req.body;
    const nextBirthDate = birthDate === undefined ? existing.birthDate : (birthDate ? new Date(birthDate) : null);
    const nextBirthTime = birthTime === undefined ? existing.birthTime : (birthTime ?? null);
    const recompute = birthDate !== undefined || birthTime !== undefined;
    const innate = recompute
      ? recomputeInnate(existing.user.fullName, nextBirthDate, nextBirthTime)
      : { numerologyData: undefined, baziData: undefined };

    const updated = await prisma.personnel.update({
      where: { userId: user.userId },
      data: {
        ...(birthDate !== undefined ? { birthDate: nextBirthDate } : {}),
        ...(birthTime !== undefined ? { birthTime: nextBirthTime } : {}),
        ...(birthPlace !== undefined ? { birthPlace: birthPlace ?? null } : {}),
        ...(recompute ? { numerologyData: innate.numerologyData ?? null, baziData: innate.baziData ?? null } : {}),
      },
      include: { user: { select: { id: true, fullName: true, username: true, avatar: true, role: true, isAdmin: true } } },
    });
    res.json(updated);
  }));

  // List — admin: all; member: only own
  router.get('/', handleAsync(async (req: any, res: any) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (user.type === 'api-key') return res.status(403).json({ error: 'API key not allowed' });

    const where = user.isAdmin ? {} : { userId: user.userId };
    const records = await prisma.personnel.findMany({
      where,
      include: { user: { select: { id: true, fullName: true, username: true, avatar: true, role: true, isAdmin: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(records);
  }));

  // Admin upsert by userId (used in User edit dialog). Creates if missing, updates if exists.
  router.put('/by-user/:userId', adminOnly, handleAsync(async (req: any, res: any) => {
    const { userId } = req.params;
    const { position, startDate, birthDate, birthTime, birthPlace } = req.body;
    if (position && !isPosition(position)) {
      return res.status(400).json({ error: 'position invalid' });
    }
    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const existing = await prisma.personnel.findUnique({ where: { userId } });
    const bd = birthDate === undefined ? existing?.birthDate ?? null : (birthDate ? new Date(birthDate) : null);
    const bt = birthTime === undefined ? existing?.birthTime ?? null : (birthTime ?? null);
    const recompute = !existing || birthDate !== undefined || birthTime !== undefined;
    const innate = recompute ? recomputeInnate(targetUser.fullName, bd, bt) : { numerologyData: undefined, baziData: undefined };

    if (existing) {
      const updated = await prisma.personnel.update({
        where: { userId },
        data: {
          ...(position ? { position } : {}),
          ...(startDate ? { startDate: new Date(startDate) } : {}),
          ...(birthDate !== undefined ? { birthDate: bd } : {}),
          ...(birthTime !== undefined ? { birthTime: bt } : {}),
          ...(birthPlace !== undefined ? { birthPlace: birthPlace ?? null } : {}),
          ...(recompute ? { numerologyData: innate.numerologyData ?? null, baziData: innate.baziData ?? null } : {}),
        },
        include: { user: { select: { id: true, fullName: true, username: true, avatar: true, role: true, isAdmin: true } } },
      });
      return res.json(updated);
    }

    if (!position) return res.status(400).json({ error: 'position required for new personnel' });
    const created = await prisma.personnel.create({
      data: {
        userId,
        position,
        startDate: startDate ? new Date(startDate) : new Date(),
        birthDate: bd,
        birthTime: bt,
        birthPlace: birthPlace ?? null,
        numerologyData: innate.numerologyData ?? undefined,
        baziData: innate.baziData ?? undefined,
      },
      include: { user: { select: { id: true, fullName: true, username: true, avatar: true, role: true, isAdmin: true } } },
    });
    return res.status(201).json(created);
  }));

  // Detail
  router.get('/:id', personnelAccess, handleAsync(async (req: any, res: any) => {
    const record = await prisma.personnel.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, fullName: true, username: true, avatar: true, role: true, isAdmin: true } } },
    });
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  }));

  // Create — admin
  router.post('/', adminOnly, handleAsync(async (req: any, res: any) => {
    const { userId, position, startDate, birthDate, birthTime, birthPlace } = req.body;
    if (!userId || !isPosition(position) || !startDate) {
      return res.status(400).json({ error: 'userId, position, startDate required' });
    }
    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const bd = birthDate ? new Date(birthDate) : null;
    const innate = recomputeInnate(targetUser.fullName, bd, birthTime ?? null);

    const created = await prisma.personnel.create({
      data: {
        userId,
        position,
        startDate: new Date(startDate),
        birthDate: bd,
        birthTime: birthTime ?? null,
        birthPlace: birthPlace ?? null,
        numerologyData: innate.numerologyData ?? undefined,
        baziData: innate.baziData ?? undefined,
      },
      include: { user: { select: { id: true, fullName: true, username: true, avatar: true, role: true, isAdmin: true } } },
    });
    res.status(201).json(created);
  }));

  // Update — admin
  router.put('/:id', adminOnly, handleAsync(async (req: any, res: any) => {
    const existing = await prisma.personnel.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { fullName: true } } },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const { position, startDate, birthDate, birthTime, birthPlace } = req.body;
    const nextBirthDate = birthDate === undefined ? existing.birthDate : (birthDate ? new Date(birthDate) : null);
    const nextBirthTime = birthTime === undefined ? existing.birthTime : (birthTime ?? null);

    const recompute =
      birthDate !== undefined || birthTime !== undefined;
    const innate = recompute
      ? recomputeInnate(existing.user.fullName, nextBirthDate, nextBirthTime)
      : { numerologyData: undefined, baziData: undefined };

    const updated = await prisma.personnel.update({
      where: { id: req.params.id },
      data: {
        ...(position && isPosition(position) ? { position } : {}),
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(birthDate !== undefined ? { birthDate: nextBirthDate } : {}),
        ...(birthTime !== undefined ? { birthTime: nextBirthTime } : {}),
        ...(birthPlace !== undefined ? { birthPlace: birthPlace ?? null } : {}),
        ...(recompute ? { numerologyData: innate.numerologyData ?? null, baziData: innate.baziData ?? null } : {}),
      },
      include: { user: { select: { id: true, fullName: true, username: true, avatar: true, role: true, isAdmin: true } } },
    });
    res.json(updated);
  }));

  // Delete — admin (hard, no soft for Personnel itself)
  router.delete('/:id', adminOnly, handleAsync(async (req: any, res: any) => {
    await prisma.personnel.delete({ where: { id: req.params.id } });
    res.status(204).end();
  }));

  return router;
}
