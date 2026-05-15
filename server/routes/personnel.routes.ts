import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { RBAC } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createSkillAssessmentSchema,
  patchStaffProfileSchema,
  upsertPerformanceSnapshotSchema,
  upsertStaffProfileSchema,
} from '../schemas/personnel.schema';
import { createPersonnelService } from '../services/personnel.service';
import { handleAsync } from '../utils/async-handler';

export function createPersonnelRoutes(prisma: PrismaClient) {
  const router = Router();
  const personnel = createPersonnelService(prisma);

  router.use(RBAC.adminOnly);

  router.get('/', handleAsync(async (_req: any, res: any) => {
    const users = await personnel.listPersonnel();
    res.json({ success: true, data: users });
  }));

  router.get('/:userId', handleAsync(async (req: any, res: any) => {
    const user = await personnel.getPersonnel(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  }));

  router.post('/:userId/profile', validate(upsertStaffProfileSchema), handleAsync(async (req: any, res: any) => {
    const profile = await personnel.upsertProfile(req.params.userId, req.body);
    res.json({ success: true, data: profile });
  }));

  router.patch('/:userId/profile', validate(patchStaffProfileSchema), handleAsync(async (req: any, res: any) => {
    const profile = await personnel.patchProfile(req.params.userId, req.body);
    if (!profile) return res.status(404).json({ success: false, error: 'StaffProfile not found — POST first' });
    res.json({ success: true, data: profile });
  }));

  router.post('/:userId/assessments', validate(createSkillAssessmentSchema), handleAsync(async (req: any, res: any) => {
    const assessment = await personnel.addAssessment(req.params.userId, req.body, req.user?.userId);
    if (!assessment) return res.status(404).json({ success: false, error: 'StaffProfile not found — POST /profile first' });
    res.json({ success: true, data: assessment });
  }));

  router.post('/:userId/snapshots', validate(upsertPerformanceSnapshotSchema), handleAsync(async (req: any, res: any) => {
    const snapshot = await personnel.upsertSnapshot(req.params.userId, req.body);
    if (!snapshot) return res.status(404).json({ success: false, error: 'StaffProfile not found' });
    res.json({ success: true, data: snapshot });
  }));

  return router;
}
