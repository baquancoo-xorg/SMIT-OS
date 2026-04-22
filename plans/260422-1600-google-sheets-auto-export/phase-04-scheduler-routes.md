# Phase 4: Scheduler & Routes

## Priority: High | Effort: Small

## Overview

Create cron scheduler for 11:00 daily export and API endpoints for manual trigger.

## Files to Create

### 1. `server/jobs/sheets-export-scheduler.ts`

```typescript
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { SheetsExportService } from '../services/sheets-export.service';
import { NotificationService } from '../services/notification.service';

export function initSheetsExportScheduler(
  prisma: PrismaClient,
  notificationService: NotificationService
) {
  const exportService = new SheetsExportService(prisma, notificationService);

  // Run at 11:00 AM Vietnam time every day
  cron.schedule('0 11 * * *', async () => {
    console.log('[SheetsExportScheduler] Starting daily export...');
    try {
      const result = await exportService.export();
      if (result.success) {
        console.log(`[SheetsExportScheduler] Export complete: ${result.spreadsheetUrl}`);
      } else {
        console.error('[SheetsExportScheduler] Export failed:', result.error);
      }
    } catch (error) {
      console.error('[SheetsExportScheduler] Unexpected error:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });

  console.log('[SheetsExportScheduler] Initialized - runs daily at 11:00 AM');

  return exportService; // Return for manual trigger via API
}
```

### 2. `server/routes/sheets-export.routes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { SheetsExportService } from '../services/sheets-export.service';
import { authMiddleware } from '../middleware/auth.middleware';

export function createSheetsExportRoutes(exportService: SheetsExportService) {
  const router = Router();

  // Require admin for all routes
  router.use(authMiddleware);
  router.use((req: Request, res: Response, next) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });

  // POST /api/sheets-export/trigger - Manual trigger
  router.post('/trigger', async (req: Request, res: Response) => {
    try {
      // Check if already running
      const status = exportService.getStatus();
      if (status?.status === 'running') {
        return res.status(409).json({
          error: 'Export already in progress',
          status,
        });
      }

      // Start export (don't await - return immediately)
      exportService.export().catch(err => {
        console.error('[SheetsExport] Background export error:', err);
      });

      res.json({
        message: 'Export started',
        status: exportService.getStatus(),
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start export' });
    }
  });

  // GET /api/sheets-export/status - Check current job status
  router.get('/status', (req: Request, res: Response) => {
    const status = exportService.getStatus();
    res.json({ status });
  });

  return router;
}
```

### 3. Update `server/index.ts`

Add to server initialization:

```typescript
import { initSheetsExportScheduler } from './jobs/sheets-export-scheduler';
import { createSheetsExportRoutes } from './routes/sheets-export.routes';

// In initialization code:
const sheetsExportService = initSheetsExportScheduler(prisma, notificationService);
app.use('/api/sheets-export', createSheetsExportRoutes(sheetsExportService));
```

## Tasks

- [ ] Create sheets-export-scheduler.ts
- [ ] Create sheets-export.routes.ts
- [ ] Update server/index.ts to register scheduler and routes
- [ ] Add admin-only middleware check

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sheets-export/trigger` | Manual trigger export (admin only) |
| GET | `/api/sheets-export/status` | Get current export job status |

## Validation

- [ ] Scheduler logs initialization at server start
- [ ] POST /trigger starts export and returns immediately
- [ ] GET /status returns correct job status
- [ ] Non-admin users get 403
