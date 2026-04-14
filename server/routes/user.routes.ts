import { Router } from 'express';
import { createUserService } from '../services/user.service';
import { RBAC, rbac } from '../middleware/rbac.middleware';
import { handleAsync } from '../utils/async-handler';
import { validate } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';
import { PrismaClient } from '@prisma/client';

export function createUserRoutes(prisma: PrismaClient) {
  const router = Router();
  const userService = createUserService(prisma);

  router.get('/', handleAsync(async (_req: any, res: any) => {
    const users = await userService.getAll();
    res.json(users);
  }));

  router.post('/', RBAC.adminOnly, validate(createUserSchema), handleAsync(async (req: any, res: any) => {
    const user = await userService.create(req.body);
    res.json(user);
  }));

  router.put('/:id', rbac({ allowSelf: true }), validate(updateUserSchema), handleAsync(async (req: any, res: any) => {
    const { id } = req.params;
    const currentUser = req.user!;

    if (!currentUser.isAdmin && id !== currentUser.userId) {
      return res.status(403).json({ error: 'Can only edit your own profile' });
    }

    const user = await userService.update(id, req.body);
    res.json(user);
  }));

  router.delete('/:id', RBAC.adminOnly, handleAsync(async (req: any, res: any) => {
    try {
      await userService.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }));

  return router;
}
