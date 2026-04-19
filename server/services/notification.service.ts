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
        where: { userId, isRead: false },
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

    async notifyDeadlineWarning(workItem: any) {
      if (!workItem.assigneeId) return;
      return this.create({
        userId: workItem.assigneeId,
        type: 'deadline_warning',
        title: 'Deadline Approaching',
        message: `"${workItem.title}" is due tomorrow`,
        entityType: 'WorkItem',
        entityId: workItem.id,
        priority: 'high',
      });
    },

    async notifySprintEnding(sprint: any, userIds: string[], daysLeft: number) {
      return this.createMany(userIds, {
        type: 'sprint_ending',
        title: 'Sprint Ending Soon',
        message: `${sprint.name} ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
        entityType: 'Sprint',
        entityId: sprint.id,
      });
    },
  };
}

export type NotificationService = ReturnType<typeof createNotificationService>;
