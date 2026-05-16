/**
 * PM notes for Personnel — admin coaching record per quarter.
 * Read: admin or own. Write: admin only.
 */

import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { handleAsync } from '../../utils/async-handler';
import { createPersonnelAccess, adminOnly } from '../../middleware/personnel-access';

const QUARTER_REGEX = /^\d{4}-Q[1-4]$/;

export function createPmNotesRoutes(prisma: PrismaClient) {
  const router = Router({ mergeParams: true });
  const personnelAccess = createPersonnelAccess(prisma);

  router.get('/', personnelAccess, handleAsync(async (req: any, res: any) => {
    const notes = await prisma.pmNote.findMany({
      where: { personnelId: req.params.id },
      include: { author: { select: { id: true, fullName: true, username: true, avatar: true } } },
      orderBy: [{ quarter: 'desc' }, { createdAt: 'desc' }],
    });
    res.json(notes);
  }));

  router.post('/', adminOnly, handleAsync(async (req: any, res: any) => {
    const user = req.user;
    if (user.type === 'api-key') return res.status(403).json({ error: 'API key not allowed' });

    const { quarter, content } = req.body;
    if (!QUARTER_REGEX.test(quarter)) return res.status(400).json({ error: 'quarter must match YYYY-QN' });
    if (typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'content required' });
    }

    const created = await prisma.pmNote.create({
      data: {
        personnelId: req.params.id,
        quarter,
        authorId: user.userId,
        content: content.trim(),
      },
      include: { author: { select: { id: true, fullName: true, username: true, avatar: true } } },
    });
    res.status(201).json(created);
  }));

  router.put('/:noteId', adminOnly, handleAsync(async (req: any, res: any) => {
    const { content } = req.body;
    if (typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'content required' });
    }
    const note = await prisma.pmNote.findUnique({ where: { id: req.params.noteId } });
    if (!note || note.personnelId !== req.params.id) {
      return res.status(404).json({ error: 'Note not found' });
    }
    const updated = await prisma.pmNote.update({
      where: { id: req.params.noteId },
      data: { content: content.trim() },
      include: { author: { select: { id: true, fullName: true, username: true, avatar: true } } },
    });
    res.json(updated);
  }));

  router.delete('/:noteId', adminOnly, handleAsync(async (req: any, res: any) => {
    const note = await prisma.pmNote.findUnique({ where: { id: req.params.noteId } });
    if (!note || note.personnelId !== req.params.id) {
      return res.status(404).json({ error: 'Note not found' });
    }
    await prisma.pmNote.delete({ where: { id: req.params.noteId } });
    res.status(204).end();
  }));

  return router;
}
