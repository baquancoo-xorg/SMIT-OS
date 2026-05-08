import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { SheetsExportService } from '../services/sheets-export.service';
import { GoogleOAuthService } from '../services/google-oauth.service';
import { childLogger } from '../lib/logger';

const log = childLogger('sheets-export-scheduler');

export function initSheetsExportScheduler(
  prisma: PrismaClient,
  googleOAuthService: GoogleOAuthService
): SheetsExportService {
  const exportService = new SheetsExportService(prisma, googleOAuthService);

  // Run at 11:00 AM Vietnam time every day
  cron.schedule('0 11 * * *', async () => {
    log.info('starting daily export');
    try {
      const result = await exportService.export();
      if (result.success) {
        log.info({ spreadsheetUrl: result.spreadsheetUrl }, 'export complete');
      } else {
        log.error({ error: result.error }, 'export failed');
      }
    } catch (error) {
      log.error({ err: error }, 'unexpected error');
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });

  log.info('initialized - runs daily at 11:00 AM');

  return exportService;
}
