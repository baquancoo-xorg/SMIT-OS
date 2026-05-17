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
import { createDashboardRoutes } from './dashboard.routes';
import { createDismissalsRoutes } from './dismissals.routes';

export function createPersonnelMount(prisma: PrismaClient) {
  const router = Router();
  // Static + admin-only routes BEFORE /:id param routes
  router.use('/personality-questions', createPersonalityQuestionRoutes());
  router.use('/dashboard', createDashboardRoutes(prisma));
  router.use('/dismissals', createDismissalsRoutes(prisma));
  router.use('/', createPersonnelRoutes(prisma));
  router.use('/:id/assessments', createAssessmentsRoutes(prisma));
  router.use('/:id/personality', createPersonalityRoutes(prisma));
  router.use('/:id/smitos-metrics', createSmitosIntegrationRoutes(prisma));
  router.use('/:id/flags', createFlagsRoutes(prisma));
  router.use('/:id/pm-notes', createPmNotesRoutes(prisma));
  return router;
}
