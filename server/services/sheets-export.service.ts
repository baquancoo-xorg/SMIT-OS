import { PrismaClient } from '@prisma/client';
import { GoogleSheetsClient } from '../lib/google-sheets-client';
import { ExportResult, ExportJobStatus } from '../types/sheets-export.types';
import { GoogleOAuthService } from './google-oauth.service';
import * as extractors from './sheets-export/extractors';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export class SheetsExportService {
  private currentJob: ExportJobStatus | null = null;
  private isExporting = false;

  constructor(
    private prisma: PrismaClient,
    private googleOAuthService: GoogleOAuthService
  ) {}

  async export(): Promise<ExportResult> {
    // Prevent concurrent exports
    if (this.isExporting) {
      return { success: false, error: 'Export already in progress', sheetsCreated: 0 };
    }
    this.isExporting = true;

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
        this.isExporting = false;

        console.log(`[SheetsExport] Success: ${result.spreadsheetUrl}`);
        return result;
      } catch (error) {
        lastError = error as Error;
        this.currentJob.retryCount = attempt;
        console.error(`[SheetsExport] Attempt ${attempt} failed:`, error);

        if (attempt < MAX_RETRIES) {
          await this.delay(RETRY_DELAY_MS * attempt);
        }
      }
    }

    this.currentJob.status = 'failed';
    this.currentJob.completedAt = new Date();
    this.currentJob.error = lastError?.message;
    this.isExporting = false;

    await this.notifyFailure(lastError?.message || 'Unknown error');

    return { success: false, error: lastError?.message, sheetsCreated: 0 };
  }

  private async doExport(): Promise<ExportResult> {
    // Get OAuth client and folder from integration
    const integration = await this.googleOAuthService.getIntegration();
    if (!integration) {
      throw new Error('Google account not connected. Please connect in Settings.');
    }

    const authClient = await this.googleOAuthService.getAuthenticatedClient();
    const client = new GoogleSheetsClient(authClient, integration.folderId || undefined);

    const date = new Date().toISOString().split('T')[0];
    const title = `SMIT-OS-Report-${date}`;

    const { id: spreadsheetId, url } = await client.createSpreadsheet(title);

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
