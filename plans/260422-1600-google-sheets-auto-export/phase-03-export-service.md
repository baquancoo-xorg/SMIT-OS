# Phase 3: Export Service

## Priority: High | Effort: Medium

## Overview

Create main orchestrator service that coordinates extractors and Google Sheets client.

## Files to Create

### `server/services/sheets-export.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { GoogleSheetsClient } from '../lib/google-sheets-client';
import { NotificationService } from './notification.service';
import { ExportResult, ExportJobStatus } from '../types/sheets-export.types';
import * as extractors from './sheets-export/extractors';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export class SheetsExportService {
  private client: GoogleSheetsClient;
  private currentJob: ExportJobStatus | null = null;

  constructor(
    private prisma: PrismaClient,
    private notificationService: NotificationService
  ) {
    this.client = new GoogleSheetsClient();
  }

  async export(): Promise<ExportResult> {
    const jobId = crypto.randomUUID();
    this.currentJob = {
      id: jobId,
      status: 'running',
      startedAt: new Date(),
      retryCount: 0,
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[SheetsExport] Attempt ${attempt}/${MAX_RETRIES}`);
        const result = await this.doExport();
        
        this.currentJob.status = 'completed';
        this.currentJob.completedAt = new Date();
        this.currentJob.spreadsheetUrl = result.spreadsheetUrl;
        
        console.log(`[SheetsExport] Success: ${result.spreadsheetUrl}`);
        return result;
      } catch (error) {
        lastError = error as Error;
        this.currentJob.retryCount = attempt;
        console.error(`[SheetsExport] Attempt ${attempt} failed:`, error);

        if (attempt < MAX_RETRIES) {
          await this.delay(RETRY_DELAY_MS * attempt); // Exponential backoff
        }
      }
    }

    // All retries failed
    this.currentJob.status = 'failed';
    this.currentJob.completedAt = new Date();
    this.currentJob.error = lastError?.message;

    // Create notification for admins
    await this.notifyFailure(lastError?.message || 'Unknown error');

    return {
      success: false,
      error: lastError?.message,
      sheetsCreated: 0,
    };
  }

  private async doExport(): Promise<ExportResult> {
    const date = new Date().toISOString().split('T')[0];
    const title = `SMIT-OS-Report-${date}`;

    // Create spreadsheet
    const { id: spreadsheetId, url } = await this.client.createSpreadsheet(title);

    const ctx = { prisma: this.prisma };
    const allExtractors = [
      extractors.analyticsOverviewRealtime,
      extractors.analyticsOverviewCohort,
      extractors.analyticsDashboard,
      extractors.workspaceTech,
      extractors.workspaceMarketing,
      extractors.workspaceMedia,
      extractors.workspaceSales,
      extractors.planningOkrs,
      extractors.planningBacklog,
      extractors.planningSprint,
      extractors.ritualsDailySync,
      extractors.ritualsWeeklyReport,
      extractors.crmLeadTracker,
    ];

    let sheetsCreated = 0;

    for (const extractor of allExtractors) {
      const data = await extractor(ctx);
      await this.client.addSheet(spreadsheetId, data.sheetName);
      await this.client.writeData(spreadsheetId, data.sheetName, data.headers, data.rows);
      sheetsCreated++;
      console.log(`[SheetsExport] Created sheet: ${data.sheetName}`);
    }

    // Delete default "Sheet1"
    await this.client.deleteDefaultSheet(spreadsheetId);

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl: url,
      sheetsCreated,
    };
  }

  private async notifyFailure(error: string): Promise<void> {
    const admins = await this.prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true },
    });

    for (const admin of admins) {
      await this.notificationService.create({
        userId: admin.id,
        type: 'export_failed',
        title: 'Google Sheets Export Failed',
        message: `Export failed after ${MAX_RETRIES} retries: ${error}`,
        priority: 'high',
      });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus(): ExportJobStatus | null {
    return this.currentJob;
  }
}
```

## Tasks

- [ ] Create SheetsExportService class
- [ ] Implement retry logic with exponential backoff
- [ ] Implement notification on failure
- [ ] Add getStatus() for checking current job

## Validation

- [ ] Service creates spreadsheet with all 13 sheets
- [ ] Retry logic works (test with mock failure)
- [ ] Admins receive notification on failure
