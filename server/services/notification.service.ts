import { PrismaClient, Prisma } from '@prisma/client';

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

type RecipientUser = { id: string; departments: string[] };

export function createNotificationService(prisma: PrismaClient) {
  const testNotificationFilter = {
    OR: [
      { type: { in: ['test', 'test_notification'] } },
      { title: { contains: 'test notification', mode: 'insensitive' as const } },
      { message: { contains: 'testing notification', mode: 'insensitive' as const } },
    ],
  };

  // Returns admin user ids. Leader role removed (plan 260510-0318);
  // escalation flows now go straight to admins.
  async function findAdminRecipientsFor(
    targetUser: RecipientUser,
    opts?: { excludeSelf?: boolean }
  ): Promise<string[]> {
    const where: Prisma.UserWhereInput = { isAdmin: true };
    if (opts?.excludeSelf) {
      where.NOT = { id: targetUser.id };
    }
    const users = await prisma.user.findMany({ where, select: { id: true } });
    return Array.from(new Set(users.map(u => u.id)));
  }

  return {
    findAdminRecipientsFor,

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

    // New: emit when a Member submits a daily report.
    // Recipients = leaders of same dept + admins (excluding submitter).
    async notifyDailyNew(
      report: { id: string; userId: string },
      submitterName: string,
      recipientIds: string[]
    ) {
      if (!recipientIds.length) return;
      await prisma.notification.createMany({
        data: recipientIds.map(userId => ({
          userId,
          type: 'daily_new',
          title: 'New Daily Report',
          message: `${submitterName} just submitted a daily report`,
          entityType: 'DailyReport',
          entityId: report.id,
        })),
      });
    },

    // New: emit when a Member is late on daily sync.
    // Dedup via Notification @@unique(userId,type,entityType,entityId) + skipDuplicates.
    // Idempotent: re-running on same day = 0 new rows.
    async notifyDailyLate(
      lateUser: { id: string; fullName: string },
      dateISO: string,
      recipientIds: string[]
    ) {
      if (!recipientIds.length) return;
      const dedupKey = `${lateUser.id}:${dateISO}`;
      await prisma.notification.createMany({
        data: recipientIds.map(userId => ({
          userId,
          type: 'daily_late',
          title: 'Daily Sync Missing',
          message: `${lateUser.fullName} hasn't submitted today's daily report`,
          entityType: 'DailyLateMarker',
          entityId: dedupKey,
          priority: 'high',
        })),
        skipDuplicates: true,
      });
    },

    // New: emit when a Member is late on weekly check-in.
    // Dedup key = `${lateUserId}:${weekEndingISO}` (a Friday in ICT) stored in entityId.
    async notifyWeeklyLate(
      lateUser: { id: string; fullName: string },
      weekEndingISO: string,
      recipientIds: string[]
    ) {
      if (!recipientIds.length) return;
      const dedupKey = `${lateUser.id}:${weekEndingISO}`;
      await prisma.notification.createMany({
        data: recipientIds.map(userId => ({
          userId,
          type: 'weekly_late',
          title: 'Weekly Check-in Missing',
          message: `${lateUser.fullName} hasn't submitted last week's check-in (ending ${weekEndingISO})`,
          entityType: 'WeeklyLateMarker',
          entityId: dedupKey,
          priority: 'high',
        })),
        skipDuplicates: true,
      });
    },
  };
}

export type NotificationService = ReturnType<typeof createNotificationService>;
