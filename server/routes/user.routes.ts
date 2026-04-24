import { Router } from 'express';
import { createUserService } from '../services/user.service';
import { RBAC } from '../middleware/rbac.middleware';
import { handleAsync } from '../utils/async-handler';
import { validate } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema, updateSelfProfileSchema } from '../schemas/user.schema';
import { PrismaClient } from '@prisma/client';

export function createUserRoutes(prisma: PrismaClient) {
  const router = Router();
  const userService = createUserService(prisma);

  // Update own profile (only fullName, avatar allowed)
  router.patch('/me', RBAC.authenticated, validate(updateSelfProfileSchema), handleAsync(async (req: any, res: any) => {
    const userId = req.user!.userId;
    const { fullName, avatar } = req.body;
    if (!fullName && !avatar) {
      return res.status(400).json({ error: 'At least one of fullName or avatar required' });
    }
    const updateData: Record<string, string> = {};
    if (fullName) updateData.fullName = fullName;
    if (avatar) updateData.avatar = avatar;
    const user = await userService.update(userId, updateData);
    res.json(user);
  }));

  // Change own password
  router.patch('/me/password', RBAC.authenticated, handleAsync(async (req: any, res: any) => {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }
    // Password policy: min 12 chars, must have letter + number
    if (newPassword.length < 12) {
      return res.status(400).json({ error: 'Password must be at least 12 characters' });
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one letter and one number' });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
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

  // Admin-only: update any user with full schema
  router.put('/:id', RBAC.adminOnly, validate(updateUserSchema), handleAsync(async (req: any, res: any) => {
    const { id } = req.params;
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
