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

  // Update own profile (fullName)
  router.patch('/me', RBAC.authenticated, handleAsync(async (req: any, res: any) => {
    const userId = req.user!.userId;
    const { fullName } = req.body;
    if (!fullName || typeof fullName !== 'string') {
      return res.status(400).json({ error: 'fullName is required' });
    }
    const user = await userService.update(userId, { fullName });
    res.json(user);
  }));

  // Change own password
  router.patch('/me/password', RBAC.authenticated, handleAsync(async (req: any, res: any) => {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }
    const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
    if (!dbUser) return res.status(404).json({ error: 'User not found' });
    const bcrypt = await import('bcryptjs');
    const valid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!valid) return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
    await userService.update(userId, { password: newPassword });
    res.json({ success: true });
  }));

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
