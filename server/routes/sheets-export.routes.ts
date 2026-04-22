import { Router, Request, Response } from 'express';
import { SheetsExportService } from '../services/sheets-export.service';

export function createSheetsExportRoutes(exportService: SheetsExportService) {
  const router = Router();

  // Admin-only check
  router.use((req: Request, res: Response, next) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });

  // POST /api/sheets-export/trigger - Manual trigger
  router.post('/trigger', async (req: Request, res: Response) => {
    try {
      const status = exportService.getStatus();
      if (status?.status === 'running') {
        return res.status(409).json({ error: 'Export already in progress', status });
      }

      // Start export in background
      exportService.export().catch(err => {
        console.error('[SheetsExport] Background export error:', err);
      });

      res.json({ message: 'Export started', status: exportService.getStatus() });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start export' });
    }
  });

  // GET /api/sheets-export/status - Check current job status
  router.get('/status', (req: Request, res: Response) => {
    res.json({ status: exportService.getStatus() });
  });

  return router;
}
