import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

type ResourceType = 'weeklyReport' | 'dailyReport' | 'workItem' | 'sprint' | 'okrCycle';

export function createOwnershipMiddleware(prisma: PrismaClient) {
  return (resourceType: ResourceType) => async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Admins can do anything
    if (user.isAdmin) return next();

    const resourceMap: Record<ResourceType, () => Promise<any>> = {
      weeklyReport: () => prisma.weeklyReport.findUnique({ where: { id }, select: { userId: true } }),
      dailyReport: () => prisma.dailyReport.findUnique({ where: { id }, select: { userId: true } }),
      workItem: () => prisma.workItem.findUnique({ where: { id }, select: { assigneeId: true } }),
      sprint: async () => null, // Admin only - always fail ownership check
      okrCycle: async () => null, // Admin only - always fail ownership check
    };

    const resource = await resourceMap[resourceType]();
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check ownership
    const ownerId = resource.userId || resource.assigneeId;
    if (!ownerId) {
      // Unassigned resource - only admin can modify
      return res.status(403).json({ error: 'Not authorized to modify this resource' });
    }
    if (ownerId !== user.userId) {
      return res.status(403).json({ error: 'Not authorized to modify this resource' });
    }

    next();
  };
}
