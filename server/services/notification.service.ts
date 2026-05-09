import { PrismaClient } from '@prisma/client';

interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
}

export function createNotificationService(prisma: PrismaClient) {
  const testNotificationFilter = {
    OR: [
      { type: { in: ['test', 'test_notification'] } },
      { title: { contains: 'test notification', mode: 'insensitive' as const } },
      { message: { contains: 'testing notification', mode: 'insensitive' as const } },
    ],
  };

  return {
    async create(data: CreateNotificationInput) {
      return prisma.notification.create({ data });
    },

    async createMany(userIds: string[], data: Omit<CreateNotificationInput, 'userId'>) {
      return prisma.notification.createMany({
        data: userIds.map(userId => ({ ...data, userId })),
      });
    },

    async getByUser(userId: string, options?: { unreadOnly?: boolean; limit?: number }) {
      return prisma.notification.findMany({
        where: {
          userId,
          ...(options?.unreadOnly ? { isRead: false } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit ?? 50,
      });
    },

    async getUnreadCount(userId: string) {
      return prisma.notification.count({
        where: {
          userId,
          isRead: false,
          NOT: testNotificationFilter,
        },
      });
    },

    async markAsRead(id: string) {
      return prisma.notification.update({
        where: { id },
        data: { isRead: true, readAt: new Date() },
      });
    },

    async markAllAsRead(userId: string) {
      return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    },

    async delete(id: string) {
      return prisma.notification.delete({ where: { id } });
    },

    async notifyReportApproved(report: any, approverName: string) {
      return this.create({
        userId: report.userId,
        type: 'report_approved',
        title: 'Report Approved',
        message: `Your weekly report was approved by ${approverName}`,
        entityType: 'WeeklyReport',
        entityId: report.id,
      });
    },

    async notifyDailyReportApproved(report: any, approverName: string) {
      return this.create({
        userId: report.userId,
        type: 'report_approved',
        title: 'Daily Report Approved',
        message: `Your daily report was approved by ${approverName}`,
        entityType: 'DailyReport',
        entityId: report.id,
      });
    },
  };
}

export type NotificationService = ReturnType<typeof createNotificationService>;
