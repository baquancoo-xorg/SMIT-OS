/**
 * Personnel routes barrel — mount under /api/personnel.
 */

import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { createPersonnelRoutes } from './personnel.routes';
import { createAssessmentsRoutes } from './assessments.routes';
import { createPersonalityRoutes, createPersonalityQuestionRoutes } from './personality.routes';
import { createSmitosIntegrationRoutes } from './smitos-integration.routes';
import { createFlagsRoutes } from './flags.routes';
import { createPmNotesRoutes } from './pm-notes.routes';

export function createPersonnelMount(prisma: PrismaClient) {
  const router = Router();
  // Public questions (auth required by parent middleware) — must mount BEFORE /:id routes
  router.use('/personality-questions', createPersonalityQuestionRoutes());
  router.use('/', createPersonnelRoutes(prisma));
  router.use('/:id/assessments', createAssessmentsRoutes(prisma));
  router.use('/:id/personality', createPersonalityRoutes(prisma));
  router.use('/:id/smitos-metrics', createSmitosIntegrationRoutes(prisma));
  router.use('/:id/flags', createFlagsRoutes(prisma));
  router.use('/:id/pm-notes', createPmNotesRoutes(prisma));
  return router;
}
