import { Router } from 'express';
import { overviewQuerySchema, kpiQuerySchema } from '../schemas/dashboard-overview.schema';
import { getSummaryMetrics } from '../services/dashboard/overview-summary.service';
import { getKpiMetrics } from '../services/dashboard/overview-kpi.service';
import { previousPeriod, parseFromTo } from '../lib/date-utils';

export function createDashboardOverviewRoutes() {
  const router = Router();

  router.get('/summary', async (req, res) => {
    try {
      const parsed = overviewQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          data: null,
          error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
          timestamp: new Date().toISOString(),
        });
      }

      const q = parsed.data;
      const { from, to } = parseFromTo(q.from, q.to);
      let prevFrom: Date, prevTo: Date;

      if (q.previousFrom && q.previousTo) {
        const prev = parseFromTo(q.previousFrom, q.previousTo);
        prevFrom = prev.from;
        prevTo = prev.to;
      } else {
        const prev = previousPeriod(from, to);
        prevFrom = prev.previousFrom;
        prevTo = prev.previousTo;
      }

      const data = await getSummaryMetrics(from, to, prevFrom, prevTo);
      res.json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error('[dashboard/summary]', err);
      res.status(500).json({
        success: false,
        data: null,
        error: (err as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  router.get('/kpi-metrics', async (req, res) => {
    try {
      const parsed = kpiQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          data: null,
          error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
          timestamp: new Date().toISOString(),
        });
      }

      const { from, to } = parseFromTo(parsed.data.from, parsed.data.to);
      const data = await getKpiMetrics(from, to);
      res.json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error('[dashboard/kpi-metrics]', err);
      res.status(500).json({
        success: false,
        data: null,
        error: (err as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const parsed = overviewQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          data: null,
          error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
          timestamp: new Date().toISOString(),
        });
      }

      const q = parsed.data;
      const { from, to } = parseFromTo(q.from, q.to);
      let prevFrom: Date, prevTo: Date;

      if (q.previousFrom && q.previousTo) {
        const prev = parseFromTo(q.previousFrom, q.previousTo);
        prevFrom = prev.from;
        prevTo = prev.to;
      } else {
        const prev = previousPeriod(from, to);
        prevFrom = prev.previousFrom;
        prevTo = prev.previousTo;
      }

      const [summary, kpiMetrics] = await Promise.all([
        getSummaryMetrics(from, to, prevFrom, prevTo),
        getKpiMetrics(from, to),
      ]);

      res.json({
        success: true,
        data: { summary, kpiMetrics },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[dashboard/overview]', err);
      res.status(500).json({
        success: false,
        data: null,
        error: (err as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
}
