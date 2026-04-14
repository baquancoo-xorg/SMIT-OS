import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const USER_SELECT = {
  id: true,
  fullName: true,
  username: true,
  department: true,
  role: true,
  scope: true,
  avatar: true,
  isAdmin: true,
};

export function createUserService(prisma: PrismaClient) {
  return {
    async getAll() {
      return prisma.user.findMany({ select: USER_SELECT });
    },

    async getById(id: string) {
      return prisma.user.findUnique({ where: { id }, select: USER_SELECT });
    },

    async create(data: {
      fullName: string;
      username: string;
      password?: string;
      department: string;
      role: string;
      avatar: string;
      isAdmin?: boolean;
    }) {
      const hashedPassword = await bcrypt.hash(data.password || '123456', 10);
      const { password: _, ...rest } = data;

      return prisma.user.create({
        data: { ...rest, password: hashedPassword },
        select: USER_SELECT,
      });
    },

    async update(id: string, data: Record<string, unknown>) {
      if (data.password) {
        data.password = await bcrypt.hash(data.password as string, 10);
      }

      return prisma.user.update({
        where: { id },
        data,
        select: USER_SELECT,
      });
    },

    async delete(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (user?.isAdmin) {
        const adminCount = await prisma.user.count({ where: { isAdmin: true } });
        if (adminCount <= 1) {
          throw new Error('Cannot delete the last admin user');
        }
      }
      await prisma.user.delete({ where: { id } });
    },
  };
}

export type UserService = ReturnType<typeof createUserService>;
