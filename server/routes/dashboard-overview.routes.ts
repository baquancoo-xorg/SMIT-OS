import { Router } from 'express';
import { overviewQuerySchema, kpiQuerySchema } from '../schemas/dashboard-overview.schema';
import { validateQuery } from '../middleware/validate.middleware';
import { getSummaryMetrics } from '../services/dashboard/overview-summary.service';
import { getKpiMetrics } from '../services/dashboard/overview-kpi.service';
import { getCohortKpiMetrics } from '../services/dashboard/overview-cohort.service';
import { previousPeriod, parseFromTo } from '../lib/date-utils';

const dashboardOpts = { errorShape: 'dashboard' as const };

export function createDashboardOverviewRoutes() {
  const router = Router();

  router.get('/summary', validateQuery(overviewQuerySchema, dashboardOpts), async (req, res) => {
    try {
      const q = req.validatedQuery as any;
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

  router.get('/kpi-metrics', validateQuery(kpiQuerySchema, dashboardOpts), async (req, res) => {
    try {
      const q = req.validatedQuery as any;
      const { from, to } = parseFromTo(q.from, q.to);
      const viewMode = q.viewMode ?? 'realtime';
      const data = viewMode === 'cohort'
        ? await getCohortKpiMetrics(from, to)
        : await getKpiMetrics(from, to);
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

  router.get('/', validateQuery(overviewQuerySchema, dashboardOpts), async (req, res) => {
    try {
      const q = req.validatedQuery as any;
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

      const viewMode = q.viewMode ?? 'realtime';
      const [summary, kpiMetrics] = await Promise.all([
        getSummaryMetrics(from, to, prevFrom, prevTo),
        viewMode === 'cohort' ? getCohortKpiMetrics(from, to) : getKpiMetrics(from, to),
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
