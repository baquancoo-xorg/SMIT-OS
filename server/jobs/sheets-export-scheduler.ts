import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { SheetsExportService } from '../services/sheets-export.service';

export function initSheetsExportScheduler(prisma: PrismaClient): SheetsExportService {
  const exportService = new SheetsExportService(prisma);

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

  return exportService;
}
