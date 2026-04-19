# Phase 3: Notification Service

**Priority:** High
**Estimated:** 2 hours
**Status:** completed
**Depends on:** Phase 2

## Overview

Create notification service with methods for creating, querying, and managing notifications.

## Service Design

```typescript
// server/services/notification.service.ts

export function createNotificationService(prisma: PrismaClient) {
  return {
    // Create single notification
    async create(data: CreateNotificationInput),
    
    // Create for multiple users (broadcast)
    async createMany(userIds: string[], data: Omit<CreateNotificationInput, 'userId'>),
    
    // Get user notifications with pagination
    async getByUser(userId: string, options?: { unreadOnly?: boolean, limit?: number }),
    
    // Get unread count
    async getUnreadCount(userId: string),
    
    // Mark as read
    async markAsRead(id: string),
    async markAllAsRead(userId: string),
    
    // Delete
    async delete(id: string),
    async deleteOld(olderThan: Date),
    
    // Trigger helpers
    async notifyReportApproved(report: WeeklyReport),
    async notifyDeadlineWarning(workItem: WorkItem),
    async notifySprintEnding(sprint: Sprint, daysLeft: number),
    async notifyOKRRisk(objective: Objective),
  };
}
```

## Implementation Steps

### 1. Create notification.service.ts

```typescript
// server/services/notification.service.ts
import { PrismaClient, Notification } from '@prisma/client';

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

    // Trigger helpers
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
        message: `${sprint.name} ends in ${daysLeft} days`,
        entityType: 'Sprint',
        entityId: sprint.id,
      });
    },
  };
}

export type NotificationService = ReturnType<typeof createNotificationService>;
```

### 2. Register in server.ts

```typescript
import { createNotificationService } from './services/notification.service';

const notificationService = createNotificationService(prisma);
```

### 3. Integrate with Report Approval

Update [report.routes.ts](../../server/routes/report.routes.ts) to trigger notification:

```typescript
// After line 115: await okrService.syncOKRProgress(updated);
await notificationService.notifyReportApproved(updated, user.fullName);
```

## Files to Create

- `server/services/notification.service.ts`

## Files to Modify

- `server.ts` - Register service
- `server/routes/report.routes.ts` - Add notification trigger

## Checklist

- [x] Create notification.service.ts
- [x] Add create, getByUser, markAsRead methods
- [x] Add trigger helpers for common events
- [x] Register in server.ts
- [x] Integrate with report approval flow
- [x] Test notification creation
