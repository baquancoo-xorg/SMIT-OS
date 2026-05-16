/**
 * Skill registry — read-only for assessment forms.
 */

import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { handleAsync } from '../utils/async-handler';

const GROUPS = ['JOB', 'GENERAL', 'PERSONAL'] as const;
const POSITIONS = ['MARKETING', 'MEDIA', 'ACCOUNT'] as const;

export function createSkillsRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get('/', handleAsync(async (req: any, res: any) => {
    const { group, position } = req.query;
    const where: { active: boolean; group?: (typeof GROUPS)[number]; position?: (typeof POSITIONS)[number] | null } = {
      active: true,
    };
    if (typeof group === 'string' && (GROUPS as readonly string[]).includes(group)) {
      where.group = group as (typeof GROUPS)[number];
    }
    if (typeof position === 'string' && (POSITIONS as readonly string[]).includes(position)) {
      where.position = position as (typeof POSITIONS)[number];
    } else if (position === 'null') {
      where.position = null;
    }
    const skills = await prisma.skill.findMany({
      where,
      orderBy: [{ group: 'asc' }, { position: 'asc' }, { order: 'asc' }],
    });
    res.json(skills);
  }));

  return router;
}
