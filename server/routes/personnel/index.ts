/**
 * Personnel routes barrel — mount under /api/personnel.
 */

import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { createPersonnelRoutes } from './personnel.routes';
import { createAssessmentsRoutes } from './assessments.routes';
import { createPersonalityRoutes, createPersonalityQuestionRoutes } from './personality.routes';

export function createPersonnelMount(prisma: PrismaClient) {
  const router = Router();
  // Public questions (auth required by parent middleware) — must mount BEFORE /:id routes
  router.use('/personality-questions', createPersonalityQuestionRoutes());
  router.use('/', createPersonnelRoutes(prisma));
  router.use('/:id/assessments', createAssessmentsRoutes(prisma));
  router.use('/:id/personality', createPersonalityRoutes(prisma));
  return router;
}
