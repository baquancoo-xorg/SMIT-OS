import { PrismaClient, Prisma } from '@prisma/client';
import { GoogleSheetsClient } from '../lib/google-sheets-client';
import { ExportResult, ExportJobStatus } from '../types/sheets-export.types';
import { GoogleOAuthService } from './google-oauth.service';
import * as extractors from './sheets-export/extractors';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

function getVietnamExportDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export class SheetsExportService {
  private currentJob: ExportJobStatus | null = null;

  constructor(
    private prisma: PrismaClient,
    private googleOAuthService: GoogleOAuthService
  ) {}

  async export(): Promise<ExportResult> {
    const exportDate = getVietnamExportDate();

    // Check existing run for today
    const existingRun = await this.prisma.sheetsExportRun.findUnique({
      where: { exportDate },
    });

    if (existingRun?.status === 'completed') {
      console.log(`[SheetsExport] Reusing existing completed run for ${exportDate}`);
      this.currentJob = {
        id: existingRun.id,
        status: 'completed',
        startedAt: existingRun.startedAt,
        completedAt: existingRun.completedAt ?? undefined,
        spreadsheetUrl: existingRun.spreadsheetUrl ?? undefined,
        retryCount: 0,
        exportDate,
      };
      return {
        success: true,
        spreadsheetId: existingRun.spreadsheetId ?? undefined,
        spreadsheetUrl: existingRun.spreadsheetUrl ?? undefined,
        sheetsCreated: existingRun.sheetsCreated,
        exportDate,
        reusedExisting: true,
      };
    }

    if (existingRun?.status === 'running') {
      console.log(`[SheetsExport] Export already running for ${exportDate}`);
      this.currentJob = {
        id: existingRun.id,
        status: 'running',
        startedAt: existingRun.startedAt,
        retryCount: 0,
        exportDate,
      };
      return { success: false, error: 'Export already in progress', sheetsCreated: 0, exportDate };
    }

    // Try to acquire lock via DB unique constraint
    let run;
    try {
      if (existingRun?.status === 'failed') {
        run = await this.prisma.sheetsExportRun.update({
          where: { exportDate },
          data: { status: 'running', startedAt: new Date(), error: null },
        });
      } else {
        run = await this.prisma.sheetsExportRun.create({
          data: { exportDate, status: 'running' },
        });
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const conflictRun = await this.prisma.sheetsExportRun.findUnique({ where: { exportDate } });
        if (conflictRun) {
          return {
            success: conflictRun.status === 'completed',
            spreadsheetUrl: conflictRun.spreadsheetUrl ?? undefined,
            sheetsCreated: conflictRun.sheetsCreated,
            exportDate,
            reusedExisting: conflictRun.status === 'completed',
            error: conflictRun.status === 'running' ? 'Export already in progress' : undefined,
          };
        }
      }
      throw error;
    }

    this.currentJob = {
      id: run.id,
      status: 'running',
      startedAt: run.startedAt,
      retryCount: 0,
      exportDate,
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[SheetsExport] Attempt ${attempt}/${MAX_RETRIES} for ${exportDate}`);
        const result = await this.doExport(exportDate);

        await this.prisma.sheetsExportRun.update({
          where: { id: run.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            spreadsheetId: result.spreadsheetId,
            spreadsheetUrl: result.spreadsheetUrl,
            sheetsCreated: result.sheetsCreated,
          },
        });

        this.currentJob.status = 'completed';
        this.currentJob.completedAt = new Date();
        this.currentJob.spreadsheetUrl = result.spreadsheetUrl;

        console.log(`[SheetsExport] Success: ${result.spreadsheetUrl}`);
        return { ...result, exportDate };
      } catch (error) {
        lastError = error as Error;
        this.currentJob.retryCount = attempt;
        console.error(`[SheetsExport] Attempt ${attempt} failed:`, error);

        if (attempt < MAX_RETRIES) {
          await this.delay(RETRY_DELAY_MS * attempt);
        }
      }
    }

    await this.prisma.sheetsExportRun.update({
      where: { id: run.id },
      data: { status: 'failed', completedAt: new Date(), error: lastError?.message },
    });

    this.currentJob.status = 'failed';
    this.currentJob.completedAt = new Date();
    this.currentJob.error = lastError?.message;

    await this.notifyFailure(lastError?.message || 'Unknown error');

    return { success: false, error: lastError?.message, sheetsCreated: 0, exportDate };
  }

  private async doExport(exportDate: string): Promise<ExportResult> {
    const integration = await this.googleOAuthService.getIntegration();
    if (!integration) {
      throw new Error('Google account not connected. Please connect in Settings.');
    }

    const authClient = await this.googleOAuthService.getAuthenticatedClient();
    const client = new GoogleSheetsClient(authClient, integration.folderId || undefined);

    const title = `SMIT-OS-Report-${exportDate}`;

    const { id: spreadsheetId, url } = await client.createSpreadsheet(title);

    const ctx = { prisma: this.prisma };
    const allExtractors = [
      extractors.analyticsOverviewRealtime,
      extractors.analyticsOverviewCohort,
      extractors.ritualsDailySync,
      extractors.ritualsWeeklyReport,
      extractors.crmLeadTracker,
    ];

    let sheetsCreated = 0;

    for (const extractor of allExtractors) {
      const data = await extractor(ctx);
      await client.addSheet(spreadsheetId, data.sheetName);
      await client.writeData(spreadsheetId, data.sheetName, data.headers, data.rows);
      sheetsCreated++;
      console.log(`[SheetsExport] Created sheet: ${data.sheetName}`);
    }

    await client.deleteDefaultSheet(spreadsheetId);

    return { success: true, spreadsheetId, spreadsheetUrl: url, sheetsCreated };
  }

  private async notifyFailure(error: string): Promise<void> {
    const admins = await this.prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true },
    });

    if (admins.length > 0) {
      await this.prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          type: 'export_failed',
          title: 'Google Sheets Export Failed',
          message: `Export failed after ${MAX_RETRIES} retries: ${error}`,
          priority: 'high',
        })),
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
