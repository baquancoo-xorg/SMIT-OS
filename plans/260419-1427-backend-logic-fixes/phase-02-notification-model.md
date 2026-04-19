# Phase 2: Notification Model

**Priority:** High
**Estimated:** 1 hour
**Status:** completed
**Depends on:** Phase 1

## Overview

Create Prisma model for notifications with support for different types and read status.

## Schema Design

```prisma
model Notification {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type        String   // report_approved, deadline_warning, sprint_ending, okr_risk, mention
  title       String
  message     String
  
  // Link to related entity
  entityType  String?  // WeeklyReport, WorkItem, Sprint, Objective
  entityId    String?
  
  isRead      Boolean  @default(false)
  readAt      DateTime?
  
  priority    String   @default("normal") // low, normal, high, urgent
  
  createdAt   DateTime @default(now())
  expiresAt   DateTime? // Auto-delete old notifications
  
  @@index([userId, isRead])
  @@index([userId, createdAt])
}
```

## Implementation Steps

### 1. Update prisma/schema.prisma

Add Notification model and User relation.

```prisma
// Add to User model
notifications    Notification[]

// Add Notification model (as above)
```

### 2. Run Migration

```bash
npx prisma migrate dev --name add_notification_model
```

### 3. Notification Types

| Type | Trigger | Priority |
|------|---------|----------|
| `report_approved` | WeeklyReport approval | normal |
| `deadline_warning` | WorkItem due in 1 day | high |
| `sprint_ending` | Sprint ends in 2 days | normal |
| `okr_risk` | OKR progress < threshold | high |
| `mention` | User mentioned in comment | normal |
| `assignment` | WorkItem assigned to user | normal |

## Files to Modify

- [prisma/schema.prisma](../../prisma/schema.prisma)

## Checklist

- [x] Add Notification model to schema
- [x] Add notifications relation to User
- [x] Run migration
- [x] Verify with `npx prisma studio`
